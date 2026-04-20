import { useState, useRef, useEffect, useCallback } from 'react';

export type UserRole = 'user' | 'admin' | 'ai';
export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface AIChatMessage {
    id: string;
    role: UserRole;
    text: string;
    createdAt: string;
    status: ChatMessageStatus;
}

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
        setIsThinking(true);

        // Simulate AI Response
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const aiMsg: AIChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: getMockAIResponse(text),
            createdAt: new Date().toISOString(),
            status: 'sent'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsThinking(false);
    }, []);

    return {
        messages,
        isThinking,
        sendMessage,
        messagesEndRef,
    };
};

function getMockAIResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('size') || lower.includes('dimension')) {
        return "For newborns, we typically recommend a 20x30cm pillow. For cribs, a standard 60x120cm mattress provides the best support for safe sleep.";
    }
    if (lower.includes('color') || lower.includes('material')) {
        return "Our most popular material is Organic Cotton for its extreme breathability. We recommend pastels or neutral tones like Breeze Blue to create a calming environment.";
    }
    if (lower.includes('price') || lower.includes('cost')) {
        return "Customization prices vary based on dimensions and materials. You can see real-time price updates in our 3D Studio as you design!";
    }
    return "That's a great question about your baby's sanctuary! I recommend checking our 3D Studio for a personalized preview of your design.";
}
