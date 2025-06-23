import { XCircle } from 'lucide-react';
import { ExecutionStep } from './types';
import { statusConfig } from './status-config';

interface ExecutionStepProps {
    step: ExecutionStep;
    index: number;
}

export default function ExecutionStepComponent({ step, index }: ExecutionStepProps) {
    const stepStatus = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.pending;
    const StepStatusIcon = stepStatus.icon;

    const getStepDuration = (step: ExecutionStep) => {
        if (!step.completed_at) return null;
        const start = new Date(step.created_at);
        const end = new Date(step.completed_at);
        const duration = end.getTime() - start.getTime();
        return Math.round(duration / 1000); // seconds
    };

    const duration = getStepDuration(step);

    return (
        <div className="flex items-start space-x-4 p-4 bg-card border border-border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                        <h5 className="text-sm font-medium text-foreground">
                            {step.input?.node_label || step.node?.data.label || `${step.input?.node_type || step.node?.type || 'Unknown'} Step`}
                        </h5>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stepStatus.className}`}>
                            <StepStatusIcon className="h-3 w-3 mr-1" />
                            {stepStatus.label}
                        </span>
                        {Number(duration ?? 0) > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {duration}s
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {new Date(step.created_at).toLocaleTimeString()}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {step.input?.node_type || step.node?.type ? (
                        <span className="capitalize">{String(step.input?.node_type || step.node?.type)}</span>
                    ) : null}
                    {step.input?.node_subtype || step.node?.subtype ? (
                        <span> • {String(step.input?.node_subtype || step.node?.subtype).replace('_', ' ')}</span>
                    ) : null}
                    {step.output?.delay_minutes && (
                        <span> • {step.output.delay_minutes} min delay</span>
                    )}
                </p>

                {/* Error */}
                {step.error && (
                    <div className="mt-2 flex items-center text-xs text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4 mr-1" />
                        {step.error}
                    </div>
                )}
            </div>
        </div>
    );
}
