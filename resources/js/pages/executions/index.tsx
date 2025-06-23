import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ExecutionsTable,
    ExecutionsPagination,
    type ExecutionsData,
    type Flow,
} from '@/components/execution';
import ExecutionFiltersComponent from '@/components/execution/execution-filters';
import { type ExecutionFilters } from '@/components/execution/types';
import ManualRunFlowModal from '@/components/execution/manual-run-flow-modal';

interface Props {
    executions: ExecutionsData;
    flows: Flow[];
    filters: ExecutionFilters;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Execution History',
        href: '/dashboard/executions',
    },
];

export default function ExecutionsIndex({ executions: initialExecutions, flows, filters }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [expandedExecutions, setExpandedExecutions] = useState<Set<number>>(new Set());
    const [loadingSteps, setLoadingSteps] = useState<Set<number>>(new Set());
    const [executions, setExecutions] = useState(initialExecutions);
    const [showManualModal, setShowManualModal] = useState(false);

    // Sync local state with props when they change (e.g., after filtering)
    useEffect(() => {
        setExecutions(initialExecutions);
        setExpandedExecutions(new Set());
    }, [initialExecutions]);

    const handleFilter = (key: string, value: string) => {
        router.get('/dashboard/executions', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        router.get('/dashboard/executions', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleExecutionSteps = async (executionId: number) => {
        const newExpanded = new Set(expandedExecutions);

        if (newExpanded.has(executionId)) {
            newExpanded.delete(executionId);
            setExpandedExecutions(newExpanded);
        } else {
            // Load steps if not already loaded
            const execution = executions.data.find(e => e.id === executionId);
            if (execution && !execution.steps) {
                setLoadingSteps(prev => new Set(prev).add(executionId));

                try {
                    const response = await fetch(`/dashboard/executions/${executionId}/steps`);
                    const data = await response.json();

                    setExecutions(prev => ({
                        ...prev,
                        data: prev.data.map(e =>
                            e.id === executionId ? { ...e, steps: data.steps } : e
                        )
                    }));
                } catch (error) {
                    console.error('Failed to load steps:', error);
                } finally {
                    setLoadingSteps(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(executionId);
                        return newSet;
                    });
                }
            }

            newExpanded.add(executionId);
            setExpandedExecutions(newExpanded);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Execution History" />
            <div className="flex h-full flex-col rounded-xl">
                <div className="flex-1 p-6">
                    <ExecutionFiltersComponent
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        filters={filters}
                        flows={flows}
                        onFilter={handleFilter}
                        onClearFilters={clearFilters}
                    />

                    {/* Manual Run Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm border border-primary/30"
                        >
                            Run Flow Manually
                        </button>
                    </div>

                    <ExecutionsTable
                        executions={executions}
                        expandedExecutions={expandedExecutions}
                        loadingSteps={loadingSteps}
                        onToggleSteps={toggleExecutionSteps}
                    />

                    <ExecutionsPagination
                        executions={executions}
                        filters={filters}
                    />
                </div>
            </div>

            <ManualRunFlowModal
                open={showManualModal}
                onOpenChange={setShowManualModal}
                flows={flows}
                onSuccess={() => router.reload({ only: ['executions'] })}
            />
        </AppLayout>
    );
}
