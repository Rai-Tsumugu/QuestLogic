import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { analyzeHomework } from '../lib/gemini';
import type { AnalysisResult } from '../lib/gemini';

// --- Types ---
type Step = 'before_capture' | 'after_capture' | 'review' | 'analyzing' | 'complete';

interface MissionCameraProps {
    onAnalysisComplete: (result: AnalysisResult, beforeImg: File, afterImg: File) => void;
    onBack: () => void;
}

export function MissionCamera({ onAnalysisComplete, onBack }: MissionCameraProps) {
    const [step, setStep] = useState<Step>('before_capture');
    const [beforeImage, setBeforeImage] = useState<File | null>(null);
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const beforeInputRef = useRef<HTMLInputElement>(null);
    const afterInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'before') {
                setBeforeImage(file);
                setStep('after_capture');
            } else {
                setAfterImage(file);
                setStep('review');
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, type: 'before' | 'after') => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (type === 'before') {
                setBeforeImage(file);
                setStep('after_capture');
            } else {
                setAfterImage(file);
                setStep('review');
            }
        }
    };

    const startAnalysis = async () => {
        if (!beforeImage || !afterImage) return;

        setStep('analyzing');
        setError(null);

        try {
            // Direct API call for MVP
            const result = await analyzeHomework(beforeImage, afterImage);

            // Simulate a bit more delay for dramatic effect if API is too fast
            setTimeout(() => {
                onAnalysisComplete(result, beforeImage, afterImage);
            }, 1000);

        } catch (err) {
            console.error(err);
            setError("AI分析に失敗しました。もう一度試すか、画像の形式を確認してください。");
            setStep('review');
        }
    };

    // --- Render Helpers ---
    const renderUploadArea = (type: 'before' | 'after') => {
        const isBefore = type === 'before';
        const image = isBefore ? beforeImage : afterImage;
        const inputRef = isBefore ? beforeInputRef : afterInputRef;
        const label = isBefore ? "STEP 1: 宿題をやる前" : "STEP 2: 宿題が終わった後";
        const subLabel = isBefore ? "まっさらなノートを撮影しよう" : "頑張って書いたノートを撮影しよう";

        if (image) {
            // Preview Mode
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-black/40"
                >
                    <img
                        src={URL.createObjectURL(image)}
                        alt="preview"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                            <RotateCcw size={14} className="mr-1" /> 撮り直す
                        </Button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white/80">
                        {type.toUpperCase()}
                    </div>
                </motion.div>
            );
        }

        // Upload Mode
        return (
            <Card
                className="aspect-[4/3] flex flex-col items-center justify-center border-dashed border-2 border-indigo-500/30 hover:border-indigo-500/60 hover:bg-slate-800/60 transition-all cursor-pointer group"
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, type)}
            >
                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    {isBefore ? <ImageIcon size={32} /> : <Camera size={32} />}
                </div>
                <h3 className="font-bold text-lg mb-1">{label}</h3>
                <p className="text-sm text-slate-400 text-center px-4">{subLabel}</p>
                <div className="mt-4 text-xs text-indigo-400/60 bg-indigo-500/5 px-3 py-1 rounded-full">
                    タップまたはドラッグ＆ドロップ
                </div>
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, type)}
                />
            </Card>
        );
    };

    return (
        <div className="max-w-2xl mx-auto w-full relative min-h-[80vh] flex flex-col">
            <AnimatePresence>
                {step === 'analyzing' && <LoadingOverlay message="AIが努力の痕跡を探しています..." />}
            </AnimatePresence>

            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    ← 戻る
                </Button>
                <h2 className="text-xl font-bold ml-2">ミッション: 今日の宿題</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {renderUploadArea('before')}

                {/* Only show After upload area if before image is set */}
                {beforeImage && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        {renderUploadArea('after')}
                    </motion.div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm mb-6 text-center">
                    {error}
                </div>
            )}

            {/* Action Footer */}
            <div className="mt-auto sticky bottom-6 z-10">
                <AnimatePresence>
                    {step === 'review' && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <Card className="flex items-center justify-between bg-indigo-950/80 border-indigo-500/30">
                                <div className="flex flex-col">
                                    <span className="text-sm text-indigo-200">準備OK?</span>
                                    <span className="font-bold text-white">AI分析を開始する</span>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={startAnalysis}
                                    className="shadow-xl shadow-indigo-500/20 animate-pulse"
                                >
                                    解析スタート <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
