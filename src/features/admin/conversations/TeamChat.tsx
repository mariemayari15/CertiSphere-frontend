import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Chat from '../../../components/Chat';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/AdminChat.css';

import {
  fetchTeamChatConversation,
  fetchAdminCodeMap,
} from '../../../services/adminService';

interface DecodedToken { userId:number; role:string; exp:number; }

const TeamChat: React.FC = () => {
  const navigate   = useNavigate();
  const token      = localStorage.getItem('authToken') || '';
  const BASE_URL   = 'http://localhost:5000';

  const [convId, setConvId]       = useState<number | null>(null);
  const [adminCodeMap, setMap]    = useState<Record<number, string>>({});
  const [error, setError]         = useState<string | null>(null);

  let userId = 0;
  try {
    if (!token) throw new Error();
    const { userId: uid, role } = jwtDecode<DecodedToken>(token);
    if (role !== 'admin') throw new Error();
    userId = uid;
  } catch {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">You must be logged in as an admin to view this page.</div>
      </div>
    );
  }

  
  useEffect(() => {
    fetchTeamChatConversation(token, BASE_URL)
      .then(setConvId)
      .catch(err => {
        console.error('TeamChat error:', err);
        setError('Unable to load Team Chat. Please try again later.');
      });
  }, [token]);

  useEffect(() => {
    fetchAdminCodeMap(token, BASE_URL)
      .then(setMap)
      .catch(console.error);
  }, [token]);

  
  if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  if (convId === null)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height:'60vh' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading…</span></div>
      </div>
    );

  return (
    <div className="admin-chat-wrapper container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="admin-chat-header mb-3"><h5 className="text-primary">Team Chat</h5></div>
          <Chat
            conversationId={convId}
            userId={userId}
            role="admin"
            token={token}
            showAdminCode
            adminCodeMap={adminCodeMap}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
