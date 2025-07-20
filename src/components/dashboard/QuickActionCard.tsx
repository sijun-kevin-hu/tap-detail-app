import React from 'react';
import Link from 'next/link';

interface QuickActionCardProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  hoverBgColor: string;
  onClick?: () => void;
}

export default function QuickActionCard({
  href,
  icon,
  title,
  description,
  bgColor,
  iconColor,
  hoverBgColor,
  onClick
}: QuickActionCardProps) {
  const cardContent = (
    <div className="flex flex-col items-center text-center">
      <div className={`h-12 w-12 sm:h-14 sm:w-14 ${bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:${hoverBgColor} transition duration-200`}>
        <div className={`h-6 w-6 sm:h-7 sm:w-7 ${iconColor}`}>
          {icon}
        </div>
      </div>
      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h4>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`card p-4 sm:p-6 hover:shadow-lg transition duration-200 group touch-target ${onClick ? 'cursor-pointer' : ''}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div 
      className={`card p-4 sm:p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition duration-200 group touch-target' : ''}`}
      onClick={onClick}
    >
      {cardContent}
    </div>
  );
} 