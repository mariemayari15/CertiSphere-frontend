import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Notification,
  fetchAdminNotifications,
  markNotificationAsRead,
} from '../../services/adminService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const serverUrl = 'http://localhost:5000';

  useEffect(() => {
    
    if (!token) {
      navigate('/admin-login');
      return;
    }

   
    fetchAdminNotifications(token, serverUrl)
      .then(setNotifications)
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [token, navigate, serverUrl]);

  
  const handleMarkAsRead = async (notifId: number) => {
    if (!token) return;

    try {
      await markNotificationAsRead(notifId, token, serverUrl);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Notifications</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {notifications.length === 0 ? (
        <p>No notifications for this admin.</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: notif.is_read ? '#f9f9f9' : '#fdf4d1',
            }}
          >
            <p>{notif.message}</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>
              Created at: {new Date(notif.created_at).toLocaleString()}
            </p>

            {!notif.is_read && (
              <button onClick={() => handleMarkAsRead(notif.id)}>
                Mark as Read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
