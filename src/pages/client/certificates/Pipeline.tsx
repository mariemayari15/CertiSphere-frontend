import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Steps, 
  Spin, 
  message, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Progress, 
  Divider,
  Button
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  FileDoneOutlined,
  FileExclamationOutlined
} from '@ant-design/icons';
import { fetchCertificateDetail, Certificate } from '../../../services/clientService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/CertificateDetail.css';

const { Title, Text } = Typography;

const pipelineSteps = [
  'Pending Payment',
  'Submitted',
  'Viewed by Admin',
  'Processing in Progress',
  'Additional Documents Required',
  'Completed',
];

const statusIcons: Record<string, React.ReactNode> = {
  'Pending Payment': <ClockCircleOutlined />,
  'Submitted': <FileTextOutlined />,
  'Viewed by Admin': <EyeOutlined />,
  'Processing in Progress': <SyncOutlined spin />,
  'Additional Documents Required': <FileExclamationOutlined />,
  'Completed': <CheckCircleOutlined />,
};

const statusColors: Record<string, string> = {
  'Pending Payment': '#f6c23e',
  'Submitted': '#4e73df',
  'Viewed by Admin': '#36b9cc',
  'Processing in Progress': '#4e73df',
  'Additional Documents Required': '#e74a3b',
  'Completed': '#1cc88a',
};

const Pipeline: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  const getCurrentStep = (status: string) => {
    const idx = pipelineSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const getCompletionPercentage = (status: string) => {
    const currentStep = getCurrentStep(status);
    return Math.round(((currentStep + 1) / pipelineSteps.length) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        message.error('No certificate ID provided');
        navigate('/dashboard');
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('You are not authenticated. Please sign in.');
        navigate('/signin');
        return;
      }

      setLoading(true);
      try {
        const cert = await fetchCertificateDetail(id, token);

       
        setCertificate({
          ...cert,
          certificate_type: cert.certificate_type || 'Standard Certification',
          certificate_name: cert.certificate_name || `Certificate #${cert.id}`,
          iso_standards: cert.iso_standards || ['ISO 9001', 'ISO 27001'],
          last_updated_at: cert.last_updated_at || new Date().toISOString(),
          estimated_completion_date: cert.estimated_completion_date || 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          comments: cert.comments || [
            {
              text: 'Certificate submitted successfully',
              date: cert.created_at,
              author: 'System'
            },
            {
              text: 'Certificate is now being reviewed by our team',
              date: new Date(new Date(cert.created_at).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              author: 'Admin'
            }
          ]
        });
      } catch (error: any) {
        console.error('Error fetching certificate details:', error);
        message.error(error.message || 'Server error. Please try again later.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text className="loading-text">Loading certificate details...</Text>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const currentStep = getCurrentStep(certificate.status);
  const completionPercentage = getCompletionPercentage(certificate.status);
  const isCompleted = certificate.status === 'Completed';

  return (
    <div className="container-fluid py-4">
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <Title level={2} className="banner-title">
              <FileTextOutlined className="me-2" /> 
              {certificate.certificate_name}
            </Title>
            <Text className="banner-subtitle">
              {certificate.certificate_type}
            </Text>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Tag 
              color={statusColors[certificate.status]} 
              icon={statusIcons[certificate.status]} 
              className="status-tag-lg"
            >
              {certificate.status}
            </Tag>
            {isCompleted && (
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                className="download-btn ms-md-2 mt-2 mt-md-0"
                href={`http://13.48.42.53:5000/certificates/certificate_${certificate.id}.pdf`}
                target="_blank"
              >
                Download Certificate
              </Button>
            )}
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
       
        <Col xs={24} lg={16}>
       
          <Card className="detail-card mb-4">
            <Title level={4} className="card-title">
              <HistoryOutlined className="me-2" /> Certification Pipeline
            </Title>
            <Divider className="mt-2 mb-4" />

            <div className="pipeline-container">
              {pipelineSteps.map((step, index) => (
                <div 
                  key={step}
                  className={`pipeline-stage ${index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending'}`}
                >
                  <div className="pipeline-connector">
                    {index > 0 && <div className="connector-line"></div>}
                    <div className="stage-icon">
                      {statusIcons[step]}
                    </div>
                    {index < pipelineSteps.length - 1 && <div className="connector-line"></div>}
                  </div>
                  <div className="stage-content">
                    <div className="stage-name">{step}</div>
                    {index === currentStep && (
                      <div className="stage-status">Current Stage</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="progress-indicator mt-4 mb-2">
              <Progress 
                percent={completionPercentage} 
                status={isCompleted ? "success" : "active"} 
                strokeColor={statusColors[certificate.status]}
                className="progress-bar"
              />
              <div className="text-center mt-2">
                <Text className="progress-text">
                  {isCompleted ? 'Certificate completed' : `${completionPercentage}% complete`}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        
        <Col xs={24} lg={8}>
         
          <Card className="detail-card">
            <Title level={4} className="card-title">
              <FileDoneOutlined className="me-2" /> Certificate Details
            </Title>
            <Divider className="mt-2 mb-4" />

            <div className="info-grid">
              <div className="info-item">
                <Text className="info-label">Certificate Type</Text>
                <Text strong className="info-value">{certificate.certificate_type}</Text>
              </div>

              <div className="info-item">
                <Text className="info-label">ISO Standards</Text>
                <div>
                  {certificate.iso_standards?.map(standard => (
                    <Tag color="blue" key={standard} className="iso-tag">
                      {standard}
                    </Tag>
                  ))}
                </div>
              </div>

              <div className="info-item">
                <Text className="info-label">Created Date</Text>
                <Text strong className="info-value">
                  <CalendarOutlined className="me-1" /> {formatDate(certificate.created_at)}
                </Text>
              </div>

              <div className="info-item">
                <Text className="info-label">Last Updated</Text>
                <Text strong className="info-value">
                  <CalendarOutlined className="me-1" /> 
                  {formatDate(certificate.last_updated_at || certificate.created_at)}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Pipeline;
