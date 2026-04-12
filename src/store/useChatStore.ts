import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  activeConversationId: string | null;
  openChat: (conversationId?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  activeConversationId: null,
  openChat: (conversationId) => set({ 
    isOpen: true, 
    activeConversationId: conversationId || null 
  }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
}));
