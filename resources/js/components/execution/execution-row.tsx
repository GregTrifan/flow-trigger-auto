import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Execution } from './types';
import { statusConfig } from './status-config';
import ExecutionStepComponent from './execution-step';

interface ExecutionRowProps {
    execution: Execution;
    isExpanded: boolean;
    isLoading: boolean;
    onToggleSteps: (executionId: number) => void;
}

export default function ExecutionRow({
    execution,
    isExpanded,
    isLoading,
    onToggleSteps
}: ExecutionRowProps) {
    const status = statusConfig[execution.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = status.icon;

    // Use contact from relation, or from context (for manual runs)
    const contact = execution.contact ?? execution.context?.contact ?? {};

    return (
        <>
            <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    #{execution.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {execution.flow.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    <div>
                        <div className="font-medium">{contact.name || 'N/A'}</div>
                        <div className="text-muted-foreground">{contact.email || 'N/A'}</div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(execution.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                        onClick={() => onToggleSteps(execution.id)}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : isExpanded ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {isLoading ? 'Loading...' : isExpanded ? 'Hide Steps' : `Show Steps${execution.steps ? ` (${execution.steps.length})` : ''}`}
                    </button>
                </td>
            </tr>

            {/* Steps */}
            {isExpanded && execution.steps && (
                <tr>
                    <td colSpan={6} className="px-6 py-4 bg-muted/20">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-foreground">Execution Steps</h4>
                            <div className="space-y-3">
                                {execution.steps.map((step, index) => (
                                    <ExecutionStepComponent
                                        key={step.id}
                                        step={step}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
