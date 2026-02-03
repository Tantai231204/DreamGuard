import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  UserCircle2,
  Clock,
  CheckCheck,
  MessageSquare,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { mockConversations, mockMessages } from '../data';


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

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <AdminPageHeader
        title="Chat Support"
        description="Manage customer conversations and provide support"
        icon={MessageSquare}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Chat' },
        ]}
        stats={[
          { label: 'Active Chats', value: mockConversations.filter(c => c.unreadCount > 0).length, icon: MessageSquare },
          { label: 'Total Conversations', value: mockConversations.length, icon: Users },
        ]}
      />

      {/* Chat Container */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="col-span-12 md:col-span-4 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConversation === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {conversation.customerName.charAt(0)}
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {conversation.customerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="ml-2 bg-[var(--color-primary)] text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-12 md:col-span-8 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {currentConversation.customerName.charAt(0)}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {currentConversation.customerName}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Online
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((msg, index: number) => {
                  const showDate =
                    index === 0 ||
                    formatDate(currentMessages[index - 1].timestamp) !==
                      formatDate(msg.timestamp);

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex items-start gap-2 ${
                          msg.senderRole === 'admin'
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }`}
                      >
                        {msg.senderRole === 'customer' && (
                          <Avatar className="h-8 w-8 bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <UserCircle2 className="h-5 w-5 text-gray-600" />
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[70%] ${
                            msg.senderRole === 'admin'
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-gray-100 text-gray-900'
                          } rounded-2xl px-4 py-2`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              msg.senderRole === 'admin'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(msg.timestamp)}</span>
                            {msg.senderRole === 'admin' && msg.isRead && (
                              <CheckCheck className="h-3 w-3 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <UserCircle2 className="h-16 w-16 mx-auto mb-4" />
                <p>Select a conversation to start</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
