import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { AnalysisResult } from '../lib/gemini';

interface ParentDashboardProps {
    results: Array<{
        id: string;
        timestamp: Date;
        data: AnalysisResult;
        status: 'pending' | 'approved' | 'rejected';
    }>;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onBack: () => void;
}

export function ParentDashboard({ results, onApprove, onReject, onBack }: ParentDashboardProps) {
    const pendingResults = results.filter(r => r.status === 'pending');
    const processedResults = results.filter(r => r.status !== 'pending');

    return (
        <div className="max-w-4xl mx-auto w-full p-4">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={onBack}>終了</Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Reviews */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Clock size={18} className="text-yellow-400" />
                        未承認のレポート ({pendingResults.length})
                    </h2>

                    {pendingResults.length === 0 ? (
                        <Card className="text-center py-12 border-dashed">
                            <p className="text-slate-500">確認待ちのレポートはありません。</p>
                        </Card>
                    ) : (
                        pendingResults.map(result => (
                            <ReportItem
                                key={result.id}
                                result={result}
                                onApprove={() => onApprove(result.id)}
                                onReject={() => onReject(result.id)}
                            />
                        ))
                    )}
                </div>

                {/* System Stats & Settings */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold">状況 summary</h2>
                    <Card className="bg-indigo-950/30 border-indigo-500/20">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">本日の承認済み</div>
                                <div className="text-3xl font-bold">{processedResults.length} <span className="text-sm font-normal text-slate-400">クエスト</span></div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">累計付与時間</div>
                                <div className="text-3xl font-bold">{processedResults.length * 30} <span className="text-sm font-normal text-slate-400">分</span></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-800/40">
                        <h3 className="font-bold text-sm mb-3">AI チューニング</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">採点の厳しさ</span>
                                <span className="text-indigo-400">普通</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-1/2 h-full bg-indigo-500" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">
                                次回から「字の丁寧さ」の配分を高くするように指示しています。
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ReportItem({ result, onApprove, onReject }: { result: any, onApprove: () => void, onReject: () => void }) {
    const data = result.data;
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="overflow-hidden border-indigo-500/20">
                <div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Award className="text-yellow-400" size={20} />
                        <span className="font-bold text-sm">{result.timestamp.toLocaleTimeString()} のレポート</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-indigo-400">Score: {data.total_score}</div>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">AI解析まとめ</h4>
                        <p className="text-sm text-slate-200">{data.feedback_to_parent}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        {data.suspicion_flag && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded flex items-center gap-1 border border-red-500/20">
                                <XCircle size={10} /> 要注意ポイントあり
                            </span>
                        )}
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded flex items-center gap-1 border border-indigo-500/20 italic">
                            Gemini 3 Flash Analyze
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50"
                            size="sm"
                            onClick={onApprove}
                        >
                            <CheckCircle2 size={16} className="mr-2" /> 承認して報酬を確定
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                            size="sm"
                            onClick={onReject}
                        >
                            <ArrowRight size={16} className="mr-2 rotate-45" /> 差し戻し
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
