import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../../styles/AdminConversations.css';

import {
  AdminUser,
  Conversation,
  fetchAdminConversations,
  fetchCertificateMap,
  fetchAdminList,
  assignConversationAdmin,
} from '../../../services/adminService';

const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [certMap, setCertMap]             = useState<Record<number, string>>({});
  const [adminList, setAdminList]         = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');

  const navigate  = useNavigate();
  const token     = localStorage.getItem('authToken');
  const serverUrl = 'http://localhost:5000';

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    (async () => {
      try {
        setIsLoading(true);
        const list = (await fetchAdminConversations(token, serverUrl))
          .filter(c => c.conversation_status !== 'team-chat');
        if (!ignore) setConversations(list);
      } catch (e) {
        if (!ignore) console.error(e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, serverUrl]);
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const map = await fetchCertificateMap(token, serverUrl);
        setCertMap(map);
      } catch (e) { console.error(e); }
    })();
  }, [token, serverUrl]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const admins = await fetchAdminList(token, serverUrl);
        setAdminList(admins);
      } catch (e) { console.error(e); }
    })();
  }, [token, serverUrl]);
  const handleAssignAdmin = async (conversationId: number, newAdminId: number) => {
    if (!token) return;
    try {
      await assignConversationAdmin(conversationId, newAdminId, token, serverUrl);
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, admin_id: newAdminId } : c)
      );
    } catch (e) { console.error(e); }
  };

  const filtered = conversations.filter(conv => {
    const term = searchTerm.toLowerCase();
    return (
      conv.client_code?.toLowerCase().includes(term) ||
      conv.certificate_name?.toLowerCase().includes(term) ||
      (conv.certificate_id && certMap[conv.certificate_id]?.toLowerCase().includes(term)) ||
      conv.conversation_status.toLowerCase().includes(term)
    );
  });

  const statusClass = (s: string) =>
    `badge ${s.toLowerCase() === 'pending'
        ? 'bg-warning text-dark' : s.toLowerCase() === 'answered'
        ? 'bg-success' : 'bg-secondary'}`;

  const openConversation = (id: number, code?: string) =>
    navigate(`/admin/chat/${id}`, { state: { clientCode: code } });

  const getTopic = (conv: Conversation) =>
    conv.certificate_name ??
    (conv.certificate_id ? certMap[conv.certificate_id] || `Certificate ${conv.certificate_id}` : 'General Inquiry');

  return (
    <div className="container-fluid admin-conversations-container py-4">
      <div className="row mb-4">
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between">
          <div className="position-relative w-100 w-md-auto">
            <i className="bi bi-search position-absolute search-icon" />
            <input
              className="form-control search-input"
              placeholder="Search by client code, topic or status…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="card loading-container">
          <div className="loading-spinner" /><p className="mt-3">Loading conversations…</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📨</div>
          <h3>No conversations found</h3>
          <p>When new conversations arrive, they will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching conversations</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="card responsive-table-container d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Client Code</th>
                    <th>Topic</th>
                    <th>Status</th>
                    <th>Assigned Admin</th>
                    <th>Last Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(conv => (
                    <tr key={conv.id}>
                      <td>{conv.client_code || 'N/A'}</td>
                      <td>{getTopic(conv)}</td>
                      <td><span className={statusClass(conv.conversation_status)}>{conv.conversation_status}</span></td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={conv.admin_id ?? ''}
                          onChange={e => handleAssignAdmin(conv.id, Number(e.target.value))}
                        >
                          <option value="">-- Assign --</option>
                          {adminList.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.first_name} {a.last_name} ({a.client_code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(conv.updated_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openConversation(conv.id, conv.client_code)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mobile-card-view d-md-none">
            {filtered.map(conv => (
              <div key={conv.id} className="card conversation-card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{conv.client_code || 'N/A'}</span>
                  <span className={statusClass(conv.conversation_status)}>
                    {conv.conversation_status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-1"><strong>Topic:</strong> {getTopic(conv)}</div>
                  <div className="mb-1"><strong>Updated:</strong> {new Date(conv.updated_at).toLocaleString()}</div>
                  <select
                    className="form-select form-select-sm my-2"
                    value={conv.admin_id ?? ''}
                    onChange={e => handleAssignAdmin(conv.id, Number(e.target.value))}
                  >
                    <option value="">-- Assign --</option>
                    {adminList.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.first_name} {a.last_name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => openConversation(conv.id, conv.client_code)}
                  >
                    Open Conversation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationsList;
