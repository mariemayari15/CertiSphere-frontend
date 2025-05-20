export interface Certificate {
  id: number;
  status: string;
  created_at: string;
  certificate_type?: string;
  certificate_name?: string;
  iso_standards?: string[];
  last_updated_at?: string;
  assigned_to?: string;
  estimated_completion_date?: string;
  comments?: Array<{
    text: string;
    date: string;
    author: string;
  }>;
}
export interface CertificateType {
  id: number;
  typeName: string;
  requiredDocs: string[];
  price: number;
}
export interface CertificateRow {
  id: number;
  certificate_name: string | null;
  certificate_type: string | null;
  price: number | null;
}
export interface ConversationData {
  id: number;
  client_id: number;
  admin_id: number | null;
  certificate_id: number | null;
  updated_at: string;
  certificate_name?: string | null;
}
export interface PaymentRow {
  certificate_id: number;
  certificate_reference: string | null;
  certificate_name: string | null;
  amount_eur: number;
  paid_at: string;
}
export async function fetchConversation(conversationId: number, token: string): Promise<ConversationData> {
  const res = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch conversation');
  return data.conversation as ConversationData;
}

export async function fetchCertificateDetail(id: string, token: string) {
  const res = await fetch(`http://localhost:5000/api/certificates/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch certificate details');
  }

  return data.certificate as Certificate;
}


export async function fetchUserCertificates(token: string, serverUrl: string): Promise<Certificate[]> {
  const res = await fetch(`${serverUrl}/api/my-certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch certificates.');
  return data.certificates || [];
}


export async function fetchCertificateTypes(token: string): Promise<{certificateTypes: CertificateType[], isoOptions: string[]}> {
  const res = await fetch('http://localhost:5000/api/certificate-types', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load certificate types');
  return {
    certificateTypes: data.data.certificateTypes,
    isoOptions: data.data.isoStandards
  };
}

export async function uploadDocuments(token: string, fileList: any[]): Promise<{certificateId: number}> {
  const formData = new FormData();
  fileList.forEach((f) => formData.append('documents', f.originFileObj));
  const res = await fetch('http://localhost:5000/api/upload-documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
  return { certificateId: data.certificateId };
}

export async function generateCertificate(
  token: string,
  params: { certificateId: number, certificateType: number, certificateName: string, isoStandards: string[] }
): Promise<{message: string}> {
  const res = await fetch('http://localhost:5000/api/generate-certificate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');
  return { message: data.message };
}

export async function createPaymentIntent(certificateId: number, token: string) {
  const res = await fetch('http://localhost:5000/api/pay-certificate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ certificateId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error);
  return { clientSecret: data.clientSecret, amount: data.amount }; 
}


export async function markCertificatePaid(certificateId: number, token: string) {
  const res = await fetch(
    `http://localhost:5000/api/certificates/${certificateId}/mark-paid`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error);
  return true;
}

export async function fetchUserPayments(token: string): Promise<PaymentRow[]> {
  const res = await fetch('http://localhost:5000/api/my-payments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error);
  return data.payments as PaymentRow[];
}





export async function fetchPendingCertificates(token: string): Promise<CertificateRow[]> {
  const res = await fetch('http://localhost:5000/api/my-pending-certificates', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error);
  return data.certificates as CertificateRow[];
}


export interface Notification {
  id: number;
  user_id: number;
  certificate_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
  request_new_document: boolean;
}


export async function fetchUserNotifications(token: string) {
  const res = await fetch('http://localhost:5000/api/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
  return data.notifications as Notification[];
}


export async function markNotificationAsRead(notifId: number, token: string) {
  const res = await fetch(`http://localhost:5000/api/notifications/${notifId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_read: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to mark as read');
  return true;
}


export async function uploadNotificationDocument(notifId: number, file: File, token: string) {
  const formData = new FormData();
  formData.append('document', file);
  const res = await fetch(`http://localhost:5000/api/notifications/${notifId}/upload-document`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload document');
  return true;
}


export interface Profile {
  business_name: string | null;
  business_type: string | null;
  industry: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  contact_email: string | null;
  phone_number: string | null;
}


export async function fetchUserProfile(token: string): Promise<Profile> {
  const res = await fetch('http://localhost:5000/api/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load profile');
  return data.profile;
}


export async function updateUserProfile(profile: Profile, token: string) {
  const res = await fetch('http://localhost:5000/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profile)
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Update failed');
  return true;
}


export async function requestAccountDeletion() {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('You must be logged-in to delete the account.');

  const res = await fetch('http://localhost:5000/api/request-account-deletion', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to request deletion');
  return true;
}


export interface MyDocument {
  document_id: number;
  file_name: string;
  uploaded_at: string;
  certificate_name: string;
  certificate_status: string;
  file_path: string;
}

export async function fetchUserDocuments(token: string): Promise<MyDocument[]> {
  const res = await fetch('http://localhost:5000/api/my-documents', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch your documents.');
  }
  return data.documents || [];
}
