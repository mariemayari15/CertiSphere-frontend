// AdminChat.tsx - Enhanced with formal styling
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Chat from '../../../components/Chat';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/AdminChat.css';

interface DecodedToken { 
  userId: number; 
  role: string; 
  exp: number;
}

const AdminChat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const location = useLocation();
  const clientCode = (location.state as any)?.clientCode as string | undefined;

  const token = localStorage.getItem('authToken') ?? '';
  const userId = token ? jwtDecode<DecodedToken>(token).userId : 0;

  if (!conversationId) return (
    <div className="container mt-4">
      <div className="alert alert-danger">
        Error: Conversation ID not specified.
      </div>
    </div>
  );

  return (
    <div className="admin-chat-wrapper container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="admin-chat-header mb-3">
            <div className="d-flex align-items-center">
              <div className="client-icon">
                <i className="bi bi-person"></i>
              </div>
              <div>
                <h5 className="client-title" style={{color: '#2e5cb8'}}>
                  {clientCode ? `Client: ${clientCode}` : 'Client Communication'}
                </h5>
               
              </div>
            </div>
          </div>
          <Chat
            conversationId={Number(conversationId)}
            userId={userId}
            role="admin"
            token={token}
            clientCode={clientCode}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

