'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentToast } from '@/context/ToastContext';
import { useDemoContext } from '@/context/DemoContext';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Music,
  Award,
  Sparkles,
  MessageCircle,
  Volume2,
  X,
} from 'lucide-react';

function StudentPracticeContent() {
  const router = useRouter();
  const { showToast } = useStudentToast();
  const { studentProfile, activeStudentId, allStudents } = useDemoContext();

  const currentStudentId = activeStudentId || studentProfile.id;
  const currentStudentInfo = allStudents.find((s) => s.student.id === currentStudentId) || allStudents[0];
  const studentFullName = currentStudentInfo?.user?.name || '學員';
  const cleanStudentName = studentFullName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const studentShortName = cleanStudentName.length > 2 ? cleanStudentName.slice(-2) : cleanStudentName;

  // 打卡核心狀態 (預設累積 18 格，完成今日打卡後變為 19 格)
  const [streakDays, setStreakDays] = useState(7);
  const [stampedCount, setStampedCount] = useState(18);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // 選定曲目 (預設拜爾鋼琴教本 No.66)
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

  // 歷史練習紀錄詳情彈窗狀態
  const [selectedHistoryLog, setSelectedHistoryLog] = useState<{
    id: string;
    date: string;
    fullDate: string;
    song: string;
    score: number;
    duration: string;
    tag: string;
    keywords: string[];
    metrics: {
      pitch: number;
      rhythm: number;
      clarity: number;
      bpm: number;
      cv: string;
    };
    ai_summary: string;
    teacher_name: string;
    teacher_comment: string;
    status: string;
  } | null>(null);

  // 歷史音訊播放模擬
  const [isHistoryAudioPlaying, setIsHistoryAudioPlaying] = useState(false);
  const [historyAudioSec, setHistoryAudioSec] = useState(0);
  const historyAudioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleHistoryAudio = () => {
    if (isHistoryAudioPlaying) {
      setIsHistoryAudioPlaying(false);
      if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
    } else {
      setIsHistoryAudioPlaying(true);
      setHistoryAudioSec(0);
      if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
      historyAudioTimerRef.current = setInterval(() => {
        setHistoryAudioSec((prev) => {
          if (prev >= 15) {
            setIsHistoryAudioPlaying(false);
            if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
    };
  }, []);

  const PRACTICE_HISTORY = [
    {
      id: 'log-1',
      date: '09/16 (三)',
      fullDate: '2026/09/16 19:30',
      song: '徹爾尼 599 第 20 首',
      score: 94,
      duration: '15 秒自主打卡',
      tag: '右手顆粒清晰',
      keywords: ['右手顆粒清晰', '換指流暢', '觸鍵穩定', '節奏精準'],
      metrics: {
        pitch: 96,
        rhythm: 93,
        clarity: 95,
        bpm: 80,
        cv: '0.032 (優良)',
      },
      ai_summary:
        '本次 15 秒打卡在 BPM 80 速度下節奏穩定，右手高音區顆粒感極佳，換指過渡均勻！第 12 小節左手伴奏力道已有顯著改善。',
      teacher_name: '林佩芬 老師',
      teacher_comment:
        '「心悅，右手第 4、5 指的掌關節支撐做得很好！繼續維持這個手型，配合節拍器穩定慢練！」',
      status: '已批改',
    },
    {
      id: 'log-2',
      date: '09/14 (一)',
      fullDate: '2026/09/14 18:45',
      song: '拜爾鋼琴教本 No.66',
      score: 91,
      duration: '15 秒自主打卡',
      tag: '觸鍵俐落',
      keywords: ['節奏穩定', '雙手平衡', '拍頻均勻', '觸鍵俐落'],
      metrics: {
        pitch: 92,
        rhythm: 90,
        clarity: 91,
        bpm: 76,
        cv: '0.041 (良好)',
      },
      ai_summary:
        '雙手合奏聲部平衡佳，十六分音符節奏精準踩在拍點上，整體旋律線條清晰流暢。',
      teacher_name: '林佩芬 老師',
      teacher_comment:
        '「切分音拍子抓得很穩！在家練習時記得左手伴奏要比右手旋律再輕一點點。」',
      status: '已批改',
    },
    {
      id: 'log-3',
      date: '09/11 (五)',
      fullDate: '2026/09/11 20:15',
      song: '巴哈初步第 3 首前四小節',
      score: 89,
      duration: '15 秒自主打卡',
      tag: '複調對位清晰',
      keywords: ['聲部獨立', '複調清晰', '斷奏乾淨', '手腕放鬆'],
      metrics: {
        pitch: 91,
        rhythm: 88,
        clarity: 89,
        bpm: 68,
        cv: '0.048 (良好)',
      },
      ai_summary:
        '巴洛克複調對位線條清楚，左右手主題對答分明，句尾收音自然。',
      teacher_name: '林佩芬 老師',
      teacher_comment:
        '「二聲部對位感出來了！注意雙手分開練習時維持指尖垂直站立。」',
      status: '已批改',
    },
    {
      id: 'log-4',
      date: '09/08 (二)',
      fullDate: '2026/09/08 17:50',
      song: '蕭邦：降E大調夜曲 Op.9 No.2',
      score: 93,
      duration: '15 秒自主打卡',
      tag: '踏板層次優美',
      keywords: ['踏板乾淨', '歌唱性佳', '色彩豐富', '弱音細膩'],
      metrics: {
        pitch: 95,
        rhythm: 92,
        clarity: 94,
        bpm: 60,
        cv: '0.035 (優良)',
      },
      ai_summary:
        '右手歌唱性旋律富有感情，踏板更換乾淨無混濁，琶音聲部輕柔流動。',
      teacher_name: '林佩芬 老師',
      teacher_comment:
        '「弱音觸鍵很美，很有詩意！高潮段落可以再放膽給予手臂重量。」',
      status: '已批改',
    },
  ];

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

    // 模擬 AI 快速分析 (1.4 秒)
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

  // 提交打卡 (嚴格限制：一天只能打卡一次，蓋第 19 顆章)
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
    setStreakDays(8);
    setStampedCount(19);
    showToast('自主練習打卡成功！已在集章冊蓋上第 19 顆印章');
    setShowCelebrationModal(true);
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 font-['Sora',sans-serif] select-none pb-12 animate-in fade-in">
      
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
            className="w-full p-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8E1D5] text-[13px] font-semibold text-[#2B3049] outline-none cursor-pointer"
          >
            <option value="徹爾尼 599 第 20 首">徹爾尼 599 第 20 首</option>
            <option value="拜爾鋼琴教本 No.66">拜爾鋼琴教本 No.66</option>
            <option value="小奏鳴曲 Op.36 No.1">小奏鳴曲 Op.36 No.1</option>
            <option value="巴哈初步第 3 首前四小節">巴哈初步第 3 首前四小節</option>
            <option value="蕭邦：升c小調圓舞曲 Op.64 No.2">蕭邦：升c小調圓舞曲 Op.64 No.2</option>
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
              <span>今日已完成打卡！已累計至第 19 顆印章</span>
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

      {/* 4. 老師反饋與評語專區 (溫馨便利貼風格) */}
      <div className="p-3.5 bg-[#FFF9E6] rounded-2xl border border-[#FFE8A3] shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-[#D97706]" />
            <span className="text-[13px] font-extrabold text-[#92400E]">老師課後練習叮嚀</span>
          </div>
          <span className="text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
            林老師指導
          </span>
        </div>
        <p className="text-[12px] text-[#78350F] leading-relaxed">
          「{studentShortName}這週的第 66 首右手切分音拍子抓得很穩！在家練習時，記得左手伴奏要比右手旋律再輕一點點，彈奏第 12 小節時手腕放鬆不要聳肩喔！」
        </p>
      </div>

      {/* 5. 歷史練習日誌 (點擊卡片可開啟詳細 AI 診斷與老師評語彈窗) */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-bold text-[#2B3049]">
            近期練習紀錄
          </span>
          <span className="text-[11px] text-[#A3A7BA]">點擊查看 AI 診斷與老師回饋</span>
        </div>

        <div className="flex flex-col gap-2">
          {PRACTICE_HISTORY.map((log) => (
            <div
              key={log.id}
              onClick={() => {
                setSelectedHistoryLog(log);
                setIsHistoryAudioPlaying(false);
                setHistoryAudioSec(0);
              }}
              className="p-3 bg-white hover:bg-[#FAF6F0] rounded-xl border border-[rgba(43,48,73,0.08)] flex items-center justify-between shadow-2xs cursor-pointer transition-all active:scale-[0.99] group"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#2B3049] group-hover:text-[#CEAB98] transition-colors">
                    {log.song}
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                    {log.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#A3A7BA] flex items-center gap-1.5">
                  <span>{log.date}</span>
                  <span>·</span>
                  <span className="text-[#CEAB98] font-medium">#{log.tag}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-extrabold text-[#CEAB98]">
                    {log.score} 分
                  </span>
                  <span className="text-[10px] text-[#A3A7BA]">點擊詳情</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] group-hover:text-[#CEAB98] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. 歷史練習紀錄 AI 診斷與老師評語詳情彈窗 (點擊背景關閉)   */}
      {/* ======================================================== */}
      {selectedHistoryLog && (
        <div
          onClick={() => {
            setSelectedHistoryLog(null);
            setIsHistoryAudioPlaying(false);
            if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
          }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] max-h-[85vh] overflow-y-auto bg-white rounded-[24px] p-5 shadow-2xl flex flex-col gap-4 border border-[#EBDCB9] animate-in zoom-in-95 [scrollbar-width:thin]"
          >
            {/* 彈窗頂部標題與關閉按鈕 */}
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#CEAB98] border border-[#E8E1D5]">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#2B3049] leading-tight">
                    {selectedHistoryLog.song}
                  </h3>
                  <p className="text-[11px] text-[#7A7E90]">
                    {selectedHistoryLog.fullDate} · 15 秒打卡
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedHistoryLog(null);
                  setIsHistoryAudioPlaying(false);
                  if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
                }}
                className="w-7 h-7 rounded-full bg-[#FAF6F0] hover:bg-[#F2EDE4] flex items-center justify-center text-[#6F6F6F] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI 評分與評級橫幅 */}
            <div className="p-3.5 bg-gradient-to-br from-[#FAF6F0] to-[#F5ECE0] rounded-2xl border border-[#E8E1D5] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#885424]">AI 音訊特徵分析</span>
                <span className="text-[12px] text-[#6F6F6F]">librosa 拍頻與音準診斷</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-black text-[#68C5AB]">
                  {selectedHistoryLog.score}
                </span>
                <span className="text-[12px] font-bold text-[#2B3049]">/ 100 分</span>
              </div>
            </div>

            {/* 15 秒錄音回放模擬 */}
            <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EFE8DC] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#2B3049] flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-[#CEAB98]" />
                  <span>打卡錄音回放 (15 秒)</span>
                </span>
                <span className="text-[11px] font-mono text-[#7A7E90]">
                  00:{String(historyAudioSec).padStart(2, '0')} / 00:15
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleHistoryAudio}
                  className="w-9 h-9 rounded-full bg-[#68C5AB] hover:bg-[#5BB39A] text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  {isHistoryAudioPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 fill-white" />
                  )}
                </button>

                {/* 動態波形長條 */}
                <div className="flex-1 flex items-center gap-1 h-6">
                  {[30, 60, 95, 70, 40, 85, 100, 65, 45, 90, 75, 50, 80, 60, 40, 70].map((h, i) => {
                    const isPassed = (i / 16) * 15 <= historyAudioSec;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          isPassed
                            ? 'bg-[#68C5AB]'
                            : isHistoryAudioPlaying
                            ? 'bg-[#CEAB98]/40 animate-pulse'
                            : 'bg-[#D1C9BE]'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI 診斷指標與關鍵字 */}
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-bold text-[#2B3049] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A259]" />
                <span>AI 特徵指標</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] text-[#7A7E90]">音準準確度</span>
                  <span className="text-[14px] font-bold text-slate-800">
                    {selectedHistoryLog.metrics.pitch}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] text-[#7A7E90]">節奏穩定度</span>
                  <span className="text-[14px] font-bold text-slate-800">
                    {selectedHistoryLog.metrics.rhythm}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] text-[#7A7E90]">觸鍵清晰度</span>
                  <span className="text-[14px] font-bold text-slate-800">
                    {selectedHistoryLog.metrics.clarity}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] text-[#7A7E90]">拍頻變異係數 (CV)</span>
                  <span className="text-[13px] font-bold text-emerald-700">
                    {selectedHistoryLog.metrics.cv}
                  </span>
                </div>
              </div>

              {/* 標籤 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedHistoryLog.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[#68C5AB]/15 text-[#2E7D68] text-[11px] font-bold"
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              {/* AI 診斷建議內容 */}
              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8E1D5] text-[12px] text-[#6F6F6F] leading-relaxed">
                {selectedHistoryLog.ai_summary}
              </div>
            </div>

            {/* 老師課後評語叮嚀 */}
            <div className="p-3.5 bg-[#FFF9E6] rounded-2xl border border-[#FFE8A3] shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#D97706]" />
                  <span className="text-[12px] font-bold text-[#92400E]">
                    {selectedHistoryLog.teacher_name} 評語
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.2 rounded-full border border-[#FDE68A]">
                  已審核送出
                </span>
              </div>
              <p className="text-[12px] text-[#78350F] leading-relaxed">
                {selectedHistoryLog.teacher_comment}
              </p>
            </div>

            {/* 關閉按鈕 */}
            <button
              type="button"
              onClick={() => {
                setSelectedHistoryLog(null);
                setIsHistoryAudioPlaying(false);
                if (historyAudioTimerRef.current) clearInterval(historyAudioTimerRef.current);
              }}
              className="w-full py-2.5 bg-[#CEAB98] hover:bg-[#C29D89] text-white font-bold text-[13px] rounded-xl shadow-sm transition-all cursor-pointer text-center"
            >
              關閉詳情
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. 打卡成功慶祝彈窗 (點擊背景關閉)                          */}
      {/* ======================================================== */}
      {showCelebrationModal && (
        <div
          onClick={() => setShowCelebrationModal(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[310px] bg-white rounded-[24px] p-5 shadow-2xl flex flex-col items-center text-center gap-3 border border-slate-100 animate-in zoom-in-95"
          >
            <div className="w-16 h-16 rounded-full bg-[#D1F2EB] flex items-center justify-center text-[30px] shadow-inner">
              🎉
            </div>
            <h3 className="text-[18px] font-extrabold text-[#2B3049]">
              打卡成功！
            </h3>
            <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
              恭喜完成今日練習，AI 評分 <strong>{aiResult?.score || 93} 分</strong>！已在您的集章冊蓋上第 <strong>{stampedCount}</strong> 顆印章！
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
                查看集章冊
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function StudentPracticeAudioCheckinPage() {
  return (
    <Suspense fallback={<div className="w-full py-8 text-center text-[#CEAB98]">載入中...</div>}>
      <StudentPracticeContent />
    </Suspense>
  );
}
