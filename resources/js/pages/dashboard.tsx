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

export default function Dashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Workflow Builder" />
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl">
      <h1 className='text-9xl mt-4 font-bold text-center'>WIP</h1>
      </div>
    </AppLayout>
  );
}
