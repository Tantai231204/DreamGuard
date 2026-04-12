import * as signalr from '@microsoft/signalr';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message, Conversation } from '../types';
import { mapConversation, type BackendConversation } from '@/api/services/chatService';

/** Data shape from Azure test script */
interface AzureMessageData {
  senderType: string;
  senderId: string;
  message: string;
}

type MessageHandler = (msg: Message) => void;
type ConversationHandler = (conv: Conversation) => void;
type TypingHandler = (conversationId: string, isTyping: boolean) => void;

interface UseSignalROptions {
  conversationId?: string | null;
  onReceiveMessage?: MessageHandler;
  onConversationUpdate?: ConversationHandler;
  onUserTyping?: TypingHandler;
  onUserOffline?: (userId: string) => void;
  enabled?: boolean;
}

const CHAT_HUB_URL = '/chathub';

export function useSignalR({
  conversationId,
  onReceiveMessage,
  onConversationUpdate,
  onUserTyping,
  onUserOffline,
  enabled = true,
}: UseSignalROptions = {}) {
  const [connection, setConnection] = useState<signalr.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for handlers — prevents reconnections when callbacks change
  const onMsgRef = useRef<MessageHandler | undefined>(onReceiveMessage);
  const onConvRef = useRef<ConversationHandler | undefined>(onConversationUpdate);
  const onTypRef = useRef<TypingHandler | undefined>(onUserTyping);
  const onOfflineRef = useRef<((id: string) => void) | undefined>(onUserOffline);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    onMsgRef.current = onReceiveMessage;
    onConvRef.current = onConversationUpdate;
    onTypRef.current = onUserTyping;
    onOfflineRef.current = onUserOffline;
  }, [onReceiveMessage, onConversationUpdate, onUserTyping, onUserOffline]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  /* ---- EFFECT 1: Connect once ---- */
  useEffect(() => {
    if (!enabled) return;

    // Grab the token from sessionStorage. 
    // Tip: If using the Pure Cookie approach, accessToken might be empty.
    // However, for Hubs on different domains (Azure), the token is usually required in Authorization header.
    const getAuthToken = () => sessionStorage.getItem('signalr_token') || '';
    
    const initialToken = getAuthToken();
    if (!initialToken) {
      console.warn('[SignalR] No signalr_token found in sessionStorage. The Hub connection might be anonymous or rejected.');
    } else {
      console.log('[SignalR] Initializing with token:', initialToken.substring(0, 10) + '...');
    }

    const conn = new signalr.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: () => {
          const t = getAuthToken();
          // DEBUG: Log token fetch during handshake
          if (!t) console.warn('[SignalR] Handshake requested token but none found.');
          return t;
        },
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalr.LogLevel.Information)
      .build();

    let stopped = false;

    conn.on('ReceiveMessage', (data: AzureMessageData & { chatMessageId?: string }) => {
      console.log('[SignalR] Raw message received from server:', data);
      if (data.message && onMsgRef.current) {
        const isStaff = data.senderType === 'admin' || data.senderType === 'Seller';
        
        onMsgRef.current({
          id: data.chatMessageId || `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: data.message,
          senderId: data.senderId,
          senderName: isStaff ? 'Support' : data.senderId,
          senderRole: isStaff ? 'admin' : 'customer',
          timestamp: new Date().toISOString(),
          status: 'sent',
          conversationId: conversationIdRef.current || '',
        });
      }
    });

    conn.on('ConversationUpdate', (conv: BackendConversation) => {
      onConvRef.current?.(mapConversation(conv));
    });

    conn.on('UserOffline', (userId: string) => {
      console.log(`[SignalR] User Offline: ${userId}`);
      onOfflineRef.current?.(userId);
    });

    conn.on('ReceiveTypingStatus', (senderId: string, isTyping: boolean) => {
      onTypRef.current?.(senderId, isTyping);
    });

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

    connection.invoke('JoinConversation', conversationId)
      .then(() => console.log(`[SignalR] Joined Room: ${conversationId}`))
      .catch((err) => console.warn('[SignalR] JOIN_CONVERSATION_ERROR:', err));

  }, [connection, isConnected, conversationId]);

  const sendTyping = useCallback(
    (receiverId: string, isTyping: boolean) => {
      if (isConnected && connection) {
        connection.invoke('SendTypingSignal', receiverId, isTyping).catch(() => {});
      }
    },
    [isConnected, connection]
  );

  /** Send message through SignalR (matching BE test script) */
  const sendHubMessage = useCallback(
    async (targetConversationId: string, message: string) => {
      if (!isConnected || !connection) {
        console.error('[SignalR] Cannot send message: and Connection state:', connection?.state);
        throw new Error('SignalR not connected');
      }
      
      try {
        // Log the outgoing payload to help detect "Sender not found" issues
        console.log(`[SignalR] Invoking SendMessage to ${targetConversationId}`);
        await connection.invoke('SendMessage', targetConversationId, message);
      } catch (err: unknown) {
        const error = err as Error;
        console.error('[SignalR] SEND_MESSAGE_INVOCATION_ERROR:', error);
        
        // Check for specific backend error messages
        if (error.message?.includes('Sender not found')) {
          console.error('[SignalR] CRITICAL: Backend Hub could not identify the user. Verification of JWT claims in the handshake token is required.');
        }
        throw error;
      }
    },
    [isConnected, connection]
  );

  return { connection, isConnected, sendTyping, sendHubMessage };
}
