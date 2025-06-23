import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

type ContactFormData = {
    name: string;
    email: string;
    phone: string;
};

type FormErrors = {
    name?: string;
    email?: string;
    phone?: string;
    contact?: string;
    [key: string]: string | undefined;
};

interface ContactFormProps {
    className?: string;
    onSuccess?: () => void;
}

export default function ContactForm({ className = '', onSuccess }: ContactFormProps) {
    const { errors: pageErrors } = usePage().props;
    const formRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, wasSuccessful, reset, errors } = useForm<ContactFormData>({
        name: '',
        email: '',
        phone: '',
    });

    // Handle successful submission
    useEffect(() => {
        if (wasSuccessful) {
            reset();
            onSuccess?.();
            // Auto-scroll to show success message
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [wasSuccessful, onSuccess, reset]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData(id as keyof ContactFormData, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: () => {
                // Focus the first field with an error
                const firstError = Object.keys(errors)[0];
                const errorElement = formRef.current?.querySelector(
                    `[name="${firstError}"]`
                ) as HTMLElement;
                if (errorElement) {
                    errorElement.focus();
                }
            }
        });
    };

    const mergedErrors = { ...(pageErrors || {}), ...errors } as FormErrors;
    const hasErrors = Object.keys(mergedErrors).length > 0;

    return (
        <div className={`space-y-6 ${className}`} ref={formRef}>
            {/* Success */}
            {wasSuccessful ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/20">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                Message Sent Successfully!
                            </h3>
                            <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                                Thank you for reaching out! We'll get back to you as soon as possible.
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Error */}
                    {hasErrors && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/20">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                        {mergedErrors.contact || 'Please fix the errors below to continue.'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="name">Full Name</Label>
                                {mergedErrors.name && (
                                    <span className="text-xs text-red-500 dark:text-red-400">
                                        {mergedErrors.name}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={data.name}
                                onChange={handleChange}
                                className={`w-full rounded-lg border-gray-200 bg-white px-4 py-3 shadow-sm transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-900/30 ${mergedErrors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                                placeholder="John Doe"
                                disabled={processing}
                                aria-invalid={!!mergedErrors.name}
                                aria-describedby={mergedErrors.name ? 'name-error' : undefined}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email">
                                    Email {!data.phone && <span className="text-red-500">*</span>}
                                </Label>
                                {mergedErrors.email && (
                                    <span className="text-xs text-red-500 dark:text-red-400">
                                        {mergedErrors.email}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={handleChange}
                                className={`w-full rounded-lg border-gray-200 bg-white px-4 py-3 shadow-sm transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-900/30 ${mergedErrors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                                placeholder="you@example.com"
                                disabled={processing}
                                aria-invalid={!!mergedErrors.email}
                                aria-describedby={mergedErrors.email ? 'email-error' : undefined}
                            />

                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                    AND / OR
                                </span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="phone">
                                    Phone {!data.email && <span className="text-red-500">*</span>}
                                </Label>
                                {mergedErrors.phone && (
                                    <span className="text-xs text-red-500 dark:text-red-400">
                                        {mergedErrors.phone}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                value={data.phone}
                                onChange={handleChange}
                                className={`w-full rounded-lg border-gray-200 bg-white px-4 py-3 shadow-sm transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-900/30 ${mergedErrors.phone ? 'border-red-500 dark:border-red-500' : ''}`}
                                placeholder="+4074942XXXX"
                                disabled={processing}
                                aria-invalid={!!mergedErrors.phone}
                                aria-describedby={mergedErrors.phone ? 'phone-error' : undefined}
                            />
                            {data.phone && !data.phone.startsWith('+') && (
                                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Please enter your phone number in international format, e.g. +4074942XXXX
                                </span>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full justify-center rounded-lg bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-teal-700 dark:hover:bg-teal-600 dark:focus:ring-teal-500 dark:focus:ring-offset-gray-900"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
