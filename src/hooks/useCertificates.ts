import { useCallback, useEffect, useState } from 'react';
import { certificateService, Certificate } from '..//certificateService';
import { adminService, AdminUser } from '../services/adminService';

export function useCertificates(token?: string) {
  const [certs,  setCerts]  = useState<Certificate[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* fetch certificates */
  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setCerts(await certificateService.list(token));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* fetch admin list */
  useEffect(() => {
    if (!token) return;
    adminService
      .listAdmins(token)
      .then(setAdmins)
      .catch((e: any) => setError(e.message));
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  /* assign helper */
  const assignAdmin = async (certId: number, adminId: number) => {
    if (!token) return;
    await certificateService.assignAdmin(certId, adminId, token);
    setCerts(prev =>
      prev.map(c =>
        c.certificate_id === certId ? { ...c, assigned_admin_id: adminId } : c
      )
    );
  };

  return { certs, admins, loading, error, refresh, assignAdmin };
}
