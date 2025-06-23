import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import useFlowStore from '@/stores/flowStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import EditableText from '@/components/ui/editable-text';
import NodeMenu from './node-menu';
import { FlowNode } from '@/types/flow';

interface FlowHeaderProps {
    isSaving: boolean;
    handleSaveFlow: () => void;
    onAddNode: (type: string, subtype: string) => FlowNode;
}

const FlowHeaderComponent = ({ isSaving, handleSaveFlow, onAddNode }: FlowHeaderProps) => {
    const { flow, updateFlow, markAsUnsaved, hasUnsavedChanges } = useFlowStore();
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    // Debug: Log component lifecycle
    useEffect(() => {
        console.log('🎯 FlowHeader mounted/updated', {
            flowId: flow?.id,
            flowName: flow?.name,
            isActive: flow?.is_active
        });
        return () => {
            console.log('🎯 FlowHeader unmounting');
        };
    }, [flow?.id, flow?.name, flow?.is_active]);

    const handleNameChange = useCallback((newName: string) => {
        console.log('✏️ Name change:', newName);
        if (flow && newName !== flow.name) {
            updateFlow({ name: newName });
            markAsUnsaved();
        }
    }, [flow, updateFlow, markAsUnsaved]);

    const handleDescriptionChange = useCallback((newDescription: string) => {
        console.log('✏️ Description change:', newDescription);
        if (flow && newDescription !== flow.description) {
            updateFlow({ description: newDescription });
            markAsUnsaved();
        }
        setIsEditingDescription(false);
    }, [flow, updateFlow, markAsUnsaved]);

    const handleIsActiveChange = useCallback((isActive: boolean) => {
        console.log('🔘 Active change:', isActive);
        if (flow && isActive !== flow.is_active) {
            updateFlow({ is_active: isActive });
            markAsUnsaved();
        }
    }, [flow, updateFlow, markAsUnsaved]);

    if (!flow) return null;

    const displayDescription = flow.description || 'Add a description...';

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
            <div className="flex items-center gap-4">
                <NodeMenu onAddNode={onAddNode} />
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-4 min-w-0">
                <div className="w-auto text-center">
                    <EditableText
                        initialValue={flow.name}
                        onSave={handleNameChange}
                        className="text-lg font-semibold text-foreground"
                    />
                </div>
                <div className="relative group mt-1 w-auto text-center">
                    {isEditingDescription ? (
                        <div className="w-auto">
                            <EditableText
                                initialValue={flow.description}
                                onSave={handleDescriptionChange}
                                className="text-sm text-muted-foreground italic"
                            />
                        </div>
                    ) : (
                        <div
                            className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors group w-auto"
                            onClick={() => setIsEditingDescription(true)}
                        >
                            {displayDescription}
                            <svg
                                className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="flow-active-toggle"
                        checked={flow.is_active}
                        onCheckedChange={handleIsActiveChange}
                    />
                    <Label htmlFor="flow-active-toggle" className="text-sm font-medium w-16 text-center">
                        {flow.is_active ? 'Active' : 'Inactive'}
                    </Label>
                </div>
                <button
                    onClick={handleSaveFlow}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isSaving ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            <span>Save Flow</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};

// Memoize the component to prevent unnecessary re-mounts
const FlowHeader = React.memo(FlowHeaderComponent, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.isSaving === nextProps.isSaving &&
        prevProps.handleSaveFlow === nextProps.handleSaveFlow &&
        prevProps.onAddNode === nextProps.onAddNode
    );
});

export default FlowHeader;
