import Link from 'next/link';
import CarLogo from '../components/CarLogo';

interface LogoProps {
    businessName?: string;
}

export default function Logo({ businessName }: LogoProps) {
    return (
        <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <CarLogo className="h-5 w-auto" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">{businessName || 'Tap Detail'}</span>
        </Link>
    );
} 