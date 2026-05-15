import { useState, useEffect } from 'react';
import { Incident } from '../types';
import { incidentService } from '../services/supabase/incidentService';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = incidentService.subscribeToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { incidents, loading };
}