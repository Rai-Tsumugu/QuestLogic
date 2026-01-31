import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = "AIがノートを分析中..." }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center p-8 max-w-sm">

                {/* Scanner Animation */}
                <div className="relative w-24 h-24 mx-auto mb-8 text-indigo-500">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500"
                    />
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-4 rounded-full bg-indigo-500/10 flex items-center justify-center"
                    >
                        <Sparkles size={32} />
                    </motion.div>

                    {/* Scan Line */}
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <motion.h3
                    className="text-2xl font-bold mb-2 text-white"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Analyzing...
                </motion.h3>
                <p className="text-indigo-200/80">
                    {message}
                </p>

                <div className="mt-8 flex justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        </div>
    );
}
