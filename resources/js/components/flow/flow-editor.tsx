import { useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    Panel,
    Connection,
    useReactFlow,
    Node
} from '@xyflow/react';
import { FlowNode, FlowEdge } from '@/types/flow';
import NodeSettings from './node-settings';
import useFlowStore from '@/stores/flowStore';
import { nodeTypes } from './node-types/node-types-def';

const FlowEditor = () => {
    const {
        nodes,
        edges,
        selectedNode,
        shouldAnimateEdges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        setSelectedNode,
        updateNode,
        deleteNodeAndEdges,
        deleteEdge,
    } = useFlowStore();

    const { screenToFlowPosition } = useReactFlow();

    // Handle node drag and drop
    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            // Get the position where the node was dropped
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const [nodeType, nodeSubtype] = type.split('.');
            if (!nodeType || !nodeSubtype) return;

            // Create the new node
            const newNode: FlowNode = {
                id: `node-${Date.now()}`,
                type: nodeType,
                position,
                data: {
                    type: nodeType,
                    subtype: nodeSubtype,
                    ...({
                        action: { value: '' },
                        condition: { operator: 'equals', value: '' },
                    }[nodeType] || {}),
                },
                width: 200,
                height: 50,
                selected: false,
                dragging: false,
            };

            // Add the new node to the store
            setNodes([...nodes, newNode]);
        },
        [screenToFlowPosition, nodes, setNodes]
    );

    // Handle edge creation
    const onConnect = useCallback(
        (params: Connection) => {
            const { source, sourceHandle, target, targetHandle } = params;
            if (!source || !target) return;

            const sourceNode = nodes.find(node => node.id === source);
            if (!sourceNode) return;

            const conditionType = sourceNode.type === 'condition'
                ? (sourceHandle === 'true' ? 'if_true' : 'if_false')
                : 'always';

            let label: string | undefined;
            const style: React.CSSProperties = { strokeWidth: 2 };

            if (conditionType === 'if_true') {
                label = 'Yes';
                style.stroke = '#22c55e'; // green-500
            } else if (conditionType === 'if_false') {
                label = 'No';
                style.stroke = '#ef4444'; // red-500
            } else {
                style.stroke = '#555';
            }

            const newEdge: FlowEdge = {
                id: `${source}-${target}-${conditionType}`,
                source,
                target,
                sourceHandle,
                targetHandle,
                style,
                label,
                data: { condition_type: conditionType },
            };

            setEdges([...edges, newEdge]);
        },
        [nodes, edges, setEdges]
    );

    const onEdgeContextMenu = useCallback(
        (event: React.MouseEvent, edge: FlowEdge) => {
            event.preventDefault();
            deleteEdge(edge.id);
        },
        [deleteEdge]
    );

    // Handle node click
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            setSelectedNode(node as FlowNode);
        },
        [setSelectedNode]
    );

    // Handle pane click to deselect node
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);
    ;

    return (
        <div className="h-full w-full bg-background" style={{ height: '100%' }}>
            <ReactFlow
                colorMode="system"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onEdgeContextMenu={onEdgeContextMenu}
                nodeTypes={nodeTypes}
                fitView
                nodeOrigin={[0.5, 0.5]}
                defaultEdgeOptions={{
                    style: {
                        stroke: 'hsl(var(--border))',
                        strokeWidth: 2,
                    },
                    animated: shouldAnimateEdges,
                }}
                style={{
                    backgroundColor: 'hsl(var(--background))',
                    height: '100%',
                    width: '100%',
                }}
            >
                <Background
                    color="hsl(var(--border))"
                    gap={16}
                    size={1}
                    className="opacity-30"
                />
                <Controls
                    className="bg-background/80 backdrop-blur-sm rounded-lg border border-border p-1 shadow-lg"
                    style={{
                        '--background': 'hsl(var(--background))',
                        '--foreground': 'hsl(var(--foreground))',
                        '--border': 'hsl(var(--border))',
                    } as React.CSSProperties}
                />

                {/* Node Settings */}
                {selectedNode && (
                    <Panel
                        position="top-right"
                        className="bg-background/80 backdrop-blur-sm rounded-lg border border-border p-4 shadow-lg w-80"
                    >
                        <h3 className="text-sm font-medium text-foreground mb-4">Node Settings</h3>
                        <NodeSettings
                            key={selectedNode.id}
                            node={selectedNode}
                            onUpdate={updateNode}
                            onDelete={deleteNodeAndEdges}
                        />
                    </Panel>
                )}
            </ReactFlow>
        </div>
    );
};

export default FlowEditor;
