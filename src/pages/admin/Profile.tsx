import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BankOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { fetchProfile, updateProfile, Profile as ProfileType } from '../../services/adminService';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [form] = Form.useForm<ProfileType>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const serverUrl = 'http://localhost:5000';

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchProfile(token, serverUrl)
      .then(profile => form.setFieldsValue(profile))
      .catch((err) => message.error(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [form, navigate, token, serverUrl]);

  const onFinish = async (values: ProfileType) => {
    try {
      setLoading(true);
      await updateProfile(values, token!, serverUrl);
      message.success(
        'Changes saved – please check your e-mail and click the verification link.',
        4
      );
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (err: any) {
      message.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <Spin size="large" />
        <Text>Loading your profile…</Text>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Card>
        <Title level={3}>
          <EditOutlined className="me-2" /> Edit Profile
        </Title>
        <Text type="secondary">
          Manage your business & contact information
        </Text>
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          preserve={false}
        >
          <Form.Item
            name="business_name"
            label="Business Name"
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Your Business Name"
            />
          </Form.Item>

          <Form.Item
            name="business_type"
            label="Business Type"
          >
            <Input prefix={<BankOutlined />} />
          </Form.Item>

          <Form.Item
            name="industry"
            label="Industry"
          >
            <Input prefix={<BankOutlined />} />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label="Contact Email"
            rules={[{ type: 'email', message: 'Enter a valid e-mail' }]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label="Phone Number"
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
