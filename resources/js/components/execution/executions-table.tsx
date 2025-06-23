import { BarChart3 } from 'lucide-react';
import { ExecutionsData } from './types';
import ExecutionRow from './execution-row';

interface ExecutionsTableProps {
    executions: ExecutionsData;
    expandedExecutions: Set<number>;
    loadingSteps: Set<number>;
    onToggleSteps: (executionId: number) => void;
}

export default function ExecutionsTable({
    executions,
    expandedExecutions,
    loadingSteps,
    onToggleSteps
}: ExecutionsTableProps) {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Execution
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Flow
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {executions.data.map((execution) => (
                            <ExecutionRow
                                key={execution.id}
                                execution={execution}
                                isExpanded={expandedExecutions.has(execution.id)}
                                isLoading={loadingSteps.has(execution.id)}
                                onToggleSteps={onToggleSteps}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {executions.data.length === 0 && (
                <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No executions found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Start by creating a workflow and triggering it.
                    </p>
                </div>
            )}
        </div>
    );
}
