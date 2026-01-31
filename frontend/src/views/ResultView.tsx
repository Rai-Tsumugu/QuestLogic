import { motion } from 'framer-motion';
import type { AnalysisResult } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CheckCircle2, AlertCircle, Quote, Star, Award } from 'lucide-react';

interface ResultViewProps {
    result: AnalysisResult;
    beforeImg: File;
    afterImg: File;
    onReset: () => void;
}

export function ResultView({ result, onReset }: ResultViewProps) {

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
                        <h1 className="text-7xl font-bold bg-gradient-to-b from-white to-indigo-300 bg-clip-text text-transparent relative z-10">
                            {result.total_score}
                            <span className="text-2xl text-indigo-300 ml-1">pts</span>
                        </h1>
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

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <ScoreCard label="作業量" score={result.score_breakdown.volume} icon="📚" delay={0.1} />
                <ScoreCard label="丁寧さ" score={result.score_breakdown.carefulness} icon="✍️" delay={0.2} />
                <ScoreCard label="思考プロセス" score={result.score_breakdown.process} icon="🧠" delay={0.3} />
                <ScoreCard label="見直し" score={result.score_breakdown.review} icon="🔍" delay={0.4} />
            </div>

            {/* Good Points (Features) */}
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="text-yellow-400" />
                <span>ここがすごい！ (Good Points)</span>
            </h3>
            <div className="space-y-3 mb-8">
                {result.features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                        <Card className="py-4 flex items-start gap-3 border-green-500/20 bg-green-900/10">
                            <CheckCircle2 className="text-green-400 shrink-0 mt-1" size={20} />
                            <div>
                                <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {feature.type}
                                </span>
                                <p className="text-sm mt-1 text-slate-200">{feature.description}</p>
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
                <Button fullWidth onClick={() => alert("MVP Demo: Game unlocked!")}>
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
