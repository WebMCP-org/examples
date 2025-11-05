import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import LLMNode from './components/nodes/LLMNode';
import MCPServerNode from './components/nodes/MCPServerNode';
import ChatSection from './components/ChatPanel';

import { useGemini } from './ai/llmContext.tsx';

import { initialNodes, CONST_CONFIG } from './config/initialSetup_config.ts';
import { isMCPServer, getServerName } from './lib/utils';


const nodeTypes: NodeTypes = {
  llm: LLMNode,
  mcpServer: MCPServerNode,
};


function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  
  const { mcpConnect, mcpDisconnect, liveConnected } = useGemini();


  // Clear localStorage on mount
  useEffect(() => {
    localStorage.clear();

  }, []);
  
  
  const updateMCPNode = useCallback((nodeId: string, isConnected: boolean) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, connected: isConnected } }
        : node
    ));
  }, [setNodes]);


  const disconnectExistingMCP = useCallback(async (excludeTargetId?: string) => {
    const isLLMEdge = (edge: Edge) => edge.source === CONST_CONFIG.LLM_NODE_ID;
    const edgesToRemove = edges.filter(edge =>
      isLLMEdge(edge) && edge.target !== excludeTargetId
    );

    if (edgesToRemove.length > 0 || liveConnected) {
      console.log('🔌 Auto-disconnecting previous MCP connection...');
      await mcpDisconnect();

      setEdges(eds =>
        eds.filter(edge =>
          !isLLMEdge(edge) || edge.target === excludeTargetId
        )
      );

      edgesToRemove.forEach(edge => {
        if (isMCPServer(edge.target)) {
          updateMCPNode(edge.target, false);
        }
      });
    }
  }, [edges, setEdges, updateMCPNode, mcpDisconnect, liveConnected]);


  const connectToMCP = useCallback(async (targetId: string) => {
    await disconnectExistingMCP(targetId);
    const success = await mcpConnect(targetId);
    
    if (success) {
      updateMCPNode(targetId, true);
    } else {
      await mcpDisconnect();
    setEdges([]);
    }
  }, [updateMCPNode, mcpConnect, disconnectExistingMCP]);


  const onConnect = useCallback(async (params: Connection) => {
    if (params.source === CONST_CONFIG.LLM_NODE_ID && isMCPServer(params.target)) {
      setEdges((eds) => addEdge(params, eds));
      await connectToMCP(params.target);
    } else if (params.source === CONST_CONFIG.LLM_NODE_ID) {
      setEdges((eds) => addEdge(params, eds));  
    }
  }, [setEdges, connectToMCP]);

  
  const onEdgesDelete = useCallback(async (edgesToDelete: Edge[]) => {
    for (const edge of edgesToDelete) {
      if (edge.source === CONST_CONFIG.LLM_NODE_ID && isMCPServer(edge.target)) {
        console.log(`🔌 Disconnecting from ${getServerName(edge.target)} due to edge deletion`);
        await mcpDisconnect();
        updateMCPNode(edge.target, false);
      }
    }
  }, [mcpDisconnect, updateMCPNode]);




  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        backgroundColor: '#1a1a1a',
        color: '#e0e0e0',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden'
      }}
    >
      <div className="w-full h-full border border-solid border-[#333] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}
          elementsSelectable={true}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background color="#333" />
          <Controls />
        </ReactFlow>
      </div>

      <ChatSection 
        disconnectNode={disconnectExistingMCP}
      />      
    </div>
  );
}

export default App;