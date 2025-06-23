
interface NodePanelProps {
    onAddNode?: (type: string, subtype: string) => void;
}

const nodeTypes = {
    trigger: ['form_submit'],
    condition: ['field_check'],
    action: ['send_email', 'send_sms'],
    wait: ['time_delay']
};

const NodePanel = ({ onAddNode }: NodePanelProps) => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = (type: string, subtype: string) => {
        if (onAddNode) {
            onAddNode(type, subtype);
        }
    };

    return (
        <div className="h-full p-4 overflow-y-auto bg-background border-r border-border">
            <div className="sticky top-0 pb-4 bg-background">
                <h3 className="text-sm font-medium text-foreground mb-3">Add Nodes</h3>
            </div>

            <div className="space-y-4">
                {Object.entries(nodeTypes).map(([type, subtypes]) => (
                    <div key={type} className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                            {type}
                        </h4>
                        <div className="grid grid-cols-1 gap-1.5">
                            {subtypes.map((subtype) => (
                                <button
                                    key={`${type}-${subtype}`}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, `${type}.${subtype}`)}
                                    onClick={() => handleClick(type, subtype)}
                                    className="group w-full flex items-center gap-2 p-2 text-sm text-left rounded-md border border-transparent hover:bg-accent hover:text-accent-foreground transition-colors cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary" />
                                    <span>{subtype.replace(/_/g, ' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NodePanel;
