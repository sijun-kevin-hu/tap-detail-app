import React from 'react';
import Link from 'next/link';

interface QuickActionRowProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    bgColor: string;
    iconColor: string;
    target?: string;
}

export default function QuickActionRow({
    href,
    icon,
    title,
    bgColor,
    iconColor,
    target
}: QuickActionRowProps) {
    return (
        <Link
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            <div className={`${bgColor} p-2 rounded-lg ${iconColor}`}>
                <div className="w-5 h-5">
                    {icon}
                </div>
            </div>
            <span className="font-medium text-gray-700">{title}</span>
        </Link>
    );
}
