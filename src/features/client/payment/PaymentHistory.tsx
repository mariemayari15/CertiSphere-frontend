import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchUserPayments, PaymentRow } from '../../../services/clientService';

const PaymentHistory: React.FC = () => {
  const [rows, setRows]       = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const payments = await fetchUserPayments(token);
        setRows(payments);
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
      title: 'Reference',
      dataIndex: 'certificate_reference',
      key: 'ref',
      render: (ref: string | null) => ref ?? '—',
    },
    {
      title: 'Certificate',
      dataIndex: 'certificate_name',
      key: 'name',
      render: (n: string | null) => n ?? 'Untitled',
    },
    {
      title: 'Amount (€)',
      dataIndex: 'amount_eur',
      key: 'amount',
      render: (a: number) => a.toFixed(2),
    },
    {
      title: 'Paid At',
      dataIndex: 'paid_at',
      key: 'paid',
      render: (iso: string) => new Date(iso).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h2>Payment History</h2>

      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="certificate_id"
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 8 }}
        />
      )}

      <Button style={{ marginTop: 24 }} onClick={() => navigate(-1)}>
        Back
      </Button>
    </div>
  );
};

export default PaymentHistory;
