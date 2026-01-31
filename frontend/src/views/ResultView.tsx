import { motion } from 'framer-motion';
import type { AnalysisResult } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CheckCircle2, AlertCircle, Quote, Star, Award, PenTool, Eraser, FileText, Search } from 'lucide-react';

interface ResultViewProps {
    result: AnalysisResult;
    beforeImg: File;
    afterImg: File;
    onReset: () => void;
}

export function ResultView({ result, beforeImg, afterImg, onReset }: ResultViewProps) {

    const getFeatureIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('pen') || t.includes('赤')) return <PenTool size={20} />;
        if (t.includes('erase') || t.includes('消し')) return <Eraser size={20} />;
        if (t.includes('process') || t.includes('途中')) return <FileText size={20} />;
        return <CheckCircle2 size={20} />;
    };

    // Calculate star rating (0-5) from total score (0-100)
    const stars = Math.round(result.total_score / 20);

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header Score */}
            <div className="text-center mb-8 relative">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                >
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full" />
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-8xl font-black bg-gradient-to-b from-white via-white to-indigo-400 bg-clip-text text-transparent relative z-10 tracking-tighter"
                        >
                            {result.total_score}
                            <span className="text-3xl font-bold text-indigo-400/80 ml-1">pts</span>
                        </motion.h1>
                    </div>

                    <div className="flex justify-center gap-1 mt-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={24}
                                fill={i < stars ? "currentColor" : "none"}
                                className={i < stars ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "text-slate-600"}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* AI Coach Feedback */}
            <Card className="mb-6 border-indigo-500/30 bg-indigo-950/40">
                <div className="flex gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-full h-fit text-indigo-300">
                        <Quote size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-indigo-200 mb-1">AIコーチからのメッセージ</h3>
                        <p className="text-lg leading-relaxed">{result.feedback_to_child}</p>
                    </div>
                </div>
            </Card>

            {/* Image Comparison Preview */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-900 aspect-video">
                    <img src={URL.createObjectURL(beforeImg)} alt="Before" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-mono uppercase tracking-widest text-white/70 border border-white/10">Before</div>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-900 aspect-video">
                    <img src={URL.createObjectURL(afterImg)} alt="After" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-500/80 rounded text-[10px] font-mono uppercase tracking-widest text-white border border-indigo-400/50">After</div>
                </div>
            </div>

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <ScoreCard label="作業量" score={result.score_breakdown.volume} icon="📚" delay={0.1} />
                <ScoreCard label="丁寧さ" score={result.score_breakdown.carefulness} icon="✍️" delay={0.2} />
                <ScoreCard label="思考プロセス" score={result.score_breakdown.process} icon="🧠" delay={0.3} />
                <ScoreCard label="見直し" score={result.score_breakdown.review} icon="🔍" delay={0.4} />
            </div>

            {/* Good Points (Features) */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Award className="text-yellow-400" />
                    <span>ここがすごい！</span>
                </h3>
                <div className="h-[1px] flex-1 bg-white/5 ml-4" />
            </div>
            <div className="space-y-3 mb-8">
                {result.features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                        <Card className="py-4 flex items-start gap-3 border-emerald-500/20 bg-emerald-900/10 hover:bg-emerald-900/20 transition-colors">
                            <div className="text-emerald-400 shrink-0 mt-1">
                                {getFeatureIcon(feature.type)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">
                                        {feature.type}
                                    </span>
                                    {feature.location && (
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Search size={10} /> {feature.location}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm mt-1.5 text-slate-200 leading-relaxed">{feature.description}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Suspicion Alert (if any) */}
            {result.suspicion_flag && (
                <Card className="mb-8 border-red-500/30 bg-red-950/20">
                    <div className="flex gap-3 text-red-400">
                        <AlertCircle className="shrink-0" />
                        <div>
                            <h3 className="font-bold mb-1">先生への報告事項</h3>
                            <p className="text-sm">{result.suspicion_reason}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Parent Feedback (Collapsible or Separate section in real app) */}
            <div className="mb-8 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">保護者向けレポート</h4>
                <p className="text-sm text-slate-300 italic">"{result.feedback_to_parent}"</p>
            </div>

            <div className="flex gap-4 sticky bottom-6">
                <Button variant="outline" fullWidth onClick={onReset}>
                    閉じる
                </Button>
                <Button fullWidth onClick={() => {
                    alert("MVP Demo: 報酬が確定しました！ゲーム時間が付与されます 🎁");
                    onReset();
                }}>
                    報酬を受け取る 🎁
                </Button>
            </div>
        </div>
    );
}

function ScoreCard({ label, score, icon, delay }: { label: string, score: number, icon: string, delay: number }) {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay }}
            className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center"
        >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className="text-2xl font-bold font-mono">
                {score}<span className="text-sm text-slate-500">/10</span>
            </div>
            {/* Simple progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <motion.div
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 10}%` }}
                    transition={{ delay: delay + 0.3, duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
}
