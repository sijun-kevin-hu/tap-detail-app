import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}

export default function StatCard({
  icon,
  label,
  value,
  bgColor,
  iconColor
}: StatCardProps) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex flex-col items-center text-center">
        <div className={`h-10 w-10 sm:h-12 sm:w-12 ${bgColor} rounded-xl flex items-center justify-center mb-3`}>
          <div className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`}>
            {icon}
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
} 