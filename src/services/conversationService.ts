import { apiFetch } from './api';

export const conversationService = {
  /* POST /api/admin/conversations */
  createConversation: (user_id: number, token: string) =>
    apiFetch<{ conversation: { id: number } }>('/api/admin/conversations', token, {
      method: 'POST',
      body: JSON.stringify({ user_id }),
    }).then(r => r.conversation),

  /* POST /api/conversations/:id/messages */
  sendMessage: (
    conversationId: number,
    content: string,
    senderRole: 'admin' | 'user',
    token: string
  ) =>
    apiFetch(`/api/conversations/${conversationId}/messages`, token, {
      method: 'POST',
      body: JSON.stringify({ content, senderRole }),
    }),

  /* POST /api/admin/notifications */
  createNotification: (
    payload: {
      user_id: number;
      certificate_id: number;
      message: string;
      request_new_document: boolean;
    },
    token: string
  ) =>
    apiFetch('/api/admin/notifications', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
