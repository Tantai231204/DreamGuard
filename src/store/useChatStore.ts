import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  activeConversationId: string | null;
  isLocked: boolean;
  openChat: (conversationId?: string, isLocked?: boolean) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  activeConversationId: null,
  isLocked: false,
  openChat: (conversationId, isLocked = false) => set({ 
    isOpen: true, 
    activeConversationId: conversationId || null,
    isLocked
  }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
}));
