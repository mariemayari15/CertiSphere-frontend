import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiDownload, FiEye, FiX, FiSearch,
  FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import '../../../styles/AdminCertificates.css';

import {
  Certificate,
  AdminUser,
  fetchCertificates,
  fetchAdmins,
  assignCertificateAdmin
} from '../../../services/adminService';

interface DecodedToken { userId: number; role: string; exp: number }

const List: React.FC = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [filtered, setFiltered] = useState<Certificate[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [sortField, setSort] = useState<
    'created_at' | 'certificate_name' | 'certificate_reference' |
    'business_name' | 'status'
  >('created_at');
  const [sortDir, setDir] = useState<'asc' | 'desc'>('desc');

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const serverUrl = 'http://13.48.42.53:5000';

  useEffect(() => { if (!token) navigate('/admin-login'); }, [token, navigate]);

  const currentAdminId = (() => {
    try { return token ? jwtDecode<DecodedToken>(token).userId : null; }
    catch { return null; }
  })();
  const getCertificates = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchCertificates(token, serverUrl);
      setCerts(data);
      setFiltered(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, serverUrl]);

  useEffect(() => { getCertificates(); }, [getCertificates]);
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await fetchAdmins(token, serverUrl);
        setAdmins(data);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [token, serverUrl]);
  const assignAdmin = async (certificateId: number, newAdminId: number) => {
    if (!token) return;
    try {
      await assignCertificateAdmin(certificateId, newAdminId, token, serverUrl);

      setCerts(prev => prev.map(c =>
        c.certificate_id === certificateId ? { ...c, assigned_admin_id: newAdminId } : c
      ));
      setFiltered(prev => prev.map(c =>
        c.certificate_id === certificateId ? { ...c, assigned_admin_id: newAdminId } : c
      ));
    } catch (e: any) {
      setError(e.message);
    }
  };
  useEffect(() => {
    let list = [...certs];
    if (search) {
      const t = search.toLowerCase();
      list = list.filter(c =>
        (c.certificate_name ?? '').toLowerCase().includes(t) ||
        (c.certificate_reference ?? '').toLowerCase().includes(t) ||
        c.business_name.toLowerCase().includes(t) ||
        c.client_code.toLowerCase().includes(t)
      );
    }
    if (statusFilter !== 'all')
      list = list.filter(c => c.status === statusFilter);
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'certificate_name':
          return dir * ((a.certificate_name ?? '').localeCompare(b.certificate_name ?? ''));
        case 'certificate_reference':
          return dir * ((a.certificate_reference ?? '').localeCompare(b.certificate_reference ?? ''));
        case 'business_name':
          return dir * a.business_name.localeCompare(b.business_name);
        case 'status':
          return dir * a.status.localeCompare(b.status);
        default:
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });
    setFiltered(list);
  }, [search, statusFilter, sortField, sortDir, certs]);

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSort('created_at');
    setDir('desc');
    setFiltered(certs);
  };

  return (
    <div className="admin-certificates-container">
      <section className="filter-section">
        <div className="filters-row">
          {/* search */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              placeholder="Search certificates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="clear-search" onClick={() => setSearch('')}><FiX /></button>}
          </div>
          {/* status */}
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Viewed by Admin">Viewed by Admin</option>
              <option value="Processing in Progress">Processing in Progress</option>
              <option value="Additional Documents Required">Additional Documents Required</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort:</label>
            <select value={sortField} onChange={e => setSort(e.target.value as any)}>
              <option value="created_at">Date</option>
              <option value="certificate_name">Certificate</option>
              <option value="certificate_reference">Reference</option>
              <option value="business_name">Business</option>
              <option value="status">Status</option>
            </select>
            <button className="btn tiny neutral" onClick={() => setDir(d => d === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button className="btn tiny neutral" onClick={resetFilters}><FiX /> Reset</button>
        </div>
      </section>
      <div className="certificates-table-wrapper">
        {loading && certs.length === 0 ? (
          <div className="loading-state"><FiRefreshCw className="spinning" /><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><FiInfo className="empty-icon" /><p>No certificates match.</p></div>
        ) : (
          <table className="certificates-table">
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Reference</th>
                <th>Business</th>
                <th>Client Code</th>
                <th>Status</th>
                <th>Date</th>
                <th>Assigned To</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const pdf = `${serverUrl}/certificates/certificate_${c.certificate_id}.pdf`;
                return (
                  <tr key={c.certificate_id}>
                    <td className="cert-name">{c.certificate_name || 'Untitled'}</td>
                    <td>{c.certificate_reference ?? 'Not yet defined'}</td>
                    <td>{c.business_name}</td>
                    <td>{c.client_code}</td>
                    <td><span className={`status-badge ${c.status.toLowerCase().replace(/ /g, '-')}`}>{c.status}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  
                    <td>
                      <select
                        className="admin-select"
                        value={c.assigned_admin_id ?? ''}
                        onChange={e => assignAdmin(c.certificate_id, Number(e.target.value))}
                      >
                        <option value="">Unassigned</option>
                       
                        {currentAdminId && (
                          <option value={currentAdminId}>
                            Me ({admins.find(a => a.id === currentAdminId)?.first_name || 'My Account'})
                          </option>
                        )}
                    
                        {admins
                          .filter(a => a.id !== currentAdminId)
                          .map(a => (
                            <option key={a.id} value={a.id}>
                              {a.first_name} {a.last_name} ({a.client_code})
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="actions-cell">
                      <Link to={`/admin/certifications/${c.certificate_id}`} className="btn tiny info">
                        <FiEye />
                      </Link>
                      {c.status === 'Completed' && (
                        <a href={pdf} target="_blank" rel="noopener noreferrer" className="btn tiny success">
                          <FiDownload />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default List;
