'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gauge,
  Play,
  Pause,
  Volume2,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Heart,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

export default function StudentSummaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lessonRecords, activeStudentId, allStudents, switchStudent } = useDemoContext();

  const recordId = (params?.id as string) || 'lesson-7';

  // 自動依據使用者 LINE ID 或全組 Demo 學生切換身分防呆
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const studentParam = urlParams.get('student') || urlParams.get('student_id');
      if (studentParam) {
        const found = allStudents.find(
          (s) =>
            s.student.id.toLowerCase() === studentParam.toLowerCase() ||
            s.user.name.toLowerCase().includes(studentParam.toLowerCase())
        );
        if (found && found.student.id !== activeStudentId) {
          switchStudent(found.student.id);
        }
      }
    }
  }, [activeStudentId, allStudents, switchStudent]);

  // 取得完整課堂紀錄列表（依時間順序排序：第 1 堂課到最新第 7 堂課）
  const allLessons = (lessonRecords && lessonRecords.length > 0)
    ? [...lessonRecords].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  // 計算當前課堂在清單中的索引 (預設為最新一堂課)
  const currentIndex = allLessons.findIndex((r) => r.id === recordId);
  const safeIndex = currentIndex !== -1 ? currentIndex : (allLessons.length > 0 ? allLessons.length - 1 : 0);
  const currentRecord = allLessons[safeIndex] || allLessons[allLessons.length - 1] || allLessons[0];

  // 左右切換按鈕邊界禁用邏輯
  const isPrevDisabled = safeIndex <= 0;
  const isNextDisabled = safeIndex >= allLessons.length - 1;

  const handlePrevLesson = () => {
    if (!isPrevDisabled && allLessons[safeIndex - 1]) {
      router.push(`/student/summary/${allLessons[safeIndex - 1].id}`);
    }
  };

  const handleNextLesson = () => {
    if (!isNextDisabled && allLessons[safeIndex + 1]) {
      router.push(`/student/summary/${allLessons[safeIndex + 1].id}`);
    }
  };

  const navigateToLesson = (id: string) => {
    router.push(`/student/summary/${id}`);
  };

  // 格式化日期標籤 (動態依 created_at 計算)
  const formatLessonHeaderDate = (isoString: string, id: string) => {
    const d = new Date(isoString || '2026-09-18T10:00:00+08:00');
    if (isNaN(d.getTime())) return '9月18日（五）的課程';
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const day = dayNames[d.getDay()];
    return `${month}月${date}日（${day}）的課程`;
  };

  const formatCardDate = (isoString: string, id: string) => {
    const d = new Date(isoString || '2026-09-18T10:00:00+08:00');
    if (isNaN(d.getTime())) return '2026/09/18';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${date}`;
  };

  // 音訊播放狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(30);
  const [audioSeconds, setAudioSeconds] = useState(225);
  const totalSeconds = 750;
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      audioTimerRef.current = setInterval(() => {
        setAudioSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          setPlayProgress((next / totalSeconds) * 100);
          return next;
        });
      }, 1000);
    } else {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // 作業勾選狀態
  const [completedHw, setCompletedHw] = useState<number[]>([]);

  const toggleHomework = (idx: number) => {
    setCompletedHw((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // 當前課堂資料拆解
  const summary = currentRecord?.clean_summary_json || {
    highlights: [],
    technical_tips: [],
    theory_tips: [],
    homework: [],
    encouragement: '',
    bpm_recommendation: 72,
  };

  const technicalTips = summary.technical_tips && summary.technical_tips.length > 0
    ? summary.technical_tips
    : [
        '第 12 小節左手伴奏觸鍵偏重，請以放輕手腕自然呼吸帶動，避免手臂下壓用力。',
        '右手快速音群保持掌關節穩定拱形，指尖垂直觸鍵確保顆粒分明。',
      ];

  const theoryTips = summary.theory_tips && summary.theory_tips.length > 0
    ? summary.theory_tips
    : [
        '注意主從和聲平衡：右手為主旋律、左手為背景和弦伴奏，兩手強弱需有明顯層次。',
        '巴哈複調音樂雙手各自獨立，注意二聲部對位線條清晰度。',
      ];

  const homeworkList = summary.homework && summary.homework.length > 0
    ? summary.homework
    : [
        '徹爾尼 599 第 20 首：配合節拍器由慢練漸進提升至目標速度 BPM 80，每日練習 15 分鐘',
        '巴哈初步第 3 首：雙手分開單獨慢練第 1 至 4 小節，熟記指法與聲部進行',
        '針對第 12 小節左手伴奏手腕放鬆度錄製 15 秒打卡音訊供批改',
      ];

  const encouragementText =
    summary.encouragement || '右手顆粒感的進步非常亮眼！只要把左手的手腕放鬆、伴奏輕下來，整首曲子的層次就會如同水晶般清澈。繼續加油！';

  const currentSongTitle = currentRecord?.song_title || '徹爾尼 599 第 20 首 & 巴哈初步第 3 首';
  const teacherName = currentRecord?.teacher_name || '林佩芬 老師 (Teacher Lin)';

  return (
    <div className="w-full flex flex-col gap-4 font-['Sora',sans-serif] select-none pb-12 animate-in fade-in">
      
      {/* 頁面標題與課程切換區 */}
      <div className="w-full pt-1 flex flex-col items-center gap-2 shrink-0">
        <div className="w-full text-center text-[#2B3049] text-[20px] font-extrabold leading-tight">
          智慧聯絡簿
        </div>

        {/* 左右切換按鈕區 */}
        <div className="w-full flex justify-center items-center gap-3">
          <button
            type="button"
            onClick={handlePrevLesson}
            disabled={isPrevDisabled}
            aria-label="切換至上一次上課的聯絡簿"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isPrevDisabled
                ? 'bg-[#EAE7E2] text-[#B8B4AE] opacity-40 cursor-not-allowed pointer-events-none'
                : 'bg-[rgba(104,197,171,0.10)] text-[#68C5AB] hover:bg-[rgba(104,197,171,0.22)] active:scale-95 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="text-[#68C5AB] text-[14px] font-bold tracking-tight">
            {formatLessonHeaderDate(currentRecord?.created_at || '', currentRecord?.id || '')}
          </div>

          <button
            type="button"
            onClick={handleNextLesson}
            disabled={isNextDisabled}
            aria-label="切換至後一次上課的聯絡簿"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isNextDisabled
                ? 'bg-[#EAE7E2] text-[#B8B4AE] opacity-40 cursor-not-allowed pointer-events-none'
                : 'bg-[rgba(104,197,171,0.10)] text-[#68C5AB] hover:bg-[rgba(104,197,171,0.22)] active:scale-95 cursor-pointer'
            }`}
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 課堂曲目副標題 */}
        <div className="w-full text-center text-[#6F6F6F] text-[13px] font-normal truncate">
          {currentSongTitle}
        </div>
      </div>

      {/* 圓點分頁指示器 */}
      <div className="w-full py-1 flex justify-center items-center gap-2">
        {allLessons.map((item, idx) => {
          const isActive = idx === safeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToLesson(item.id)}
              aria-label={`第 ${idx + 1} 堂課`}
              className={`transition-all duration-200 cursor-pointer rounded-full ${
                isActive
                  ? 'w-2.5 h-2.5 bg-[#68C5AB]'
                  : 'w-1.5 h-1.5 bg-[#6F6F6F] opacity-30 hover:opacity-60'
              }`}
            />
          );
        })}
      </div>

      {/* 白色圓角卡片容器 */}
      <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(104,197,171,0.25)] shadow-[0px_8px_24px_rgba(43,48,73,0.06)] flex flex-col gap-4">
        
        {/* 卡片頂部：AI 標籤、曲目、BPM 與授課教師 */}
        <div className="w-full flex flex-col gap-2.5">
          <div className="w-full flex justify-between items-start gap-2">
            <div className="flex-1 flex flex-col items-start gap-1">
              <div className="px-2 py-0.5 bg-[rgba(104,197,171,0.12)] rounded-lg inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D5CC6A]" />
                <span className="text-[#D5CC6A] text-[11px] font-bold">
                  AI 課堂情緒過濾 & 學習卡片
                </span>
              </div>
              <h2 className="text-[#2B3049] text-[18px] font-extrabold leading-tight">
                {currentSongTitle}
              </h2>
            </div>

            {/* BPM 方塊 */}
            <div className="px-2.5 py-1.5 bg-[rgba(104,197,171,0.06)] rounded-xl outline outline-1 outline-[#D5CC6A] flex flex-col items-center justify-center gap-0.5 shrink-0">
              <Gauge className="w-3.5 h-3.5 text-[#D5CC6A]" />
              <span className="text-[#D5CC6A] text-[11px] font-bold whitespace-nowrap">
                BPM {summary.bpm_recommendation || 72}
              </span>
            </div>
          </div>

          {/* 授課教師與日期 */}
          <div className="text-[#6F6F6F] text-[11px] font-normal">
            授課指導：{teacherName} · 課堂日期：{formatCardDate(currentRecord?.created_at || '', currentRecord?.id || '')}
          </div>
        </div>

        {/* 現場原音錄音播放條 */}
        <div className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-[#EBDCB9] flex items-center gap-3 shadow-2xs">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? '暫停播放' : '播放原音'}
            className="w-9 h-9 rounded-full bg-[#D5CC6A] hover:bg-[#c7bd5f] active:scale-95 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white fill-white" />
            ) : (
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            )}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-full h-1.5 bg-[rgba(43,48,73,0.12)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D5CC6A] transition-all duration-300 rounded-full"
                style={{ width: `${playProgress}%` }}
              />
            </div>
            <div className="w-full flex justify-between items-center text-[11px] text-[#6F6F6F]">
              <span>{formatTime(audioSeconds)} / {formatTime(totalSeconds)}</span>
              <Volume2 className="w-3.5 h-3.5 text-[#6F6F6F]" />
            </div>
          </div>
        </div>

        <div className="w-full h-0 border-b border-[rgba(43,48,73,0.06)]" />

        {/* 一、本週技術與手型重點 */}
        <div className="w-full flex flex-col gap-2.5">
          <div className="px-2.5 py-1 bg-[rgba(104,197,171,0.08)] rounded-xl self-start flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-[#D5CC6A]" />
            <span className="text-[#D5CC6A] text-[13px] font-bold">
              本週技術與手型重點
            </span>
          </div>
          <div className="w-full flex flex-col gap-2">
            {technicalTips.map((tip, idx) => (
              <div
                key={idx}
                className="w-full p-3 bg-white rounded-xl outline outline-1 outline-[rgba(104,197,171,0.25)] flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D5CC6A]" />
                  <span className="text-[#D5CC6A] text-[11px] font-bold">
                    手感重點 #{idx + 1}
                  </span>
                </div>
                <div className="text-[#2B3049] text-[13px] font-normal leading-relaxed">
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 二、樂理與節拍重點 */}
        <div className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-[#E8E1D5] flex flex-col gap-2.5">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#D5CC6A]" />
            <span className="text-[#D5CC6A] text-[12px] font-bold">
              樂理與節拍重點
            </span>
          </div>
          <div className="w-full flex flex-col gap-2">
            {theoryTips.map((tip, idx) => (
              <div key={idx} className="w-full flex items-start gap-2">
                <div className="pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D5CC6A]/20 flex items-center justify-center text-[#D5CC6A] text-[10px] font-black">
                    ♪
                  </div>
                </div>
                <div className="flex-1 text-[#2B3049] text-[13px] font-normal leading-relaxed">
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 三、回家作業與練習指引 */}
        <div className="w-full flex flex-col gap-2.5">
          <div className="px-2.5 py-1 bg-[rgba(206,171,152,0.10)] rounded-xl self-start flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#CEAB98]" />
            <span className="text-[#CEAB98] text-[13px] font-bold">
              回家作業與練習指引
            </span>
          </div>
          <div className="w-full flex flex-col gap-2">
            {homeworkList.map((hw, idx) => {
              const isDone = completedHw.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleHomework(idx)}
                  className={`w-full p-2.5 bg-white rounded-xl outline outline-1 flex items-center gap-2 cursor-pointer transition-all ${
                    isDone
                      ? 'outline-[rgba(104,197,171,0.5)] bg-[#F4FBF8]'
                      : 'outline-[rgba(104,197,171,0.17)] hover:outline-[rgba(104,197,171,0.35)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold transition-colors ${
                      isDone ? 'bg-[#68C5AB]' : 'bg-[#CEAB98]'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={`flex-1 text-[#2B3049] text-[13px] font-normal transition-opacity ${
                      isDone ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {hw}
                  </div>
                  <div
                    className={`px-1.5 py-0.5 rounded-md flex items-center justify-center shrink-0 text-[11px] font-semibold transition-colors ${
                      isDone
                        ? 'bg-[rgba(104,197,171,0.15)] text-[#48A58D]'
                        : 'bg-[rgba(206,171,152,0.12)] text-[#CEAB98]'
                    }`}
                  >
                    {isDone ? '✔ 已完成' : '未完成'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 四、老師課後小結 */}
        <div className="w-full p-3 bg-[#FFF9E6] rounded-xl border border-[#FFE8A3] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
            <span className="text-[#92400E] text-[12px] font-bold">
              {teacherName.replace(/\s*\(.*?\)\s*/g, '')} 課後小結
            </span>
          </div>
          <div className="text-[#78350F] text-[13px] font-normal leading-relaxed">
            「{encouragementText}」
          </div>
        </div>

      </div>
    </div>
  );
}
