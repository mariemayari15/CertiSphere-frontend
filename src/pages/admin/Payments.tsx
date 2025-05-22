import React, { useEffect, useState, useCallback } from 'react';
import { FiRefreshCw, FiSearch, FiInfo } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { fetchAdminPayments, PaymentRow } from '../../services/adminService';

const Payments: React.FC = () => {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [filtered, setFilt] = useState<PaymentRow[]>([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState('');
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('authToken');
  const serverUrl = 'http://13.48.42.53:5000';

  useEffect(() => {
    try {
      if (!token) throw new Error();
      const { role } = jwtDecode<{ userId: number; role: string; exp: number }>(token);
      if (role !== 'admin') throw new Error();
    } catch {
      window.location.href = '/admin-login';
    }
  }, [token]);

  
  const fetchPayments = useCallback(async () => {
    if (!token) return;
    try {
      setLoad(true);
      const payments = await fetchAdminPayments(token, serverUrl);
      setRows(payments);
      setFilt(payments);
    } catch (e: any) {
      setErr(e.message || 'Network error');
    } finally {
      setLoad(false);
    }
  }, [token, serverUrl]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  
  useEffect(() => {
    const term = search.toLowerCase();
    setFilt(
      rows.filter(r =>
        (r.certificate_reference ?? '').toLowerCase().includes(term) ||
        r.client_code.toLowerCase().includes(term) ||
        (r.business_name ?? '').toLowerCase().includes(term)
      )
    );
  }, [search, rows]);

  return (
    <div className="admin-payments-container">
      <header className="payments-header">
        <h1>Payments</h1>
        <button className="btn tiny primary shadow"
                onClick={fetchPayments}
                aria-label="Refresh">
          <FiRefreshCw className={loading ? 'spinning' : ''}/>
        </button>
      </header>

      
      <div className="payments-search">
        <FiSearch className="search-icon"/>
        <input
          placeholder="Search…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>

      
      {error && (
        <div className="error-banner">{error}</div>
      )}

      {loading && rows.length === 0 ? (
        <div className="loading-state">
          <FiRefreshCw className="spinning"/><p>Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FiInfo className="empty-icon"/><p>No payments match.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount (€)</th>
                <th>Client Code</th>
                <th>Paid At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.certificate_id}>
                  <td>{p.certificate_reference ?? '—'}</td>
                  <td>€ {p.amount_eur.toFixed(2)}</td>
                  <td>{p.client_code}</td>
                  <td>{new Date(p.paid_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
