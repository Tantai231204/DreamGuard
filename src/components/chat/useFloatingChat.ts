import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/store/useChatStore';
import { uploadToCloudinary } from '@/lib/uploadCloudinary';
import { serializeChatPayload } from '@/utils/chatPayload';
import type { ChatPayloadAppointment } from '@/utils/chatPayload';

export type UserRole = 'user' | 'admin';
export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

interface SendMessagePayload {
  clientId: string;
  text: string;
  imageUrl?: string;
  imageName?: string;
}

export interface ChatMessage {
  id: string;
  role: UserRole;
  senderId?: string;
  text: string;
  imageUrl?: string;
  appointment?: ChatPayloadAppointment;
  status: ChatMessageStatus;
  createdAt: string;
}

import chatService from '@/api/services/chatService';
import type { Message } from '../../pages/admin/chat/types';
import { useSignalR } from '@/pages/admin/chat/hooks/useSignalR';

const getPrimaryImageUrl = (msg: Pick<Message, 'attachments'>): string | undefined =>
  msg.attachments?.find((attachment) => attachment.type === 'image' && !!attachment.url)?.url;

const mapToUI = (msg: Message): ChatMessage => ({
  id: msg.id,
  role: msg.senderRole === 'admin' ? 'admin' : 'user',
  senderId: msg.senderId,
  text: msg.content,
  imageUrl: getPrimaryImageUrl(msg),
  appointment: msg.appointment,
  status: msg.status === 'failed' ? 'failed' : 'sent',
  createdAt: msg.timestamp || new Date().toISOString()
});

const getAppointmentSignature = (appointment?: ChatMessage['appointment']) => {
  if (!appointment) return '';
  return [
    appointment.kind,
    appointment.scheduledAt,
    appointment.location || '',
    appointment.note || '',
    appointment.pinned === false ? '0' : '1',
  ].join('|');
};

const normalizeMessageText = (text: string) =>
  text
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ');

const isUsableReceiverId = (value?: string): value is string =>
  !!value && value.trim().length > 0 && value !== 'unknown';

const isSameMessageSignature = (
  incoming: Pick<ChatMessage, 'text' | 'imageUrl' | 'appointment'>,
  existing: Pick<ChatMessage, 'text' | 'imageUrl' | 'appointment'>,
) =>
  normalizeMessageText(incoming.text) === normalizeMessageText(existing.text) &&
  (incoming.imageUrl || '') === (existing.imageUrl || '') &&
  getAppointmentSignature(incoming.appointment) === getAppointmentSignature(existing.appointment);

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations if we don't have an active one
  const { data: conversations } = useQuery({
    queryKey: ['customerConversations'],
    queryFn: () => chatService.getConversations(),
    enabled: isOpen,
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
    enabled: isOpen && !!activeConversationId,
    staleTime: Infinity,
    refetchInterval: isOpen && !!activeConversationId ? 7000 : false,
    refetchOnWindowFocus: true,
  });

  // Listen for real-time messages via SignalR!
  const { sendHubMessage, sendTyping } = useSignalR({
    conversationId: activeConversationId,
    enabled: !!activeConversationId,
    typingFromRole: 'admin',
    onReceiveMessage: (msg) => {
      if (!msg.conversationId || msg.conversationId !== activeConversationId) return;
      const queryKey = ['floatingChatMessages', msg.conversationId];
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => {
        const incoming = mapToUI(msg);

        // Hard idempotency by server id
        if (old.some((o) => o.id === incoming.id)) return old;

        const incomingTime = Date.parse(incoming.createdAt) || Date.now();

        // If this is user's own echo, replace matching optimistic temp message.
        if (incoming.role === 'user') {
          const optimisticIndex = old.findIndex(
            (o) => o.id.startsWith('temp-') && isSameMessageSignature(incoming, o),
          );

          if (optimisticIndex >= 0) {
            const next = [...old];
            next[optimisticIndex] = incoming;
            return next;
          }
        }

        // Guard against duplicate events with different ids but same payload/time.
        const hasSemanticDuplicate = old.some((o) => {
          if (o.role !== incoming.role) return false;
          if (!isSameMessageSignature(incoming, o)) return false;
          const existingTime = Date.parse(o.createdAt) || 0;
          return Math.abs(existingTime - incomingTime) <= 2500;
        });

        if (hasSemanticDuplicate) return old;

        return [...old, incoming];
      });
      setIsTyping(false);
    },
    onUserTyping: (convoId, typing) => {
      const isActiveConversationTyping = convoId === activeConversationId;
      const isActiveStaffTyping = convoId === activeConversation?.staffId || convoId === fallbackStaffId;
      const isActiveCustomerTyping = convoId === activeConversation?.customerId;

      if (isActiveConversationTyping || isActiveStaffTyping || isActiveCustomerTyping) {
        setIsTyping(typing);
      }
    }
  });

  const activeConversation = useMemo(
    () => conversations?.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const fallbackStaffId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role === 'admin' && isUsableReceiverId(message.senderId)) {
        return message.senderId;
      }
    }
    return undefined;
  }, [messages]);

  const sendTypingSignal = useCallback(
    (typing: boolean) => {
      const receiverId = activeConversation?.staffId || fallbackStaffId || activeConversationId;
      if (!receiverId) return;

      sendTyping(receiverId, typing);
    },
    [activeConversation?.staffId, fallbackStaffId, activeConversationId, sendTyping],
  );

  const sendMutation = useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      if (!activeConversationId) throw new Error("Missing active conversation ID");

      const serializedMessage = serializeChatPayload({
        text: payload.text,
        attachments: payload.imageUrl
          ? [{ type: 'image', url: payload.imageUrl, fileName: payload.imageName || 'image' }]
          : [],
      });

      await sendHubMessage(activeConversationId, serializedMessage);
    },
    onMutate: async (payload) => {
      const queryKey = ['floatingChatMessages', activeConversationId];
      await queryClient.cancelQueries({ queryKey });

      const optimisticMsg: ChatMessage = {
        id: payload.clientId,
        role: 'user',
        text: payload.text,
        imageUrl: payload.imageUrl,
        status: 'sending',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => {
        const existingIndex = old.findIndex((message) => message.id === payload.clientId);

        if (existingIndex >= 0) {
          const next = [...old];
          next[existingIndex] = {
            ...next[existingIndex],
            text: payload.text,
            imageUrl: payload.imageUrl,
            status: 'sending',
            createdAt: new Date().toISOString(),
          };
          return next;
        }

        return [...old, optimisticMsg];
      });

      return { queryKey, optimisticId: payload.clientId };
    },
    onSuccess: (_result, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<ChatMessage[]>(context.queryKey, (old = []) =>
        old.map((message) =>
          message.id === context.optimisticId
            ? { ...message, status: 'sent' }
            : message,
        ),
      );
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<ChatMessage[]>(context.queryKey, (old = []) =>
        old.map((message) =>
          message.id === context.optimisticId
            ? { ...message, status: 'failed' }
            : message,
        ),
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
    async (text: string, imageFile?: File | null) => {
      if (!activeConversationId) return;

      const normalizedText = text.trim();
      if (!normalizedText && !imageFile) return;

      const clientId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      let imageUrl: string | undefined;
      let imageName: string | undefined;

      try {
        if (imageFile) {
          setUploadProgress(0);
          const uploadedImage = await uploadToCloudinary(imageFile, {
            onProgress: (progress) => {
              setUploadProgress(progress);
            },
          });
          imageUrl = uploadedImage.secure_url;
          imageName = imageFile.name;
        }

        await sendMutation.mutateAsync({
          clientId,
          text: normalizedText,
          imageUrl,
          imageName,
        });
      } finally {
        setUploadProgress(null);
      }
    },
    [sendMutation, activeConversationId]
  );

  const retryFailedMessage = useCallback(
    async (messageId: string) => {
      if (!activeConversationId) return;

      const queryKey = ['floatingChatMessages', activeConversationId];
      const currentMessages = queryClient.getQueryData<ChatMessage[]>(queryKey) ?? [];
      const failedMessage = currentMessages.find(
        (message) =>
          message.id === messageId &&
          message.role === 'user' &&
          message.status === 'failed',
      );

      if (!failedMessage) return;

      await sendMutation.mutateAsync({
        clientId: failedMessage.id,
        text: failedMessage.text,
        imageUrl: failedMessage.imageUrl,
        imageName: failedMessage.imageUrl ? 'image' : undefined,
      });
    },
    [activeConversationId, queryClient, sendMutation],
  );

  return {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    messages,
    isLoading: isFetchingMessages,
    isSending: sendMutation.isPending,
    uploadProgress,
    isTyping,
    sendTypingSignal,
    sendMessage,
    retryFailedMessage,
    messagesEndRef,
  };
}
