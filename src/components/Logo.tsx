import Link from 'next/link';
import CarLogo from '../components/CarLogo';

export default function Logo() {
    return (
        <Link href="/" className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium hover:bg-indigo-200 transition">
            <CarLogo className="h-6 w-auto mr-2" />
            Tap Detail
        </Link>
    );
} 