import { useState, useCallback, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        setTimeout(() => setIsCartBouncing(false), 500);
    }, []);

    const triggerFlyToCart = useCallback((image: string, startElement: HTMLElement) => {
        if (!cartIconRef.current) return;

        const startRect = startElement.getBoundingClientRect();
        const endRect = cartIconRef.current.getBoundingClientRect();

        const newItem: FlyingItem = {
            id: `fly-${Math.random().toString(36).substr(2, 9)}`,
            image,
            startX: startRect.left + startRect.width / 2,
            startY: startRect.top + startRect.height / 2,
            endX: endRect.left + endRect.width / 2,
            endY: endRect.top + endRect.height / 2,
        };

        setFlyingItems(prev => [...prev, newItem]);

        // Trigger bounce slightly before the item hits (haptic feel)
        setTimeout(() => {
            triggerCartBounce();
        }, 700);

        // Remove after animation completes
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
        }, 1000);
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

function FlyingItemsOverlay({ items }: { items: FlyingItem[] }) {
    return (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
            <AnimatePresence mode="popLayout">
                {items.map(item => (
                    <FlyingItemElement key={item.id} item={item} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function FlyingItemElement({ item }: { item: FlyingItem }) {
    return (
        <motion.div
            initial={{ 
                x: item.startX, 
                y: item.startY, 
                scale: 0.5, 
                opacity: 0,
                rotate: 0,
                filter: 'blur(0px)'
            }}
            animate={{ 
                x: [item.startX, (item.startX + item.endX) / 2, item.endX],
                y: [item.startY, item.startY - 150, item.endY], // Parabolic arc
                scale: [0.5, 1.2, 0.1], // Pop then shrink
                opacity: [0, 1, 1, 0],
                rotate: [0, 25, -15, 0],
                filter: ['blur(0px)', 'blur(4px)', 'blur(0px)'] // Motion blur simulation
            }}
            transition={{ 
                duration: 0.9, 
                ease: [0.22, 1, 0.36, 1], // Sophisticated ease out
                times: [0, 0.4, 1]
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
            {/* Trail particles */}
            {[...Array(4)].map((_, i) => {
                const angle = (i / 4) * Math.PI * 2;
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.4, scale: 1 }}
                        animate={{ 
                            opacity: 0, 
                            scale: 0,
                            x: Math.cos(angle) * 40,
                            y: Math.sin(angle) * 40
                        }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="absolute inset-0 bg-[#4988c4]/40 rounded-full blur-md"
                    />
                );
            })}

            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(73,136,196,0.3)] ring-2 ring-white bg-white">
                <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent mix-blend-overlay" />
            </div>
            
            {/* Flash/Sparkle impact */}
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 2], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#4988c4] rounded-full blur-xl"
            />
        </motion.div>
    );
}
