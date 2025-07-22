import Link from 'next/link';

export default function NavBar() {
    return (
        <nav className="glass border-b border-white/20 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium hover:bg-indigo-200 transition">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Tap Detail
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link href="/book" className="text-gray-700 hover:text-gray-900 font-medium transition duration-200">
                            Find Detailers
                        </Link>
                        <Link href="/signup" className="text-gray-700 hover:text-gray-900 font-medium transition duration-200">
                            Join as Detailer
                        </Link>
                        <Link href="/login" className="btn-primary text-sm">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
} 