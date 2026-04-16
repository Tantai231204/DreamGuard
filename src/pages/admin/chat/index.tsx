/* ============================================================
   ChatAdmin — Main Page
   Optimized: Coordinated SignalR connection with Query polling.
   ============================================================ */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import AdminPageHeader  from '@/components/layout/AdminPageHeader';
import ConversationList from './components/ConversationList';
import ChatHeader       from './components/ChatHeader';
import MessageList      from './components/MessageList';
import MessageInput     from './components/MessageInput';
import EmptyState       from './components/EmptyState';
import { useConversations } from './hooks/useConversations';
import { useChat }          from './hooks/useChat';
import { useSignalR }       from './hooks/useSignalR';
import { chatService }      from '@/api/services';
import { toast }            from 'sonner';
import { uploadToCloudinary } from '@/lib/uploadCloudinary';
import { serializeChatPayload } from '@/utils/chatPayload';
import type { ChatPayloadAppointment } from '@/utils/chatPayload';
import './styles.css';

/* ---- Stable formatters */
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });

const formatTime = (iso: string): string =>
  timeFormatter.format(new Date(iso));

const formatDate = (iso: string): string => {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PRESENCE_ACTIVITY_TIMEOUT_MS = 60_000;

/* ------------------------------------------------------------ */
export default function ChatAdmin() {
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>({});
  const [isResolvingConversation, setIsResolvingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const presenceTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const conversationsRef = useRef<import('./types').Conversation[]>([]);
  const selectedConversationRef = useRef<string | null>(null);
  const participantConversationRef = useRef<Record<string, string>>({});

  // Refs for SignalR callbacks (prevents connection restarts on prop changes)
  // Must be declared before useSignalR
  const _appendFnRef = useRef<(msg: import('./types').Message) => void>(() => {});
  const _updateFnRef = useRef<(conv: import('./types').Conversation) => void>(() => {});
  const _presenceTouchFnRef = useRef<(conversationId: string) => void>(() => {});
  const _onlineFnRef = useRef<(userId: string) => void>(() => {});
  const _offlineFnRef = useRef<(id: string) => void>(() => {});
  const _messageStatusFnRef = useRef<(messageId: string, status: 'delivered' | 'read') => void>(() => {});

  /* ---- Conversations ------------------------------------- */
  const {
    conversations,
    isLoading: convsLoading,
    error:     convsError,
    searchQuery,
    setSearchQuery,
    selectedId,
    selectConversation,
    filteredConversations,
    stats,
    applyConversationUpdate,
  } = useConversations({ pollEnabled: true });

  useEffect(() => {
    conversationsRef.current = conversations;

    const nextParticipantMap = { ...participantConversationRef.current };
    conversations.forEach((conversation) => {
      nextParticipantMap[conversation.id] = conversation.id;
      if (conversation.customerId) {
        nextParticipantMap[conversation.customerId] = conversation.id;
      }
    });

    participantConversationRef.current = nextParticipantMap;
  }, [conversations]);

  useEffect(() => {
    selectedConversationRef.current = selectedId || null;
  }, [selectedId]);

  /* ---- Real-time (SignalR) -------------------------------- */
  const { isConnected, sendTyping, sendHubMessage } = useSignalR({
    conversationId: selectedId,
    typingFromRole: 'customer',
    onReceiveMessage: useCallback(
      (msg: import('./types').Message) => {
        const isCurrent = msg.conversationId === selectedConversationRef.current;

        if (msg.senderRole === 'customer' && msg.senderId && msg.conversationId) {
          participantConversationRef.current[msg.senderId] = msg.conversationId;
          participantConversationRef.current[msg.conversationId] = msg.conversationId;
        }

        // 1. If it's the active conversation, append to list
        if (isCurrent) {
          _appendFnRef.current?.(msg);
        }
        
        // 2. ALWAYS update the conversation list (Sidebar) real-time
        const existing = conversationsRef.current.find(c => c.id === msg.conversationId);
        if (existing) {
          _updateFnRef.current?.({
            ...existing,
            lastMessage: msg.content,
            lastMessageTime: msg.timestamp,
            // Only increment if it's NOT the current one (the current one gets marked as read anyway)
            unreadCount: isCurrent ? 0 : (existing.unreadCount || 0) + 1,
            hasUnread: !isCurrent
          });
        }
        
        if (msg.senderRole === 'customer' && msg.conversationId) {
          _presenceTouchFnRef.current?.(msg.conversationId);
        }
      },
      []
    ),
    onConversationUpdate: useCallback(
      (conv: import('./types').Conversation) => { 
        _updateFnRef.current?.(conv); 
      },
      []
    ),
    onUserTyping: useCallback((typingKey: string, isTyping: boolean) => {
      if (!typingKey) return;

      const normalizedTypingKey = typingKey.trim();
      if (!normalizedTypingKey) return;

      const mappedConversationId = participantConversationRef.current[normalizedTypingKey];
      let resolvedConversationId = mappedConversationId
        || conversationsRef.current.find(
          (item) => item.id === normalizedTypingKey || item.customerId === normalizedTypingKey,
        )?.id;

      if (!resolvedConversationId && selectedConversationRef.current) {
        const selectedConversation = conversationsRef.current.find(
          (item) => item.id === selectedConversationRef.current,
        );

        if (selectedConversation?.staffId && selectedConversation.staffId === normalizedTypingKey) {
          resolvedConversationId = selectedConversation.id;
        }
      }

      if (!resolvedConversationId) return;

      setTypingByConversation(prev => ({ ...prev, [resolvedConversationId]: isTyping }));

      const existingTimeout = typingTimeoutsRef.current[resolvedConversationId];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (isTyping) {
        _presenceTouchFnRef.current?.(resolvedConversationId);
        typingTimeoutsRef.current[resolvedConversationId] = setTimeout(() => {
          setTypingByConversation(prev => ({ ...prev, [resolvedConversationId]: false }));
        }, 2500);
      }
    }, []),
    onUserOnline: useCallback((userId: string) => {
      _onlineFnRef.current?.(userId);
    }, []),
    onUserOffline: useCallback((userId: string) => {
      _offlineFnRef.current?.(userId);
    }, []),
    onMessageStatus: useCallback((messageId: string, status: 'delivered' | 'read') => {
      _messageStatusFnRef.current?.(messageId, status);
    }, []),
  });

  /* ---- Messages ------------------------------------------ */
  const {
    messages,
    isLoading: msgsLoading,
    hasMore,
    addOptimisticMessage,
    updateMessageStatus,
    loadMore,
    appendMessage,
    markAsRead,
  } = useChat({ conversationId: selectedId });

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  // Mark as read when selecting a new conversation with unread messages
  // Use conversationsRef to get immediate data without waiting for memo/render cycles
  useEffect(() => {
    if (!selectedId) return;
    
    const conv = conversationsRef.current.find(c => c.id === selectedId);
    if (conv?.hasUnread || (conv?.unreadCount && conv.unreadCount > 0)) {
      markAsRead();
    }
  }, [selectedId, markAsRead]);

  // Sync references to keep hooks consistent
  useEffect(() => { 
    _appendFnRef.current = appendMessage; 
    _updateFnRef.current = applyConversationUpdate;
    _messageStatusFnRef.current = (messageId: string, status: 'delivered' | 'read') => {
      updateMessageStatus(messageId, status);
    };

    const clearPresenceTimeout = (conversationId: string) => {
      const timeout = presenceTimeoutsRef.current[conversationId];
      if (timeout) {
        clearTimeout(timeout);
        delete presenceTimeoutsRef.current[conversationId];
      }
    };

    const setConversationPresence = (conversationId: string, online: boolean) => {
      const conversation = conversationsRef.current.find((c) => c.id === conversationId);
      if (!conversation || conversation.isOnline === online) return;
      _updateFnRef.current?.({ ...conversation, isOnline: online });
    };

    _presenceTouchFnRef.current = (conversationId: string) => {
      if (!conversationId) return;

      setConversationPresence(conversationId, true);
      clearPresenceTimeout(conversationId);

      presenceTimeoutsRef.current[conversationId] = setTimeout(() => {
        setConversationPresence(conversationId, false);
        delete presenceTimeoutsRef.current[conversationId];
      }, PRESENCE_ACTIVITY_TIMEOUT_MS);
    };

    const resolveConversationIdFromKey = (key: string): string | null => {
      const normalizedKey = key.trim();
      if (!normalizedKey) return null;

      const mappedConversationId = participantConversationRef.current[normalizedKey];
      if (mappedConversationId) {
        return mappedConversationId;
      }

      const conversation = conversationsRef.current.find(
        (item) => item.id === normalizedKey || item.customerId === normalizedKey,
      );

      return conversation?.id || null;
    };

    _onlineFnRef.current = (userId: string) => {
      if (!userId) return;

      const resolvedConversationId = resolveConversationIdFromKey(userId);
      if (resolvedConversationId) {
        _presenceTouchFnRef.current?.(resolvedConversationId);
      }
    };

    _offlineFnRef.current = (id: string) => {
      // Map user offline to a status update in the list
      const resolvedConversationId = resolveConversationIdFromKey(id);
      if (resolvedConversationId) {
        clearPresenceTimeout(resolvedConversationId);
        setConversationPresence(resolvedConversationId, false);
      }
    };
  }, [appendMessage, applyConversationUpdate, updateMessageStatus]);

  useEffect(() => {
    const typingTimeouts = typingTimeoutsRef.current;
    const presenceTimeouts = presenceTimeoutsRef.current;
    return () => {
      Object.values(typingTimeouts).forEach(clearTimeout);
      Object.values(presenceTimeouts).forEach(clearTimeout);
    };
  }, []);

  /* ---- Derived ------------------------------------------- */
  const headerStats = useMemo(
    () => [
      { label: 'Active',        value: stats.active },
      { label: 'Total',         value: stats.total  },
      { label: 'Sync Status',   value: isConnected ? 'Live' : 'Polling' },
    ],
    [stats, isConnected]
  );

  /* ---- Handlers ------------------------------------------ */
  const handleSend = useCallback(
    async ({
      text,
      imageFile,
      appointment,
    }: {
      text: string;
      imageFile?: File | null;
      appointment?: ChatPayloadAppointment;
    }) => {
      if (!selectedId || !isConnected || currentConversation?.status === 'resolved') return;

      const normalizedText = text.trim();
      if (!normalizedText && !imageFile && !appointment) return;

      setIsSendingMessage(true);
      let optimisticMessageId: string | undefined;

      try {
        let imageUrl: string | undefined;

        if (imageFile) {
          setUploadProgress(0);
          const uploaded = await uploadToCloudinary(imageFile, {
            onProgress: (progress) => {
              setUploadProgress(progress);
            },
          });
          imageUrl = uploaded.secure_url;
        }

        const optimisticAttachments = imageUrl
          ? [{ id: `optimistic-att-${Date.now()}`, type: 'image' as const, url: imageUrl, fileName: imageFile?.name || 'image' }]
          : undefined;

        optimisticMessageId = addOptimisticMessage(normalizedText, optimisticAttachments, appointment);

        const outgoingPayload = serializeChatPayload({
          text: normalizedText,
          attachments: imageUrl
            ? [{ type: 'image', url: imageUrl, fileName: imageFile?.name || 'image' }]
            : [],
          metadata: appointment
            ? {
              appointment,
            }
            : null,
        });

        await sendHubMessage(selectedId, outgoingPayload);

        if (optimisticMessageId) {
          updateMessageStatus(optimisticMessageId, 'sent');
        }
      } catch (err) {
        if (optimisticMessageId) {
          updateMessageStatus(optimisticMessageId, 'failed');
        }
        console.error('[Chat] SendMessage failed:', err);
        toast.error('Could not send this message. Please try again.');
        throw err;
      } finally {
        setUploadProgress(null);
        setIsSendingMessage(false);
      }
    },
    [
      selectedId,
      isConnected,
      addOptimisticMessage,
      updateMessageStatus,
      sendHubMessage,
      currentConversation?.status,
    ]
  );

  const handleRetryMessage = useCallback(
    async (message: import('./types').Message) => {
      if (!selectedId || !isConnected || message.senderRole !== 'admin') return;

      updateMessageStatus(message.id, 'sending');

      try {
        const retryPayload = serializeChatPayload({
          text: message.content,
          attachments: (message.attachments || [])
            .filter((attachment) => !!attachment.url)
            .map((attachment) => ({
              type: attachment.type,
              url: attachment.url,
              fileName: attachment.fileName,
            })),
          metadata: message.appointment
            ? {
              appointment: message.appointment,
            }
            : null,
        });

        await sendHubMessage(selectedId, retryPayload);
        updateMessageStatus(message.id, 'sent');
      } catch (error) {
        updateMessageStatus(message.id, 'failed');
        console.error('[Chat] Retry failed:', error);
        toast.error('Retry failed. Please check connection and try again.');
      }
    },
    [selectedId, isConnected, sendHubMessage, updateMessageStatus],
  );

  const handleResolveConversation = useCallback(
    async () => {
      if (!currentConversation || isResolvingConversation || currentConversation.status === 'resolved') {
        return;
      }

      setIsResolvingConversation(true);
      try {
        await chatService.updateConversationStatus(currentConversation.id, 'resolved');
        applyConversationUpdate({
          ...currentConversation,
          status: 'resolved',
          lastMessageTime: new Date().toISOString(),
        });
        setTypingByConversation(prev => ({ ...prev, [currentConversation.id]: false }));
        toast.success('Conversation marked as resolved.');
      } catch (error) {
        console.error('[Chat] Resolve conversation failed:', error);
        toast.error('Could not resolve conversation. Please verify backend endpoint.');
      } finally {
        setIsResolvingConversation(false);
      }
    },
    [currentConversation, isResolvingConversation, applyConversationUpdate]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (currentConversation?.status === 'resolved') return;
      const targetId = currentConversation?.customerId || currentConversation?.id;
      if (targetId) {
        sendTyping(targetId, isTyping);
      }
    },
    [currentConversation?.customerId, currentConversation?.id, currentConversation?.status, sendTyping]
  );

  const isCurrentTyping = currentConversation 
    ? !!typingByConversation[currentConversation.id] 
    : false;

  /* -------------------------------------------------------- */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <AdminPageHeader
        title="Chat Support"
        description="Manage customer conversations in real time"
        stats={headerStats}
      />

      <div className="flex-1 px-5 pb-5 pt-4 flex flex-col min-h-0">
        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">

          {/* Sidebar */}
          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={selectConversation}
            stats={stats}
            isLoading={convsLoading}
            error={convsError}
            formatTime={formatTime}
          />

          {/* Chat window */}
          <div className="col-span-12 lg:col-span-8 h-full flex flex-col border border-gray-100 bg-white rounded-md overflow-hidden shadow-sm">
            {currentConversation ? (
              <>
                <ChatHeader 
                   conversation={currentConversation} 
                   isTyping={isCurrentTyping}
                   onResolveConversation={handleResolveConversation}
                   isResolving={isResolvingConversation}
                />

                <MessageList
                  messages={messages}
                  isLoading={msgsLoading}
                  isTyping={isCurrentTyping}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onRetryMessage={handleRetryMessage}
                  formatTime={formatTime}
                  formatDate={formatDate}
                />

                <MessageInputWrapper
                  disabled={!isConnected || currentConversation.status === 'resolved'}
                  isSending={isSendingMessage}
                  uploadProgress={uploadProgress}
                  onSend={handleSend}
                  onTyping={handleTyping}
                  onFocus={() => {
                    if (currentConversation?.hasUnread || currentConversation?.unreadCount > 0) {
                      markAsRead();
                    }
                  }}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---- Isolated draft wrapper */
function MessageInputWrapper({
  disabled,
  isSending,
  uploadProgress,
  onSend,
  onTyping,
  onFocus,
}: {
  disabled: boolean;
  isSending: boolean;
  uploadProgress: number | null;
  onSend: (payload: { text: string; imageFile?: File | null; appointment?: ChatPayloadAppointment }) => Promise<void>;
  onTyping: (is: boolean) => void;
  onFocus?: () => void;
}) {
  const [draft, setDraft] = useState('');

  const handleSend = useCallback(async (payload: { text: string; imageFile?: File | null; appointment?: ChatPayloadAppointment }) => {
    if (disabled) return;
    await onSend(payload);
  }, [disabled, onSend]);

  return (
    <div onFocus={onFocus} onClick={onFocus}>
      <MessageInput
        draft={draft}
        isSending={disabled || isSending}
        uploadProgress={uploadProgress}
        onDraftChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
      />
    </div>
  );
}
