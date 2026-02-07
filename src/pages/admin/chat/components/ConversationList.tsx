import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConversationItem from './ConversationItem';
import { motion, AnimatePresence } from 'framer-motion';

interface Conversation {
  id: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (id: string) => void;
  formatTime: (date: string) => string;
}

export default function ConversationList({
  conversations,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  formatTime,
}: ConversationListProps) {
  return (
    <Card className="col-span-12 lg:col-span-4 h-full flex flex-col overflow-hidden shadow-lg border border-gray-200 bg-white rounded-xl">
      {/* Search Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-10 border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-500 mt-2"
          >
            {conversations.length} result{conversations.length !== 1 ? 's' : ''} found
          </motion.p>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <AnimatePresence mode="popLayout">
          {conversations.length > 0 ? (
            conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ConversationItem
                  {...conversation}
                  isSelected={selectedId === conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  formatTime={formatTime}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-12 text-gray-400"
            >
              <Search className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No conversations found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
