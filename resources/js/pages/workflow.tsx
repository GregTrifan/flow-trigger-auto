import FlowWithProvider from '@/components/flow/flow-with-provider';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Workflow Builder',
        href: '/dashboard/workflow',
    },
];

export default function Workflow() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workflow Builder" />
            <div className="flex h-full flex-col rounded-xl">
                <FlowWithProvider />
            </div>
        </AppLayout>
    );
}
