import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Chat.css';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: 'client' | 'admin';
  content: string;
  created_at: string;
}

interface ChatProps {
  conversationId: number;
  userId: number;
  role: 'client' | 'admin';
  token: string;
  clientCode?: string;
  serverUrl?: string;
  showAdminCode?: boolean;
  adminCodeMap?: Record<number, string>;
}

const Chat: React.FC<ChatProps> = ({
  conversationId,
  userId,
  role,
  token,
  clientCode: propClientCode,
  serverUrl = 'http://localhost:5000',
  showAdminCode = false,
  adminCodeMap = {},
}) => {
  const loc = useLocation();
  const navClientCode = (loc.state as any)?.clientCode as string | undefined;
  const clientCode = propClientCode ?? navClientCode;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    setLoading(true);
    fetch(`${serverUrl}/api/conversations/${conversationId}/messages`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => d.success ? setMessages(d.messages)
                           : setError('Failed to load messages'))
      .catch(() => setError('Network error occurred'))
      .finally(() => setLoading(false));
  }, [conversationId, serverUrl, token]);

  
  useEffect(() => {
    const socket = io(serverUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinConversation', conversationId);
    socket.on('messageReceived', (m: Message) => {
      if (m.conversation_id === conversationId)
        setMessages(prev => [...prev, m]);
    });
    socket.on('connect_error', () => setError('Connection error'));
    return () => { socket.disconnect(); };
  }, [conversationId, serverUrl]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 
  const handleSend = () => {
    if (!inputValue.trim() || !socketRef.current) return;
    socketRef.current.emit('newMessage', {
      conversationId, senderId: userId, content: inputValue, senderRole: role,
    });
    setInputValue('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

 
  const labelFor = (m: Message) => {
    if (m.sender_id === userId) return 'You';
    if (m.sender_role === 'client') return clientCode ?? 'Client';
   
    if (showAdminCode) return adminCodeMap[m.sender_id] || 'Admin';
    return 'Admin';
  };

  
  const formatTime = (t: string) =>
    new Date(t).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

 
  return (
    <div className="chat-wrapper">
      <div className="compact-chat-container">
       
        <div className="chat-header">
          <h5 className="chat-title">Chat Messages</h5>
          
        </div>
        
      
        <div className="chat-messages-area">
          {loading && (
            <div className="chat-loading">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="chat-error">
              <div className="alert alert-danger py-2" role="alert">
                <small>{error}</small>
              </div>
            </div>
          )}
          
          {!loading && messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p>No messages yet</p>
            </div>
          )}
          
          <div className="chat-messages">
            {messages.map(message => {
              const isCurrentUser = message.sender_id === userId;
              return (
                <div key={message.id} 
                     className={`chat-message ${isCurrentUser ? 'chat-message-out' : 'chat-message-in'}`}>
                  <div className="message-avatar">
                    <div className={`avatar-circle ${isCurrentUser ? 'avatar-you' : 'avatar-other'}`}>
                      {labelFor(message)}
                    </div>
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-sender">
                      {labelFor(message)}
                    </div>
                    <div className="message-bubble">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
       
        <div className="chat-input-area">
          <div className="input-group">
            <textarea
              className="form-control"
              rows={2}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
            />
            <button className="btn-send"
                    disabled={!inputValue.trim()}
                    onClick={handleSend}>
              Send
            </button>
          </div>
          <div className="input-help">
            <small>Press Enter to send</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;