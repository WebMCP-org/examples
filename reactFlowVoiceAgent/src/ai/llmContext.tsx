import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useMemo, useCallback, type RefObject } from 'react';

import { TabClientTransport } from '@mcp-b/transports';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { setupMCPServer } from '../mcpServers/_shared.ts';
import type { ToolCall, LiveFunctionResponse, MCPTool, LiveFunctionCall } from '../lib/clientTypes.ts';
import { MultimodalLiveClient } from './geminiClient.ts';

import { createLiveConfigWithTools, audioContext } from '../lib/utils.ts';

import { WebMic } from '../lib/Microphone/WebMic.ts';
import { AudioStreamer } from '../lib/Speaker/audio-streamer.ts';

import { useScreenCapture } from "../lib/Stream/use-screen-capture.ts";
import { useWebcam } from "../lib/Stream/use-webcam.ts";


interface llmContextType {
  liveClient: MultimodalLiveClient;

  mcpConnect: (serverType: string) => Promise<boolean>;
  mcpDisconnect: () => Promise<void>;
  liveConnect: (mcpTools?: MCPTool[]) => Promise<boolean>;
  liveDisconnect: () => Promise<void>;
  
  liveConnected: boolean; 
  setLiveConnected: (connected: boolean) => void;

  voiceModeEnabled: boolean;
  setVoiceModeEnabled: (enabled: boolean) => void;

  tools: MCPTool[];
  setTools: (tools: MCPTool[]) => void;
  callToolManual: (call: LiveFunctionCall) => Promise<Object | null>;

  videoRef: RefObject<HTMLVideoElement | null>;
  renderCanvasRef: RefObject<HTMLCanvasElement | null>;
  streamType: "webcam" | "screen" | null;
  toggleCam: () => void;
  toggleStream: () => void;

  sendMessage: (message: string) => void;
  setApiKey: (apiKey: string) => void;
}

const llmContext = createContext<llmContextType | undefined>(undefined);

export const LLMProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState("");
  const [mcpClient, setMcpClient] = useState<Client | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [currentServer, setCurrentServer] = useState<McpServer | null>(null);
  
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [microphone] = useState(() => new WebMic());
  const speakerRef = useRef<AudioStreamer | null>(null); 

  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(null);
  const [streamType, setStreamType] = useState<"webcam" | "screen" | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null); 
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);

  const videoStream = useScreenCapture();
  const camStream = useWebcam();

  // Create voice client with API key
  const liveClient = useMemo(
    () => new MultimodalLiveClient({ apiKey: apiKey }),
    [apiKey],
  );
  

// ########################################################################
// ###################### LIVE WEBSOCKET CONNECT ##########################
// ########################################################################
  
  const liveDisconnect = useCallback(async () => {
    liveClient.disconnect();
    setLiveConnected(false);
    
  }, [liveClient]);


  const liveConnect = useCallback(async (mcpTools?: MCPTool[]): Promise<boolean> => {
    const tools = mcpTools || [];
    
    // console.log('🔧 API key:', apiKey);
    if (!apiKey) return false;

    try {
      const liveConfig = createLiveConfigWithTools(tools);
      console.log('📋 Live config with tools:', liveConfig);
      
      await liveDisconnect();
      await liveClient.connect(liveConfig);      
      
      setLiveConnected(true);
      return true;      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      return false;
    }
  }, [apiKey, liveClient, createLiveConfigWithTools]);


// ########################################################################
// ###################### MCP SERVER CONNECT ##############################
// ########################################################################
  
  const mcpDisconnect = useCallback(async () => {
    // Close the WebSocket
    if (liveConnected) await liveDisconnect();

    if (!mcpClient) return

    // Close the MCP client
    if (mcpClient) {
      try {
        mcpClient.close();
      } catch (error) {
        console.warn('Error closing MCP client:', error);
      }
      setMcpClient(null);
    }
    
    // Close the MCP server        
    if (currentServer) {
      try {
        if (typeof currentServer.close === 'function') {
          await currentServer.close();
        }
      } catch (error) {
        console.warn('Error closing MCP server:', error);
      }
      setCurrentServer(null);
    }
    
    // Reset the tools
    setTools([]);
    
    // Wait for the server to close
    await new Promise(resolve => setTimeout(resolve, 200));
  }, [liveConnected, liveClient, mcpClient, currentServer]);

 
  
  const mcpConnect = useCallback(async (serverType: string): Promise<boolean> => {
    try {
      await mcpDisconnect();
      
      // Add a delay to allow the old server transport to fully close
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create and connect to the MCP server
      const server = await setupMCPServer(serverType);
      setCurrentServer(server);      

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transport = new TabClientTransport({
        targetOrigin: window.location.origin
      });
      
      const newClient = new Client({
        name: 'WebAppClient',
        version: '1.0.0',
      });

      await newClient.connect(transport);
      setMcpClient(newClient);

      // Get tools
      const toolList = await newClient.listTools();
      const newTools = toolList.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || tool.name,
        parameters: tool.inputSchema || { type: "object", properties: {}, required: [] }
      }));
      
      setTools(newTools);

      // console.log(`✅ Connected to ${serverType} with ${newTools.length} tools:`, newTools.map(t => t.name));

      // Connect to WebSocket with the new tools
      const response = await liveConnect(newTools);
      if (!response) return false;

      return true;
    } catch (error) {
      console.error('❌ MCP Connection failed:', error);
      return false;
    }
  }, [mcpDisconnect, liveConnect]);


  
// ########################################################################
// ###################### LLM CHAT ########################################
// ########################################################################

  const sendMessage = useCallback(async (message: string) => {
    if (liveConnected) {
        liveClient.send([{ text: message }]);
    } else {
      console.warn('⚠️ WebSocket not connected');
    }
  }, [liveConnected, liveClient]);    

// ########################################################################
// ###################### LLM VOICE #######################################
// ########################################################################

  const talkToLLM = (base64: string) => {
    if (liveConnected) {
      liveClient.sendRealtimeInput([{
        mimeType: "audio/pcm;rate=16000",
        data: base64,
      }]);
    }
  };

  useEffect(() => {
    if (liveConnected && voiceModeEnabled && microphone) {
      microphone.on("data", talkToLLM).start();
    } else {
      microphone.stop();
    }

    return () => {
      microphone.off("data", talkToLLM);
    };
  }, [liveConnected, liveClient, voiceModeEnabled, microphone]);

// ########################################################################
// ###################### LLM SPEAKER #####################################
// ########################################################################

  // SPEAKER: INITIALIZE
  useEffect(() => {
    if (!speakerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
          speakerRef.current = new AudioStreamer(audioCtx);
          speakerRef.current
      });
    }
  }, [speakerRef]);



  // SPEAKER
  const onAudio = (data: ArrayBuffer) => speakerRef.current?.addPCM16(new Uint8Array(data));

  useEffect(() => {
    liveClient
      .on("audio", onAudio);
    
    return () => {
        liveClient
          .off("audio", onAudio);
    };
  }, [liveClient]);


// ########################################################################
// ###################### TOOL CALL #######################################
// ########################################################################
  
  const callTool = async (toolCall: ToolCall) => {
    // console.log(JSON.stringify(toolCall.functionCalls))

    if (mcpClient) {
      const functionResponses: LiveFunctionResponse[] = [];
      for (const call of toolCall.functionCalls) {
        try {
          // console.log(`📞 Calling MCP tool: ${call.name}, args: ${JSON.stringify(call.args)}, id: ${call.id}`);

          console.log(JSON.stringify(call));

          const toolResult = await mcpClient.callTool({
            name: call.name,
            arguments: call.args as any || {}
          });
          
          // console.log(`✅ Tool result for ${call.name}:`, toolResult);
          
          functionResponses.push({
            id: call.id,
            response: toolResult
          });
        } catch (error) {
          console.error(`❌ Tool call failed for ${call.name}:`, error);
          functionResponses.push({
            id: call.id,
            response: { 
              error: `Tool call failed: ${error instanceof Error ? error.message : String(error)}` 
            }
          });
        }
      }
      
      // Send tool responses to the LLM

      // console.log('📤 Sending tool responses:', functionResponses);
      liveClient.sendToolResponse({ functionResponses });
    } else {
      console.warn('⚠️ No MCP client available for tool calls');
      
      // Send error response back to the WebSocket
      const errorResponses: LiveFunctionResponse[] = toolCall.functionCalls.map(call => ({
        id: call.id,
        response: { error: "MCP client not available" }
      }));
      liveClient.sendToolResponse({ functionResponses: errorResponses });
    }
  };


  useEffect(() => {
    liveClient
      .on("toolcall", callTool);

    return () => {
      liveClient
        .off("toolcall", callTool)
    };
  }, [liveClient, mcpClient]);




  const callToolManual = async (call: LiveFunctionCall): Promise<Object | null> => {
    console.log(JSON.stringify(call))
    
    // return {}
    if (mcpClient) {
      const toolResult = await mcpClient.callTool({
        name: call.name,
        arguments: call.args as any || {}
      });

      console.log(`✅ Tool result for ${call.name}:`, toolResult);

      return toolResult;
    } else {
      console.warn('⚠️ No MCP client available for tool calls');

      return { error: "MCP client not available" };
    }
  };


// ########################################################################
// ###################### LLM STREAMING ###################################
// ########################################################################

  const toggleStream = async () => {
    try {
      if (streamType !== "screen") {
        const mediaStream = await videoStream.start();
        setActiveVideoStream(mediaStream);
        setStreamType("screen");
      } else {
        videoStream.stop();
        setActiveVideoStream(null);
        setStreamType(null);
      }
    } catch (error) {
      console.error("Error toggling video stream:", error);
    }
  };

  const toggleCam = async () => {
    try {
      if (streamType !== "webcam") {
        camStream.stop();
        setActiveVideoStream(null);
        setStreamType(null);
      } else {
        const mediaStream = await camStream.start();
        setActiveVideoStream(mediaStream);
        setStreamType("webcam");
      }
    } catch (error) {
      console.error("Error starting camera stream:", error);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }
    
    let timeoutId = -1;
    
    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas || !videoRef.current) return;
      
      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      
        if (canvas.width + canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1);
        liveClient.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }
      
        if (liveConnected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }

    if (liveConnected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [liveConnected, activeVideoStream, liveClient, videoRef]);

// ########################################################################
// ########################################################################

  return (
    <llmContext.Provider value={{
      liveClient,
      
      mcpConnect, mcpDisconnect,
      liveConnect, liveDisconnect,
      
      liveConnected, setLiveConnected,
      voiceModeEnabled, setVoiceModeEnabled,
      tools, setTools,
      callToolManual,

      videoRef, renderCanvasRef, streamType,
      toggleCam, toggleStream,

      sendMessage, setApiKey,
    }}>
      {children}
    </llmContext.Provider>
  );
};


export const useGemini = () => {
  const context = useContext(llmContext);
  if (context === undefined) {
    throw new Error('useGemini must be used within a LLMProvider');
  }
  return context;
};
