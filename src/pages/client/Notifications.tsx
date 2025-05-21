import React, { useEffect, useState } from 'react';
import { Typography, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  uploadNotificationDocument,
  Notification
} from '../../services/clientService';

const { Title, Text } = Typography;

const UserNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserNotifications(token)
      .then(setNotifications)
      .catch((err) => setError(err.message));
  }, [token, navigate]);

  const markAsRead = async (notifId: number) => {
    if (!token) return;
    try {
      await markNotificationAsRead(notifId, token);
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpload = async (notifId: number, file: File) => {
    if (!token) return;
    try {
      await uploadNotificationDocument(notifId, file, token);
      message.success('Document uploaded successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Title level={3}>Notifications</Title>
      {error && <Text type="danger">{error}</Text>}

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map(notif => (
          <div
            key={notif.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: notif.is_read ? '#f9f9f9' : '#fff8e1',
            }}
          >
            <Text>{notif.message}</Text>
            <br />
            {notif.request_new_document && notif.certificate_id && (
              <div style={{ marginTop: '0.5rem' }}>
                <Text type="secondary" style={{ fontSize: '0.9rem' }}>
                  Admin requested an additional document. Please upload below:
                </Text>
                <br />
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleUpload(notif.id, e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
            <br />
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              {new Date(notif.created_at).toLocaleString()}
            </Text>
            <div style={{ marginTop: '0.5rem' }}>
              {!notif.is_read && (
                <Button size="small" onClick={() => markAsRead(notif.id)}>
                  Mark as Read
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserNotifications;
