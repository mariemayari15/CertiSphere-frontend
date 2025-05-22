export interface DashboardStats {
    certificationsCount: number;
    pendingCertifications: number;
    activeUsers: number;
    revenue: string;
  }
  export interface AdminFormData {
  firstName: string;
  lastName: string;
  title: string;
  contactEmail: string;
  phoneNumber: string;
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

export interface PaymentRow {
  certificate_id        : number;
  certificate_reference : string | null;
  client_code           : string;
  business_name         : string | null;
  paid_at               : string;      // ISO timestamp
  amount_eur            : number;      // always 50
}

export interface Notification {
  id: number;
  user_id: number;
  certificate_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
  export interface AdminUser {
  id: number;
  client_code: string;
  role: string;
  first_name: string;
  last_name: string;
  business_name?: string;
  business_type?: string;
  industry?: string;
  contact_email?: string;
  phone_number?: string;
  created_at: string;
  cert_count?: number;
}

export interface CertificateItem {
  id: number;
  status: string;
  created_at: string;
  certificate_type: string | null;
  certificate_name: string | null;
}

export interface DocumentItem {
  document_id: number;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  certificate_id: number;
  is_correct: boolean;
}
export interface Certificate {
  certificate_id: number;
  certificate_name?: string | null;
  certificate_reference?: string | null;
  user_id: number;
  status: string;
  created_at: string;
  assigned_admin_id?: number | null;
  client_code: string;
  role?: string;
  first_name: string;
  last_name: string;
  business_name: string;
  contact_email?: string; 
}



export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  client_code: string;
  role: string;
}

export interface Conversation {
  id: number;
  client_id: number | null;
  certificate_id: number | null;
  certificate_name: string | null;
  conversation_status: string;
  admin_id: number | null;
  updated_at: string;
  client_code?: string;
}

export interface CertificateInfo {
  id: number;
  certificate_name: string | null;
}


export async function fetchCertificate(certificateId: string, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/certificates/${certificateId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch certificate');
  return data.certificate as Certificate;
}


export async function fetchDocuments(certificateId: string, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/certificates/${certificateId}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch documents');
  return data.documents as DocumentItem[];
}


export async function updateCertificateStatus(certificateId: string, newStatus: string, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/certificates/${certificateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update status');
  return data.certificate as Certificate;
}


export async function updateDocumentCheck(docId: number, checked: boolean, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/documents/${docId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_correct: checked }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update document');
  return data.document;
}


export async function sendAdminMessage(
  certificate: Certificate,
  messageContent: string,
  requestNewDoc: boolean,
  certificateId: string,
  token: string,
  serverUrl: string
) {
  
  const convRes = await fetch(`${serverUrl}/api/admin/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: certificate.user_id }),
  });
  const convData = await convRes.json();
  if (!convRes.ok) throw new Error(convData.error || 'Failed to create conversation');


  const msgRes = await fetch(
    `${serverUrl}/api/conversations/${convData.conversation.id}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: messageContent, senderRole: 'admin' }),
    }
  );
  const msgData = await msgRes.json();
  if (!msgRes.ok) throw new Error(msgData.error || 'Failed to send message');

  
  const notRes = await fetch(`${serverUrl}/api/admin/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: certificate.user_id,
      certificate_id: Number(certificateId),
      message: messageContent,
      request_new_document: requestNewDoc,
    }),
  });
  const notData = await notRes.json();
  if (!notRes.ok) throw new Error(notData.error || 'Failed to create notification');

  return true;
}

  
  export async function fetchAdminDashboardStats(token: string): Promise<DashboardStats> {
    const res = await fetch('http://13.48.42.53:5000/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
  
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch dashboard stats');
    }
  
    return {
      certificationsCount: data.certificationsCount,
      pendingCertifications: data.pendingCertifications,
      activeUsers: data.activeUsers,
      revenue: data.revenue,
    };
  }

export async function fetchCertificates(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/certificates`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch certificates');
  return data.certificates as Certificate[];
}


export async function fetchAdmins(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/admins`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch admins');
  return data.admins as AdminUser[];
}


export async function assignCertificateAdmin(
  certificateId: number,
  newAdminId: number,
  token: string,
  serverUrl: string
) {
  const res = await fetch(`${serverUrl}/api/admin/certificates/${certificateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ assigned_admin_id: newAdminId })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Update failed');
  return true;
}

export async function fetchAdminConversations(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch conversations');
  return data.conversations as Conversation[];
}


export async function fetchCertificateMap(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch certificates');
  const map: Record<number, string> = {};
  (data.certificates as CertificateInfo[]).forEach(c => {
    map[c.id] = c.certificate_name || `Certificate ${c.id}`;
  });
  return map;
}

export async function fetchAdminList(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/admins`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch admins');
  return data.admins as AdminUser[];
}

export async function assignConversationAdmin(
  conversationId: number,
  newAdminId: number,
  token: string,
  serverUrl: string
) {
  const res = await fetch(`${serverUrl}/api/admin/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ admin_id: newAdminId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to assign admin');
  return true;
}

export async function fetchTeamChatConversation(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/conversations/team-chat`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success || !data.conversation?.id)
    throw new Error(data.error || 'Unable to load Team Chat.');
  return data.conversation.id as number;
}

export async function fetchAdminCodeMap(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/admins`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch admins');
  const map: Record<number, string> = {};
  (data.admins as { id: number; client_code: string }[]).forEach(a => {
    map[a.id] = a.client_code;
  });
  return map;
}

export async function fetchAdminUserDetail(userId: string, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load user details');
  return { user: data.user as AdminUser, certificates: data.certificates as CertificateItem[] };
}
export async function fetchAllAdminUsers(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load users');
  return data.users as AdminUser[];
}

export async function registerNewAdmin(formData: AdminFormData, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register admin');
  return data.adminCode as string;
}
export async function fetchAdminNotifications(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch admin notifications');
  return data.notifications as Notification[];
}
export async function markNotificationAsRead(notifId: number, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/notifications/${notifId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_read: true }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to mark notification as read');
  return true;
}
export async function fetchAdminPayments(token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/admin/payments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error');
  return data.payments as PaymentRow[];
}

export async function fetchProfile(token: string, serverUrl: string): Promise<Profile> {
  const res = await fetch(`${serverUrl}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load profile');
  return data.profile as Profile;
}


export async function updateProfile(values: Profile, token: string, serverUrl: string) {
  const res = await fetch(`${serverUrl}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Update failed');
  return data;
}
