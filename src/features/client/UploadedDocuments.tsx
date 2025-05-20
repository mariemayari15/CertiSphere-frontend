import React, { useEffect, useState } from 'react';
import {
  Table,
  message,
  Typography,
  Tag,
  Spin,
  Empty,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  FileTextOutlined,
  CloudUploadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/UserDocuments.css';
import { fetchUserDocuments, MyDocument } from '../../services/clientService';

const { Title, Text } = Typography;

const UploadedDocuments: React.FC = () => {
  const [docs, setDocs] = useState<MyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('You are not authenticated. Please sign in.');
      navigate('/signin');
      return;
    }
    setLoading(true);
    fetchUserDocuments(token)
      .then(setDocs)
      .catch(err => {
        console.error('Error fetching documents:', err);
        message.error(err.message || 'Server error. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

 
  const getStatusTag = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; icon: React.ReactNode }
    > = {
      pending:    { color: 'orange', icon: <ClockCircleOutlined /> },
      processing: { color: 'blue',   icon: <FileSearchOutlined /> },
      approved:   { color: 'green',  icon: <CheckCircleOutlined /> },
      rejected:   { color: 'red',    icon: <ExclamationCircleOutlined /> },
    };
    const lower   = status.toLowerCase();
    const matched = Object.keys(statusMap).find((k) => lower.includes(k));
    const { color, icon } = matched
      ? statusMap[matched]
      : { color: 'default', icon: <FileTextOutlined /> };

    return (
      <Tag color={color} icon={icon} className="status-tag">
        {status}
      </Tag>
    );
  };

  
  const columns = [
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (_: any, record: MyDocument) => (
        <a
          href={`http://localhost:5000/${record.file_path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="file-name-cell"
        >
          <FileTextOutlined className="file-icon" />
          <Text ellipsis className="file-name">{record.file_name}</Text>
        </a>
      ),
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploaded_at',
      key: 'uploaded_at',
      render: (val: string) => (
        <div className="date-cell">
          <CloudUploadOutlined className="date-icon" />
          <span>{new Date(val).toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: 'Certificate Name',
      dataIndex: 'certificate_name',
      key: 'certificate_name',
      render: (name: string) => <Text>{name || '—'}</Text>,
    },
    {
      title: 'Certificate Status',
      dataIndex: 'certificate_status',
      key: 'certificate_status',
      render: (status: string) => getStatusTag(status),
    },
  ];

  
  return (
    <div className="container-fluid py-4">
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-md-12">
            <Title level={2} className="banner-title">
              <FileTextOutlined className="me-2" /> Uploaded Documents
            </Title>
            <Text className="banner-subtitle">
              View and manage your uploaded  documents
            </Text>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="documents-card shadow">
            {loading ? (
              <div className="loading-container d-flex flex-column align-items-center py-5">
                <Spin size="large" />
                <Text className="mt-3 text-muted">Loading your documents...</Text>
              </div>
            ) : docs.length > 0 ? (
              <div className="table-responsive">
                <Table
                  dataSource={docs}
                  columns={columns}
                  rowKey="document_id"
                  className="documents-table"
                  pagination={{
                    pageSize: 10,
                    position: ['bottomCenter'],
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                  rowClassName="table-row"
                />
              </div>
            ) : (
              <div className="empty-state text-center py-5">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text className="text-muted">No documents found</Text>}
                />
                <div className="mt-4">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/user/new-certificate')}
                  >
                    <CloudUploadOutlined className="me-2" /> Upload New Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedDocuments;
