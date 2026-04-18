/* ============================================================
   chatService — REST endpoints provided by Backend
   Only GET operations are available via REST.
   Sending messages is handled exclusively through SignalR.
   ============================================================ */

import api from '@/lib/api';
import type { Message, Conversation, MessageAttachment } from '../../pages/admin/chat/types';
import { MESSAGES_PAGE_SIZE } from '../../pages/admin/chat/constants';
import { parseChatPayload } from '@/utils/chatPayload';
import { parseTypingSignalPayload } from '@/utils/typingSignal';


/** Raw structure from Backend */
export interface BackendConversation {
  conversationId: string;
  customerId: string;
  staffId?: string;
  createdAt: string;
  hasUnread?: boolean;
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
  isRead?: boolean;
  attachments?: MessageAttachment[];
}

const isIdentifierLike = (value?: string): boolean => {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(trimmed)) return true;

  const longTokenPattern = /^[A-Za-z0-9_-]{16,}$/;
  return longTokenPattern.test(trimmed);
};

const toServerConversationStatus = (status: Conversation['status']) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const resolveStaffId = (item: BackendConversation): string | undefined => {
  const raw = item as unknown as Record<string, unknown>;

  const nestedStaff = raw.staff;
  const nestedStaffId =
    nestedStaff && typeof nestedStaff === 'object'
      ? ((nestedStaff as Record<string, unknown>).id ??
        (nestedStaff as Record<string, unknown>).staffId ??
        (nestedStaff as Record<string, unknown>).userId)
      : undefined;

  const candidates = [
    item.staffId,
    typeof raw.staffID === 'string' ? raw.staffID : undefined,
    typeof raw.sellerId === 'string' ? raw.sellerId : undefined,
    typeof raw.staffUserId === 'string' ? raw.staffUserId : undefined,
    typeof raw.assigneeId === 'string' ? raw.assigneeId : undefined,
    typeof nestedStaffId === 'string' ? nestedStaffId : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
};

const parseBooleanLike = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'online', 'active', 'available'].includes(normalized)) return true;
    if (['false', '0', 'offline', 'inactive', 'unavailable'].includes(normalized)) return false;
  }
  return undefined;
};

const resolveOnlineStatus = (item: BackendConversation): boolean | undefined => {
  const raw = item as unknown as Record<string, unknown>;
  const presence = raw.presence;
  const nestedPresence = presence && typeof presence === 'object'
    ? (presence as Record<string, unknown>)
    : null;

  const candidates: unknown[] = [
    raw.isOnline,
    raw.online,
    raw.onlineStatus,
    raw.connectionState,
    raw.connectionStatus,
    nestedPresence?.isOnline,
    nestedPresence?.online,
    nestedPresence?.status,
  ];

  for (const candidate of candidates) {
    const parsed = parseBooleanLike(candidate);
    if (typeof parsed === 'boolean') return parsed;
  }

  return undefined;
};

const resolveUnreadCount = (item: BackendConversation): number => {
  const raw = item as unknown as Record<string, unknown>;
  const candidate = raw.unreadCount ?? raw.unreadMessages ?? raw.unread_count ?? raw.UnreadCount ?? 0;
  return typeof candidate === 'number' ? candidate : 0;
};

/** Map backend conversation schema to UI model */
export const mapConversation = (item: BackendConversation): Conversation => ({
  id: item.conversationId,
  customerId: item.customerId,
  staffId: resolveStaffId(item),
  customerName: item.tradeInOrder?.receiverName || 'Customer',
  customerAvatar: '',
  lastMessage: `Order: ${item.tradeInOrder?.orderCode || 'N/A'}`,
  lastMessageTime: item.createdAt || new Date().toISOString(),
  unreadCount: resolveUnreadCount(item),
  hasUnread: item.hasUnread,
  status: (item.tradeInOrder?.status?.toLowerCase() || 'active') as Conversation['status'],
  isOnline: resolveOnlineStatus(item)
});

/** Map backend message schema to UI model */
export const mapMessage = (item: BackendMessage, convoId: string): Message | null => {
  const rawContent = item.message || item.content || '';
  if (parseTypingSignalPayload(rawContent)) {
    return null;
  }

  const parsedPayload = parseChatPayload(rawContent);

  const normalizedBackendAttachments = (item.attachments || []).map((attachment, index) => ({
    id: attachment.id || `hist-att-${Date.now()}-${index}`,
    type: attachment.type || 'image',
    url: attachment.url,
    fileName: attachment.fileName || `attachment-${index + 1}`,
    fileSizeBytes: attachment.fileSizeBytes,
  }));

  const payloadAttachments: MessageAttachment[] = parsedPayload.attachments.map((attachment, index) => ({
    id: `payload-att-${Date.now()}-${index}`,
    type: attachment.type,
    url: attachment.url,
    fileName: attachment.fileName || `attachment-${index + 1}`,
  }));

  const attachments = normalizedBackendAttachments.length > 0
    ? normalizedBackendAttachments
    : payloadAttachments;

  const senderType = (item.senderType || '').toLowerCase();
  const isStaff =
    senderType.includes('admin') ||
    senderType.includes('manager') ||
    senderType.includes('seller') ||
    senderType.includes('staff') ||
    senderType.includes('support');

  const customerDisplayName = !isIdentifierLike(item.senderName)
    ? item.senderName!.trim()
    : 'Customer';

  return {
    id: item.chatMessageId || item.id || `hist-${Date.now()}-${Math.random()}`,
    conversationId: convoId,
    senderId: item.senderId || 'unknown',
    senderName: isStaff ? 'Support' : customerDisplayName,
    senderRole: isStaff ? 'admin' : 'customer',
    content: parsedPayload.text,
    timestamp: item.createdAt || item.timestamp || new Date().toISOString(),
    status: item.isRead ? 'read' : 'sent',
    isRead: item.isRead,
    attachments,
    appointment: parsedPayload.metadata?.appointment,
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

  /**
   * Close/resolve a conversation handled by admin/staff.
   * Backend variants are supported via fallback endpoints.
   */
  updateConversationStatus: async (
    conversationId: string,
    status: Conversation['status']
  ): Promise<void> => {
    const normalizedStatus = toServerConversationStatus(status);
    const attempts: Array<() => Promise<unknown>> = [
      () => api.patch(`/Conversations/${conversationId}/status`, { status: normalizedStatus }),
      () => api.patch(`/Conversations/${conversationId}/Status`, { status: normalizedStatus }),
      () => api.patch(`/Conversations/${conversationId}/resolve`),
      () => api.patch(`/Conversations/${conversationId}/Resolve`),
      () => api.post(`/Conversations/${conversationId}/resolve`),
      () => api.post(`/Conversations/${conversationId}/Resolve`),
    ];

    let lastError: unknown;

    for (const attempt of attempts) {
      try {
        await attempt();
        return;
      } catch (error) {
        lastError = error;
        const statusCode = (error as { response?: { status?: number } })?.response?.status;
        if (statusCode && statusCode !== 404 && statusCode !== 405) {
          break;
        }
      }
    }

    throw lastError ?? new Error('Unable to update conversation status.');
  },

  /** PATCH /api/Conversations/{conversationId}/mark-as-read */
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/Conversations/${conversationId}/mark-as-read`);
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
    
    const mappedItems = rawItems
      .map((item) => mapMessage(item, conversationId))
      .filter((item): item is Message => !!item);

    return {
      items: mappedItems,
      hasMore: Array.isArray(data) ? data.length === MESSAGES_PAGE_SIZE : (data.hasMore ?? false),
    };
  },
};

export default chatService;

