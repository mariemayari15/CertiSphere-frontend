import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { requestPasswordReset } from '../../services/authService';

const ForgotPassword: React.FC = () => {
  const onFinish = async (values: any) => {
    try {
      const data = await requestPasswordReset(values.clientCode);
      message.success(data.message || 'Check your email for a reset link');
    } catch (error: any) {
      message.error(error.message || 'Something went wrong, please try again.');
    }
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item
        label="Client Code"
        name="clientCode"
        rules={[{ required: true, message: 'Please enter your client code' }]}
      >
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Send Reset Link
      </Button>
    </Form>
  );
};

export default ForgotPassword;
