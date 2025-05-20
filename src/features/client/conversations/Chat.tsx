import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Chat from '../../../components/Chat';

interface TokenPayload {
  userId: number;
  clientCode: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface ConversationData {
  id: number;
  client_id: number;
  admin_id: number | null;
  certificate_id: number | null;
  updated_at: string;
  certificate_name?: string | null;
}

const getTokenData = () => {
  const t = localStorage.getItem('authToken');
  if (!t) return null;
  try { return jwtDecode<TokenPayload>(t); }
  catch { return null; }
};

const UserChat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const token    = localStorage.getItem('authToken');
  const userData = getTokenData();

  const [conversation, setConversation] = useState<ConversationData | null>(null);

  if (!token || !userData)           return <div>Please log in first!</div>;
  if (!conversationId)               return <div>No conversation ID!</div>;
  const convoIdNum = Number(conversationId);
  if (Number.isNaN(convoIdNum))      return <div>Invalid conversation ID!</div>;

  useEffect(() => {
    fetch(`http://localhost:5000/api/conversations/${convoIdNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => d.success && setConversation(d.conversation))
      .catch(console.error);
  }, [convoIdNum, token]);

  const certInfo = conversation
    ? conversation.certificate_id
      ? conversation.certificate_name
        ? `Regarding Certificate: ${conversation.certificate_name}`
        : `Regarding Certificate ID #${conversation.certificate_id}`
      : 'Conversation about: OTHER'
    : '';

  return (
    <div className="user-chat">
      <br />
      <br />
      {conversation && <p style={{ fontStyle: 'italic' }}>{certInfo}</p>}

      <Chat
        conversationId={convoIdNum}
        userId={userData.userId}
        role={userData.role === 'admin' ? 'admin' : 'client'}
        token={token}
      />
    </div>
  );
};

export default UserChat;
