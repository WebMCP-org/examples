import { type Node } from 'reactflow';

import { MCP_SERVERS, type MCP_SERVERS_CONFIG } from './mcp_config.ts';


export const CONST_CONFIG = {
  LLM_NODE_ID: "llm-1"
};


// Helper functions
const createMCPServerNode = (id: string, config: MCP_SERVERS_CONFIG): Node => ({
  id,
  type: 'mcpServer',
  position: config.position,
  data: {
    label: config.label,
    url: config.url,
    connected: false,
  },
});



export const initialNodes: Node[] = [
  {
    id: CONST_CONFIG.LLM_NODE_ID,
    type: 'llm',
    position: { x: 100, y: 150 },
    data: { label: 'Gemini LLM' },
  },
  ...Object.entries(MCP_SERVERS).map(([id, config]) => createMCPServerNode(id, config)),
];