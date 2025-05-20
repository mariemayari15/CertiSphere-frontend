import { apiFetch } from './api';

/* ---------- Types ---------- */
export interface Certificate {
  certificate_id:       number;
  certificate_name:     string | null;
  certificate_reference:string | null;
  user_id:              number;
  status:               string;
  created_at:           string;
  assigned_admin_id:    number | null;
  client_code:          string;
  first_name:           string;
  last_name:            string;
  business_name:        string;
}

export interface DocumentItem {
  document_id:   number;
  file_name:     string;
  file_path:     string;
  uploaded_at:   string;
  certificate_id:number;
  is_correct:    boolean;
}

/* ---------- Endpoints ---------- */
export const certificateService = {
  list: (token: string) =>
    apiFetch<{ certificates: Certificate[] }>('/api/admin/certificates', token).then(
      r => r.certificates
    ),

  detail: (id: string, token: string) =>
    apiFetch<{ certificate: Certificate }>(`/api/admin/certificates/${id}`, token).then(
      r => r.certificate
    ),

  documents: (id: string, token: string) =>
    apiFetch<{ documents: DocumentItem[] }>(
      `/api/admin/certificates/${id}/documents`,
      token
    ).then(r => r.documents),

  updateStatus: (id: string, status: string, token: string) =>
    apiFetch<{ certificate: Certificate }>(`/api/admin/certificates/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then(r => r.certificate),

  assignAdmin: (certId: number, adminId: number, token: string) =>
    apiFetch(`/api/admin/certificates/${certId}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_admin_id: adminId }),
    }),

  updateDocument: (docId: number, is_correct: boolean, token: string) =>
    apiFetch(`/api/admin/documents/${docId}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ is_correct }),
    }),
};
