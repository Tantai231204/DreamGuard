/* ============================================================
   CHAT DOMAIN — STRICT TYPE DEFINITIONS
   ============================================================ */

import type { ChatPayloadAppointment } from '@/utils/chatPayload';

export type ConversationStatus = 'active' | 'resolved' | 'pending' | 'archived';
export type MessageRole       = 'admin' | 'customer';
export type MessageStatus     = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/* ---- Conversation ----------------------------------------- */
export interface Conversation {
  id: string;
  customerId: string;
  staffId?: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;   // ISO 8601
  unreadCount: number;
  hasUnread?: boolean;
  status: ConversationStatus;
  isOnline?: boolean;
  tags?: string[];
}

/* ---- Message ---------------------------------------------- */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageRole;
  content: string;
  timestamp: string;         // ISO 8601
  status: MessageStatus;
  isRead?: boolean;
  attachments?: MessageAttachment[];
  appointment?: ChatPayloadAppointment;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  fileName: string;
  fileSizeBytes?: number;
}

/* ---- API shapes ------------------------------------------- */
export interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachments?: File[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* ---- Hook return shapes ----------------------------------- */
export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  loadMore: () => void;
  markAsRead: (conversationId: string) => void;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedId: string | null;
  selectConversation: (id: string) => void;
  filteredConversations: Conversation[];
  stats: ConversationStats;
}

export interface ConversationStats {
  active: number;
  total: number;
  unreadTotal: number;
}
