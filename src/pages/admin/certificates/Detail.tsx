import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../../styles/AdminCertificateDetail.css';

import {
  Certificate,
  DocumentItem,
  fetchCertificate,
  fetchDocuments,
  updateCertificateStatus,
  updateDocumentCheck,
  sendAdminMessage,
} from '../../../services/adminService';

const ALLOWED_STATUSES = [
  'Submitted',
  'Viewed by Admin',
  'Processing in Progress',
  'Additional Documents Required',
  'Completed',
];

const Detail: React.FC = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [requestNewDoc, setRequestNewDoc] = useState(false);

  const navigate  = useNavigate();
  const token     = localStorage.getItem('authToken');
  const serverUrl = 'http://localhost:5000';

  useEffect(() => {
    if (!token) navigate('/admin-login');
  }, [token, navigate]);

  useEffect(() => {
    if (!certificateId || !token) return;

    fetchCertificate(certificateId, token, serverUrl)
      .then(cert => {
        setCertificate(cert);
        setNewStatus(cert.status);
      })
      .catch(err => {
        setError(err.message);
      });

    fetchDocuments(certificateId, token, serverUrl)
      .then(setDocuments)
      .catch(err => {
        setError(err.message);
      });
  }, [certificateId, token, serverUrl]);

 
  const handleStatusUpdate = () => {
    if (!certificateId || !newStatus.trim() || !token) return;

    updateCertificateStatus(certificateId, newStatus, token, serverUrl)
      .then(cert => {
        setCertificate(cert);
        alert(`Status updated to ${cert.status}`);
      })
      .catch(err => setError(err.message));
  };

  const handleDocCheck = (docId: number, checked: boolean) => {
    setDocuments(prev =>
      prev.map(d => (d.document_id === docId ? { ...d, is_correct: checked } : d))
    );
    if (!token) return;

    updateDocumentCheck(docId, checked, token, serverUrl)
      .catch(err => setError(err.message));
  };

  const handleSendMessage = async () => {
    if (!certificate || !certificateId || !token) {
      alert('No certificate loaded');
      return;
    }
    try {
      await sendAdminMessage(
        certificate,
        messageContent,
        requestNewDoc,
        certificateId,
        token,
        serverUrl
      );
      alert('Conversation, message, and notification sent!');
      setMessageContent('');
      setRequestNewDoc(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateCertificate = () => {
    if (!certificateId || !certificate || !token) return;

    if (!documents.every(d => d.is_correct)) {
      alert('Not all documents are marked as correct. Please review them first.');
      return;
    }

    updateCertificateStatus(certificateId, 'Completed', token, serverUrl)
      .then(cert => {
        setCertificate(cert);
        alert('Certificate marked as Completed!');
        navigate('/admin/dashboard');
      })
      .catch(err => setError(err.message));
  };

  const handleGoBack = () => navigate('/admin/certifications');
  if (error)
    return (
      <div className="container mt-4">
        <div className="admin-error">{error}</div>
      </div>
    );

  if (!certificate)
    return (
      <div className="container mt-4">
        <div className="admin-loading">Loading certificate data...</div>
      </div>
    );

  return (
    <div className="container mt-4 mb-4">
      <div className="cert-detail">
        {/* Header */}
        <div className="cert-header">
          <div className="back-icon" onClick={handleGoBack}>
            <i className="bi bi-arrow-left" />
          </div>
          <h2>
            {certificate.certificate_reference ?? `Certificate #${certificate.certificate_id}`}
          </h2>
          <div className="cert-status">{certificate.status}</div>
        </div>

        <div className="cert-main">
          <div className="cert-info">
            <div className="row">
              <div className="col-md-3 col-sm-6 mb-3 mb-md-0">
                <div className="cert-info-item">
                  <span className="cert-info-label">Client</span>
                  {certificate.client_code}
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3 mb-md-0">
                <div className="cert-info-item">
                  <span className="cert-info-label">Business</span>
                  {certificate.business_name}
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3 mb-md-0">
                <div className="cert-info-item">
                  <span className="cert-info-label">Email</span>
                  {certificate.contact_email}
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="cert-info-item">
                  <span className="cert-info-label">Created</span>
                  {new Date(certificate.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          <div className="cert-toolbar">
            <div className="status-control">
              <select
                className="form-select"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
              >
                {ALLOWED_STATUSES.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <button className="btn btn-custom" onClick={handleStatusUpdate}>
                Update Status
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="docs-section">
                <h3 className="section-header">Documents</h3>
                {documents.length === 0 ? (
                  <p className="no-docs">No documents uploaded.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-custom mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: 50 }} />
                          <th>Name</th>
                          <th>Date</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.document_id}>
                            <td>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={doc.is_correct}
                                  onChange={e => handleDocCheck(doc.document_id, e.target.checked)}
                                  id={`doc-${doc.document_id}`}
                                />
                              </div>
                            </td>
                            <td>{doc.file_name}</td>
                            <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                            <td>
                              <a
                                href={`${serverUrl}/uploads/${doc.file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="doc-link"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="message-section">
                <h3 className="section-header">Send Message</h3>
                <div className="p-3">
                  <div className="mb-3">
                    <textarea
                      className="form-control message-textarea"
                      value={messageContent}
                      onChange={e => setMessageContent(e.target.value)}
                      rows={4}
                      placeholder="Explain what is missing or not correct..."
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center message-controls">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="requestNewDoc"
                        checked={requestNewDoc}
                        onChange={() => setRequestNewDoc(!requestNewDoc)}
                      />
                      <label className="form-check-label" htmlFor="requestNewDoc">
                        Request New Document
                      </label>
                    </div>
                    <button className="btn btn-custom" onClick={handleSendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="cert-footer p-4">
              <button
                className="btn btn-custom btn-generate"
                onClick={handleGenerateCertificate}
                disabled={!documents.every(d => d.is_correct)}
              >
                Generate Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
