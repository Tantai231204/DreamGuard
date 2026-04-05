/* ============================================================
   useConversations — TanStack Query v5
   Sorting and auto-polling coordination.
   ============================================================ */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Conversation, ConversationStats } from '../types';
import { chatService } from '@/api/services';
import { SEARCH_DEBOUNCE_MS, POLLING_INTERVAL_MS } from '../constants';
import { useDebounce } from '@/hooks/useDebounce';

/* ---- Mock fallback (removed once VITE_API_URL is set) ----- */
import { mockConversations } from '../../data';

const USE_MOCK = !import.meta.env.VITE_API_URL;

export const CONVERSATIONS_QUERY_KEY = ['admin', 'conversations'] as const;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  /* ---- Debounced search ---------------------------------- */
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  /* ---- Query -------------------------------------------- */
  const { data, isLoading, error } = useQuery<Conversation[], Error>({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: async () => {
      if (USE_MOCK) return (mockConversations as unknown as Conversation[]).sort((a,b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
      const items = await chatService.getConversations();
      // Always sort by time
      return items.sort((a,b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
    },
    refetchInterval: pollEnabled ? POLLING_INTERVAL_MS : false,
    staleTime: 60_000,                      // keep metadata longer if live updates work
  });

  const conversations = useMemo(() => data ?? [], [data]);

  /* ---- Selection logic: find existing or first available --- */
  const resolvedSelectedId = useMemo(() => {
    if (selectedId && conversations.some(c => c.id === selectedId)) return selectedId;
    return conversations[0]?.id ?? null;
  }, [selectedId, conversations]);

  /* ---- Select + optimistic mark-read --------------------- */
  const selectConversation = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (!USE_MOCK) {
        chatService.markRead(id).catch(() => null);
      }
      // Optimistic: zero unread in cache immediately
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (prev) =>
        prev?.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
      );
    },
    [queryClient]
  );

  /* ---- Apply real-time update to cache ------------------- */
  const applyConversationUpdate = useCallback(
    (updated: Conversation) => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (prev) => {
        if (!prev) return [updated];
        const res = prev.some((c) => c.id === updated.id)
            ? prev.map((c) => (c.id === updated.id ? updated : c))
            : [updated, ...prev];
        // Ensure newest is always at the top
        return res.sort((a,b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
      });
    },
    [queryClient]
  );

  /* ---- Derived ------------------------------------------- */
  const filteredConversations = useMemo(() => {
    if (!debouncedSearch.trim()) return conversations;
    const q = debouncedSearch.toLowerCase();
    return conversations.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, debouncedSearch]);

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
