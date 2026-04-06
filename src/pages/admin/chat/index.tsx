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
import './styles.css';

/* ---- Stable formatters */
const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string): string => {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ------------------------------------------------------------ */
export default function ChatAdmin() {
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Refs for SignalR callbacks (prevents connection restarts on prop changes)
  // Must be declared before useSignalR
  const _appendFnRef = useRef<(msg: import('./types').Message) => void>(() => {});
  const _updateFnRef = useRef<(conv: import('./types').Conversation) => void>(() => {});

  /* ---- Real-time (SignalR) -------------------------------- */
  const { sendTyping, isConnected } = useSignalR({
    onReceiveMessage: useCallback(
      (msg: import('./types').Message) => {
        _appendFnRef.current?.(msg);
      },
      []
    ),
    onConversationUpdate: useCallback(
      (conv: import('./types').Conversation) => { 
        _updateFnRef.current?.(conv); 
      },
      []
    ),
    onUserTyping: useCallback((convId: string, isTyping: boolean) => {
      setTypingUsers(prev => ({ ...prev, [convId]: isTyping }));
    }, []),
  });

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
  } = useConversations({ pollEnabled: !isConnected });

  /* ---- Messages ------------------------------------------ */
  const {
    messages,
    isLoading: msgsLoading,
    isSending,
    hasMore,
    sendMessage,
    loadMore,
    appendMessage,
  } = useChat({ conversationId: selectedId });

  // Sync references to keep hooks consistent
  useEffect(() => { 
    _appendFnRef.current = appendMessage; 
    _updateFnRef.current = applyConversationUpdate;
  }, [appendMessage, applyConversationUpdate]);

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

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
    (draft: string) => {
      if (!selectedId) return;
      sendMessage({ conversationId: selectedId, content: draft });
    },
    [selectedId, sendMessage]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (selectedId) sendTyping(selectedId, isTyping);
    },
    [selectedId, sendTyping]
  );

  const isCurrentTyping = selectedId ? !!typingUsers[selectedId] : false;

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
          <div className="col-span-12 lg:col-span-8 h-full flex flex-col border border-gray-100 bg-white rounded-xl overflow-hidden shadow-sm">
            {currentConversation ? (
              <>
                <ChatHeader 
                   conversation={currentConversation} 
                   isTyping={isCurrentTyping}
                />

                <MessageList
                  messages={messages}
                  isLoading={msgsLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  formatTime={formatTime}
                  formatDate={formatDate}
                />

                <MessageInputWrapper
                  isSending={isSending}
                  onSend={handleSend}
                  onTyping={handleTyping}
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
  isSending,
  onSend,
  onTyping,
}: {
  isSending: boolean;
  onSend: (draft: string) => void;
  onTyping: (is: boolean) => void;
}) {
  const [draft, setDraft] = useState('');

  const handleSend = useCallback(() => {
    if (!draft.trim() || isSending) return;
    onSend(draft);
    setDraft('');
  }, [draft, isSending, onSend]);

  return (
    <MessageInput
      draft={draft}
      isSending={isSending}
      onDraftChange={setDraft}
      onSend={handleSend}
      onTyping={onTyping}
    />
  );
}
