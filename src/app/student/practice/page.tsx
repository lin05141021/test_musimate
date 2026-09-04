'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';
import { useStudentToast } from '@/context/ToastContext';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Music,
  Flame,
  Volume2,
  Sparkles,
  Award,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';

export default function StudentPracticeAudioCheckinPage() {
  const router = useRouter();
  const { showToast } = useStudentToast();

  // 打卡核心狀態
  const [streakDays, setStreakDays] = useState(7);
  const [stampedCount, setStampedCount] = useState(18);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // 選定曲目
  const [selectedSong, setSelectedSong] = useState('拜爾鋼琴教本 No.66');

  // 錄音狀態
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [countdown, setCountdown] = useState(15);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 播放模擬
  const [isPlaying, setIsPlaying] = useState(false);

  // AI 診斷狀態
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    score: number;
    keywords: string[];
    summary: string;
  } | null>(null);

  // 打卡成功慶祝彈窗
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // 更多抽屜
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  // 開始 15 秒錄音
  const startRecording = () => {
    setRecordState('recording');
    setCountdown(15);
    setAiResult(null);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          stopAndDiagnose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 停止錄音並啟動 AI 診斷
  const stopAndDiagnose = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRecordState('recorded');
    setIsAiDiagnosing(true);

    // 模擬 AI 快速分析 (1.5 秒)
    setTimeout(() => {
      setIsAiDiagnosing(false);
      setAiResult({
        score: 93,
        keywords: ['節奏穩定', '音準精確', '觸鍵靈敏', '換指流暢'],
        summary: '本次演奏節奏穩定（BPM 96 保持優良），高把位清脆俐落，音質飽滿！',
      });
    }, 1400);
  };

  // 重新錄音
  const resetRecording = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRecordState('idle');
    setCountdown(15);
    setIsPlaying(false);
    setAiResult(null);
  };

  // 提交打卡 (嚴格限制：一天只能打卡一次)
  const handleConfirmCheckin = async () => {
    if (hasCheckedInToday) {
      alert('您今天已經完成打卡囉！一天只能打卡一次，明天再接再厲！');
      return;
    }

    try {
      await fetch('/api/student/stamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: '55555555-5555-4555-b555-555555555555',
          song_title: selectedSong,
          ai_score: aiResult?.score || 93,
          ai_keywords: aiResult?.keywords || ['節奏穩定', '音準精確'],
        }),
      });
    } catch (e) {
      console.warn('API error:', e);
    }

    setHasCheckedInToday(true);
    setStreakDays((prev) => prev + 1);
    setStampedCount((prev) => prev + 1);
    showToast('自主練習打卡成功！已蓋上印章');
    setShowCelebrationModal(true);
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#EDE8DE] sm:bg-[#E5E0D8] flex items-center justify-center p-0 sm:p-4 font-['Sora',sans-serif] select-none">
      {/* 360px 手機外框主容器 */}
      <div className="w-[360px] h-[800px] max-w-full max-h-[100dvh] sm:max-h-[820px] bg-[#FAF6F0] rounded-[40px] shadow-[0px_12px_24px_rgba(43,48,73,0.13)] overflow-hidden flex flex-col relative border border-[#F0EAE1]">
        
        {/* ============================================================ */}
        {/* 頂部 Header 列 (高 64px) */}
        {/* ============================================================ */}
        <header className="h-[64px] shrink-0 px-5 border-b border-[#F0EAE1] bg-[#FAF6F0] flex justify-between items-center z-20">
          <div className="w-[140px] h-[36px] relative cursor-pointer" onClick={() => router.push('/')}>
            <Image
              src="/UI/logo.png"
              alt="MusiMate"
              fill
              className="object-contain object-left"
              priority
              onError={(e: any) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#68C5AB]">第 3 期</span>
            <span className="text-[11px] text-[#A3A7BA]">· 練習打卡</span>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 可滾動主內容區域 (垂直滾動) */}
        {/* ============================================================ */}
        <main className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] px-5 pt-3 pb-8 flex flex-col gap-4">
          
          {/* 1. 頁面標題 */}
          <div className="flex flex-col gap-1">
            <h1 className="text-[#2B3049] text-[20px] font-bold tracking-tight">
              自主練習打卡
            </h1>
            <p className="text-[#6F6F6F] text-[12px] font-normal">
              每日錄音練琴 15 秒，獲取 AI 診斷回饋並累積蓋章！
            </p>
          </div>

          {/* 2. 今日打卡狀態與集章卡入口橫幅 */}
          <div className="p-3.5 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[20px] ${
                  hasCheckedInToday ? 'bg-emerald-50 text-emerald-600' : 'bg-[#FDEBD0] text-[#E74C3C]'
                }`}
              >
                {hasCheckedInToday ? '✅' : '🔥'}
              </div>
              <div className="flex flex-col">
                <div className="text-[13px] font-bold text-[#2B3049] flex items-center gap-1.5">
                  <span>{hasCheckedInToday ? '今日已完成打卡' : '今日尚未打卡'}</span>
                  <span className="text-[11px] text-[#E74C3C] font-semibold">
                    (連續 {streakDays} 天)
                  </span>
                </div>
                <div className="text-[11px] text-[#7A7E90]">
                  已累積集章：{stampedCount} / 60 格
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/student/stamps')}
              className="px-2.5 py-1.5 bg-[#FAF6F0] hover:bg-[#F2EDE4] rounded-xl text-[11px] font-bold text-[#CEAB98] border border-[#E8E1D5] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>查看徽章</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. 錄音打卡核心工作台 */}
          <div className="p-4 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] shadow-sm flex flex-col gap-3.5">
            
            {/* 曲目選擇 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#2B3049] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#CEAB98]" />
                <span>本次練琴曲目</span>
              </label>
              <select
                value={selectedSong}
                onChange={(e) => setSelectedSong(e.target.value)}
                disabled={recordState === 'recording'}
                className="w-full p-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8E1D5] text-[13px] font-semibold text-[#2B3049] outline-none"
              >
                <option value="拜爾鋼琴教本 No.66">拜爾鋼琴教本 No.66</option>
                <option value="小奏鳴曲 Op.36 No.1">小奏鳴曲 Op.36 No.1</option>
                <option value="鈴木小提琴第一冊 嘉禾舞曲">鈴木小提琴第一冊 嘉禾舞曲</option>
                <option value="巴哈 G大調小步舞曲">巴哈 G大調小步舞曲</option>
                <option value="自選練琴片段">自選練琴片段</option>
              </select>
            </div>

            {/* 錄音控制視覺區 */}
            <div className="w-full py-5 bg-[#FAF6F0] rounded-xl border border-[#EFE8DC] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
              
              {/* 錄音波形動畫模擬 */}
              {recordState === 'recording' && (
                <div className="flex items-center gap-1.5 h-6">
                  {[40, 75, 100, 60, 90, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-[#E74C3C] rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 圓形錄音按鈕 */}
              <div className="relative">
                {recordState === 'idle' && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#CEAB98] to-[#E5C2AF] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                )}

                {recordState === 'recording' && (
                  <button
                    type="button"
                    onClick={stopAndDiagnose}
                    className="w-18 h-18 rounded-full bg-[#E74C3C] text-white flex items-center justify-center shadow-md animate-pulse hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Square className="w-7 h-7 fill-white" />
                  </button>
                )}

                {recordState === 'recorded' && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-18 h-18 rounded-full bg-[#68C5AB] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 ml-1 fill-white" />}
                  </button>
                )}
              </div>

              {/* 狀態文字與倒數計時 */}
              <div className="text-center flex flex-col items-center">
                {recordState === 'idle' && (
                  <span className="text-[13px] font-bold text-[#2B3049]">
                    點擊麥克風開始錄音 (15秒)
                  </span>
                )}
                {recordState === 'recording' && (
                  <span className="text-[14px] font-extrabold text-[#E74C3C]">
                    錄音中... 剩餘 {countdown} 秒
                  </span>
                )}
                {recordState === 'recorded' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-emerald-700">
                      ✔ 15 秒音訊錄製完成
                    </span>
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="text-[11px] text-[#6F6F6F] hover:text-[#2B3049] flex items-center gap-0.5 underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重錄</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI 智能診斷狀態與結果卡片 */}
            {isAiDiagnosing && (
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-center gap-2.5 text-purple-700 text-[13px] animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="font-bold">AI 智能分析音準與節奏中...</span>
              </div>
            )}

            {aiResult && !isAiDiagnosing && (
              <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E8E1D5] flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C9A259]" />
                    <span className="text-[13px] font-extrabold text-[#2B3049]">
                      AI 診斷評分
                    </span>
                  </div>
                  <span className="text-[18px] font-black text-[#68C5AB]">
                    {aiResult.score} 分
                  </span>
                </div>

                {/* 關鍵字標籤 */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {aiResult.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#68C5AB]/15 text-[#2E7D68] text-[11px] font-bold"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                <p className="text-[12px] text-[#6F6F6F] leading-relaxed pt-1">
                  {aiResult.summary}
                </p>
              </div>
            )}

            {/* 確認打卡送出按鈕 (一日限打卡一次) */}
            <div className="pt-1">
              {hasCheckedInToday ? (
                <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>今日已打卡！一天限打卡一次，明天再接再厲</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!aiResult}
                  onClick={handleConfirmCheckin}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-[14px] transition-all cursor-pointer shadow-sm ${
                    aiResult
                      ? 'bg-[#68C5AB] hover:bg-[#5BB39A] active:scale-[0.99]'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>送出今日自主打卡 (蓋印章 +1)</span>
                </button>
              )}
            </div>

          </div>

          {/* 4. 歷史練習日誌 */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-[#2B3049]">
                近期練習紀錄
              </span>
              <span className="text-[11px] text-[#A3A7BA]">過去 3 天</span>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { date: '09/03 (三)', song: '巴哈 G大調小步舞曲', score: 91, tag: '節奏穩定' },
                { date: '09/02 (二)', song: '拜爾鋼琴教本 No.66', score: 88, tag: '觸鍵俐落' },
                { date: '09/01 (一)', song: '小奏鳴曲 Op.36 No.1', score: 94, tag: '音準極佳' },
              ].map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-[rgba(43,48,73,0.06)] flex items-center justify-between shadow-2xs"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#2B3049]">{log.song}</span>
                    <span className="text-[11px] text-[#A3A7BA]">{log.date} · #{log.tag}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-[#CEAB98]">{log.score} 分</span>
                    <CheckCircle2 className="w-4 h-4 text-[#68C5AB]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* ============================================================ */}
        {/* 底部 TabBar */}
        {/* ============================================================ */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar
            activeTab="practice"
            onMoreClick={() => setIsMoreDrawerOpen(true)}
          />
        </footer>

        {/* 更多功能側選單抽屜 */}
        <StudentMoreDrawer
          isOpen={isMoreDrawerOpen}
          onClose={() => setIsMoreDrawerOpen(false)}
        />

        {/* 打卡成功慶祝彈窗 */}
        {showCelebrationModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-[310px] bg-white rounded-[24px] p-5 shadow-2xl flex flex-col items-center text-center gap-3 border border-slate-100 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#D1F2EB] flex items-center justify-center text-[30px] shadow-inner">
                🎉
              </div>
              <h3 className="text-[18px] font-extrabold text-[#2B3049]">
                打卡成功！
              </h3>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                恭喜完成今日練習，AI 評分 <strong>{aiResult?.score || 93} 分</strong>！已在您的集章卡蓋上第 <strong>{stampedCount}</strong> 顆印章！
              </p>
              <div className="w-full flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[#6F6F6F] font-bold text-[12px] hover:bg-slate-50 transition-all cursor-pointer"
                >
                  留在此頁
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebrationModal(false);
                    router.push('/student/stamps');
                  }}
                  className="flex-1 py-2.5 bg-[#CEAB98] hover:bg-[#C29D89] text-white font-bold text-[12px] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  查看集章卡
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
