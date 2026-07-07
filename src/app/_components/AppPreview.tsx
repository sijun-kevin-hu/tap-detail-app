import React from 'react';
import {
    CurrencyDollarIcon,
    BriefcaseIcon,
    UserGroupIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import StatCard from '@/components/ui/StatCard';
import Logo from '@/components/ui/Logo';

export default function AppPreview() {
    return (
        <div className="rounded-xl bg-gray-50 shadow-2xl ring-1 ring-gray-900/10 overflow-hidden">
            {/* Mock Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <Logo businessName="Elite Auto Detailing" />
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                        Preview Mode
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            JD
                        </div>
                        <span className="text-sm font-medium text-gray-700">John Doe</span>
                    </div>
                </div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="p-4 sm:p-6 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={<CurrencyDollarIcon />}
                        label="Revenue (This Week)"
                        value="$1,250"
                        bgColor="bg-green-100"
                        iconColor="text-green-600"
                    />
                    <StatCard
                        icon={<BriefcaseIcon />}
                        label="Jobs Completed"
                        value="8"
                        bgColor="bg-blue-100"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={<UserGroupIcon />}
                        label="Active Clients"
                        value="142"
                        bgColor="bg-purple-100"
                        iconColor="text-purple-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area - Recent Appointments */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Today&apos;s Schedule</h3>

                        {/* Appointment 1 */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="bg-indigo-50 rounded-lg p-3 text-center min-w-[80px]">
                                <div className="text-indigo-600 font-bold text-lg">10:00</div>
                                <div className="text-indigo-400 text-xs uppercase font-bold">AM</div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Tesla Model Y - Full Detail</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <UserGroupIcon className="w-4 h-4" />
                                        Sarah Smith
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CurrencyDollarIcon className="w-4 h-4" />
                                        $250
                                    </span>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                Confirmed
                            </div>
                        </div>

                        {/* Appointment 2 */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center opacity-75">
                            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
                                <div className="text-gray-600 font-bold text-lg">02:00</div>
                                <div className="text-gray-400 text-xs uppercase font-bold">PM</div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Ford F-150 - Interior Only</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <UserGroupIcon className="w-4 h-4" />
                                        Mike Johnson
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CurrencyDollarIcon className="w-4 h-4" />
                                        $180
                                    </span>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                Pending
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm">
                                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                    <PlusIcon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-700">New Appointment</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                    <UserGroupIcon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-700">Add Client</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
