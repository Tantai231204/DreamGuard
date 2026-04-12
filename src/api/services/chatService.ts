/* ============================================================
   chatService — REST endpoints provided by Backend
   Only GET operations are available via REST.
   Sending messages is handled exclusively through SignalR.
   ============================================================ */

import api from '@/lib/api';
import type { Message, Conversation, MessageAttachment } from '../../pages/admin/chat/types';
import { MESSAGES_PAGE_SIZE } from '../../pages/admin/chat/constants';


/** Raw structure from Backend */
export interface BackendConversation {
  conversationId: string;
  customerId: string;
  staffId: string;
  createdAt: string;
  tradeInOrder?: {
    orderCode?: string;
    receiverName?: string;
    status?: string;
  };
}

/** Raw Message from Backend */
export interface BackendMessage {
  chatMessageId?: string;
  id?: string;
  senderId?: string;
  senderName?: string;
  senderType?: string;
  message?: string;
  content?: string;
  createdAt?: string;
  timestamp?: string;
  attachments?: MessageAttachment[];
}

/** Map backend conversation schema to UI model */
export const mapConversation = (item: BackendConversation): Conversation => ({
  id: item.conversationId,
  customerId: item.customerId,
  customerName: item.tradeInOrder?.receiverName || 'Customer',
  customerAvatar: '',
  lastMessage: `Order: ${item.tradeInOrder?.orderCode || 'N/A'}`,
  lastMessageTime: item.createdAt || new Date().toISOString(),
  unreadCount: 0,
  status: (item.tradeInOrder?.status?.toLowerCase() || 'active') as Conversation['status'],
  isOnline: false
});

/** Map backend message schema to UI model */
export const mapMessage = (item: BackendMessage, convoId: string): Message => {
  const isStaff = item.senderType === 'admin' || item.senderType === 'Seller';
  return {
    id: item.chatMessageId || item.id || `hist-${Date.now()}-${Math.random()}`,
    conversationId: convoId,
    senderId: item.senderId || 'unknown',
    senderName: isStaff ? 'Support' : (item.senderName || item.senderId || 'Customer'),
    senderRole: isStaff ? 'admin' : 'customer',
    content: item.message || item.content || '',
    timestamp: item.createdAt || item.timestamp || new Date().toISOString(),
    status: 'sent',
    attachments: item.attachments || []
  };
};

const chatService = {
  /* ---- Conversations ------------------------------------ */

  /** GET /api/Conversations */
  getConversations: async (params?: { pageNumber?: number; pageSize?: number; Key?: string }): Promise<Conversation[]> => {
    const res = await api.get('/Conversations', { params });
    const data = res.data?.data ?? res.data;
    const items: BackendConversation[] = Array.isArray(data) ? data : (data.items ?? []);

    return items.map(mapConversation);
  },

  /* ---- Messages ---------------------------------------- */

  /**
   * GET /api/Conversations/:id/Messages
   */
  getMessages: async (
    conversationId: string,
    page = 1
  ): Promise<{ items: Message[]; hasMore: boolean }> => {
    const res = await api.get(`/Conversations/${conversationId}/Messages`, {
      params: { page, pageSize: MESSAGES_PAGE_SIZE },
    });
    const data = res.data?.data ?? res.data;
    const rawItems: BackendMessage[] = Array.isArray(data) ? data : (data.items ?? []);
    
    return {
      items: rawItems.map(item => mapMessage(item, conversationId)),
      hasMore: Array.isArray(data) ? data.length === MESSAGES_PAGE_SIZE : (data.hasMore ?? false),
    };
  },
};

export default chatService;
