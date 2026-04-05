/* ============================================================
   useChat — TanStack Query v5
   useQuery for message list, useMutation for send with optimistic UI
   ============================================================ */

import { useCallback } from 'react';
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { Message, SendMessagePayload } from '../types';
import { chatService } from '@/api/services';


/* ---- Mock fallback --------------------------------------- */
import { mockMessages } from '../../data';

const USE_MOCK = !import.meta.env.VITE_API_URL;

export const messagesQueryKey = (conversationId: string) =>
  ['admin', 'messages', conversationId] as const;

/* ---- Optimistic counter ---------------------------------- */
let _counter = 0;
const tempId = () => `optimistic-${++_counter}`;

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

  /* ---- Send message mutation ----------------------------- */
  const { mutateAsync: sendMutation, isPending: isSending } = useMutation({
    mutationFn: (payload: SendMessagePayload) => {
      if (USE_MOCK) {
        return new Promise<Message>((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: tempId(),
                conversationId: payload.conversationId,
                senderId: adminId,
                senderName: adminName,
                senderRole: 'admin',
                content: payload.content,
                timestamp: new Date().toISOString(),
                status: 'delivered',
              }),
            500
          )
        );
      }
      return chatService.sendMessage(payload);
    },

    onMutate: async (payload) => {
      if (!conversationId) return;
      const key = messagesQueryKey(conversationId);

      // Cancel any in-flight refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: key });

      // Snapshot current cache for rollback
      const snapshot = queryClient.getQueryData(key);

      // Optimistic message
      const optimistic: Message = {
        id: tempId(),
        conversationId: payload.conversationId,
        senderId: adminId,
        senderName: adminName,
        senderRole: 'admin',
        content: payload.content,
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      // Append to the last page optimistically
      queryClient.setQueryData(key, (old: typeof data) => {
        if (!old) return old;
        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          items: [...lastPage.items, optimistic],
        };
        return { ...old, pages };
      });

      return { snapshot, optimisticId: optimistic.id };
    },

    onSuccess: (confirmed, _payload, context) => {
      if (!conversationId || !context) return;
      const key = messagesQueryKey(conversationId);

      // Replace optimistic entry with confirmed server message
      queryClient.setQueryData(key, (old: typeof data) => {
        if (!old) return old;
        const pages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((m) =>
            m.id === context.optimisticId ? confirmed : m
          ),
        }));
        return { ...old, pages };
      });
    },

    onError: (_err, _payload, context) => {
      if (!conversationId || !context) return;
      const key = messagesQueryKey(conversationId);

      // Rollback to snapshot
      queryClient.setQueryData(key, context.snapshot);
    },
  });

  /* ---- Public send function ----------------------------- */
  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      return sendMutation(payload);
    },
    [sendMutation]
  );

  /* ---- Load more (older messages) ----------------------- */
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ---- Inject message from real-time event -------------- */
  const appendMessage = useCallback(
    (msg: Message) => {
      if (!conversationId) return;
      const key = messagesQueryKey(conversationId);

      queryClient.setQueryData(key, (old: typeof data) => {
        if (!old) return old;
        // Idempotent: skip duplicates
        const alreadyExists = old.pages.some((page) =>
          page.items.some((m) => m.id === msg.id)
        );
        if (alreadyExists) return old;

        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          items: [...lastPage.items, msg],
        };
        return { ...old, pages };
      });
    },
    [conversationId, queryClient]
  );

  return {
    messages,
    isLoading,
    isSending,
    hasMore: !!hasNextPage,
    sendMessage,
    loadMore,
    appendMessage,
  };
}
