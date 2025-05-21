import React, { useEffect, useState } from 'react';
import { Table, Button, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchPendingCertificates, CertificateRow } from '../../../services/clientService';
import '../../../styles/UserDashboard.css';

const PendingPayments: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('You must be logged in.');
      navigate('/signin');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const certs = await fetchPendingCertificates(token);
        setRows(certs);
      } catch (err: any) {
        console.error(err);
        message.error(err.message || 'Server error');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const columns = [
    {
      title: 'Certificate',
      dataIndex: 'certificate_name',
      key: 'certificate_name',
      render: (txt: string | null) => txt || 'Untitled',
    },
    {
      title: 'Type',
      dataIndex: 'certificate_type',
      key: 'certificate_type',
      render: (t: string | null) => t || '—',
    },
    {
      title: 'Price (€)',
      dataIndex: 'price',
      key: 'price',
      render: (cents: number | null) =>
        cents != null ? (cents / 100).toFixed(2) : '—',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: CertificateRow) => (
        <Button
          type="primary"
          onClick={() => navigate(`/user/payment_checkout/${record.id}`)}
        >
          Pay now
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h2 className="pending title">Pending Payments</h2>

      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="id"
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 8 }}
        />
      )}
    </div>
  );
};

export default PendingPayments;
