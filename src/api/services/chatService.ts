/* ============================================================
   chatService — follows the same pattern as orderService.ts
   Uses the global `api` (axios) instance with auth + interceptors.
   ============================================================ */

import api from '@/lib/api';
import type { Message, Conversation, SendMessagePayload } from '../../pages/admin/chat/types';
import { MESSAGES_PAGE_SIZE } from '../../pages/admin/chat/constants';


const chatService = {
  /* ---- Conversations ------------------------------------ */

  /** GET /admin/conversations */
  getConversations: async (): Promise<Conversation[]> => {
    const res = await api.get('/admin/conversations');
    return res.data?.data ?? res.data;
  },

  /** PATCH /admin/conversations/:id/read */
  markRead: async (id: string): Promise<void> => {
    await api.patch(`/admin/conversations/${id}/read`);
  },

  /** PATCH /admin/conversations/:id/resolve */
  resolve: async (id: string): Promise<void> => {
    await api.patch(`/admin/conversations/${id}/resolve`);
  },

  /* ---- Messages ---------------------------------------- */

  /**
   * GET /admin/conversations/:id/messages?page=1&pageSize=30
   * Oldest first — adjust if backend uses cursor.
   */
  getMessages: async (
    conversationId: string,
    page = 1
  ): Promise<{ items: Message[]; hasMore: boolean }> => {
    const res = await api.get(`/admin/conversations/${conversationId}/messages`, {
      params: { page, pageSize: MESSAGES_PAGE_SIZE },
    });
    const data = res.data?.data ?? res.data;
    // Normalise shape — backend may return { items, hasMore } or an array
    if (Array.isArray(data)) {
      return { items: data, hasMore: data.length === MESSAGES_PAGE_SIZE };
    }
    return {
      items: data.items ?? data,
      hasMore: data.hasMore ?? false,
    };
  },

  /**
   * POST /admin/conversations/:id/messages
   * Supports text-only (JSON) and attachments (multipart).
   */
  sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
    const { conversationId, content, attachments } = payload;

    if (attachments && attachments.length > 0) {
      const form = new FormData();
      form.append('content', content);
      attachments.forEach((f) => form.append('attachments', f));
      const res = await api.post(
        `/admin/conversations/${conversationId}/messages`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data?.data ?? res.data;
    }

    const res = await api.post(
      `/admin/conversations/${conversationId}/messages`,
      { content }
    );
    return res.data?.data ?? res.data;
  },
};

export default chatService;
