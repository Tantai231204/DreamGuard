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

  /* ---- Optimistic send (adds to UI immediately) ---------- */
  const addOptimisticMessage = useCallback(
    (content: string) => {
      if (!conversationId) return;
      const key = messagesQueryKey(conversationId);

      const optimistic: Message = {
        id: tempId(),
        conversationId,
        senderId: adminId,
        senderName: adminName,
        senderRole: 'admin',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      queryClient.setQueryData(key, (old: InfiniteData<{ items: Message[]; hasMore: boolean }> | undefined) => {
        if (!old) return old;
        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          items: [...lastPage.items, optimistic],
        };
        return { ...old, pages };
      });
    },
    [conversationId, adminId, adminName, queryClient]
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

        // 1. Idempotent check: skip if ID already exists in any page
        const alreadyExists = old.pages.some((page) =>
          page.items.some((m) => m.id === msg.id)
        );
        if (alreadyExists) return old;

        // 2. Echo cancellation: 
        // If we just sent an admin message and server sends it back as 'admin', 
        // we keep our optimistic one and skip the duplicate from WS 
        // (unless we want to "upgrade" it). For now, skip to prevent double-render.
        if (msg.senderRole === 'admin') {
           const hasOptimisticMatch = old.pages.some(p => 
              p.items.some(m => m.id.startsWith('optimistic-') && m.content === msg.content)
           );
           if (hasOptimisticMatch) {
              console.log('[Chat] Ignoring echoed admin message (already shown optimistically)');
              return old;
           }
        }

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
    hasMore: !!hasNextPage,
    addOptimisticMessage,
    loadMore,
    appendMessage,
  };
}
