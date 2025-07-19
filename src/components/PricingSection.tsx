import Link from 'next/link';

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Simple, Transparent
                        <span className="text-blue-600"> Pricing</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Choose the plan that fits your business size. No hidden fees, no surprises.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$29</span>
                            <span className="text-gray-600">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Up to 100 clients
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Basic scheduling
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Payment processing
                            </li>
                        </ul>
                        <Link href="/signup" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition duration-200 text-center block">
                            Start Free Trial
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-xl transform scale-105 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Professional</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">$59</span>
                            <span className="text-blue-100">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-white">
                                <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Unlimited clients
                            </li>
                            <li className="flex items-center text-white">
                                <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Advanced scheduling
                            </li>
                            <li className="flex items-center text-white">
                                <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Marketing tools
                            </li>
                            <li className="flex items-center text-white">
                                <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Analytics dashboard
                            </li>
                        </ul>
                        <Link href="/signup" className="w-full bg-white text-blue-600 hover:bg-gray-50 py-3 px-6 rounded-xl font-semibold transition duration-200 text-center block">
                            Start Free Trial
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$99</span>
                            <span className="text-gray-600">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Everything in Professional
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Team management
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Priority support
                            </li>
                        </ul>
                        <Link href="/signup" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition duration-200 text-center block">
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
} 