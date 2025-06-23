import { useCallback, useEffect, useState } from 'react';
import { useReactFlow, Position } from '@xyflow/react';
import useFlowStore from '@/stores/flowStore';
import FlowEditor from './flow-editor';
import '@xyflow/react/dist/style.css';
import { FlowNode } from '@/types/flow';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import FlowHeader from './flow-header';

interface FlowMasterProps {
    flowId: string;
}

const FlowMaster = ({ flowId }: FlowMasterProps) => {
    const {
        nodes,
        isLoading,
        error,
        setNodes,
        fetchFlow,
        saveFlow,
    } = useFlowStore();

    const [isSaving, setIsSaving] = useState(false);
    const { screenToFlowPosition } = useReactFlow();
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
        details?: string;
    } | null>(null);

    useEffect(() => {
        // Log mount/unmount for debugging
        console.log('FlowMaster mounted/updated', { flowId, nodesCount: nodes.length });
        return () => {
            console.log('FlowMaster unmounting');
        };
    }, [flowId, nodes.length]);

    const handleAddNode = useCallback((type: string, subtype: string) => {
        const position = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });

        const newNode: FlowNode = {
            id: `node-${Date.now()}`,
            type,
            position,
            data: {
                type,
                subtype,
                ...({
                    action: { value: '' },
                    condition: { operator: 'equals', value: '' },
                }[type] || {}),
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            draggable: true,
            connectable: true,
            deletable: true,
            selectable: true,
        } as FlowNode;

        setNodes([...nodes, newNode]);
        return newNode;
    }, [setNodes, nodes, screenToFlowPosition]);

    useEffect(() => {
        if (flowId) {
            fetchFlow(flowId);
        }
    }, [fetchFlow, flowId]);

    const handleSaveFlow = useCallback(async () => {
        if (isSaving) return;
        setIsSaving(true);
        setAlert(null);
        try {
            const success = await saveFlow(flowId);
            if (success) {
                setAlert({
                    type: 'success',
                    message: 'Flow saved successfully!'
                });
                setTimeout(() => setAlert(null), 5000);
            } else {
                setAlert({
                    type: 'error',
                    message: 'Failed to save flow.',
                    details: 'Check the logs for more details.'
                });
                setTimeout(() => setAlert(null), 10000);
            }
        } catch (error: unknown) {
            console.error('Save flow error:', error);
            let details = 'Unknown error';
            if (error instanceof Error) {
                details = error.message;
            } else if (typeof error === 'string') {
                details = error;
            } else if (error && typeof error === 'object') {
                details = JSON.stringify(error);
            }
            setAlert({
                type: 'error',
                message: 'Error saving flow.',
                details
            });
            setTimeout(() => setAlert(null), 10000);
        } finally {
            setIsSaving(false);
        }
    }, [flowId, isSaving, saveFlow, setAlert]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Alert Feedback */}
            {alert && (
                <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
                    <Alert
                        variant={alert.type === 'error' ? 'destructive' : alert.type === 'success' ? 'success' : 'default'}
                        className="shadow-lg flex flex-row items-center gap-4"
                    >
                        <div className="flex-1">
                            <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                            <AlertDescription>{alert.message}</AlertDescription>
                            {alert.details && (
                                <div className="mt-1 text-xs text-muted-foreground break-all">
                                    {alert.details}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setAlert(null)}
                            className="ml-2 text-muted-foreground hover:text-foreground focus:outline-none"
                            aria-label="Dismiss"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </Alert>
                </div>
            )}
            {/* Header */}
            <FlowHeader
                isSaving={isSaving}
                handleSaveFlow={handleSaveFlow}
                onAddNode={handleAddNode}
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/*
                <aside className="w-60 border-r border-border">
                    <NodePanel onAddNode={handleAddNode} />
                </aside>
                */}

                {/* Flow Editor */}
                <div className="flex-1 relative" style={{ height: '100%' }}>
                    <FlowEditor />
                </div>
            </div>
        </div>
    );
};

export default FlowMaster;
