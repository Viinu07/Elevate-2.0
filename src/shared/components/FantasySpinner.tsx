import { motion } from 'framer-motion';

export const FantasySpinner = ({ size = 64, color = '#6366f1' }: { size?: number; color?: string }) => {
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Outer Rune Circle */}
            <motion.div
                className="absolute inset-0 border-2 border-dashed rounded-full"
                style={{ borderColor: color, opacity: 0.3 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner Rotating Square (Diamond) */}
            <motion.div
                className="absolute w-1/2 h-1/2 border-2 border-current rounded-sm"
                style={{ borderColor: color, opacity: 0.6 }}
                animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Core Orb */}
            <motion.div
                className="absolute w-1/4 h-1/4 rounded-full bg-current shadow-[0_0_15px_currentColor]"
                style={{ backgroundColor: color }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Orbiting Particle */}
            <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <div
                    className="w-2 h-2 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-current shadow-[0_0_10px_currentColor]"
                    style={{ backgroundColor: color }}
                />
            </motion.div>
        </div>
    );
};
