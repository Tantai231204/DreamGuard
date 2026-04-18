import { memo, useCallback } from 'react';
import { Search, X, MessageSquareDot, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import ConversationItem from './ConversationItem';
import type { Conversation, ConversationStats } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectConversation: (id: string) => void;
  stats: ConversationStats;
  isLoading: boolean;
  error: string | null;
  formatTime: (iso: string) => string;
}

function ConversationListInner({
  conversations,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  stats,
  isLoading,
  error,
  formatTime,
}: ConversationListProps) {
  const handleClearSearch = useCallback(() => onSearchChange(''), [onSearchChange]);

  return (
    <div className="col-span-12 lg:col-span-4 h-full flex flex-col overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200/80">
      {/* ---- Header ---- */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareDot className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-gray-800">Conversations</span>
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {stats.unreadTotal > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[10px] font-bold text-white bg-[var(--color-primary)] rounded-full px-2 py-0.5"
              >
                {stats.unreadTotal} unread
              </motion.span>
            )}
            <span className="text-[10px] text-gray-400">{stats.total} total</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-8 text-xs border-gray-200 bg-gray-50 rounded-xl
                       focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20
                       focus:border-[var(--color-primary)] transition-all"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-5 w-5 p-0 hover:bg-gray-200 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {searchQuery && (
          <p className="text-[10px] text-gray-400 pl-1">
            {conversations.length > 0
              ? `${conversations.length} result${conversations.length !== 1 ? 's' : ''}`
              : 'No results'}
          </p>
        )}
      </div>

      {/* ---- Error banner ---- */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100"
          >
            <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-500">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-admin min-h-0">
        <div className="py-2">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedId === conv.id}
                onSelect={onSelectConversation}
                formatTime={formatTime}
              />
            ))
          ) : !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
            >
              <Search className="h-8 w-8 opacity-20" />
              <p className="text-xs">No conversations found</p>
            </motion.div>
          ) : (
            /* Skeleton */
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
                  <div className="h-2.5 bg-gray-100 rounded animate-pulse w-4/5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const ConversationList = memo(ConversationListInner);
ConversationList.displayName = 'ConversationList';
export default ConversationList;
