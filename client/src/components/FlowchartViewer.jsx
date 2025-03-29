import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Controls, Background, useNodesState, useEdgesState, 
  addEdge, Panel, MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Custom node types
const nodeTypes = {
  start: ({ data }) => (
    <div className="flow-node start-node">
      {data.label}
    </div>
  ),
  process: ({ data }) => (
    <div className="flow-node process-node">
      {data.label}
    </div>
  ),
  decision: ({ data }) => (
    <div className="flow-node decision-node">
      {data.label}
    </div>
  ),
  io: ({ data }) => (
    <div className="flow-node io-node">
      {data.label}
    </div>
  ),
  end: ({ data }) => (
    <div className="flow-node end-node">
      {data.label}
    </div>
  )
};

// Initial position function to prevent the error
const getInitializedNodes = (nodes) => {
  return nodes.map((node, index) => ({
    ...node,
    // Add default position if not already present
    position: node.position || { 
      x: 100 + (index % 3) * 200, 
      y: 100 + Math.floor(index / 3) * 100 
    },
  }));
};

function FlowchartViewer({ flowData }) {
  // Initialize with empty arrays if flowData is not provided
  const initialNodes = useMemo(() => {
    return flowData?.nodes ? getInitializedNodes(flowData.nodes) : [];
  }, [flowData]);
  
  const initialEdges = flowData?.edges || [];
  
  // Set up state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Apply default styling to nodes and edges
  const styledNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      style: {
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        width: 180,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '12px',
      },
      // Apply specific styles based on node type
      ...(node.type === 'start' && { 
        style: { 
          background: 'rgba(218, 232, 252, 0.8)',
          borderColor: '#6c8ebf',
          borderRadius: '24px',
        } 
      }),
      ...(node.type === 'end' && { 
        style: { 
          background: 'rgba(218, 232, 252, 0.8)',
          borderColor: '#6c8ebf',
          borderRadius: '24px',
        } 
      }),
      ...(node.type === 'decision' && { 
        style: { 
          background: 'rgba(255, 242, 204, 0.8)',
          borderColor: '#d6b656',
          borderRadius: '4px',
          transform: 'rotate(45deg)',
          width: 120,
          height: 120,
        },
        data: {
          ...node.data,
          labelStyle: {
            transform: 'rotate(-45deg)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }
        }
      }),
    }));
  }, [nodes]);
  
  // Apply default styling to edges
  const styledEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#888' },
      labelStyle: { 
        fill: '#333', 
        fontWeight: 500,
        background: 'white',
        padding: '2px 4px', 
        borderRadius: '4px',
        fontSize: '12px',
      },
    }));
  }, [edges]);

  // Auto-layout the graph
  const onLayout = useCallback(() => {
    if (!nodes.length) return;
    
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50 });
    
    // Add nodes and edges to dagre
    nodes.forEach(node => {
      // Adjust size based on node type
      const width = node.type === 'decision' ? 120 : 180;
      const height = node.type === 'decision' ? 120 : 60;
      dagreGraph.setNode(node.id, { width, height });
    });
    
    edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    
    // Calculate layout
    dagre.layout(dagreGraph);
    
    // Apply layout to nodes with error checking
    const layoutedNodes = nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      // Skip nodes dagre couldn't layout (shouldn't happen)
      if (!nodeWithPosition) {
        console.warn(`No position for node ${node.id}`);
        return node;
      }
      
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (node.type === 'decision' ? 60 : 90),
          y: nodeWithPosition.y - (node.type === 'decision' ? 60 : 30)
        }
      };
    });
    
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);
  
  // Apply layout when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => onLayout(), 100);
      return () => clearTimeout(timer);
    }
  }, [initialNodes.length]); // Only re-run when node count changes
  
  return (
    <div className="flowchart-container glassmorphism">
      <div style={{ width: '100%', height: '600px' }}>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <Panel position="top-right">
            <button 
              onClick={onLayout}
              className="glassmorphism-button"
            >
              Auto Layout
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default FlowchartViewer; 