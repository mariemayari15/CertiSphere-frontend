import React, { useState, useEffect } from 'react';
import {
  Upload,
  Button,
  message,
  Row,
  Col,
  List,
  Card,
  Typography,
  Divider,
  Select,
  Input,
  Checkbox,
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/GenerateCertificate.css';
import {
  fetchCertificateTypes,
  uploadDocuments,
  generateCertificate,
  CertificateType,
} from '../../../services/clientService';

const { Title, Text, Paragraph } = Typography;

const Request: React.FC = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>([]);
  const [isoOptions, setIsoOptions] = useState<string[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  const [certificateName, setCertificateName] = useState<string>('');
  const [selectedISOs, setSelectedISOs] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('You are not authenticated. Please sign in again.');
      navigate('/signin');
      return;
    }
    (async () => {
      try {
        const { certificateTypes, isoOptions } = await fetchCertificateTypes(token);
        setCertificateTypes(certificateTypes);
        setIsoOptions(isoOptions);
      } catch (err: any) {
        console.error(err);
        message.error(err.message || 'Server error while loading certificate info.');
      }
    })();
  }, [navigate]);

  const handleTypeChange = (id: number) => {
    setSelectedTypeId(id);
    const found = certificateTypes.find((t) => t.id === id);
    setRequiredDocs(found ? found.requiredDocs : []);
  };

  const handleISOChange = (vals: any) => setSelectedISOs(vals);

  const handleUpload = async () => {
    if (!selectedTypeId) {
      message.warning('Please select a certificate type.');
      return;
    }
    if (!fileList.length) {
      message.warning('Please select at least one document to upload!');
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('You are not authenticated. Please sign in again.');
      navigate('/signin');
      return;
    }
    setUploading(true);
    try {
     
      const { certificateId } = await uploadDocuments(token, fileList);
      message.success('Documents uploaded successfully!');
     
      const { message: genMsg } = await generateCertificate(token, {
        certificateId,
        certificateType: selectedTypeId,
        certificateName,
        isoStandards: selectedISOs,
      });
      message.success(genMsg || 'Certificate generation initiated!');
     
      setFileList([]);
      setSelectedTypeId(null);
      setRequiredDocs([]);
      setCertificateName('');
      setSelectedISOs([]);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Server error. Please try again later.');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    multiple: true,
    fileList,
    onChange: (info: any) => setFileList(info.fileList),
    beforeUpload: () => false,          
    showUploadList: { showRemoveIcon: true },
  };

  return (
    <div className="certificate-container container-fluid py-4">
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            Select your certificate type and upload required documents
          </Title>
        </div>
      </div>

      <Row gutter={[24, 24]} className="content-row">
        <Col xs={24} md={8}>
          <Card className="requirements-card">
            <Title level={4} className="card-title">
              <CheckCircleOutlined className="title-icon" /> Certificate Details
            </Title>
            <Divider className="custom-divider" />
            <div className="mb-3">
              <Text strong>Certificate Type:</Text>
              <Select
                className="w-100 mt-2"
                placeholder="Select Certificate Type"
                value={selectedTypeId ?? undefined}
                onChange={handleTypeChange}
              >
                {certificateTypes.map((ct) => (
                  <Select.Option key={ct.id} value={ct.id}>
                    {ct.typeName}
                  </Select.Option>
                ))}
              </Select>
              {selectedTypeId && (
                <Paragraph style={{ marginTop: 8 }}>
                  Price:&nbsp;
                  <strong>
                    €
                    {(
                      certificateTypes.find((t) => t.id === selectedTypeId)!.price /
                      100
                    ).toFixed(2)}
                  </strong>
                </Paragraph>
              )}
            </div>
            <div className="mb-3">
              <Text strong>Certificate Name (Optional):</Text>
              <Input
                placeholder="e.g. Project ABC Certificate"
                className="mt-2"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <Text strong>ISO Standards:</Text>
              <div className="mt-2">
                <Checkbox.Group
                  options={isoOptions.map((iso) => ({ label: iso, value: iso }))}
                  value={selectedISOs}
                  onChange={handleISOChange}
                />
              </div>
            </div>
            <Divider className="custom-divider" />
            <Title level={5}>Required Documents</Title>
            {selectedTypeId && requiredDocs.length > 0 ? (
              <List
                className="requirements-list"
                dataSource={requiredDocs}
                renderItem={(item) => (
                  <List.Item className="requirement-item">
                    <div className="requirement-content">
                      <CheckCircleOutlined className="check-icon" />
                      <Text>{item}</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Paragraph type="secondary">
                {selectedTypeId
                  ? 'No documents listed for this certificate type.'
                  : 'Please select a certificate type to see required documents.'}
              </Paragraph>
            )}
            <div className="info-box">
              <InfoCircleOutlined className="info-icon" />
              <Paragraph className="info-text">
                All documents must be in PDF, JPG, JPEG, DOCX or PNG format. Maximum file size is
                10&nbsp;MB per document.
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="upload-card">
            <Title level={4} className="card-title">
              <UploadOutlined className="title-icon" /> Upload Your Documents
            </Title>
            <Divider className="custom-divider" />
            <Paragraph className="upload-instructions">
              Please upload all required documents.
            </Paragraph>
            <div className="upload-area">
              <Upload {...uploadProps} className="upload-component">
                <Button icon={<UploadOutlined />} className="select-btn">
                  Select Documents
                </Button>
              </Upload>
              {fileList.length > 0 && (
                <div className="file-list-container">
                  <Text strong>Selected Files: {fileList.length}</Text>
                </div>
              )}
              <Button
                type="primary"
                onClick={handleUpload}
                loading={uploading}
                disabled={fileList.length === 0}
                className="upload-btn"
              >
                {uploading ? 'Processing…' : 'Request the Certificate'}
              </Button>
            </div>
            <div className="process-steps">
              <Title level={5} className="steps-title">
                Certificate Generation Process:
              </Title>
              {['Enter Details & Select Documents', 'Verification', 'Certificate Generation'].map(
                (title, idx) => (
                  <div className="process-step" key={idx}>
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-content">
                      <Text strong>{title}</Text>
                      <Text type="secondary">
                        {idx === 0
                          ? 'Choose certificate type, name, ISO, then upload files'
                          : idx === 1
                            ? 'Our administrators will verify your submitted documents'
                            : 'Your certificate will be generated and available for download'}
                      </Text>
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Request;
