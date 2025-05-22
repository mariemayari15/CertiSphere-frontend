import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../../../styles/AdminUserDetail.css';

import {
  AdminUser,
  CertificateItem,
  fetchAdminUserDetail,
} from '../../../services/adminService';

interface DecodedToken {
  userId: number;
  clientCode: string;
  role: string;
  iat: number;
  exp: number;
}

const AdminUserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const serverUrl = 'http://13.48.42.53:5000';

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      navigate('/admin-login');
      return;
    }
    try {
      const decoded = jwtDecode<DecodedToken>(storedToken);
      if (decoded.role !== 'admin') {
        setError('You do not have admin privileges.');
        navigate('/admin-login');
      }
    } catch (err) {
      console.error('Invalid token:', err);
      setError('Authentication failed. Please login again.');
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    if (!id) {
      setError('No user ID param found.');
      return;
    }

    setLoading(true);
    fetchAdminUserDetail(id, token, serverUrl)
      .then(({ user, certificates }) => {
        setUser(user);
        setCerts(certificates);
      })
      .catch((err: any) => {
        console.error('Error fetching user detail:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete')) return 'status-complete';
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('progress')) return 'status-progress';
    if (statusLower.includes('reject')) return 'status-rejected';
    return '';
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return <div className="loading-message">Loading user details...</div>;
  }

  if (!user) {
    return (
      <div className="not-found-message">
        <p>No user found or user is not role='user'.</p>
        <button onClick={() => navigate('/admin/users')} className="btn-back">
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="user-detail-wrapper">
      <div className="user-detail-header">
        <h2>Client Business Profile Details</h2>
      </div>

      <div className="user-profile">
        <div className="user-card">
          <div className="avatar-section">
            <div className="user-name-code">
              <div className="business-name">{user.business_name || 'Unnamed Business'}</div>
              <span className="user-code">{user.client_code}</span>
            </div>
          </div>

          <div className="info-grid">
            <div className="business-info"><strong>Business Name:</strong> {user.business_name ?? 'N/A'}</div>
            <div className="business-info"><strong>Business Type:</strong> {user.business_type ?? 'N/A'}</div>
            <div className="business-info"><strong>Industry:</strong> {user.industry ?? 'N/A'}</div>
            <div className="business-info"><strong>Email:</strong> {user.contact_email ?? 'N/A'}</div>
            <div className="business-info"><strong>Phone:</strong> {user.phone_number ?? 'N/A'}</div>
            <div className="business-info"><strong>Creation Date:</strong> {formatDate(user.created_at)}</div>
          </div>
        </div>

        <div className="certificates-section">
          <h3>Certificates</h3>
          {certs.length === 0 ? (
            <p className="empty-text">No certificates for this user.</p>
          ) : (
            <table className="cert-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Request Date</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(cert => (
                  <tr key={cert.id}>
                    <td>{cert.certificate_type || 'N/A'}</td>
                    <td>{cert.certificate_name || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(cert.status)}`}>
                        {cert.status}
                      </span>
                    </td>
                    <td>{formatDate(cert.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
