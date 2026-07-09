"use client";

import { useEffect, useState } from 'react';
import { getDetailerByBusinessId } from '@/lib/firebase/firestore-detailers';
import { getServices } from '@/lib/firebase/firestore-settings';
import { Detailer } from '@/lib/models/detailer';
import { ServiceMenu } from '@/lib/models/settings';

export function useBookingData(businessId: string) {
  const [detailer, setDetailer] = useState<Detailer | null>(null);
  const [services, setServices] = useState<ServiceMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetailerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch detailer profile by business ID
        const detailerData = await getDetailerByBusinessId(businessId);
        if (!detailerData) {
          setError('Detailer not found');
          return;
        }
        setDetailer(detailerData);

        // Fetch services using detailer's UID
        const servicesData = await getServices(detailerData.uid);
        setServices(servicesData.filter(service => service.active));

      } catch (err) {
        console.error('Error fetching detailer data:', err);
        setError('Failed to load detailer information');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchDetailerData();
    }
  }, [businessId]);

  return { detailer, services, loading, error, setError };
}
