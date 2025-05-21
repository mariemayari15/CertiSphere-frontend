import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { requestPasswordChange } from '../../services/authService';

const ChangePasswordUser: React.FC = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  const onFinish = async (values: { oldPassword: string }) => {
    try {
      await requestPasswordChange(values.oldPassword, authToken || '');
      message.success('Check your e-mail and follow the link to set a new password.', 4);
      setTimeout(() => navigate('/user/dashboard'), 4000);
    } catch (err: any) {
      message.error(err.message || 'Something went wrong.');
    }
  };

  return (
    <Form onFinish={onFinish} style={{ maxWidth: 400, margin: '40px auto' }}>
      <Form.Item
        label="Current Password"
        name="oldPassword"
        rules={[{ required: true, message: 'Please enter your current password' }]}
      >
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit" block>
        Send Verification E-mail
      </Button>
    </Form>
  );
};

export default ChangePasswordUser;
