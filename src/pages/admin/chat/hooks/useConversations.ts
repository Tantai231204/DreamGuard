/* ============================================================
   useConversations — TanStack Query v5
   Sorting and auto-polling coordination.
   ============================================================ */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import type { Conversation, ConversationStats } from '../types';
import { chatService } from '@/api/services';
import { SEARCH_DEBOUNCE_MS, POLLING_INTERVAL_MS } from '../constants';
import { useDebounce } from '@/hooks/useDebounce';

/* ---- Mock fallback (removed once VITE_API_URL is set) ----- */
import { mockConversations } from '../../data';

const USE_MOCK = !import.meta.env.VITE_API_URL;

export const CONVERSATIONS_QUERY_KEY = ['admin', 'conversations'] as const;
const URL_CONVERSATION_REFETCH_MAX_ATTEMPTS = 8;

export interface UseConversationsOptions {
  /** If WebSocket is down, poll for updates. If up, disable. */
  pollEnabled?: boolean;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedId: string | null;
  selectConversation: (id: string) => void;
  filteredConversations: Conversation[];
  stats: ConversationStats;
  applyConversationUpdate: (conv: Conversation) => void;
}

export function useConversations({ pollEnabled = true }: UseConversationsOptions = {}): UseConversationsReturn {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get('id');

  // Internal selection state (manual clicks)
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  /* ---- Debounced search ---------------------------------- */
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  /* ---- Query -------------------------------------------- */
  const { data, isLoading, error, refetch } = useQuery<Conversation[], Error>({
    queryKey: [...CONVERSATIONS_QUERY_KEY, debouncedSearch],
    queryFn: async () => {
      if (USE_MOCK) return (mockConversations as unknown as Conversation[]).sort((a, b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
      const items = await chatService.getConversations({
        Key: debouncedSearch || undefined,
        pageNumber: 1,
        pageSize: 50
      });
      return items.sort((a, b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
    },
    // ---- PERFORMANCE OPTIMIZATIONS ----
    refetchInterval: pollEnabled ? POLLING_INTERVAL_MS * 2 : false, // Slower polling if enabled
    refetchOnWindowFocus: false, // Don't refetch on tab switch (we have SignalR)
    refetchOnMount: false, // Don't refetch if data is available
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 mins (standard)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 mins
  });

  const conversations = useMemo(() => data ?? [], [data]);
  useEffect(() => {
    if (!urlId) return;

    const hasTargetConversation = conversations.some((conversation) => conversation.id === urlId);
    if (hasTargetConversation) return;

    let attempts = 1;
    void refetch();

    const timer = setInterval(() => {
      attempts += 1;
      void refetch();

      if (attempts >= URL_CONVERSATION_REFETCH_MAX_ATTEMPTS) {
        clearInterval(timer);
      }
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, [conversations, refetch, urlId]);

  /* ---- Selection logic: find existing or first available --- */
  const resolvedSelectedId = useMemo(() => {
    // 1. Priority: Manual click
    if (internalSelectedId && conversations.some(c => c.id === internalSelectedId)) return internalSelectedId;
    // 2. Secondary: URL Param
    if (urlId && conversations.some(c => c.id === urlId)) return urlId;
    // 3. Fallback: First one
    return conversations[0]?.id ?? null;
  }, [internalSelectedId, urlId, conversations]);

  /* ---- Select + optimistic mark-read --------------------- */
  const selectConversation = useCallback(
    (id: string) => {
      setInternalSelectedId(id);
      setSearchParams(prev => {
        prev.set('id', id);
        return prev;
      }, { replace: true });

      // Optimistic: zero unread in all conversation query variants (search/no-search)
      queryClient.setQueriesData<Conversation[]>({ queryKey: CONVERSATIONS_QUERY_KEY }, (prev) =>
        prev?.map((c) => (c.id === id ? { ...c, unreadCount: 0, hasUnread: false } : c))
      );
    },
    [queryClient, setSearchParams]
  );

  /* ---- Apply real-time update to cache ------------------- */
  const applyConversationUpdate = useCallback(
    (updated: Conversation) => {
      queryClient.setQueriesData<Conversation[]>({ queryKey: CONVERSATIONS_QUERY_KEY }, (prev) => {
        if (!prev) return [updated];
        const res = prev.some((c) => c.id === updated.id)
          ? prev.map((c) => (c.id === updated.id ? updated : c))
          : [updated, ...prev];
        // Ensure newest is always at the top
        return res.sort((a, b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
      });
    },
    [queryClient]
  );

  /* ---- Derived ------------------------------------------- */
  const filteredConversations = conversations;

  const stats = useMemo<ConversationStats>(
    () => ({
      active: conversations.filter((c) => c.status === 'active').length,
      total: conversations.length,
      unreadTotal: conversations.reduce((s, c) => s + c.unreadCount, 0),
    }),
    [conversations]
  );

  return {
    conversations,
    isLoading,
    error: error?.message ?? null,
    searchQuery: searchInput,
    setSearchQuery: setSearchInput,
    selectedId: resolvedSelectedId,
    selectConversation,
    filteredConversations,
    stats,
    applyConversationUpdate,
  };
}
