import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';
import { resetPassword } from '../../services/authService';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const onFinish = async (values: any) => {
    try {
      if (!token) {
        message.error('No reset token provided in the URL');
        return;
      }
      const data = await resetPassword(token, values.newPassword);
      message.success(data.message || 'Password reset successful');
    } catch (error: any) {
      message.error(error.message || 'Something went wrong, please try again.');
    }
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item
        label="New Password"
        name="newPassword"
        rules={[
          { required: true, message: 'Please enter a new password' },
          { min: 6, message: 'Password must be at least 6 characters' },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Reset Password
      </Button>
    </Form>
  );
};

export default ResetPassword;
