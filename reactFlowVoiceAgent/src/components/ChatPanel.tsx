import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Send, StopCircle, Monitor, Camera } from "lucide-react";

import type { MCPTool, LiveFunctionCall } from "../lib/clientTypes.ts";
import { useGemini } from "../ai/llmContext.tsx";
import { ToolPopout } from "./ToolPopout.tsx";


export default function ChatSection({ disconnectNode }: { disconnectNode: () => void }) {
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<string[]>(['🎉 Ready! Connect the LLM to any MCP server to start.']);
    const [apiKeyInput, setApiKeyInput] = useState('');

    const [viewToolPopout, setViewToolPopout] = useState(false);
    

    const [showVideoDropdown, setShowVideoDropdown] = useState(false);
    const dropdownVideoRef = useRef<HTMLVideoElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        liveClient,
      
        liveConnect,
        
        liveConnected, setLiveConnected,
        voiceModeEnabled, setVoiceModeEnabled,
        tools, setTools,

        videoRef, renderCanvasRef, streamType,
        toggleCam, toggleStream,

        sendMessage, setApiKey,
    } = useGemini();


    // API KEY
    const handleApiKeySubmit = () => {
        if (apiKeyInput.trim()) {
            if (liveConnected) {
                addChatMessage('🔌 Disconnected due to new API key');
                disconnectNode();
            }
            setApiKey(apiKeyInput.trim());
            addChatMessage('🔑 API Key set. You may now connect.');
        }
    };

// ########################################################################
// ############################### CHAT ###################################
// ########################################################################
    const addChatMessage = useCallback((message: string) => {
        setChatHistory(prev => [...prev, message]);
    }, []);

    // CHAT: USER MESSAGES
    const handleSendChatMessage = async () => {
        if (!chatMessage.trim()) return;
        setChatMessage('');
        try {
            addChatMessage(`You: ${chatMessage}`);
            sendMessage(chatMessage);
        } catch (error) {
            addChatMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChatMessage();
        }
    };

    // CHAT: LLM MESSAGES
    useEffect(() => {
        const handleTurnComplete = (fullResponse: string) => {
            addChatMessage(`Gemini: ${fullResponse}`);
        };

        liveClient
            .on("turncomplete", handleTurnComplete)          
        return () => {
            liveClient
            .off("turncomplete", handleTurnComplete)
        };

    }, [liveClient, addChatMessage]);

    

    const handleClearChat = () => {
        setChatHistory([]);
    };


// ########################################################################
// ######################## LLM CONNECTION ################################
// ########################################################################

    // LLM CONNECTION
    useEffect(() => {
        const onClose = (reason: string) => {
            setLiveConnected(false);
            addChatMessage(`🔌 Disconnected! ${reason}`);
    
            setTools([]);
        };
        liveClient.on("close", onClose);

        return () => {
            liveClient.off("close", onClose);
        };
    }, [liveClient, liveConnected]);


    const justChat = async () => {
        const success = await liveConnect([]);
        addChatMessage(success ? '🔌 Connected to MCP server' : '❌ Failed to connect to MCP server. Make sure you have set an API key.');
    };


// ########################################################################
// ######################### STREAM DROPDOWN ##############################
// ########################################################################

    const handleToggleStream = () => {
        setShowVideoDropdown(prev => !prev);
    };


    useEffect(() => {
        if (showVideoDropdown && videoRef.current && dropdownVideoRef.current) {
            dropdownVideoRef.current.srcObject = videoRef.current.srcObject;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Element)) {
                setShowVideoDropdown(false);
            }
        };
        if (showVideoDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showVideoDropdown]);


    const StreamDropdown = () => {
        return (
            <div
                className="absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-2xl border border-slate-600 z-[9999]"
                style={{ minWidth: '400px' }}
            >
                <div className="p-3 border-b border-slate-600 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Live Video Stream</h3>
                    <button
                        onClick={handleToggleStream}
                        className="text-slate-400 hover:text-white transition-colors text-sm p-1"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-3">
                    <video
                        ref={dropdownVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto bg-black rounded-md"
                        style={{
                            aspectRatio: '16/9',
                            maxHeight: '300px',
                            objectFit: 'cover'
                        }}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleToggleStream}
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="flex h-screen">
            {/* Left Panel - Tool Popout Window */}
            {viewToolPopout && (
                <ToolPopout setViewToolPopout={setViewToolPopout} />
            )}

            {/* Main Chat Section */}
            <div className="w-150 h-screen p-6 bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden relative">
                <canvas style={{ display: "none" }} ref={renderCanvasRef} />

                <div className="flex justify-between items-center mb-6 relative z-20">
                    <h2 className="m-0 text-2xl font-bold text-blue-400">🤖 Gemini Chat</h2>
                    <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />

                    {/* Video Dropdown Trigger */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={handleToggleStream}
                            className={`px-4 py-2 text-white rounded shadow-lg transition-colors flex items-center gap-2 ${
                                showVideoDropdown ? 'bg-slate-500 hover:bg-slate-400' : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                        >
                            📹 Video Stream
                            <span className={`text-xs transition-transform ${showVideoDropdown ? 'rotate-180' : 'rotate-0'}`}>
                                ▼
                            </span>
                        </button>

                        {showVideoDropdown && (
                            <StreamDropdown/>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        {/* Status pill */}
                        <div
                            className="px-2 py-2 w-[90px] text-center bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-40 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 data-[connected=false]:bg-gray-500 data-[connected=false]:bg-opacity-20 data-[connected=false]:text-gray-400 data-[connected=false]:border-gray-500 data-[connected=false]:border-opacity-40"
                            data-connected={liveConnected}
                        >
                            {liveConnected ? 'active' : 'inactive'}
                        </div>

                        {/* Connect/Disconnect button */}
                        <button
                            onClick={() =>
                                liveConnected ? disconnectNode() : justChat()
                            }
                            className={`px-2 py-2 w-22 text-center text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shadow-lg ${
                                liveConnected
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {liveConnected ? 'Disconnect' : 'Just Chat'}
                        </button>
                    </div>
                </div>

                {/* API Key Form */}
                <div className="mb-3 p-5 bg-slate-800 rounded-xl border border-slate-700">
                    <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter Gemini API Key"
                        className="w-full p-3 mb-3 border border-slate-600 rounded-lg bg-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        className="w-full p-3 bg-blue-600 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-blue-700"
                        onClick={handleApiKeySubmit}
                    >
                        Set API Key
                    </button>
                </div>

                {/* Tools */}
                <button className="mb-3 p-5 bg-emerald-900 bg-opacity-30 rounded-xl border border-emerald-700 border-opacity-50" onClick={() => setViewToolPopout(!viewToolPopout)}>
                    <h4 className="m-0 mb-3 text-lg font-semibold text-emerald-300">
                        🔧 Available Tools: {tools.length}
                    </h4>
                    <div className="max-h-[120px] overflow-y-auto">
                        {tools.map((tool: MCPTool) => (
                            <div key={tool.name} className="text-sm text-emerald-200 mb-2 font-mono bg-slate-800 bg-opacity-50 px-3 py-1 rounded">
                                • {tool.name}
                            </div>
                        ))}
                    </div>
                </button>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto bg-teal-500 bg-opacity-100 rounded-xl mb-3 px-3 py-2 min-h-[200px] border border-slate-700">
                    {chatHistory.length === 0 ? (
                        <div className="text-slate-700 italic text-center mt-8 text-lg">
                            No messages yet. Start a conversation!
                        </div>
                    ) : (
                        chatHistory.map((msg, index) => (
                            <div key={index} className={`mb-3 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap break-words border ${
                                msg.startsWith('You:') ? 'bg-blue-600 bg-opacity-20 border-blue-500 border-opacity-30 text-blue-100' :
                                msg.startsWith('Error:') ? 'bg-red-600 bg-opacity-20 border-red-500 border-opacity-30 text-red-100' :
                                'bg-slate-700 border-slate-600 text-slate-200'
                            }`}>
                                {msg}
                            </div>
                        ))
                    )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-3 mb-3">
                    <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyUp={handleKeyPress}
                        placeholder="Ask me stuff"
                        className="flex-1 p-4 max-h-20  resize-y border border-slate-600 rounded-lg bg-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!liveConnected}
                    />
                    <button
                        onClick={handleSendChatMessage}
                        disabled={!chatMessage.trim() || !liveConnected || streamType !== null}
                        className={`w-12 flex items-center justify-center text-white border-none rounded-lg text-sm transition-all duration-200 shadow-lg ${
                            !chatMessage.trim() || !liveConnected || streamType !== null
                                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                                : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
                        }`}
                    >
                        <Send />
                    </button>
                    <button
                        onClick={() => setVoiceModeEnabled(!voiceModeEnabled)}
                        disabled={!liveConnected}
                        className={`w-12 flex items-center justify-center text-white border-none rounded-lg text-sm transition-all duration-200 shadow-lg ${
                            !liveConnected
                                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                                : voiceModeEnabled
                                    ? 'bg-red-600 cursor-pointer hover:bg-red-700'
                                    : 'bg-teal-600 cursor-pointer hover:bg-slate-700'
                        }`}
                    >
                        {voiceModeEnabled ? <StopCircle /> : <Mic />}
                    </button>
                </div>

                {/* Stream Buttons */}
                <div className="flex gap-3 mb-4 h-12">
                    <button
                        onClick={handleClearChat}
                        className="flex-1 flex items-center justify-center bg-slate-700 rounded-lg text-white border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors duration-200 text-sm font-medium"
                    >
                        Clear Chat
                    </button>
                    <button
                        className={`w-12 flex items-center justify-center text-white border-none rounded-lg text-sm transition-all duration-200 shadow-lg ${
                            streamType === "webcam"
                                ? 'bg-red-600 cursor-pointer hover:bg-red-700'
                                : 'bg-emerald-600 cursor-pointer hover:bg-emerald-700'
                        }`}
                        onClick={() => toggleCam()}
                        title={streamType === "webcam" ? "Stop Camera" : "Start Camera"}
                    >
                        {streamType === "webcam" ? <StopCircle size={24} /> : <Camera size={24} />}
                    </button>
                    <button
                        className={`w-12 flex items-center justify-center text-white border-none rounded-lg text-sm transition-all duration-200 shadow-lg ${
                            streamType === "screen"
                                ? 'bg-red-600 cursor-pointer hover:bg-red-700'
                                : 'bg-emerald-600 cursor-pointer hover:bg-emerald-700'
                        }`}
                        onClick={() => toggleStream()}
                        title={streamType === "screen" ? "Stop Screen Share" : "Start Screen Share"}
                    >
                        {streamType === "screen" ? <StopCircle size={24} /> : <Monitor size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
}