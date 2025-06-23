import { Filter } from 'lucide-react';
import { Flow, type ExecutionFilters } from './types';

interface ExecutionFiltersProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    filters: ExecutionFilters;
    flows: Flow[];
    onFilter: (key: string, value: string) => void;
    onClearFilters: () => void;
}

export default function ExecutionFilters({
    showFilters,
    setShowFilters,
    filters,
    flows,
    onFilter,
    onClearFilters,
}: ExecutionFiltersProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Execution History</h1>
                    <p className="text-muted-foreground mt-2">Monitor and analyze workflow executions</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Flow
                            </label>
                            <select
                                value={filters.flow_id || ''}
                                onChange={(e) => onFilter('flow_id', e.target.value)}
                                className="w-full p-2 border bg-transparent border-border/50 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                            >
                                <option value="">All Flows</option>
                                {flows.map((flow) => (
                                    <option key={flow.id} value={flow.id}>
                                        {flow.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => onFilter('status', e.target.value)}
                                className="w-full p-2 border bg-transparent border-border/50 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="running">Running</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={onClearFilters}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
