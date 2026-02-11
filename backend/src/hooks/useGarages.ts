import { useState, useEffect, useCallback } from 'react';
import { fetchGarages, fetchGarageById, fetchGarageServices } from '../services/garageService';

export function useGarages() {
  const [garages, setGarages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGarages();
      setGarages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { garages, loading, error, refresh: load };
}

export function useGarageDetail(garageId: string) {
  const [garage, setGarage] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!garageId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGarageById(garageId);
      setGarage(data.garage);
      setServices(data.services);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [garageId]);

  useEffect(() => {
    load();
  }, [load]);

  return { garage, services, loading, error, refresh: load };
}
