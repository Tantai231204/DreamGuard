import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/store/useChatStore';

export type UserRole = 'user' | 'admin';

export interface ChatMessage {
  id: string;
  role: UserRole;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

import chatService from '@/api/services/chatService';
import type { Message } from '../../pages/admin/chat/types';
import { useSignalR } from '@/pages/admin/chat/hooks/useSignalR';

const mapToUI = (msg: Message): ChatMessage => ({
  id: msg.id,
  role: msg.senderRole === 'admin' ? 'admin' : 'user',
  text: msg.content,
  imageUrl: msg.attachments && msg.attachments.length > 0 ? msg.attachments[0].url : undefined,
  createdAt: msg.timestamp || new Date().toISOString()
});

const fetchMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { items } = await chatService.getMessages(conversationId, 1);
  return items.map(mapToUI);
};

// ----------------------------------------------------------------------
// Custom Hook
// ----------------------------------------------------------------------
export function useFloatingChat() {
  const { isOpen, openChat, closeChat, toggleChat, activeConversationId } = useChatStore();
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations if we don't have an active one
  const { data: conversations } = useQuery({
    queryKey: ['customerConversations'],
    queryFn: () => chatService.getConversations(),
    enabled: isOpen && !activeConversationId,
  });

  // Automatically select the latest conversation
  useEffect(() => {
    if (isOpen && !activeConversationId && conversations && conversations.length > 0) {
      openChat(conversations[0].id);
    }
  }, [isOpen, activeConversationId, conversations, openChat]);

  // 2. Fetch messages for the active conversation
  const { data: messages = [], isLoading: isFetchingMessages } = useQuery({
    queryKey: ['floatingChatMessages', activeConversationId],
    queryFn: () => activeConversationId ? fetchMessages(activeConversationId) : Promise.resolve([]),
    enabled: !!activeConversationId,
    staleTime: Infinity,
  });

  // Listen for real-time messages via SignalR!
  const { sendHubMessage } = useSignalR({
    conversationId: activeConversationId,
    enabled: !!activeConversationId,
    onReceiveMessage: (msg) => {
      if (msg.conversationId !== activeConversationId) return;
      const queryKey = ['floatingChatMessages', activeConversationId];
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => {
        // Prevent duplicate messages if any
        if (old.some((o) => o.id === msg.id)) return old;
        return [...old, mapToUI(msg)];
      });
      setIsTyping(false);
    },
    onUserTyping: (convoId, typing) => {
      if (convoId === activeConversationId) {
        setIsTyping(typing);
      }
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: { text: string; image?: File | null }) => {
      if (!activeConversationId) throw new Error("Missing active conversation ID");
      // Fallback: Send message via SignalR if available
      await sendHubMessage(activeConversationId, payload.text);
      return {
        id: `temp-${Date.now()}`,
        role: 'user' as UserRole,
        text: payload.text,
        createdAt: new Date().toISOString(),
      };
    },
    onMutate: async (payload) => {
      const queryKey = ['floatingChatMessages', activeConversationId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ChatMessage[]>(queryKey);

      const optimisticMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        text: payload.text,
        imageUrl: payload.image ? URL.createObjectURL(payload.image) : undefined,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [
        ...old,
        optimisticMsg,
      ]);

      return { previous };
    },
    onError: (_err, _variables, context) => {
      const queryKey = ['floatingChatMessages', activeConversationId];
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (savedMsg) => {
      const queryKey = ['floatingChatMessages', activeConversationId];
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) =>
        old.map((msg) => (msg.id.startsWith('temp-') ? savedMsg : msg))
      );
    },
  });

  const shouldScroll = isOpen && (messages.length > 0 || isTyping);
  useEffect(() => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isTyping, isOpen, shouldScroll]);

  const sendMessage = useCallback(
    (text: string, imageFile?: File | null) => {
      if (!activeConversationId) return;
      sendMutation.mutate({ text, image: imageFile });
    },
    [sendMutation, activeConversationId]
  );

  return {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    messages,
    isLoading: isFetchingMessages,
    isTyping,
    sendMessage,
    messagesEndRef,
  };
}
