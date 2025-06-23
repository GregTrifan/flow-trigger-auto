import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Workflow, BarChart3 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-col rounded-xl">
                <div className="flex-1 p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Manage your workflows and monitor executions</p>
                    </div>

                    {/* Workflow Builder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <Link
                            href="/dashboard/workflow"
                            className="group block p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <Workflow className="h-8 w-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                        Workflow Builder
                                    </h3>
                                    <p className="text-muted-foreground mt-1">
                                        Create and edit your automation workflows
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Execution History */}
                        <Link
                            href="/dashboard/executions"
                            className="group block p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <BarChart3 className="h-8 w-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                        Execution History
                                    </h3>
                                    <p className="text-muted-foreground mt-1">
                                        Monitor and analyze workflow executions
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
