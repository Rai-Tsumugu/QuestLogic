import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap, CheckCircle2, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';

interface NFCUnlockProps {
    onComplete: () => void;
}

export function NFCUnlock({ onComplete }: NFCUnlockProps) {
    const [status, setStatus] = useState<'waiting' | 'scanning' | 'success'>('waiting');

    const handleSimulateTap = () => {
        setStatus('scanning');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                onComplete();
            }, 1000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-indigo-950 p-6 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent)] pointer-events-none" />

            <AnimatePresence mode="wait">
                {status === 'waiting' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                    >
                        <div className="relative w-48 h-48 mx-auto mb-12">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl"
                            />
                            <div className="relative flex items-center justify-center w-full h-full bg-slate-900 border-2 border-indigo-500/30 rounded-3xl">
                                <Lock size={64} className="text-indigo-400" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">報酬を解錠する</h2>
                        <p className="text-indigo-200/60 mb-8 max-w-xs mx-auto text-lg">
                            スマホを Gate-Plug または Box の
                            <span className="text-indigo-400 font-bold"> NFCボタン</span>
                            にかざしてください
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-center gap-2">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-indigo-400"
                                >
                                    <Smartphone size={32} />
                                </motion.div>
                                <div className="text-slate-600">
                                    <Zap size={32} />
                                </div>
                            </div>

                            <Button
                                className="mt-8 bg-indigo-600"
                                size="lg"
                                onClick={handleSimulateTap}
                            >
                                デバイスにかざす (シミュレート)
                            </Button>
                        </div>
                    </motion.div>
                )}

                {status === 'scanning' && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        <div className="w-48 h-48 mx-auto mb-8 relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap size={48} className="text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white">スキャン中...</h2>
                        <p className="text-indigo-300">NFC ID: GT-PLUG-0922</p>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.6 }}
                            className="w-48 h-48 mx-auto mb-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                        >
                            <CheckCircle2 size={96} className="text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-bold text-white mb-2">Unlocked!</h2>
                        <p className="text-emerald-400 text-xl font-medium">ごほうびが解放されました</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
