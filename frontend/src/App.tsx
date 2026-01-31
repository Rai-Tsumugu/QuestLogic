import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShieldCheck, Gamepad2, Laptop, GraduationCap, ChevronRight } from 'lucide-react'
import { MissionCamera } from './views/MissionCamera'
import { ResultView } from './views/ResultView'
import { ParentDashboard } from './views/ParentDashboard'
import { NFCUnlock } from './views/NFCUnlock'
import type { AnalysisResult } from './lib/gemini'

interface HistoryItem {
  id: string;
  timestamp: Date;
  data: AnalysisResult;
  status: 'pending' | 'approved' | 'rejected';
}

function App() {
  const [role, setRole] = useState<'parent' | 'child' | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [beforeImg, setBeforeImg] = useState<File | null>(null)
  const [afterImg, setAfterImg] = useState<File | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showNFC, setShowNFC] = useState(false)
  const [gameTime, setGameTime] = useState(0)

  const handleAnalysisComplete = (res: AnalysisResult, before: File, after: File) => {
    setResult(res)
    setBeforeImg(before)
    setAfterImg(after)

    // Add to history as pending
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      data: res,
      status: 'pending'
    }
    setHistory(prev => [newItem, ...prev])
  }

  const handleApprove = (id: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'approved' as const } : item
    ))
  }

  const handleReject = (id: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'rejected' as const } : item
    ))
  }

  const resetFlow = () => {
    setResult(null)
    setBeforeImg(null)
    setAfterImg(null)
  }

  const handleBackToRoleSelect = () => {
    setRole(null)
    resetFlow()
  }

  const handleReceiveReward = () => {
    setShowNFC(true)
  }

  const handleNFCComplete = () => {
    setShowNFC(false)
    // Add bonus time based on score (simplified)
    if (result) {
      setGameTime(prev => prev + 30 + (result.total_score > 80 ? 15 : 0))
    }
    resetFlow()
  }

  // --- View Rendering Logic ---
  const renderContent = () => {
    // 1. Result View
    if (result && beforeImg && afterImg) {
      return (
        <ResultView
          result={result}
          beforeImg={beforeImg}
          afterImg={afterImg}
          onReset={handleReceiveReward}
        />
      )
    }

    // 2. Child Mode: Mission Camera
    if (role === 'child') {
      return (
        <MissionCamera
          onAnalysisComplete={handleAnalysisComplete}
          onBack={handleBackToRoleSelect}
        />
      )
    }

    // 3. Parent Mode
    if (role === 'parent') {
      return (
        <ParentDashboard
          results={history}
          onApprove={handleApprove}
          onReject={handleReject}
          onBack={handleBackToRoleSelect}
        />
      )
    }

    // 4. Initial: Hero & Role Select
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
            <Sparkles size={14} />
            {gameTime > 0 ? (
              <span>残りゲーム時間: <span className="text-white font-bold">{gameTime}分</span></span>
            ) : (
              <span>AI-Powered Learning Management</span>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            SmartStudy <span className="text-gradient">Gate</span>
          </h1>
          <p className="text-color-text-muted text-lg max-w-lg mx-auto">
            AIが「努力」を正当に評価し、物理デバイスが「約束」を守る。
            親子の信頼を深める次世代の学習管理システム。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole('parent')}
            className={`glass-card cursor-pointer group transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-indigo-500/20 text-indigo-400`}>
                <ShieldCheck size={32} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">管理者 (親)</h3>
            <p className="text-color-text-muted mb-4">
              AI学習レポートの確認、評価基準の調整、ゲーム時間の管理を行います。
            </p>
            <div className="flex items-center text-indigo-400 font-semibold group-hover:gap-2 transition-all">
              <span>開始する</span>
              <ChevronRight size={18} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole('child')}
            className={`glass-card cursor-pointer group transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`p-3 rounded-xl bg-purple-500/20 text-purple-400`}
              >
                <Gamepad2 size={32} />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold mb-2">挑戦者 (子供)</h3>
            <p className="text-color-text-muted mb-4">
              クエスト（宿題）をクリアして、AIから最高の報酬（ゲーム時間）を勝ち取ろう！
            </p>
            <div className="flex items-center text-purple-400 font-semibold group-hover:gap-2 transition-all">
              <span>クエストへ</span>
              <ChevronRight size={18} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex gap-8 text-color-text-muted text-sm"
        >
          <div className="flex items-center gap-2">
            <GraduationCap size={16} />
            <span>Learn with AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Laptop size={16} />
            <span>Device Control</span>
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <div className="bg-mesh">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <AnimatePresence>
        {showNFC && <NFCUnlock onComplete={handleNFCComplete} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={role ? role + (result ? '-result' : '') : 'hero'}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col items-center"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
