import { useState, useCallback, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CartAnimationContext } from './cartAnimationContext';

interface FlyingItem {
    id: string;
    image: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export function CartAnimationProvider({ children }: { children: ReactNode }) {
    const cartIconRef = useRef<HTMLButtonElement>(null);
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const [isCartBouncing, setIsCartBouncing] = useState(false);

    const triggerCartBounce = useCallback(() => {
        setIsCartBouncing(true);
        setTimeout(() => setIsCartBouncing(false), 600);
    }, []);

    const triggerFlyToCart = useCallback((image: string, startElement: HTMLElement) => {
        if (!cartIconRef.current) return;

        const startRect = startElement.getBoundingClientRect();
        const endRect = cartIconRef.current.getBoundingClientRect();

        const newItem: FlyingItem = {
            id: `fly-${Date.now()}`,
            image,
            startX: startRect.left + startRect.width / 2,
            startY: startRect.top + startRect.height / 2,
            endX: endRect.left + endRect.width / 2,
            endY: endRect.top + endRect.height / 2,
        };

        setFlyingItems(prev => [...prev, newItem]);

        // Remove after animation completes
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
            triggerCartBounce();
        }, 800);
    }, [triggerCartBounce]);

    return (
        <CartAnimationContext.Provider value={{ cartIconRef, triggerFlyToCart, triggerCartBounce, isCartBouncing }}>
            {children}
            {typeof document !== 'undefined' && createPortal(
                <FlyingItemsOverlay items={flyingItems} />,
                document.body
            )}
        </CartAnimationContext.Provider>
    );
}

// Flying items overlay component
function FlyingItemsOverlay({ items }: { items: FlyingItem[] }) {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {items.map(item => (
                <FlyingItemElement key={item.id} item={item} />
            ))}
        </div>
    );
}

// Individual flying item
function FlyingItemElement({ item }: { item: FlyingItem }) {
    const deltaX = item.endX - item.startX;
    const deltaY = item.endY - item.startY;

    return (
        <div
            className="absolute w-16 h-16 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white"
            style={{
                left: item.startX,
                top: item.startY,
                transform: 'translate(-50%, -50%)',
                animation: 'flyToCart 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                '--fly-x': `${deltaX}px`,
                '--fly-y': `${deltaY}px`,
            } as React.CSSProperties}
        >
            <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover"
            />
            {/* Sparkle effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
    );
}
