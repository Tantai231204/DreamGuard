import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type UserRole = 'user' | 'admin';

export interface ChatMessage {
  id: string;
  role: UserRole;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

// ----------------------------------------------------------------------
// Mock API Service (ready to be replaced with real backend)
// ----------------------------------------------------------------------
const fetchMessages = async (): Promise<ChatMessage[]> => {
  await new Promise((r) => setTimeout(r, 600));
  return [
    {
      id: '1',
      role: 'admin',
      text: 'Hello! Welcome to DreamGuard. How can I help you today?',
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: '2',
      role: 'user',
      text: 'I have a question about the bedding sizes.',
      createdAt: new Date(Date.now() - 50000).toISOString(),
    },
    {
      id: '3',
      role: 'admin',
      text: 'Of course! You can refer to this size chart.',
      imageUrl: '/images/babyset.jpg',
      createdAt: new Date(Date.now() - 40000).toISOString(),
    },
  ];
};

const sendUserMessage = async (payload: { text: string; image?: File | null }): Promise<ChatMessage> => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    id: `msg-${Date.now()}`,
    role: 'user',
    text: payload.text,
    imageUrl: payload.image ? URL.createObjectURL(payload.image) : undefined,
    createdAt: new Date().toISOString(),
  };
};

const simulateAdminReply = async (): Promise<ChatMessage> => {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    id: `reply-${Date.now()}`,
    role: 'admin',
    text: 'Our support team has received your message. We will get back to you shortly.',
    createdAt: new Date().toISOString(),
  };
};

// ----------------------------------------------------------------------
// Custom Hook
// ----------------------------------------------------------------------
export function useFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: isFetchingMessages } = useQuery({
    queryKey: ['floatingChatMessages'],
    queryFn: fetchMessages,
    staleTime: Infinity,
  });

  const sendMutation = useMutation({
    mutationFn: sendUserMessage,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['floatingChatMessages'] });
      const previous = queryClient.getQueryData<ChatMessage[]>(['floatingChatMessages']);

      const optimisticMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        text: payload.text,
        imageUrl: payload.image ? URL.createObjectURL(payload.image) : undefined,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(['floatingChatMessages'], (old = []) => [
        ...old,
        optimisticMsg,
      ]);

      setIsTyping(true); // Simulate admin is thinking
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['floatingChatMessages'], context.previous);
      }
      setIsTyping(false);
    },
    onSuccess: (savedMsg) => {
      queryClient.setQueryData<ChatMessage[]>(['floatingChatMessages'], (old = []) =>
        old.map((msg) => (msg.id.startsWith('temp-') ? savedMsg : msg))
      );

      // Trigger mock admin reply
      simulateAdminReply().then((replyMsg) => {
        queryClient.setQueryData<ChatMessage[]>(['floatingChatMessages'], (old = []) => [
          ...old,
          replyMsg,
        ]);
        setIsTyping(false);
        setIsOpen((currentOpen) => {
          if (!currentOpen) setUnreadCount((prev) => prev + 1);
          return currentOpen;
        });
      });
    },
  });

  const shouldScroll = isOpen && (messages.length > 0 || isTyping);
  useEffect(() => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isTyping, isOpen, shouldScroll]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, closeChat, openChat]);

  const sendMessage = useCallback(
    (text: string, imageFile?: File | null) => {
      sendMutation.mutate({ text, image: imageFile });
    },
    [sendMutation]
  );

  return {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    messages,
    isLoading: isFetchingMessages,
    isTyping,
    unreadCount,
    sendMessage,
    messagesEndRef,
  };
}
