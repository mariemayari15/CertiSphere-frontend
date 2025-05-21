import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Divider,
  List,
  message,
  Spin,
} from 'antd';
import {
  EditOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  KeyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/UserSettings.css';

import { requestAccountDeletion } from '../../services/clientService';

const { Title, Text } = Typography;

const UserSettings: React.FC = () => {
  const navigate   = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleAction = (key: string) => {
    switch (key) {
      case 'editProfile':
        navigate('/user/profile');
        break;
      case 'changePassword':
        navigate('/user/change-password');
        break;
      case 'paymentMethods':
        navigate('/user/payments');
        break;
      case 'paymentHistory':
        navigate('/user/payment-history');
        break;
      case 'deleteAccount':
        onRequestDeletion();
        break;
      default:
        break;
    }
  };

  const onRequestDeletion = async () => {
    const ok = window.confirm(
      'DELETE BUSINESS ACCOUNT\n\n' +
      'This action is irreversible. All certificates, documents and ' +
      'messages will be permanently removed.\n\n' +
      'After you click “OK”, we will send a confirmation e-mail.'
    );
    if (!ok) return;
    setBusy(true);
    try {
      await requestAccountDeletion();
      message.success('Check your e-mail to complete account deletion.');
    } catch (e: any) {
      message.error(e.message || 'Server error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {busy && (
        <div className="blocking-spinner">
          <Spin size="large" />
        </div>
      )}

      <div className="welcome-banner mb-4">
        <Title level={2} className="banner-title">
          <SettingOutlined className="me-2" /> Account Settings
        </Title> 
      </div>

      <Card className="settings-card mb-4">
        <Title level={4}><EditOutlined className="me-2" /> Profile Information</Title>
        <Divider />
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              key:'editProfile',
              title:'Edit Business Information',
              description:'Phone Number, Email, …',
              icon:<EditOutlined className="list-icon" />,
              btnLabel:'Edit Information',
            },
            {
              key:'changePassword',
              title:'Change Password',
              description:'Update your account password',
              icon:<KeyOutlined className="list-icon" />,
              btnLabel:'Change Password',
            },
          ]}
          renderItem={item=>(
            <List.Item>
              <List.Item.Meta avatar={item.icon}
                title={item.title} description={item.description}/>
              <Button type="primary"
                onClick={()=>handleAction(item.key)}>
                {item.btnLabel}
              </Button>
            </List.Item>
          )}
        />
      </Card>

      <Card className="settings-card mb-4">
        <Title level={4}><CreditCardOutlined className="me-2" /> Billing & Payments</Title>
        <Divider />
        <List
          itemLayout="horizontal"
          dataSource={[
            { key:'paymentHistory',
              title:'Payment History',
              description:'Download previous payment invoices',
              icon:<CreditCardOutlined className="list-icon" />,
              btnLabel:'View Transactions' },
          ]}
          renderItem={item=>(
            <List.Item>
              <List.Item.Meta avatar={item.icon}
                title={item.title} description={item.description}/>
              <Button type="primary"
                onClick={()=>handleAction(item.key)}>
                {item.btnLabel}
              </Button>
            </List.Item>
          )}
        />
      </Card>

      <Card className="settings-card">
        <Title level={4}><DeleteOutlined className="me-2" /> Privacy Settings</Title>
        <Divider />
        <Text strong>Delete your business account</Text>
        <p>This action is irreversible.</p>
        <Button danger type="primary"
          onClick={()=>handleAction('deleteAccount')}>
          Delete Business Account
        </Button>
      </Card>
    </div>
  );
};

export default UserSettings;
