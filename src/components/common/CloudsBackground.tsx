import { motion } from 'framer-motion';

interface CloudProps {
    delay?: number;
    duration?: number;
    x?: number;
    y?: number;
    scale?: number;
}

function Cloud({ delay = 0, duration = 20, x = 0, y = 0, scale = 1 }: CloudProps) {
    return (
        <motion.div
            className="absolute opacity-30"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `scale(${scale})`,
            }}
            animate={{
                x: [0, 100, 0],
                y: [0, -30, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
                delay,
            }}
        >
            <svg width="200" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="50" rx="40" ry="25" fill="url(#cloud-gradient)" />
                <ellipse cx="100" cy="40" rx="50" ry="30" fill="url(#cloud-gradient)" />
                <ellipse cx="140" cy="50" rx="40" ry="25" fill="url(#cloud-gradient)" />
                <defs>
                    <linearGradient id="cloud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#e0c3fc', stopOpacity: 0.6 }} />
                        <stop offset="100%" style={{ stopColor: '#8ec5fc', stopOpacity: 0.4 }} />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>
    );
}

export function CloudsBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30" />

            {/* Floating clouds */}
            <Cloud delay={0} duration={25} x={10} y={20} scale={1.2} />
            <Cloud delay={3} duration={30} x={60} y={10} scale={0.9} />
            <Cloud delay={6} duration={28} x={30} y={60} scale={1.0} />
            <Cloud delay={9} duration={32} x={70} y={70} scale={0.8} />
            <Cloud delay={12} duration={27} x={50} y={40} scale={1.1} />
            <Cloud delay={15} duration={29} x={85} y={25} scale={0.95} />
        </div>
    );
}
