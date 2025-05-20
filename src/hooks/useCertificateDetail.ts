import { useEffect, useState } from 'react';
import {
  certificateService,
  Certificate,
  DocumentItem,
} from '../services/certificateService';
import { conversationService } from '../services/conversationService';

export function useCertificateDetail(
  certificateId?: string,
  token?: string
) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [documents,   setDocuments]   = useState<DocumentItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  /* load cert + docs */
  useEffect(() => {
    if (!certificateId || !token) return;

    (async () => {
      try {
        setLoading(true);
        const [cert, docs] = await Promise.all([
          certificateService.detail(certificateId, token),
          certificateService.documents(certificateId, token),
        ]);
        setCertificate(cert);
        setDocuments(docs);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [certificateId, token]);

  /* helpers */
  const updateStatus = async (status: string) => {
    if (!certificateId || !token) return;
    const cert = await certificateService.updateStatus(certificateId, status, token);
    setCertificate(cert);
  };

  const toggleDoc = async (docId: number, checked: boolean) => {
    if (!token) return;
    await certificateService.updateDocument(docId, checked, token);
    setDocuments(prev =>
      prev.map(d =>
        d.document_id === docId ? { ...d, is_correct: checked } : d
      )
    );
  };

  const completeCertificate = async () => updateStatus('Completed');

  const sendMessage = async (
    user_id: number,
    message: string,
    requestNewDoc: boolean
  ) => {
    if (!certificateId || !token) return;

    const { id: conversationId } = await conversationService.createConversation(
      user_id,
      token
    );
    await conversationService.sendMessage(conversationId, message, 'admin', token);
    await conversationService.createNotification(
      {
        user_id,
        certificate_id: Number(certificateId),
        message,
        request_new_document: requestNewDoc,
      },
      token
    );
  };

  return {
    certificate,
    documents,
    loading,
    error,
    updateStatus,
    toggleDoc,
    completeCertificate,
    sendMessage,
  };
}
