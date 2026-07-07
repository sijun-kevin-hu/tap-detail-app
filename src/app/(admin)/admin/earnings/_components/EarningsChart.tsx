"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Earning } from '@/lib/models/earning';

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

interface EarningsChartProps {
  earnings: Earning[];
}

export default function EarningsChart({ earnings }: EarningsChartProps) {
  // Earnings by day for chart
  const today = getToday();
  const daysInMonth = today.getDate();
  const earningsByDay: number[] = Array(daysInMonth).fill(0);
  earnings.forEach((e) => {
    if (e.price) {
      const d = new Date(e.date);
      const day = d.getDate() - 1;
      earningsByDay[day] += e.price;
    }
  });

  // Prepare data for recharts
  const chartData = earningsByDay.map((val, i) => ({ day: i + 1, earnings: val }));

  return (
    <div className="bg-white rounded-xl p-4 shadow mb-8">
      <div className="text-sm font-medium mb-2">Earnings by Day</div>
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={4} />
            <YAxis tick={{ fontSize: 12 }} width={32} />
            <Tooltip formatter={v => `$${v}`} labelFormatter={d => `Day ${d}`} />
            <Bar dataKey="earnings" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
