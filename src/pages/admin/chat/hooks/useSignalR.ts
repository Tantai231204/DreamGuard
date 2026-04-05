/* ============================================================
   useSignalR — Real-time WebSocket / SignalR hook
   
   Optimized: Returns connection status to coordinate with polling.
   ============================================================ */

import * as signalR from '@microsoft/signalr';
import { useEffect, useRef, useCallback, useState } from 'react';
import type { Message, Conversation } from '../types';

type MessageHandler      = (msg: Message) => void;
type ConversationHandler = (conv: Conversation) => void;
type TypingHandler       = (conversationId: string, isTyping: boolean) => void;

interface UseSignalROptions {
  onReceiveMessage?: MessageHandler;
  onConversationUpdate?: ConversationHandler;
  onUserTyping?: TypingHandler;
  enabled?: boolean;
}

/** Hub URL: same base as VITE_API_URL, different path */
const CHAT_HUB_URL = `${(import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''}/hubs/chat`;

export function useSignalR({
  onReceiveMessage,
  onConversationUpdate,
  onUserTyping,
  enabled = true,
}: UseSignalROptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Keep callbacks fresh without re-running the effect
  const onMsgRef  = useRef(onReceiveMessage);
  const onConvRef = useRef(onConversationUpdate);
  const onTypRef  = useRef(onUserTyping);
  useEffect(() => { onMsgRef.current  = onReceiveMessage;    });
  useEffect(() => { onConvRef.current = onConversationUpdate; });
  useEffect(() => { onTypRef.current  = onUserTyping;         });

  // SignalR context cleanup and connection
  useEffect(() => {
    // If not enabled, don't even start the async block
    if (!enabled || !import.meta.env.VITE_API_URL) {
      // Note: we don't call setIsConnected(false) here to avoid the "cascading render" lint error.
      // Instead, we let the cleanup or the initial state handle it.
      return; 
    }

    let cancelled = false;

    (async () => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(CHAT_HUB_URL, {
            accessTokenFactory: () =>
              document.cookie
                .split('; ')
                .find((r) => r.startsWith('access_token='))
                ?.split('=')[1] ?? '',
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
          .configureLogging(signalR.LogLevel.Warning)
          .build();

        connection.on('ReceiveMessage',      (msg: Message)      => onMsgRef.current?.(msg));
        connection.on('ConversationUpdate',  (conv: Conversation) => onConvRef.current?.(conv));
        connection.on('UserTyping',          (convId: string, isTyping: boolean) => onTypRef.current?.(convId, isTyping));
        
        connection.onreconnecting(() => setIsConnected(false));
        connection.onreconnected(() => setIsConnected(true));
        connection.onclose(() => setIsConnected(false));

        await connection.start();
        if (cancelled) {
          connection.stop();
          return;
        }
        connectionRef.current = connection;
        setIsConnected(true);
      } catch (err) {
        if (!cancelled) setIsConnected(false);
        console.warn('[SignalR] Connection failed — real-time disabled, polling active:', err);
      }
    })();

    return () => {
      cancelled = true;
      connectionRef.current?.stop();
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  return { 
    sendTyping: useCallback((conversationId: string, isTyping: boolean) => {
        connectionRef.current?.invoke('SetTyping', conversationId, isTyping).catch(() => null);
    }, []),
    isConnected: enabled ? isConnected : false // Derived state for better reactivity
  };
}
