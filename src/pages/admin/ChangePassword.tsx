
import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { requestPasswordChange } from '../../services/authService';

const { Title } = Typography;

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken') || '';

  const onFinish = async (values: { oldPassword: string }) => {
    try {
      await requestPasswordChange(values.oldPassword, token);
      message.success('Check your e-mail and follow the link to set a new password.', 4);
      setTimeout(() => navigate('/admin/dashboard'), 4000);
    } catch (err: any) {
      message.error(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card style={{ maxWidth: 400, margin: '0 auto' }}>
        <Title level={3}><KeyOutlined className="me-2" /> Change Password</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Send Verification E-mail
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
