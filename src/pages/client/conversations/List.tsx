import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Select,
  Alert,
  List,
  Empty,
  Divider,
  Tag,
} from 'antd';
import {
  MessageOutlined,
  PlusCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/UserConversations.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface Conversation {
  id: number;
  updated_at: string;
  certificate_id: number | null;
}

interface UserCertificate {
  id: number;
  certificate_name: string | null;
}

const UserConversations: React.FC = () => {
  const navigate     = useNavigate();
  const token        = localStorage.getItem('authToken');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [certificates,  setCertificates]  = useState<UserCertificate[]>([]);
  const [selectedCert,  setSelectedCert]  = useState('');
  const [error,        setError]          = useState('');
  const [loading,      setLoading]        = useState(true);

  
  useEffect(() => {
    if (!token) { navigate('/signin'); return; }

    setLoading(true);
    Promise.all([
      fetch('http://13.48.42.53:5000/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch('http://13.48.42.53:5000/api/my-certificates', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([convRes, certRes]) => {
        if (convRes.success) setConversations(convRes.conversations);
        if (certRes.success) setCertificates(certRes.certificates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate, token]);

  
  const startConversation = async () => {
    if (!token) { navigate('/signin'); return; }
    if (!selectedCert) { setError('Choose a certificate or “Other” first.'); return; }

    setLoading(true);
    const certId = selectedCert === 'other' ? null : Number(selectedCert);
    try {
      const res  = await fetch('http://13.48.42.53:5000/api/conversations', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body   : JSON.stringify({ certificateId: certId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Could not create conversation.'); return; }
      navigate(`/user/chat/${data.conversation.id}`);
    } catch (err) {
      console.error(err);
      setError('Server error while creating conversation.');
    } finally {
      setLoading(false);
    }
  };

 
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const certTitle = (id: number | null) => {
    if (!id) return 'General Inquiry';
    const c = certificates.find(c => c.id === id);
    return c ? c.certificate_name || `Certificate #${c.id}` : 'Unknown Certificate';
  };

  
  return (
    <div className="container-fluid py-4">
      
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <Title level={2} className="banner-title">
              <MessageOutlined className="me-2" /> Support Conversations
            </Title>
            <Text className="banner-subtitle">
              View your existing conversations or start a new one
            </Text>
          </div>
          <div className="col-md-4 d-flex justify-content-md-end mt-3 mt-md-0">
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              onClick={() => document.getElementById('new-conversation-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              New Conversation
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
       
        <div className="col-md-8 mb-4">
          <Card className="conversations-card h-100" loading={loading}>
            <Title level={4} className="card-title">
              <MessageOutlined className="me-2" /> Your Conversations
            </Title>
            <Divider className="mt-2 mb-4" />

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                className="mb-4"
              />
            )}

            {!loading && conversations.length === 0 ? (
              <Empty description="No conversations found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={conversations}
                renderItem={c => (
                  <List.Item
                    className="conversation-item"
                    onClick={() => navigate(`/user/chat/${c.id}`)}
                  >
                    <div className="conversation-content">
                      <div className="conversation-header">
                        <Tag
                          color={c.certificate_id ? 'blue' : 'green'}
                          className="conversation-tag"
                        >
                          {c.certificate_id && <FileTextOutlined className="me-1" />}
                          {certTitle(c.certificate_id)}
                        </Tag>
                      </div>
                      <div className="conversation-footer">
                        <span className="conversation-date">
                          <CalendarOutlined className="me-1" />
                          {formatDate(c.updated_at)}
                        </span>
                        <Button type="link" size="small">
                          Open&nbsp;<MessageOutlined />
                        </Button>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>

        
        <div className="col-md-4 mb-4" id="new-conversation-section">
          <Card className="new-conversation-card h-100">
            <Title level={4} className="card-title">
              <PlusCircleOutlined className="me-2" /> Start New Conversation
            </Title>
            <Divider className="mt-2 mb-4" />

            <Text strong>Select a certificate or “General Inquiry”:</Text>
            <Select
              placeholder="-- Select One --"
              className="w-100 mt-2"
              value={selectedCert}
              onChange={v => { setSelectedCert(v); setError(''); }}
              size="large"
            >
              {certificates.map(c => (
                <Option key={c.id} value={c.id.toString()}>
                  <FileTextOutlined className="me-2" />
                  {c.certificate_name || `Certificate #${c.id}`}
                </Option>
              ))}
              <Option value="other">
                <ExclamationCircleOutlined className="me-2" />
                General Inquiry
              </Option>
            </Select>

            {error && <Text type="danger" className="d-block mt-2">{error}</Text>}

            <Button
              type="primary"
              block
              size="large"
              className="start-conversation-btn mt-4"
              icon={<MessageOutlined />}
              onClick={startConversation}
              loading={loading}
            >
              Start Conversation
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserConversations;
