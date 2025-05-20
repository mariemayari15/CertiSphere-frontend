import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../../../styles/AdminUsersList.css';

import { AdminUser, fetchAllAdminUsers } from '../../../services/adminService';

interface DecodedToken {
  userId: number;
  clientCode: string;
  role: string;
  iat: number;
  exp: number;
}

const AdminUsersList: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const serverUrl = 'http://localhost:5000';

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
      } else {
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Invalid token:', err);
      setError('Authentication failed. Please login again.');
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetchAllAdminUsers(token, serverUrl)
      .then(setUsers)
      .catch((err: any) => {
        console.error('Error fetching users:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return <div className="loading-message">Loading users...</div>;
  }

  return (
    <div className="admin-users-container">
      <h2>All Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Client Code</th>
            <th>Business Name</th>
            <th>Certificates</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={3} className="no-users">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="user-row"
                onClick={() => navigate(`/admin/users/${user.id}`)}
              >
                <td className="client-code-cell">{user.client_code}</td>
                <td className="business-name-cell">{user.business_name || 'N/A'}</td>
                <td className="cert-count-cell">
                  <span className={`cert-badge ${user.cert_count && user.cert_count > 0 ? 'has-certs' : ''}`}>
                    {user.cert_count || 0}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersList;
