import { FlowEdge, FlowNode } from '@/types/flow';
import { ApiEdge, toBackendEdge, toFEEdge } from '@/utils/edge-converter';
import { ApiNode, toBENode, toFENode } from '@/utils/node-converter';
import { applyEdgeChanges, applyNodeChanges, EdgeChange, NodeChange } from '@xyflow/react';
import axios from 'axios';
import { create } from 'zustand';

// Add a Flow type
export interface Flow {
    id: number | null;
    name: string;
    description: string;
    is_active: boolean;
}

interface FlowState {
    flow: Flow | null;
    nodes: FlowNode[];
    edges: FlowEdge[];
    selectedNode: FlowNode | null;
    isLoading: boolean;
    error: string | null;
    hasUnsavedChanges: boolean;
    shouldAnimateEdges: boolean;
    // Actions
    updateFlow: (data: Partial<Flow>) => void;
    setNodes: (nodes: FlowNode[]) => void;
    setEdges: (edges: FlowEdge[]) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    setSelectedNode: (node: FlowNode | null) => void;
    updateNode: (node: FlowNode) => void;
    deleteNodeAndEdges: (nodeId: string) => void;
    deleteEdge: (edgeId: string) => void;
    fetchFlow: (flowId: string) => Promise<void>;
    saveFlow: (flowId: string) => Promise<boolean>;
    saveFlowWithUpdates: (flowId: string, flowUpdates: Partial<Flow>) => Promise<boolean>;
    markAsUnsaved: () => void;
    markAsSaved: () => void;
}

const useFlowStore = create<FlowState>((set, get) => ({
    flow: null,
    nodes: [],
    edges: [],
    selectedNode: null,
    isLoading: false,
    error: null,
    hasUnsavedChanges: false,
    shouldAnimateEdges: false,

    updateFlow: (data) => {
        set((state) => {
            if (!state.flow) return state;

            // Only update if there are actual changes
            const hasChanges = Object.keys(data).some((key) => state.flow![key as keyof Flow] !== data[key as keyof Flow]);

            if (!hasChanges) return state;

            return {
                flow: { ...state.flow, ...data },
                hasUnsavedChanges: true,
                shouldAnimateEdges: true,
            };
        });
    },

    setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true, shouldAnimateEdges: true }),
    setEdges: (edges) => set({ edges, hasUnsavedChanges: true, shouldAnimateEdges: true }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes).map((node) => ({
                ...node,
                data: node.data || {},
            })) as FlowNode[],
            hasUnsavedChanges: true,
            shouldAnimateEdges: true,
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges) as FlowEdge[],
            hasUnsavedChanges: true,
            shouldAnimateEdges: true,
        });
    },

    setSelectedNode: (node) => set({ selectedNode: node }),

    updateNode: (node: FlowNode) => {
        set((state) => ({
            nodes: state.nodes.map((n) => (n.id === node.id ? node : n)),
            hasUnsavedChanges: true,
            shouldAnimateEdges: true,
        }));
    },

    deleteNodeAndEdges: (nodeId: string) => {
        set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== nodeId),
            edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
            selectedNode: null,
            hasUnsavedChanges: true,
            shouldAnimateEdges: true,
        }));
    },

    deleteEdge: (edgeId: string) => {
        set((state) => ({
            edges: state.edges.filter((e) => e.id !== edgeId),
            hasUnsavedChanges: true,
            shouldAnimateEdges: true,
        }));
    },

    markAsUnsaved: () => set({ hasUnsavedChanges: true, shouldAnimateEdges: true }),
    markAsSaved: () => set({ hasUnsavedChanges: false, shouldAnimateEdges: false }),

    fetchFlow: async (flowId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await axios.get<{
                flow: Flow;
                nodes: ApiNode[];
                edges: ApiEdge[];
            }>(`/api/v1/flows/${flowId}`);

            const { flow, nodes: apiNodes, edges: apiEdges } = response.data;

            set({
                flow: flow,
                hasUnsavedChanges: false,
            });

            // Convert API nodes and edges to FE format using converters
            const flowNodes = Array.isArray(apiNodes) ? apiNodes.map(toFENode) : [];
            const flowEdges = Array.isArray(apiEdges) ? apiEdges.map(toFEEdge) : [];
            set({
                nodes: flowNodes,
                edges: flowEdges,
                hasUnsavedChanges: false,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? `Failed to load flow: ${error.message}` : 'Failed to load flow';
            set({ error: errorMessage });
            console.error('Error fetching flow:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    saveFlow: async (flowId) => {
        try {
            set({ isLoading: true, error: null });
            const { nodes, edges, flow } = get();

            // 1. Transform Nodes for Backend using converter
            const nodesForApi = nodes.map(toBENode);

            // 2. Transform Edges for Backend using converter
            const edgesForApi = edges.map(toBackendEdge);

            // 3. Construct the final payload
            const payload = {
                flow: flow,
                nodes: nodesForApi,
                edges: edgesForApi,
            };

            await axios.put(`/api/v1/flows/${flowId}`, payload);

            set({ error: null });
            get().markAsSaved();
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? `Failed to save flow: ${error.message}` : 'Failed to save flow';
            set({ error: errorMessage });
            console.error('Error saving flow:', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    saveFlowWithUpdates: async (flowId, flowUpdates) => {
        try {
            set({ isLoading: true, error: null });
            const { nodes, edges, flow } = get();

            if (!flow) {
                set({ error: 'No flow data available' });
                return false;
            }

            // Create updated flow with the new values
            const updatedFlow = { ...flow, ...flowUpdates };

            // 1. Transform Nodes for Backend using converter
            const nodesForApi = nodes.map(toBENode);

            // 2. Transform Edges for Backend using converter
            const edgesForApi = edges.map(toBackendEdge);

            // 3. Construct the final payload
            const payload = {
                flow: updatedFlow,
                nodes: nodesForApi,
                edges: edgesForApi,
            };

            await axios.put(`/api/v1/flows/${flowId}`, payload);

            // Update the store with the new flow data after successful save
            set({ flow: updatedFlow, error: null });
            get().markAsSaved();
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? `Failed to save flow: ${error.message}` : 'Failed to save flow';
            set({ error: errorMessage });
            console.error('Error saving flow:', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },
}));

export default useFlowStore;
