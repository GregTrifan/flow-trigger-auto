import { router } from '@inertiajs/react';
import { ExecutionsData, type ExecutionFilters } from './types';

interface ExecutionsPaginationProps {
    executions: ExecutionsData;
    filters: ExecutionFilters;
}

export default function ExecutionsPagination({ executions, filters }: ExecutionsPaginationProps) {
    if (executions.last_page <= 1) return null;

    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Showing {((executions.current_page - 1) * executions.per_page) + 1} to{' '}
                {Math.min(executions.current_page * executions.per_page, executions.total)} of{' '}
                {executions.total} results
            </div>
            <div className="flex space-x-2">
                {executions.current_page > 1 && (
                    <button
                        onClick={() => router.get('/dashboard/executions', { ...filters, page: executions.current_page - 1 })}
                        className="px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                    >
                        Previous
                    </button>
                )}
                {executions.current_page < executions.last_page && (
                    <button
                        onClick={() => router.get('/dashboard/executions', { ...filters, page: executions.current_page + 1 })}
                        className="px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
