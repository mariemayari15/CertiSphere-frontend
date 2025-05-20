import React from 'react';
import { Card, Typography, Button, Divider, List } from 'antd';
import { EditOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleAction = (key: string) => {
    switch (key) {
      case 'editProfile':
        navigate('/admin/profile');
        break;
      case 'changePassword':
        navigate('/admin/change-password');
        break;
    }
  };

  return (
    <div className="container-fluid py-4">
      <Title level={2} className="mb-4">Admin Settings</Title>
      
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              key: 'editProfile',
              title: 'Edit Profile Info',
              description: 'Business & contact details',
              icon: <EditOutlined style={{ fontSize: '1.2em' }} />,
              btnLabel: 'Edit'
            },
            {
              key: 'changePassword',
              title: 'Change Password',
              description: 'Send password change link',
              icon: <KeyOutlined style={{ fontSize: '1.2em' }} />,
              btnLabel: 'Send Link'
            }
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleAction(item.key)}
                >
                  {item.btnLabel}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={<b>{item.title}</b>}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Settings;
