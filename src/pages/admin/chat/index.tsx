import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { Card } from '@/components/ui/card';
import { mockConversations, mockMessages } from '../data';
import ConversationList from './components/ConversationList';
import ChatHeader from './components/ChatHeader';
import MessageBubble from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import EmptyState from './components/EmptyState';
import './styles.css';


export default function ChatAdmin() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    mockConversations[0]?.id || null
  );
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = mockConversations.find(
    (conv) => conv.id === selectedConversation
  );

  const currentMessages = useMemo(
    () => mockMessages[selectedConversation || ''] || [],
    [selectedConversation]
  );

  const filteredConversations = mockConversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // In a real app, send message to backend
    console.log('Sending message:', message);
    setMessage('');
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US');
    }
  };

  const headerStats = [
    { label: 'Active Chats', value: mockConversations.filter(c => c.unreadCount > 0).length },
    { label: 'Total Conversations', value: mockConversations.length },
    { label: 'Avg Response Time', value: '2m 34s' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AdminPageHeader
        title="Chat Support"
        description="Manage customer conversations and provide real-time support"
        stats={headerStats}
      />

      {/* Chat Container */}
      <div className="flex-1 px-6 pb-6 pt-6 flex flex-col min-h-0 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Conversations List Component */}
          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={setSelectedConversation}
            formatTime={formatTime}
          />

          {/* Chat Window */}
          <Card className="col-span-12 lg:col-span-8 h-full flex flex-col shadow-lg border border-gray-200 bg-white rounded-xl overflow-hidden">
            {currentConversation ? (
              <>
                <ChatHeader
                  customerName={currentConversation.customerName}
                  isOnline={true}
                />

                {/* Messages Area - Takes all remaining space, scrolls internally */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 custom-scrollbar">
                  {currentMessages.length > 0 ? (
                    <div className="p-4 space-y-3">
                      {currentMessages.map((msg, index: number) => {
                        const showDate =
                          index === 0 ||
                          formatDate(currentMessages[index - 1].timestamp) !==
                          formatDate(msg.timestamp);

                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center my-4"
                              >
                                <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                  {formatDate(msg.timestamp)}
                                </span>
                              </motion.div>
                            )}

                            <MessageBubble
                              content={msg.content}
                              timestamp={msg.timestamp}
                              senderRole={msg.senderRole}
                              isRead={msg.isRead}
                              formatTime={formatTime}
                            />
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation below</p>
                      </div>
                    </div>
                  )}
                </div>

                <MessageInput
                  message={message}
                  onMessageChange={setMessage}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
