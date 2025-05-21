import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  BankOutlined, 
  PhoneOutlined, 
  MailOutlined,
  SaveOutlined,
  EditOutlined
} from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/UserProfile.css';

import { fetchUserProfile, updateUserProfile, Profile } from '../../services/clientService';

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');


  
  useEffect(() => {
    if (!token) { navigate('/signin'); return; }

    setLoading(true);
    fetchUserProfile(token)
      .then(profile => form.setFieldsValue(profile))
      .catch(err => message.error(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [form, navigate, token]);


  
  const onFinish = async (values: Profile) => {
    try {
      setLoading(true);
      await updateUserProfile(values, token!);
      message.success(
        'Changes saved – please check your e-mail and click the verification link.',
        4
      );
      setTimeout(() => navigate('/user/dashboard'), 1000);
    } catch (err: any) {
      message.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text className="loading-text">Loading your profile...</Text>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-md-12">
            <Title level={2} className="banner-title">
              <EditOutlined className="me-2" /> Edit Profile
            </Title>
            <Text className="banner-subtitle">
              Manage your business and contact information
            </Text>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Card className="profile-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              preserve={false}
              className="profile-form"
            >
              <div className="row">
                <div className="col-12">
                  <Title level={5} className="section-title">
                    <BankOutlined className="me-2" /> Business Information
                  </Title>
                  <Divider className="mt-2 mb-4" />
                </div>
                
                <div className="col-md-4">
                  <Form.Item name="business_name" label="Business Name">
                    <Input prefix={<BankOutlined className="site-form-item-icon" />} placeholder="Your Business Name" />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="business_type" label="Business Type">
                    <Input prefix={<BankOutlined className="site-form-item-icon" />} placeholder="Type of Business" />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="industry" label="Industry">
                    <Input prefix={<BankOutlined className="site-form-item-icon" />} placeholder="Your Industry" />
                  </Form.Item>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <Title level={5} className="section-title">
                    <UserOutlined className="me-2" /> Account Creator Information
                  </Title>
                  <Divider className="mt-2 mb-4" />
                </div>
                
                <div className="col-md-4">
                  <Form.Item name="first_name" label="First Name">
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Your First Name" />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="last_name" label="Last Name">
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Your Last Name" />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="title" label="Title">
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Your Job Title" />
                  </Form.Item>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <Title level={5} className="section-title">
                    <MailOutlined className="me-2" /> Contact Information
                  </Title>
                  <Divider className="mt-2 mb-4" />
                </div>
                
                <div className="col-md-6">
                  <Form.Item 
                    name="contact_email" 
                    label="Contact Email"
                    rules={[{ type: 'email', message: 'Please enter a valid email address' }]}
                  >
                    <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Your Email Address" />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="phone_number" label="Phone Number">
                    <Input prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder="Your Phone Number" />
                  </Form.Item>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12 d-flex justify-content-end">
                  <Button 
                    type="default" 
                    className="me-2"
                    onClick={() => navigate('/user/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    className="save-button"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
