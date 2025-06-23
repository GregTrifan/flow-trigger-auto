import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';

type NodeData = {
    label?: string;
    type?: string;
    subtype?: string;
    to?: string;
    subject?: string;
    body?: string;
    message?: string;
    url?: string;
    field_name?: string;
    operator?: string;
    value?: string | number;
    delay_minutes?: number;
    datetime?: string;
};

interface FlowNode extends Node {
    data: NodeData;
    type: string;
    position: { x: number; y: number };
}

interface NodeSettingsProps {
    node: FlowNode;
    onUpdate: (node: FlowNode) => void;
    onDelete: (nodeId: string) => void;
}

const NodeSettings = ({ node, onUpdate, onDelete }: NodeSettingsProps) => {
    const [settings, setSettings] = useState<NodeData>(node.data || {});

    // Correctly derive type and subtype from the node prop
    const nodeType = node.type;
    const nodeSubtype = node.data.subtype;

    const inputClasses = "w-full p-2 border bg-transparent border-border/50 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700";
    const labelClasses = "block text-sm font-medium text-muted-foreground mb-1";

    // Available contact fields for conditions
    const contactFields = [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
    ];

    // Available operators for conditions
    const operators = [
        { value: 'exists', label: 'Exists (not empty)' },
        { value: 'not_exists', label: 'Does Not Exist (empty)' },
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does Not Equal' },
        { value: 'contains', label: 'Contains' },
    ];

    useEffect(() => {
        if (JSON.stringify(settings) !== JSON.stringify(node.data)) {
            onUpdate({ ...node, data: settings });
        }
    }, [settings, node, onUpdate]);

    const renderSettings = () => {
        const currentSubtype = settings.subtype || nodeSubtype;

        switch (nodeType) {
            case 'action':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>Action Type</label>
                            <select
                                value={currentSubtype}
                                onChange={(e) => {
                                    setSettings({ ...settings, type: 'action', subtype: e.target.value });
                                }}
                                className={inputClasses}
                            >
                                <option value="send_email">Send Email</option>
                                <option value="send_sms">Send SMS</option>
                            </select>
                        </div>

                        {currentSubtype === 'send_email' && (
                            <>
                                <div>
                                    <label className={labelClasses}>Subject</label>
                                    <input
                                        type="text"
                                        value={settings.subject || ''}
                                        onChange={(e) => setSettings({ ...settings, subject: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Welcome to our service!"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Body</label>
                                    <textarea
                                        value={settings.body || ''}
                                        onChange={(e) => setSettings({ ...settings, body: e.target.value })}
                                        rows={4}
                                        className={inputClasses}
                                        placeholder="Hi {{name}}, welcome to our service! Your email is {{email}}."
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                    <strong>Available variables:</strong> {'{{name}}'}, {'{{email}}'}, {'{{phone}}'}
                                </div>
                            </>
                        )}

                        {currentSubtype === 'send_sms' && (
                            <>
                                <div>
                                    <label className={labelClasses}>Message</label>
                                    <textarea
                                        value={settings.message || ''}
                                        onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                                        rows={4}
                                        className={inputClasses}
                                        placeholder="Hi {{name}}, thanks for contacting us!"
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                    <strong>Available variables:</strong> {'{{name}}'}, {'{{email}}'}, {'{{phone}}'}
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'condition':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>Field</label>
                            <select
                                value={settings.field_name || ''}
                                onChange={(e) => setSettings({ ...settings, field_name: e.target.value })}
                                className={inputClasses}
                            >
                                <option value="">Select a field</option>
                                {contactFields.map(field => (
                                    <option key={field.value} value={field.value}>
                                        {field.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Operator</label>
                            <select
                                value={settings.operator || 'exists'}
                                onChange={(e) => {
                                    const newOperator = e.target.value;
                                    const newSettings = { ...settings, operator: newOperator };

                                    // Clear value field for exists/not_exists operators
                                    if (newOperator === 'exists' || newOperator === 'not_exists') {
                                        delete newSettings.value;
                                    }

                                    setSettings(newSettings);
                                }}
                                className={inputClasses}
                            >
                                {operators.map(operator => (
                                    <option key={operator.value} value={operator.value}>
                                        {operator.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {settings.operator && settings.operator !== 'exists' && settings.operator !== 'not_exists' && (
                            <div>
                                <label className={labelClasses}>Value</label>
                                <input
                                    type="text"
                                    value={settings.value ?? ''}
                                    onChange={(e) => setSettings({ ...settings, value: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Enter value to compare"
                                />
                            </div>
                        )}
                    </div>
                );

            case 'wait':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>Delay (minutes)</label>
                            <input
                                type="number"
                                min="1"
                                value={settings.delay_minutes || 1}
                                onChange={(e) => setSettings({ ...settings, delay_minutes: parseInt(e.target.value) || 1 })}
                                className={inputClasses}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            The flow will pause for the specified number of minutes before continuing to the next step.
                        </div>
                    </div>
                );

            case 'trigger':
                return (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            This flow will trigger when the contact form is submitted.
                        </div>
                    </div>
                );

            default:
                return <div className="text-sm text-muted-foreground">No configuration available for this node type.</div>;
        }
    };

    return (
        <div className="space-y-4">
            {renderSettings()}
            <hr className="border-border/50" />
            <button
                onClick={() => onDelete(node.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-md bg-red-500/90 text-primary-foreground hover:bg-red-600/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
                Delete Node
            </button>
        </div>
    );
};

export default NodeSettings;
