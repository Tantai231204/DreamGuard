/* ============================================================
   clientChatService — Used directly by FloatingChat for customers
   Follows same logic as admin chatService
   ============================================================ */

import api from '@/lib/api';
import type { Message } from '../../pages/admin/chat/types';

const clientChatService = {
  /** GET /chat/messages */
  getMessages: async (
    page = 1
  ): Promise<{ items: Message[]; hasMore: boolean }> => {
    const res = await api.get('/chat/messages', {
      params: { page, pageSize: 30 },
    });
    const data = res.data?.data ?? res.data;
    if (Array.isArray(data)) {
      return { items: data, hasMore: data.length === 30 };
    }
    return {
      items: data.items ?? [],
      hasMore: data.hasMore ?? false,
    };
  },

  /** POST /chat/messages */
  sendMessage: async (payload: { content: string; attachments?: File[] }): Promise<Message> => {
    const { content, attachments } = payload;

    if (attachments && attachments.length > 0) {
      const form = new FormData();
      form.append('content', content);
      attachments.forEach((f) => form.append('attachments', f));
      const res = await api.post('/chat/messages', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data ?? res.data;
    }

    const res = await api.post('/chat/messages', { content });
    return res.data?.data ?? res.data;
  },
};

export default clientChatService;
