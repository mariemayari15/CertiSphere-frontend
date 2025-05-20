import { useEffect, useState } from 'react';
import { fetchAdminDashboardStats, DashboardStats } from '../services/adminService';

interface UseAdminDashboardStatsReturn {
  stats: DashboardStats | null;
  error: string;
  loading: boolean;
}

export function useAdminDashboardStats(token?: string): UseAdminDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    setLoading(true);
    fetchAdminDashboardStats(token)
      .then((data: DashboardStats) => {  
        if (isMounted) {
          setStats(data);
          setError('');
        }
      })
      .catch((err: unknown) => { 
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return { stats, error, loading };
}
