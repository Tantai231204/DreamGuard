import { createContext } from 'react';

export interface CartAnimationContextType {
    cartIconRef: React.RefObject<HTMLButtonElement | null>;
    triggerFlyToCart: (image: string, startElement: HTMLElement) => void;
    triggerCartBounce: () => void;
    isCartBouncing: boolean;
}

export const CartAnimationContext = createContext<CartAnimationContextType | null>(null);
