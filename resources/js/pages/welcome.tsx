import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/contact/contact-form';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
    className?: string;
    iconClassName?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    icon,
    className = '',
    iconClassName = 'bg-gray-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400'
}) => {
    return (
        <div className={`transition-all duration-300 ${className}`}>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${iconClassName}`}>
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    );
};

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
            <Head title="FTA - Visual Workflow Automation">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <div className="absolute inset-0 bg-grid-gray-200 dark:bg-grid-gray-800 [mask-image:linear-gradient(0deg,transparent,white)] dark:[mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.05))]" />

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
                <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        FTA
                    </Link>
                    <nav className="flex items-center space-x-6">
                        {auth.user ? (
                            <Link href={route('dashboard')}>
                                <Button variant="outline" className="border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">
                                    Log in
                                </Link>
                                <Link href={route('register')}>
                                    <Button className="bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg hover:from-teal-700 hover:to-blue-700 dark:from-teal-500 dark:to-blue-500 dark:hover:from-teal-600 dark:hover:to-blue-600">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 py-20 dark:from-gray-950 dark:to-gray-900 lg:py-32">
                    <div className="absolute inset-0 -z-10 opacity-30">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    </div>
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-6 inline-flex items-center rounded-full border border-teal-100 bg-teal-50/80 px-4 py-1.5 text-sm font-medium text-teal-800 backdrop-blur-sm dark:border-teal-900/30 dark:bg-teal-900/30 dark:text-teal-200">
                                🔁 Visual Workflow Automation for Email, SMS, and Forms
                            </div>
                            <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-teal-400 dark:to-blue-400 sm:text-5xl md:text-6xl lg:text-7xl">
                                Build, Trigger, and Track Automated Flows
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                                FTA lets you visually design and execute communication workflows. Trigger automations from form submissions, send emails or SMS, add delays, and branch logic—all with a drag-and-drop builder and real-time execution history.
                            </p>
                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href={auth.user ? route('dashboard') : route('register')} className="w-full sm:w-auto">
                                    <Button
                                        size="lg"
                                        className="w-full transform bg-gradient-to-r from-teal-600 to-blue-600 px-8 text-white shadow-lg transition-all hover:from-teal-700 hover:to-blue-700 hover:shadow-xl active:scale-95 dark:from-teal-500 dark:to-blue-500 dark:hover:from-teal-600 dark:hover:to-blue-600"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="relative bg-white py-20 dark:bg-gray-950">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)]"></div>
                    <div className="container relative mx-auto px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <h2 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-teal-400 dark:to-blue-400 sm:text-5xl">
                                Visual Automation, Real Results
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                                Design, launch, and monitor flows for lead capture, notifications, and more—no code required.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
                            {[
                                {
                                    title: "Drag-and-Drop Builder",
                                    description: "Visually connect triggers, actions, waits, and conditions to automate your business logic. Instantly see your workflow come to life.",
                                    icon: "🔄"
                                },
                                {
                                    title: "Form-Triggered Automations",
                                    description: "Kick off flows when someone submits a form. Route leads, send emails or SMS, and branch logic based on user data.",
                                    icon: "📝"
                                },
                                {
                                    title: "Execution Tracking",
                                    description: "See every step of every run. Track status and timing for full transparency and easy debugging.",
                                    icon: "📊"
                                }
                            ].map((feature, index) => (
                                <FeatureCard
                                    key={index}
                                    title={feature.title}
                                    description={feature.description}
                                    icon={feature.icon}
                                    className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900/50 dark:shadow-teal-900/20"
                                    iconClassName="bg-gradient-to-r from-teal-100 to-blue-100 text-teal-600 dark:from-teal-900/50 dark:to-blue-900/50 dark:text-teal-400"
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="bg-white py-20 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                    <div className="container relative mx-auto px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:bg-gradient-to-r dark:from-teal-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent sm:text-4xl">
                                    Get in touch
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                                    Have questions about FTA? We'd love to hear from you.
                                </p>
                            </div>
                            <div className="mt-12">
                                <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 dark:bg-gray-800/50 dark:ring-white/10 sm:p-10">
                                    <ContactForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="flex items-center space-x-2">
                            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                FTA
                            </Link>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                &copy; {new Date().getFullYear()} All rights reserved
                            </span>
                        </div>
                        <div className="mt-4 flex space-x-6 md:mt-0">
                            <a href="https://x.com/grigore_trifan" className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400" target="_blank" rel="noopener noreferrer">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="https://github.com/GregTrifan/flow-trigger-auto" className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400" target="_blank" rel="noopener noreferrer">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#contact" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
