/* ============================================================
   useChat — TanStack Query v5
   useQuery for message list. Sending is done via SignalR only.
   ============================================================ */

import { useCallback } from 'react';
import {
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import type { Message } from '../types';
import { chatService } from '@/api/services';


/* ---- Mock fallback --------------------------------------- */
import { mockMessages } from '../../data';

const USE_MOCK = !import.meta.env.VITE_API_URL;

export const messagesQueryKey = (conversationId: string) =>
  ['admin', 'messages', conversationId] as const;

/* ---- Optimistic counter ---------------------------------- */
let _counter = 0;
const tempId = () => `optimistic-${++_counter}`;
const normalizeMessageText = (text: string) =>
  text
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ');

const getPrimaryAttachmentUrl = (attachments?: Message['attachments']) =>
  attachments?.find((attachment) => attachment.type === 'image' && !!attachment.url)?.url || '';

const getAppointmentSignature = (appointment?: Message['appointment']) => {
  if (!appointment) return '';
  return [
    appointment.kind,
    appointment.scheduledAt,
    appointment.location || '',
    appointment.note || '',
    appointment.pinned === false ? '0' : '1',
  ].join('|');
};

const isSameMessageSignature = (
  incoming: Pick<Message, 'content' | 'attachments' | 'appointment'>,
  existing: Pick<Message, 'content' | 'attachments' | 'appointment'>,
) =>
  normalizeMessageText(incoming.content) === normalizeMessageText(existing.content) &&
  getPrimaryAttachmentUrl(incoming.attachments) === getPrimaryAttachmentUrl(existing.attachments) &&
  getAppointmentSignature(incoming.appointment) === getAppointmentSignature(existing.appointment);

interface UseChatOptions {
  conversationId: string | null;
  adminId?: string;
  adminName?: string;
}

export function useChat({
  conversationId,
  adminId = 'ADMIN-001',
  adminName = 'Admin Support',
}: UseChatOptions) {
  const queryClient = useQueryClient();
  const queryKey = messagesQueryKey(conversationId ?? '');

  /* ---- Message list with infinite pagination ------------- */
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: messagesQueryKey(conversationId ?? ''),
    queryFn: async ({ pageParam = 1 }) => {
      if (!conversationId) return { items: [] as Message[], hasMore: false };

      if (USE_MOCK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const all: Message[] = (mockMessages as any)[conversationId] ?? [];
        return { items: all, hasMore: false };
      }

      return chatService.getMessages(conversationId, pageParam as number);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    enabled: !!conversationId,
    staleTime: 30_000,
  });

  /* ---- Flatten pages into a single ordered array --------- */
  const messages: Message[] =
    data?.pages.flatMap((p) => p.items) ?? [];

  /* ---- Optimistic send (adds to UI immediately) ---------- */
  const addOptimisticMessage = useCallback(
    (content: string, attachments?: Message['attachments'], appointment?: Message['appointment']) => {
      if (!conversationId) return undefined;
      const optimisticId = tempId();

      const optimistic: Message = {
        id: optimisticId,
        conversationId,
        senderId: adminId,
        senderName: adminName,
        senderRole: 'admin',
        content,
        timestamp: new Date().toISOString(),
        status: 'sending',
        attachments,
        appointment,
      };

      queryClient.setQueryData(queryKey, (old: InfiniteData<{ items: Message[]; hasMore: boolean }> | undefined) => {
        if (!old) return old;
        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          items: [...lastPage.items, optimistic],
        };
        return { ...old, pages };
      });

      return optimisticId;
    },
    [conversationId, adminId, adminName, queryClient, queryKey]
  );

  const updateMessageStatus = useCallback(
    (messageId: string, status: Message['status']) => {
      if (!conversationId) return;

      queryClient.setQueryData(queryKey, (old: InfiniteData<{ items: Message[]; hasMore: boolean }> | undefined) => {
        if (!old) return old;

        const pages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((message) =>
            message.id === messageId
              ? { ...message, status }
              : message,
          ),
        }));

        return { ...old, pages };
      });
    },
    [conversationId, queryClient, queryKey],
  );

  /* ---- Load more (older messages) ----------------------- */
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ---- Inject message from real-time event -------------- */
  const appendMessage = useCallback(
    (msg: Message) => {
      if (!conversationId) return;

      queryClient.setQueryData(queryKey, (old: typeof data) => {
        if (!old) return old;

        // 1. Idempotent check: skip if ID already exists in any page
        const alreadyExists = old.pages.some((page) =>
          page.items.some((m) => m.id === msg.id)
        );
        if (alreadyExists) return old;

        const incomingTime = Date.parse(msg.timestamp) || Date.now();

        // 2. Echo cancellation: 
        // If we just sent an admin message and server sends it back as 'admin', 
        // we keep our optimistic one and skip the duplicate from WS 
        // (unless we want to "upgrade" it). For now, skip to prevent double-render.
        if (msg.senderRole === 'admin') {
          const optimisticPageIndex = old.pages.findIndex((p) =>
            p.items.some(
              (m) => m.id.startsWith('optimistic-') && isSameMessageSignature(msg, m),
            ),
          );

          if (optimisticPageIndex >= 0) {
            const pages = [...old.pages];
            const targetPage = pages[optimisticPageIndex];
            pages[optimisticPageIndex] = {
              ...targetPage,
              items: targetPage.items.map((m) =>
                m.id.startsWith('optimistic-') && isSameMessageSignature(msg, m)
                  ? msg
                  : m,
              ),
            };
            return { ...old, pages };
          }
        }

        const hasSemanticDuplicate = old.pages.some((p) =>
          p.items.some((m) => {
            if (m.senderRole !== msg.senderRole) return false;
            if (!isSameMessageSignature(msg, m)) return false;
            const existingTime = Date.parse(m.timestamp) || 0;
            return Math.abs(existingTime - incomingTime) <= 2500;
          }),
        );

        if (hasSemanticDuplicate) return old;

        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          items: [...lastPage.items, msg],
        };
        return { ...old, pages };
      });
    },
    [conversationId, queryClient, queryKey]
  );

  return {
    messages,
    isLoading,
    hasMore: !!hasNextPage,
    addOptimisticMessage,
    updateMessageStatus,
    loadMore,
    appendMessage,
  };
}
