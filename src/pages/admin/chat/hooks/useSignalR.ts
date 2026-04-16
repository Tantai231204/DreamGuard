import * as signalr from '@microsoft/signalr';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message, Conversation } from '../types';
import { mapConversation, type BackendConversation } from '@/api/services/chatService';
import { parseChatPayload } from '@/utils/chatPayload';
import { parseTypingSignalPayload, serializeTypingSignalPayload } from '@/utils/typingSignal';

/** Data shape from Azure test script */
interface AzureMessageData {
  chatMessageId?: string;
  id?: string;
  senderType?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  content?: string;
  text?: string;
  createdAt?: string;
  timestamp?: string;
  conversationId?: string;
  ConversationId?: string;
  roomId?: string;
  attachments?: Array<{
    id?: string;
    type?: 'image' | 'file';
    url?: string;
    fileName?: string;
    fileSizeBytes?: number;
  }>;
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

type MessageHandler = (msg: Message) => void;
type ConversationHandler = (conv: Conversation) => void;
type TypingHandler = (conversationId: string, isTyping: boolean) => void;
type PresenceHandler = (userId: string) => void;
type MessageAckStatus = Extract<Message['status'], 'delivered' | 'read'>;
type MessageStatusHandler = (messageId: string, status: MessageAckStatus) => void;
interface TypingInvokeCandidate {
  method: string;
  args: unknown[];
}

interface TypingEventResolution {
  typingKey: string | null;
  isTyping: boolean | null;
}

interface UseSignalROptions {
  conversationId?: string | null;
  onReceiveMessage?: MessageHandler;
  onConversationUpdate?: ConversationHandler;
  onUserTyping?: TypingHandler;
  onUserOnline?: PresenceHandler;
  onUserOffline?: PresenceHandler;
  onMessageStatus?: MessageStatusHandler;
  typingFromRole?: 'admin' | 'customer' | 'any';
  enabled?: boolean;
}

const CHAT_HUB_URL = (() => {
  const explicitHubUrl = import.meta.env.VITE_SIGNALR_URL as string | undefined;
  if (explicitHubUrl && explicitHubUrl.trim()) {
    return explicitHubUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiBaseUrl && /^https?:\/\//i.test(apiBaseUrl)) {
    try {
      return new URL('/chathub', apiBaseUrl).toString();
    } catch {
      // Fall through to relative proxy path when URL parsing fails.
    }
  }

  return '/chathub';
})();

const normalizeRealtimeId = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== 'object') return null;

  const raw = payload as Record<string, unknown>;
  const candidates = [raw.userId, raw.customerId, raw.senderId, raw.id];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
};

const resolveTypingConversationId = (
  payload: unknown,
): string | null => {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed) return trimmed;
  }

  if (payload && typeof payload === 'object') {
    const raw = payload as Record<string, unknown>;
    const candidates = [
      raw.conversationId,
      raw.ConversationId,
      raw.roomId,
      raw.senderId,
      raw.userId,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
  }

  return null;
};

const parseBooleanLike = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;

    if (['true', 'typing', 'start', 'started', 'on', '1'].includes(normalized)) {
      return true;
    }

    if (['false', 'stop', 'stopped', 'off', '0'].includes(normalized)) {
      return false;
    }
  }

  return null;
};

const resolveTypingEvent = (
  args: unknown[],
  fallbackConversationId?: string | null,
): TypingEventResolution => {
  let typingKey: string | null = null;
  let isTyping: boolean | null = null;

  for (const arg of args) {
    if (isTyping === null) {
      const parsedFlag = parseBooleanLike(arg);
      if (parsedFlag !== null) {
        isTyping = parsedFlag;
      } else if (arg && typeof arg === 'object') {
        const raw = arg as Record<string, unknown>;
        const booleanCandidates = [raw.isTyping, raw.typing, raw.isTypingStatus, raw.status];

        for (const candidate of booleanCandidates) {
          const parsedCandidateFlag = parseBooleanLike(candidate);
          if (parsedCandidateFlag !== null) {
            isTyping = parsedCandidateFlag;
            break;
          }
        }
      }
    }

    if (!typingKey) {
      const shouldSkipStringAsId = typeof arg === 'string' && parseBooleanLike(arg) !== null;
      if (!shouldSkipStringAsId) {
        const candidateTypingKey = resolveTypingConversationId(arg);
        if (candidateTypingKey) {
          typingKey = candidateTypingKey;
        }
      }
    }
  }

  if (!typingKey && fallbackConversationId?.trim()) {
    typingKey = fallbackConversationId.trim();
  }

  return { typingKey, isTyping };
};

const resolveMessageId = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== 'object') return null;

  const raw = payload as Record<string, unknown>;
  const candidates = [raw.messageId, raw.chatMessageId, raw.id];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
};

export function useSignalR({
  conversationId,
  onReceiveMessage,
  onConversationUpdate,
  onUserTyping,
  onUserOnline,
  onUserOffline,
  onMessageStatus,
  typingFromRole = 'any',
  enabled = true,
}: UseSignalROptions = {}) {
  const [connection, setConnection] = useState<signalr.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for handlers — prevents reconnections when callbacks change
  const onMsgRef = useRef<MessageHandler | undefined>(onReceiveMessage);
  const onConvRef = useRef<ConversationHandler | undefined>(onConversationUpdate);
  const onTypRef = useRef<TypingHandler | undefined>(onUserTyping);
  const onOnlineRef = useRef<PresenceHandler | undefined>(onUserOnline);
  const onOfflineRef = useRef<PresenceHandler | undefined>(onUserOffline);
  const onMessageStatusRef = useRef<MessageStatusHandler | undefined>(onMessageStatus);
  const typingFromRoleRef = useRef<'admin' | 'customer' | 'any'>(typingFromRole);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    onMsgRef.current = onReceiveMessage;
    onConvRef.current = onConversationUpdate;
    onTypRef.current = onUserTyping;
    onOnlineRef.current = onUserOnline;
    onOfflineRef.current = onUserOffline;
    onMessageStatusRef.current = onMessageStatus;
    typingFromRoleRef.current = typingFromRole;
  }, [onReceiveMessage, onConversationUpdate, onUserTyping, onUserOnline, onUserOffline, onMessageStatus, typingFromRole]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  /* ---- EFFECT 1: Connect once ---- */
  useEffect(() => {
    if (!enabled) return;

    const getAuthToken = () => sessionStorage.getItem('signalr_token') || '';

    const initialToken = getAuthToken();
    if (!initialToken) {
      console.warn('[SignalR] No signalr_token found in sessionStorage. The Hub connection might be anonymous or rejected.');
    } else {
      console.log('[SignalR] Initializing with token:', `${initialToken.substring(0, 10)}...`);
    }

    const connectionOptions: signalr.IHttpConnectionOptions = {
      withCredentials: true,
    };

    if (initialToken) {
      connectionOptions.accessTokenFactory = () => {
        const token = getAuthToken();
        if (!token) console.warn('[SignalR] Handshake requested token but none found.');
        return token;
      };
    }

    const conn = new signalr.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, connectionOptions)
      .withAutomaticReconnect()
      .configureLogging(signalr.LogLevel.Information)
      .build();

    let stopped = false;

    const handleIncomingMessage = (rawData?: AzureMessageData | string | null) => {
      const data: AzureMessageData =
        typeof rawData === 'string'
          ? { message: rawData, conversationId: conversationIdRef.current || undefined }
          : (rawData ?? {});

      const rawMessage = (data.message || data.content || data.text || '').trim();
      if (!rawMessage) return;

      const senderType = (data.senderType || '').toLowerCase();
      const isStaff =
        senderType.includes('admin') ||
        senderType.includes('manager') ||
        senderType.includes('seller') ||
        senderType.includes('staff') ||
        senderType.includes('support');
      const senderRole: 'admin' | 'customer' = isStaff ? 'admin' : 'customer';
      const hasSenderTypeHint = senderType.trim().length > 0;

      const typingSignal = parseTypingSignalPayload(rawMessage);
      if (typingSignal) {
        const expectedTypingRole = typingFromRoleRef.current;
        if (expectedTypingRole !== 'any' && hasSenderTypeHint && senderRole !== expectedTypingRole) {
          return;
        }

        const typingKey =
          typingSignal.conversationId ||
          data.conversationId ||
          data.ConversationId ||
          data.roomId ||
          typingSignal.senderId ||
          data.senderId ||
          conversationIdRef.current ||
          null;

        if (typingKey) {
          onTypRef.current?.(typingKey, typingSignal.isTyping);
        }
        return;
      }

      if (!onMsgRef.current) return;

      const parsedPayload = parseChatPayload(rawMessage);

      const normalizedBackendAttachments = (data.attachments || [])
        .filter((attachment) => !!attachment?.url)
        .map((attachment, index) => ({
          id: attachment?.id || `ws-att-${Date.now()}-${index}`,
          type: attachment?.type || 'image',
          url: attachment!.url!,
          fileName: attachment?.fileName || `attachment-${index + 1}`,
          fileSizeBytes: attachment?.fileSizeBytes,
        }));

      const payloadAttachments = parsedPayload.attachments.map((attachment, index) => ({
        id: `ws-payload-att-${Date.now()}-${index}`,
        type: attachment.type,
        url: attachment.url,
        fileName: attachment.fileName || `attachment-${index + 1}`,
      }));

      const attachments = normalizedBackendAttachments.length > 0
        ? normalizedBackendAttachments
        : payloadAttachments;

      const hasPinnedAppointment = !!parsedPayload.metadata?.appointment;
      if (!parsedPayload.text && attachments.length === 0 && !hasPinnedAppointment) return;

      const payloadConversationId = data.conversationId || data.ConversationId || data.roomId;
      const resolvedConversationId = payloadConversationId || '';
      
      if (!resolvedConversationId) {
        console.warn('[SignalR] ReceiveMessage ignored: missing conversationId in payload. Fallback ignored to prevent cross-chat contamination.', data);
        return;
      }

      const customerDisplayName = !isIdentifierLike(data.senderName)
        ? data.senderName!.trim()
        : 'Customer';

      onMsgRef.current({
        id: data.chatMessageId || data.id || `ws-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        content: parsedPayload.text,
        senderId: data.senderId || 'unknown',
        senderName: isStaff ? 'Support' : customerDisplayName,
        senderRole: isStaff ? 'admin' : 'customer',
        timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
        status: 'sent',
        conversationId: resolvedConversationId,
        attachments,
        appointment: parsedPayload.metadata?.appointment,
      });
    };

    const handleOnlineEvent = (payload: unknown) => {
      const userId = normalizeRealtimeId(payload);
      if (!userId) return;
      console.log(`[SignalR] User Online: ${userId}`);
      onOnlineRef.current?.(userId);
    };

    const handleOfflineEvent = (payload: unknown) => {
      const userId = normalizeRealtimeId(payload);
      if (!userId) return;
      console.log(`[SignalR] User Offline: ${userId}`);
      onOfflineRef.current?.(userId);
    };

    const handleTypingStart = (...args: unknown[]) => {
      const { typingKey } = resolveTypingEvent(args, conversationIdRef.current);
      if (!typingKey) return;

      onTypRef.current?.(typingKey, true);
    };

    const handleTypingStop = (...args: unknown[]) => {
      const { typingKey } = resolveTypingEvent(args, conversationIdRef.current);
      if (!typingKey) return;

      onTypRef.current?.(typingKey, false);
    };

    const handleMessageDelivered = (payload: unknown) => {
      const messageId = resolveMessageId(payload);
      if (!messageId) return;
      onMessageStatusRef.current?.(messageId, 'delivered');
    };

    const handleMessageSeen = (payload: unknown) => {
      const messageId = resolveMessageId(payload);
      if (!messageId) return;
      onMessageStatusRef.current?.(messageId, 'read');
    };

    conn.on('ReceiveMessage', handleIncomingMessage);
    conn.on('ReceiveNewMessage', handleIncomingMessage);
    conn.on('MessageReceived', handleIncomingMessage);
    conn.on('RECEIVE_MESSAGE', handleIncomingMessage);

    conn.on('ConversationUpdate', (conv: BackendConversation) => {
      onConvRef.current?.(mapConversation(conv));
    });

    conn.on('UserOnline', handleOnlineEvent);
    conn.on('USER_ONLINE', handleOnlineEvent);
    conn.on('UserOffline', handleOfflineEvent);
    conn.on('USER_OFFLINE', handleOfflineEvent);

    const handleTypingStatus = (...args: unknown[]) => {
      const { typingKey, isTyping } = resolveTypingEvent(args, conversationIdRef.current);
      if (!typingKey || isTyping === null) return;

      onTypRef.current?.(typingKey, isTyping);
    };

    conn.on('ReceiveTypingStatus', handleTypingStatus);
    conn.on('TypingStatus', handleTypingStatus);
    conn.on('ReceiveTyping', handleTypingStatus);
    conn.on('ReceiveTypingSignal', handleTypingStatus);

    conn.on('TYPING', handleTypingStart);
    conn.on('STOP_TYPING', handleTypingStop);
    conn.on('Typing', handleTypingStart);
    conn.on('StopTyping', handleTypingStop);
    conn.on('USER_TYPING', handleTypingStart);
    conn.on('USER_STOP_TYPING', handleTypingStop);

    conn.on('MessageDelivered', handleMessageDelivered);
    conn.on('MESSAGE_DELIVERED', handleMessageDelivered);
    conn.on('MessageSeen', handleMessageSeen);
    conn.on('MESSAGE_SEEN', handleMessageSeen);

    conn.onreconnecting((error) => {
      console.warn('[SignalR] Reconnecting due to error:', error);
      setIsConnected(false);
    });

    conn.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected. ConnectionId:', connectionId);
      setIsConnected(true);
    });

    conn.onclose((error) => {
      if (!stopped) {
        console.error('[SignalR] Connection closed. Error:', error);
        setIsConnected(false);
      }
    });

    conn.start()
      .then(() => {
        if (stopped) {
          conn.stop();
          return;
        }
        console.log('[SignalR] Connected to Azure Hub successfully');
        setIsConnected(true);
        setConnection(conn);
      })
      .catch((err) => {
        if (!stopped) {
          console.error('[SignalR] Connection start failed. Trace:', err);
        }
      });

    return () => {
      stopped = true;
      conn.stop();
      setConnection(null);
      setIsConnected(false);
    };
  }, [enabled]);

  /* ---- EFFECT 2: Join rooms when conversationId changes ---- */
  useEffect(() => {
    if (!connection || !isConnected || !conversationId) return;

    const joinMethods = ['JoinConversation', 'JoinRoom', 'JoinChat', 'JoinGroup'];
    const joinAll = async () => {
      const results = await Promise.allSettled(
        joinMethods.map((method) => connection.invoke(method, conversationId)),
      );

      const hasSuccess = results.some((result) => result.status === 'fulfilled');
      if (!hasSuccess) {
        console.warn('[SignalR] JOIN_CONVERSATION_ERROR: all join methods failed.');
      }
    };

    void joinAll();
  }, [connection, isConnected, conversationId]);

  const sendTyping = useCallback(
    (receiverId: string, isTyping: boolean) => {
      if (!isConnected || !connection) return;

      const normalizedReceiverId = typeof receiverId === 'string' ? receiverId.trim() : '';
      const normalizedConversationId = typeof conversationIdRef.current === 'string'
        ? conversationIdRef.current.trim()
        : '';

      const typingMethods = ['SendTypingSignal', 'SendTypingStatus', 'SendTyping', 'Typing'];
      const candidates: TypingInvokeCandidate[] = [];

      const pushTwoArgCandidates = (id: string) => {
        if (!id) return;
        typingMethods.forEach((method) => {
          candidates.push({ method, args: [id, isTyping] });
        });
      };

      pushTwoArgCandidates(normalizedReceiverId);
      if (normalizedConversationId && normalizedConversationId !== normalizedReceiverId) {
        pushTwoArgCandidates(normalizedConversationId);
      }

      if (normalizedConversationId && normalizedReceiverId) {
        typingMethods.forEach((method) => {
          candidates.push({ method, args: [normalizedConversationId, normalizedReceiverId, isTyping] });
          candidates.push({ method, args: [normalizedReceiverId, normalizedConversationId, isTyping] });
          candidates.push({
            method,
            args: [{
              conversationId: normalizedConversationId,
              receiverId: normalizedReceiverId,
              isTyping,
            }],
          });
        });
      }

      const uniqueCandidates = candidates.filter((candidate, index, list) =>
        list.findIndex((item) =>
          item.method === candidate.method && JSON.stringify(item.args) === JSON.stringify(candidate.args),
        ) === index,
      );

      const promises: Array<Promise<unknown>> = uniqueCandidates.map((candidate) =>
        connection.invoke(candidate.method, ...candidate.args),
      );

      // Fallback channel through message stream so FE still shows typing
      // even when BE typing event contract is inconsistent.
      if (normalizedConversationId) {
        const typingPayload = serializeTypingSignalPayload({
          conversationId: normalizedConversationId,
          isTyping,
        });
        promises.push(connection.invoke('SendMessage', normalizedConversationId, typingPayload));
      }

      void Promise.allSettled(promises);
    },
    [isConnected, connection],
  );

  /** Send message through SignalR (matching BE test script) */
  const sendHubMessage = useCallback(
    async (targetConversationId: string, message: string) => {
      if (!isConnected || !connection) {
        console.error('[SignalR] Cannot send message: and Connection state:', connection?.state);
        throw new Error('SignalR not connected');
      }

      try {
        console.log(`[SignalR] Invoking SendMessage to ${targetConversationId}`);
        await connection.invoke('SendMessage', targetConversationId, message);
      } catch (err: unknown) {
        const error = err as Error;
        console.error('[SignalR] SEND_MESSAGE_INVOCATION_ERROR:', error);

        if (error.message?.includes('Sender not found')) {
          console.error('[SignalR] CRITICAL: Backend Hub could not identify the user. Verification of JWT claims in the handshake token is required.');
        }
        throw error;
      }
    },
    [isConnected, connection],
  );

  return { connection, isConnected, sendTyping, sendHubMessage };
}
