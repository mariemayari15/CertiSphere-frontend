import React, { useEffect, useState } from 'react';
import { Table, message, Typography, Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  FileTextOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/TrackProgress.css';
import { fetchUserCertificates, Certificate } from '../../../services/clientService';

const { Title, Text } = Typography;

const Progress: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const serverUrl = 'http://13.48.42.53:5000';

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('You are not authenticated. Please sign in.');
        navigate('/signin');
        return;
      }
      try {
        setLoading(true);
        const certs = await fetchUserCertificates(token, serverUrl);
        setCertificates(certs);
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
        message.error(err.message || 'Server error. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, serverUrl]);

  const columns = [
    {
      title: 'Certificate Name',
      dataIndex: 'certificate_name',
      key: 'certificate_name',
      render: (_: any, record: Certificate) => (
        <a
          onClick={() => navigate(`/user/certificate/${record.id}`)} 
          className="certificate-link"
        >
          <FileTextOutlined className="me-2" />
          {record.certificate_name || 'Untitled'}
        </a>
      ),
    },
    {
      title: 'Certificate Type',
      dataIndex: 'certificate_type',
      key: 'certificate_type',
      render: (type: string | null) => type || '-',
    },
    {
      title: 'ISO Standards',
      dataIndex: 'iso_standards',
      key: 'iso_standards',
      render: (standards: string[] | null) =>
        standards && standards.length ? standards.join(', ') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          Pending: 'warning',
          Processing: 'processing',
          Completed: 'success',
          Rejected: 'error'
        };
        const statusClass = statusColors[status] || 'default';
        return (
          <span className={`status-badge ${statusClass}`}>
            {status === 'Completed' && <CheckCircleOutlined className="me-1" />}
            {status}
          </span>
        );
      }
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => (
        <span className="date-cell">
          <CalendarOutlined className="me-2" />
          {new Date(val).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Download PDF',
      key: 'download',
      render: (_: any, record: Certificate) =>
        record.status === 'Completed' ? (
          <a
            href={`${serverUrl}/certificates/certificate_${record.id}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
          >
            <FilePdfOutlined className="me-1" /> Download
          </a>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-md-12">
            <Title level={2} className="banner-title">
              <FileTextOutlined className="me-2" /> Track Certificate Progress
            </Title>
            <Text className="banner-subtitle">
              Monitor the status of your certification process
            </Text>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="certificates-card shadow">
            {loading ? (
              <div className="loading-container d-flex flex-column align-items-center py-5">
                <Spin size="large" />
                <Text className="mt-3 text-muted">Loading your certificates...</Text>
              </div>
            ) : certificates.length > 0 ? (
              <div className="table-responsive">
                <Table 
                  dataSource={certificates} 
                  columns={columns} 
                  rowKey="id" 
                  className="certificates-table"
                  pagination={{
                    pageSize: 10,
                    position: ['bottomCenter'],
                    showSizeChanger: true,
                  }}
                  rowClassName="table-row"
                />
              </div>
            ) : (
              <div className="empty-state text-center py-5">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text className="text-muted">No certificates found</Text>}
                />
                <div className="mt-4">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/user/new-certificate')}
                  >
                    <FileTextOutlined className="me-2" /> Create New Certificate
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

export default Progress;
