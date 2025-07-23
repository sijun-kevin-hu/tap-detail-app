"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from '@/lib/auth-context';
import { getEarnings, addEarning } from '@/lib/firebase/firestore-earnings';
import { formatDate } from '@/utils/formatters';
import { Earning } from '@/lib/models/earning';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import CurrencyInput from 'react-currency-input-field';

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getMonthEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getMonthName() {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Change defaultNewEarning and NewEarning usage for price to string
const defaultNewEarning = {
  date: new Date().toISOString().split("T")[0],
  clientName: "",
  service: "",
  price: "",
};

export default function EarningsPage() {
  const { detailer } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEarning, setNewEarning] = useState(defaultNewEarning);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  async function fetchEarnings() {
    if (!detailer?.uid) return;
    const from = getMonthStart().toISOString().split("T")[0];
    const to = getMonthEnd().toISOString().split("T")[0];
    const data = await getEarnings(detailer.uid, from, to);
    setEarnings(data);
  }

  useEffect(() => {
    if (detailer?.uid) fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailer?.uid]);

  if (!detailer?.uid) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + (e.price || 0), 0);
  const totalJobs = earnings.length;
  const avgEarnings = totalJobs ? totalEarnings / totalJobs : 0;

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

  // Recent jobs (last 10)
  const recentJobs = [...earnings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Add earnings handler
  const handleAddEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    const priceNum = parseFloat(newEarning.price);
    if (!newEarning.clientName.trim() || !newEarning.service.trim() || isNaN(priceNum) || priceNum <= 0 || !newEarning.date) {
      setAddError("All fields are required");
      return;
    }
    setAdding(true);
    try {
      await addEarning(detailer.uid, {
        clientName: newEarning.clientName,
        service: newEarning.service,
        price: priceNum,
        date: newEarning.date,
      });
      setShowAddModal(false);
      setNewEarning(defaultNewEarning);
      fetchEarnings();
    } catch {
      setAddError("Failed to add earning");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6">
      <div className="flex items-center mb-4">
        <Link href="/admin" className="mr-3 text-gray-500 hover:text-indigo-600 text-lg font-medium">&larr; Back</Link>
        <h1 className="text-2xl font-bold">Earnings</h1>
      </div>
      <div className="text-sm text-gray-500 mb-4">Earnings for {getMonthName()}</div>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500 mb-1">Earnings This Month</div>
          <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500 mb-1">Completed Jobs</div>
          <div className="text-2xl font-bold">{totalJobs}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500 mb-1">Avg. Earnings/Job</div>
          <div className="text-2xl font-bold">${avgEarnings.toFixed(2)}</div>
        </div>
      </div>

      {/* Add Earnings Button */}
      <div className="flex justify-end mb-4">
        <button
          className="btn-primary text-base px-6 py-2 rounded-lg"
          onClick={() => setShowAddModal(true)}
        >
          + Add Earnings
        </button>
      </div>

      {/* Chart */}
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

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-xl p-4 shadow mb-24">
        <div className="text-sm font-medium mb-2">Recent Earnings</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="py-2 px-2 text-left">Date</th>
                <th className="py-2 px-2 text-left">Client</th>
                <th className="py-2 px-2 text-left">Service</th>
                <th className="py-2 px-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} className="border-t last:border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{formatDate(job.date)}</td>
                  <td className="py-2 px-2">{job.clientName}</td>
                  <td className="py-2 px-2">{job.service}</td>
                  <td className="py-2 px-2 text-right">
                    ${job.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Earnings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto p-6">
            <h2 className="text-lg font-bold mb-4">Add Earnings</h2>
            <form onSubmit={handleAddEarning} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="input-modern w-full"
                  value={newEarning.date}
                  onChange={e => setNewEarning({ ...newEarning, date: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-modern w-full"
                  value={newEarning.clientName}
                  onChange={e => setNewEarning({ ...newEarning, clientName: e.target.value })}
                  required
                  autoComplete="off"
                  inputMode="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-modern w-full"
                  value={newEarning.service}
                  onChange={e => setNewEarning({ ...newEarning, service: e.target.value })}
                  required
                  autoComplete="off"
                  inputMode="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <CurrencyInput
                  id="price"
                  name="price"
                  className="input-modern w-full"
                  placeholder="0.00"
                  decimalsLimit={2}
                  prefix={"$"}
                  value={newEarning.price}
                  onValueChange={(value) => {
                    setNewEarning({ ...newEarning, price: value || '' });
                  }}
                  required
                />
              </div>
              {addError && <div className="text-red-600 text-sm mb-2">{addError}</div>}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 