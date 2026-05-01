import { useState, useRef, useEffect, useCallback } from 'react';
import aiService from '@/api/services/aiService';

export type UserRole = 'user' | 'admin' | 'ai';
export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface AIChatMessage {
    id: string;
    role: UserRole;
    text: string;
    createdAt: string;
    status: ChatMessageStatus;
    recommendedProducts?: import('@/api/services/aiService').AIProduct[];
}

const INITIAL_SUGGESTIONS = [
    "Baby Products",
    "Shipping & Delivery",
    "Returns & Warranty",
    "Payment Methods",
    "Custom Products",
    "Trade-in Program",
    "Cleaning Services",
    "Vouchers & Promotions"
];

export const useFloatingAIChat = () => {
    const [messages, setMessages] = useState<AIChatMessage[]>([
        {
            id: 'welcome-ai',
            role: 'ai',
            text: "Hello! I'm your DreamGuard AI Assistant. How can I help you optimize your baby's sleep sanctuary today?",
            createdAt: new Date().toISOString(),
            status: 'sent'
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking, scrollToBottom]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const userMsg: AIChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text,
            createdAt: new Date().toISOString(),
            status: 'sent'
        };

        setMessages(prev => [...prev, userMsg]);
        setSuggestions([]); // Clear old suggestions when user speaks
        setIsThinking(true);

        try {
            const response = await aiService.askFAQ(text);
            
            const aiMsg: AIChatMessage = {
                id: Date.now().toString() + "-ai",
                role: 'ai',
                text: response.answer,
                createdAt: new Date().toISOString(),
                status: 'sent',
                recommendedProducts: response.recommended_products
            };
            setMessages(prev => [...prev, aiMsg]);
            
            // If the AI doesn't understand, provide the initial set of suggestions as "Fast Operations"
            if (response.answer.includes("not understand") || response.answer.includes("chưa hiểu rõ") || !response.follow_up_suggestions?.length) {
                setSuggestions(INITIAL_SUGGESTIONS);
            } else {
                setSuggestions(response.follow_up_suggestions);
            }
        } catch (error) {
            console.error("[useFloatingAIChat] AI request failed:", error);
            const errorMsg: AIChatMessage = {
                id: Date.now().toString() + "-error",
                role: 'ai',
                text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                createdAt: new Date().toISOString(),
                status: 'sent'
            };
            setMessages(prev => [...prev, errorMsg]);
            setSuggestions(INITIAL_SUGGESTIONS);
        } finally {
            setIsThinking(false);
        }
    }, []);

    return {
        messages,
        isThinking,
        suggestions,
        sendMessage,
        messagesEndRef,
    };
};
