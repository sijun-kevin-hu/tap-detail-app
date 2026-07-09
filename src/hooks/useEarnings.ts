"use client";

import { useEffect, useState } from 'react';
import { getEarnings } from '@/lib/firebase/firestore-earnings';
import { Earning } from '@/lib/models/earning';
import { Detailer } from '@/lib/models/detailer';

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getMonthEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
}

export function useEarnings(detailer: Detailer | null) {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'all'>('month');
  const [filterStart, setFilterStart] = useState<string | null>(null);
  const [filterEnd, setFilterEnd] = useState<string | null>(null);

  async function fetchEarnings() {
    if (!detailer?.uid) return;
    let from: string;
    let to: string;
    if (viewMode === 'all' && detailer.createdAt) {
      from = filterStart || detailer.createdAt.split('T')[0];
      to = filterEnd || new Date().toISOString().split('T')[0];
    } else {
      from = getMonthStart().toISOString().split('T')[0];
      to = getMonthEnd().toISOString().split('T')[0];
    }
    const data = await getEarnings(detailer.uid, from, to);
    setEarnings(data);
  }

  useEffect(() => {
    if (detailer?.uid) fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailer?.uid, viewMode, filterStart, filterEnd]);

  return {
    earnings,
    viewMode,
    setViewMode,
    filterStart,
    setFilterStart,
    filterEnd,
    setFilterEnd,
    refetchEarnings: fetchEarnings,
  };
}
