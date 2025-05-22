import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BsFileEarmarkPlus,
  BsCloudUpload,
  BsGraphUp,
  BsShieldCheck,
  BsFolder2Open,
  BsChatSquareText,
} from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/UserDashboard.css';

type Activity = {
  id: string;
  message: string;
  timestamp: string;
  color: string;
};

const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completionPct, setCompletionPct] = useState(0);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }
    Promise.all([
      fetch('http://13.48.42.53:5000/api/my-certificates', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch('http://13.48.42.53:5000/api/my-documents', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([certData, docData]) => {
        if (!certData.success || !docData.success) {
          console.error('Failed to load your activity');
          return;
        }

       
        const certActs: Activity[] = certData.certificates.map((c: any) => ({
          id: `cert-${c.id}`,
          message: `New certificate requested${c.certificate_name ? `: ${c.certificate_name}` : ''}`,
          timestamp: c.created_at,
          color: '#4e73df',
        }));
        const docActs: Activity[] = docData.documents.map((d: any) => ({
          id: `doc-${d.document_id}`,
          message: `Document uploaded: ${d.file_name}`,
          timestamp: d.uploaded_at,
          color: '#1cc88a',
        }));
        setActivities(
          [...certActs, ...docActs]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
        );

        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const recentCerts = certData.certificates.filter(
          (c: any) => new Date(c.created_at) >= oneMonthAgo
        );
        const total = recentCerts.length;
        const completed = recentCerts.filter(
          (c: any) => c.status.toLowerCase() === 'completed'
        ).length;
        setCompletionPct(total > 0 ? Math.round((completed / total) * 100) : 0);
      })
      .catch(console.error);
  }, [navigate, token]);

  const actions = [
    { title: 'New Certificate', icon: <BsFileEarmarkPlus />, link: '/user/new-certificate', color: '#4e73df' },
    { title: 'Uploaded Docs',   icon: <BsCloudUpload />,    link: '/user/documents',       color: '#1cc88a' },
    { title: 'Track Progress',  icon: <BsGraphUp />,        link: '/user/progress',        color: '#36b9cc' },
    { title: 'Secure Payment',  icon: <BsShieldCheck />,    link: '/user/payments',        color: '#f6c23e' },
  ];

  const formatTime = (ts: string) => new Date(ts).toLocaleString();

  return (
    <div className="dashboard">
      <div className="container py-5">
       
        <div className="welcome mb-5">
          <h1>Welcome to CertiSphere</h1>
        </div>

        <div className="row g-4 mb-5">
          {actions.map((action, i) => (
            <div className="col-md-6 col-lg-3" key={i}>
              <Link to={action.link} className="action-link">
                <div className="action-card" style={{ borderColor: action.color }}>
                  <div className="action-icon" style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <span>{action.title}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="progress-card">
              <h5>Completion Status </h5>
              <div className="progress-circle">
                <div
                  className="progress-bar-circle"
                  style={{
                    background: `conic-gradient(#4e73df ${completionPct}%, #edf2ff 0)`,
                  }}
                />
                <div className="progress-inner">
                  <h2>{completionPct}%</h2>
                </div>
              </div>
            </div>
          </div>

         
          <div className="col-md-8 mb-4">
            <div className="activity-card">
              <h5>Recent Activity</h5>
              <div className="activity-list">
                {activities.length === 0 ? (
                  <p className="text-muted">No recent activity</p>
                ) : (
                  activities.map((act) => (
                    <div className="activity-item" key={act.id}>
                      <div
                        className="activity-dot"
                        style={{ backgroundColor: act.color }}
                      />
                      <div className="activity-content">
                        <p>{act.message}</p>
                        <span>{formatTime(act.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

     
        <div className="row mt-3">
          <div className="col-12">
            <div className="links-card">
              <h5>Quick Actions</h5>
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <Link to="/user/documents" className="quick-link">
                    <BsFolder2Open className="me-2" /> Document Library
                  </Link>
                </div>
                <div className="col-sm-6 col-md-3">
                  <Link to="/user/support" className="quick-link">
                    <BsChatSquareText className="me-2" /> Support Center
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
