import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import type { Flow } from './types';

interface ManualRunFlowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    flows: Flow[];
    onSuccess?: () => void;
}

export default function ManualRunFlowModal({ open, onOpenChange, flows, onSuccess }: ManualRunFlowModalProps) {
    const [manualError, setManualError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        flow_id: flows[0]?.id || '',
        name: '',
        email: '',
        phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setManualError(null);
        setSuccessMsg(null);
        post('/dashboard/executions/manual-run', {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Flow executed successfully!');
                setTimeout(() => {
                    setSuccessMsg(null);
                    onOpenChange(false);
                    reset();
                    onSuccess?.();
                }, 1200);
            },
            onError: () => {
                setManualError('Please fix the errors below.');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Run Flow Manually</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="flow_id">Flow</Label>
                        <select
                            id="flow_id"
                            name="flow_id"
                            value={data.flow_id}
                            onChange={e => setData('flow_id', e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            required
                        >
                            {flows.map(flow => (
                                <option key={flow.id} value={flow.id}>{flow.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                            minLength={2}
                            maxLength={100}
                            placeholder="John Doe"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            maxLength={100}
                            placeholder="you@example.com"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            maxLength={20}
                            placeholder="+4074942XXXX"
                            className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                    </div>
                    {manualError && <div className="text-red-600 text-sm">{manualError}</div>}
                    {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Running...' : 'Run Flow'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
