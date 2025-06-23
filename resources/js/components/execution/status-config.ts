import { CheckCircle, Clock, RefreshCw, SkipForward, XCircle } from 'lucide-react';

export const statusConfig = {
    pending: { label: 'Pending', icon: Clock, className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400' },
    running: { label: 'Running', icon: RefreshCw, className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
    completed: { label: 'Completed', icon: CheckCircle, className: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
    failed: { label: 'Failed', icon: XCircle, className: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400' },
    skipped: { label: 'Skipped', icon: SkipForward, className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400' },
} as const;
