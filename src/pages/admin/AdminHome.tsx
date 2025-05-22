import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiUsers, FiFileText, FiMessageSquare, FiActivity
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';

import StatCard from '../../components/StatCard';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface DecodedToken { userId: number; role: string; exp: number; }

interface Stats {
  success: boolean;
  totalUsers: number;
  totalCertificates: number;
  pendingCertificates: number;      
  completedCertificates: number;
  monthlyNewUsers: { month: string; count: number }[];
  monthlyNewCertificates: { month: string; count: number }[];
}

const AdminHome: React.FC = () => {
  const navigate              = useNavigate();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    try {
      const { role } = jwtDecode<DecodedToken>(token);
      if (role !== 'admin') navigate('/admin-login');
    } catch {
      navigate('/admin-login');
    }
  }, [navigate]);


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {
        setLoading(true);
        const res  = await fetch('http://13.48.42.53:5000/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` },
          signal
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load stats');
        setStats(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);


  const makeLine = (labels: string[], values: number[], label: string) => ({
    labels,
    datasets: [{
      label,
      data: values,
      borderColor: 'rgba(67,97,238,1)',
      backgroundColor: 'rgba(67,97,238,0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(67,97,238,1)',
    }],
  });

  
  if (error) return <p style={{ padding: 20, color: 'red' }}>{error}</p>;

  return (
    <div className="dashboard-content">
      
      <section className="welcome-section">
        <h2>Welcome to your Admin Dashboard</h2>
      </section>

   
      <section className="stats-grid">
        <StatCard icon={<FiUsers />} value={loading ? '…' : stats?.totalUsers ?? 0}
                  label="Total Clients" trend={{ value: 5, isPositive: true }} />
        <StatCard icon={<FiFileText />} value={loading ? '…' : stats?.totalCertificates ?? 0}
                  label="Total Certificates" trend={{ value: 2, isPositive: true }} />
        <StatCard icon={<FiFileText />} value={loading ? '…' : stats?.pendingCertificates ?? 0}
                  label="Pending Orders" trend={{ value: 1, isPositive: false }} />
        <StatCard icon={<FiFileText />} value={loading ? '…' : stats?.completedCertificates ?? 0}
                  label="Completed Orders" trend={{ value: 4, isPositive: true }} />
      </section>

      
      <section className="charts-grid">
        <div className="chart-card">
          <h3>Monthly New Clients</h3>
          <div className="chart-container">
            <Line data={makeLine(
              (stats?.monthlyNewUsers || []).map(u => u.month),
              (stats?.monthlyNewUsers || []).map(u => u.count),
              'New Clients'
            )}/>
          </div>
        </div>

        <div className="chart-card">
          <h3>Monthly New Certificates</h3>
          <div className="chart-container">
            <Line data={makeLine(
              (stats?.monthlyNewCertificates || []).map(c => c.month),
              (stats?.monthlyNewCertificates || []).map(c => c.count),
              'New Certificates'
            )}/>
          </div>
        </div>
      </section>
      <section className="communications-section">
        <div className="communications-content">
          <h2>Client Communications Hub</h2>
          <p>Respond to client inquiries and manage conversations.</p>
          <NavLink to="/admin/conversations" className="communications-button">
            <FiMessageSquare className="comm-icon" /><span>View Conversations</span>
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
