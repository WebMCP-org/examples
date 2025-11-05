import { type FunctionDeclaration } from '@google/generative-ai';

import { LLM_CONFIG } from '../config/ai_config';
import { MCP_SERVERS } from '../config/mcp_config.ts';

import type { LiveConfig, MCPTool } from './clientTypes.ts';


// ########################################################################
// ###################### LIVE GEMINI CLIENT UTILS ########################
// ########################################################################

export type GetAudioContextOptions = AudioContextOptions & {
  id?: string;
};

const map: Map<string, AudioContext> = new Map();

export const audioContext: (
  options?: GetAudioContextOptions,
) => Promise<AudioContext> = (() => {
  const didInteract = new Promise((res) => {
    window.addEventListener("pointerdown", res, { once: true });
    window.addEventListener("keydown", res, { once: true });
  });

  return async (options?: GetAudioContextOptions) => {
    try {
      const a = new Audio();
      a.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      await a.play();
      if (options?.id && map.has(options.id)) {
        const ctx = map.get(options.id);
        if (ctx) {
          return ctx;
        }
      }
      const ctx = new AudioContext(options);
      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    } catch (e) {
      await didInteract;
      if (options?.id && map.has(options.id)) {
        const ctx = map.get(options.id);
        if (ctx) {
          return ctx;
        }
      }
      const ctx = new AudioContext(options);
      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    }
  };
})();


export const blobToJSON = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const json = JSON.parse(reader.result as string);
        resolve(json);
      } else {
        reject("oops");
      }
    };
    reader.readAsText(blob);
  });

  
export function base64ToArrayBuffer(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}



// ########################################################################
// #################### GET MCP TOOL CONFIG FOR LLM #######################
// ########################################################################

const convertMCPParams = (params: any): any => {
  if (!params || !params.properties) {
    return {};
  }

  const properties: any = {};
  for (const [key, value] of Object.entries(params.properties)) {
    const param = value as any;
    properties[key] = {
      type: param.type || "string",
      description: param.description || key,
      // Add format and other OpenAPI schema properties if they exist
      ...(param.format && { format: param.format }),
      ...(param.enum && { enum: param.enum }),
      ...(param.items && { items: param.items })
    };
  }
  
  return properties;
};


export const createLiveConfigWithTools = (mcpTools: MCPTool[]): LiveConfig => {
  if (mcpTools.length === 0) return LLM_CONFIG;

  // Convert MCP tools to proper Live API FunctionDeclaration format
  const mcpFunctionDeclarations = mcpTools.map(tool => {
    const functionDeclaration = {
      name: tool.name,
      description: tool.description || `Execute ${tool.name}`,
      parameters: {
        type: "object",
        properties: convertMCPParams(tool.parameters),
        required: tool.parameters?.required || []
      }
    };
    
    return functionDeclaration;
  });

  // Create the tools array in the correct LiveConfig format
  const tools: LiveConfig['tools'] = [{
    functionDeclarations: mcpFunctionDeclarations as FunctionDeclaration[]
  }];

  return {
    ...LLM_CONFIG,
    tools: tools
  };
};



// ########################################################################
// ######################## GET NODE INFORMATION ##########################
// ########################################################################

export const isMCPServer = (nodeId: string | null): nodeId is keyof typeof MCP_SERVERS => {
  if (!nodeId) return false;
  
  return nodeId in MCP_SERVERS;
};

export const getServerName = (serverId: string): string => {
  return isMCPServer(serverId) ? MCP_SERVERS[serverId].label : serverId;
};