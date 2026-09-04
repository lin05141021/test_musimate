'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';
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
} from 'lucide-react';

export default function StudentSummaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lessonRecords, activeStudentId, allStudents, switchStudent } = useDemoContext();

  const recordId = (params?.id as string) || 'lesson-1';

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

  // 取得完整課堂紀錄列表（依時間順序排序：第 1 堂課到第 5 堂課）
  const allLessons = (lessonRecords && lessonRecords.length > 0)
    ? [...lessonRecords].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  // 計算當前課堂在清單中的索引
  const currentIndex = allLessons.findIndex((r) => r.id === recordId);
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  const currentRecord = allLessons[safeIndex] || allLessons[0];

  // 左右切換按鈕邊界禁用邏輯
  // 左鍵：切換至上一次（更早）上課的聯絡簿。若已是清單第一堂（最舊），到底變灰且 disabled
  const isPrevDisabled = safeIndex <= 0;
  // 右鍵：切換至後一次（更新）上課的聯絡簿。若已是清單最後一堂（最新），到底變灰且 disabled
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

  // 格式化日期標籤
  const formatLessonHeaderDate = (isoString: string, id: string) => {
    if (id === 'lesson-1') return '8月15日（五）的課程';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '8月15日（五）的課程';
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const day = dayNames[d.getDay()];
    return `${month}月${date}日（${day}）的課程`;
  };

  const formatCardDate = (isoString: string, id: string) => {
    if (id === 'lesson-1') return '2026/08/15';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '2026/08/15';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${date}`;
  };

  // 音訊播放狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(30); // 預設進度
  const [audioSeconds, setAudioSeconds] = useState(225); // 03:45
  const totalSeconds = 750; // 12:30
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

  // 作業勾選狀態 (每項作業可點擊切換 未完成 / 已完成)
  const [completedHw, setCompletedHw] = useState<number[]>([]);

  const toggleHomework = (idx: number) => {
    setCompletedHw((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // 更多選單漢堡抽屜狀態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        '右手持弓姿勢注意放鬆，避免過度緊繃，以保持弓速的流暢度與琴弦共鳴。',
        '左手第二指按弦精準度，在高把位轉換時應維持指尖垂直落指，防止音準偏低。',
      ];

  const theoryTips = summary.theory_tips && summary.theory_tips.length > 0
    ? summary.theory_tips
    : [
        '注意十六分音符的均勻度，切分音符需準確踩在拍點上，不能隨意搶拍。',
        'E大調升分號 (C#) 的按弦位置需特別貼近一指，維持半音關係精準度。',
      ];

  const homeworkList = summary.homework && summary.homework.length > 0
    ? summary.homework
    : [
        '第15至32小節慢速練習並分段重複10次',
        '錄製一段節拍器輔助的穩定演奏音訊供批改',
        '熟記第一樂章前奏的左手把位指法與弓法',
      ];

  const encouragementText =
    summary.encouragement || '每一次的練習都是進步的累積，老師看到你的努力了！';

  const currentSongTitle = currentRecord?.song_title || '巴哈：E大調小提琴協奏曲 第一樂章';
  const teacherName = currentRecord?.teacher_name || '張老師';

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] sm:bg-[#EDE8DE] flex justify-center items-center py-0 sm:py-6 select-none font-['Sora','Noto_Sans_TC',sans-serif]">
      {/* 360px Google Pixel 9a 標準尺寸手機主視窗容器 (固定高度 800px / 100dvh，超過版面由中間區域垂直滾動 vertical scroll) */}
      <div className="w-[360px] h-[800px] max-w-full max-h-[100dvh] sm:max-h-[820px] bg-[#FAF6F0] flex flex-col justify-between relative shadow-2xl sm:rounded-[36px] overflow-hidden border border-[#E5DEC9]">
        
        {/* 頂部固定品牌列 (flex-shrink-0 置頂) */}
        <header className="flex-shrink-0 w-full h-16 px-5 py-3 flex items-center bg-[#FAF6F0] border-b border-[#F0EBE1]/80 z-20">
          <div className="w-[161px] h-10 flex items-center">
            <img
              src="/UI/logo.png"
              alt="MusiMate"
              className="h-9 w-auto object-contain cursor-pointer"
              onClick={() => router.push('/')}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/logo.png')) {
                  target.src = '/logo.png';
                }
              }}
            />
          </div>
        </header>

        {/* 主要內容區域 (flex-1 獨立垂直滾動 vertical scroll，超出版面卡片平滑滾動) */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-6 flex flex-col gap-2 [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent]">
          
          {/* 頁面標題與課程切換區 */}
          <div className="w-full pt-1 pb-2 flex flex-col items-center gap-2 shrink-0">
            <div className="w-full text-center text-[#2B3049] text-[20px] font-extrabold leading-tight">
              智慧聯絡簿
            </div>

            {/* 左右切換按鈕區 (切換上一次上課的聯絡簿，到底變灰不能點選) */}
            <div className="w-full flex justify-center items-center gap-3">
              {/* 向左按鈕：切換至上一次（更早）的課堂 */}
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

              {/* 當前課堂日期標籤 */}
              <div className="text-[#68C5AB] text-[14px] font-bold tracking-tight">
                {formatLessonHeaderDate(currentRecord?.created_at || '', currentRecord?.id || '')}
              </div>

              {/* 向右按鈕：切換至後一次（更新）的課堂 */}
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
            <div className="w-full text-center text-[#6F6F6F] text-[14px] font-normal truncate">
              {currentSongTitle}
            </div>
          </div>

          {/* 聯絡簿卡片主體與分頁圓點 */}
          <div className="w-full flex flex-col gap-2">
            
            {/* 圓點分頁指示器 (共 5 堂課，當前課堂呈現 8px 碧綠色，其餘 6px 半透明灰) */}
            <div className="w-full py-2 flex justify-center items-center gap-2">
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
                        ? 'w-2 h-2 bg-[#68C5AB]'
                        : 'w-1.5 h-1.5 bg-[#6F6F6F] opacity-30 hover:opacity-60'
                    }`}
                  />
                );
              })}
            </div>

            {/* 白色圓角卡片容器 (依據 Figma 規範完整精準切版) */}
            <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(104,197,171,0.25)] shadow-[0px_8px_24px_rgba(43,48,73,0.06)] flex flex-col gap-5">
              
              {/* 卡片頂部：AI 標籤、曲目、BPM 與授課教師 */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full flex justify-between items-start gap-2">
                  <div className="flex-1 flex flex-col items-start gap-1.5">
                    {/* AI 課堂情緒過濾 & 學習卡片 Badge */}
                    <div className="px-2 py-1 bg-[rgba(104,197,171,0.12)] rounded-lg inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D5CC6A]" />
                      <span className="text-[#D5CC6A] text-[12px] font-bold">
                        AI 課堂情緒過濾 & 學習卡片
                      </span>
                    </div>
                    {/* 曲目大標題 */}
                    <h2 className="text-[#2B3049] text-[20px] font-extrabold leading-7">
                      {currentSongTitle}
                    </h2>
                  </div>

                  {/* BPM 方塊 */}
                  <div className="w-16 px-2 py-1.5 bg-[rgba(104,197,171,0.06)] rounded-xl outline outline-1 outline-[#D5CC6A] flex flex-col items-center justify-center gap-0.5 shrink-0">
                    <Gauge className="w-4 h-4 text-[#D5CC6A]" />
                    <span className="text-[#D5CC6A] text-[12px] font-bold whitespace-nowrap">
                      BPM {summary.bpm_recommendation || 72}
                    </span>
                  </div>
                </div>

                {/* 授課教師與日期 */}
                <div className="text-[#6F6F6F] text-[12px] font-normal">
                  授課指導：{teacherName} · 課堂日期：{formatCardDate(currentRecord?.created_at || '', currentRecord?.id || '')}
                </div>
              </div>

              {/* 現場原音錄音播放條 (點擊切換播放/暫停) */}
              <div className="w-full p-3 bg-white rounded-2xl outline outline-1 outline-[rgba(104,197,171,0.25)] flex items-center gap-3 shadow-2xs">
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
                  <div className="w-full flex justify-between items-center text-[12px] text-[#6F6F6F]">
                    <span>{formatTime(audioSeconds)} / {formatTime(totalSeconds)}</span>
                    <Volume2 className="w-3.5 h-3.5 text-[#6F6F6F]" />
                  </div>
                </div>
              </div>

              {/* 分隔細線 */}
              <div className="w-full h-0 border-b border-[rgba(43,48,73,0.06)]" />

              {/* 一、本週技術與手型重點 */}
              <div className="w-full flex flex-col gap-3">
                <div className="px-2.5 py-1.5 bg-[rgba(104,197,171,0.08)] rounded-xl self-start flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#D5CC6A]" />
                  <span className="text-[#D5CC6A] text-[14px] font-bold">
                    本週技術與手型重點
                  </span>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {technicalTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="w-full p-3 bg-white rounded-xl outline outline-1 outline-[rgba(104,197,171,0.25)] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D5CC6A]" />
                        <span className="text-[#D5CC6A] text-[12px] font-bold">
                          手感重點 #{idx + 1}
                        </span>
                      </div>
                      <div className="text-[#2B3049] text-[14px] font-normal leading-[21px]">
                        {tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 二、樂理與節拍重點 */}
              <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(104,197,171,0.25)] flex flex-col gap-3">
                <div className="px-2 py-1 bg-white rounded-lg self-start flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#D5CC6A]" />
                  <span className="text-[#D5CC6A] text-[12px] font-bold">
                    樂理與節拍重點
                  </span>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {theoryTips.map((tip, idx) => (
                    <div key={idx} className="w-full flex items-start gap-2.5">
                      <div className="pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D5CC6A]/20 flex items-center justify-center text-[#D5CC6A] text-[10px] font-black">
                          ♪
                        </div>
                      </div>
                      <div className="flex-1 text-[#2B3049] text-[14px] font-normal leading-[21px]">
                        {tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 三、回家作業與練習指引 (點擊可切換完成狀態) */}
              <div className="w-full flex flex-col gap-3">
                <div className="px-2.5 py-1.5 bg-[rgba(206,171,152,0.10)] rounded-xl self-start flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CEAB98]" />
                  <span className="text-[#CEAB98] text-[14px] font-bold">
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
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[12px] font-bold transition-colors ${
                            isDone ? 'bg-[#68C5AB]' : 'bg-[#CEAB98]'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div
                          className={`flex-1 text-[#2B3049] text-[14px] font-normal transition-opacity ${
                            isDone ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {hw}
                        </div>
                        <div
                          className={`px-1.5 py-0.5 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-semibold transition-colors ${
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

              {/* 四、張老師課後小結 */}
              <div className="w-full p-3 bg-white rounded-xl outline outline-1 outline-[rgba(104,197,171,0.25)] flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#D5CC6A] fill-[#D5CC6A]" />
                  <span className="text-[#CEAB98] text-[12px] font-bold">
                    張老師課後小結
                  </span>
                </div>
                <div className="text-[#2B3049] text-[14px] font-normal leading-[21px]">
                  「{encouragementText}」
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* 底部固定五大功能 TabBar (聯絡簿 Active) */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar
            activeTab="summary"
            onMoreClick={() => setIsMenuOpen(true)}
          />
        </footer>

        {/* 側邊漢堡側選單抽屜 (點擊 TabBar 的「更多」時滑出) */}
        <StudentMoreDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

      </div>
    </div>
  );
}
