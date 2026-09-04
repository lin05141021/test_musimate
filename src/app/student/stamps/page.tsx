'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';
import {
  Mic,
  Star,
  Flame,
  Volume2,
  Sparkles,
  Headphones,
  Award,
  Music,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

// 印章樣式設定
interface StampData {
  slot_index: number;
  color: string;
  rotation: number;
  icon_type: 'note' | 'clef' | 'star' | 'flame' | 'headphone' | 'music' | 'sparkle';
  checked_date: string;
}

// 預設 18 顆已蓋印章 (嚴格比照 Figma 坐標與微傾斜角度)
const INITIAL_STAMPS: StampData[] = [
  { slot_index: 1, color: '#FFDDE2', rotation: -6, icon_type: 'note', checked_date: '08/17' },
  { slot_index: 2, color: '#D1F2EB', rotation: 5, icon_type: 'clef', checked_date: '08/18' },
  { slot_index: 3, color: '#E8D7F5', rotation: -4, icon_type: 'star', checked_date: '08/19' },
  { slot_index: 4, color: '#D4E6F1', rotation: 8, icon_type: 'flame', checked_date: '08/20' },
  { slot_index: 5, color: '#FDEBD0', rotation: -3, icon_type: 'headphone', checked_date: '08/21' },
  { slot_index: 6, color: '#FCF3CF', rotation: 6, icon_type: 'music', checked_date: '08/22' },
  { slot_index: 7, color: '#FFDDE2', rotation: -8, icon_type: 'sparkle', checked_date: '08/23' },
  { slot_index: 8, color: '#D1F2EB', rotation: 3, icon_type: 'note', checked_date: '08/24' },
  { slot_index: 9, color: '#E8D7F5', rotation: -5, icon_type: 'clef', checked_date: '08/25' },
  { slot_index: 10, color: '#D4E6F1', rotation: 7, icon_type: 'star', checked_date: '08/26' },
  { slot_index: 11, color: '#FDEBD0', rotation: -4, icon_type: 'flame', checked_date: '08/27' },
  { slot_index: 12, color: '#FCF3CF', rotation: 5, icon_type: 'headphone', checked_date: '08/28' },
  { slot_index: 13, color: '#FFDDE2', rotation: -7, icon_type: 'music', checked_date: '08/29' },
  { slot_index: 14, color: '#D1F2EB', rotation: 4, icon_type: 'sparkle', checked_date: '08/30' },
  { slot_index: 15, color: '#E8D7F5', rotation: -3, icon_type: 'note', checked_date: '08/31' },
  { slot_index: 16, color: '#D4E6F1', rotation: 6, icon_type: 'clef', checked_date: '09/01' },
  { slot_index: 17, color: '#FDEBD0', rotation: -6, icon_type: 'star', checked_date: '09/02' },
  { slot_index: 18, color: '#FCF3CF', rotation: 4, icon_type: 'flame', checked_date: '09/03' },
];

export default function StudentStampsPage() {
  const router = useRouter();

  // 集章核心狀態
  const [stampedCount, setStampedCount] = useState(18);
  const [streakDays, setStreakDays] = useState(7);
  const [stampList] = useState<StampData[]>(INITIAL_STAMPS);

  // 分頁切換 (第 1 頁: 1~30 格, 第 2 頁: 31~60 格)
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  // 更多功能抽屜
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  // 成就徽章數值
  const [rhythmScore] = useState(65);
  const [perfectCount] = useState(3);
  const [repertoireCount] = useState(8);

  // 渲染印章圖示輔助函數
  const renderStampIcon = (type: string) => {
    switch (type) {
      case 'note':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B3049" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="#2B3049" />
            <circle cx="18" cy="16" r="3" fill="#2B3049" />
          </svg>
        );
      case 'clef':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B3049" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <path d="M8 8c0-2.5 1.8-4 4-4s4 1.5 4 4c0 3-3 4-3 7 0 2 1.5 3 3 3" />
            <path d="M8 8c0 3 3 4 3 7 0 2-1.5 3-3 3" />
          </svg>
        );
      case 'star':
        return <Star className="w-5 h-5 text-[#2B3049] fill-[#2B3049]" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-[#2B3049] fill-[#2B3049]" />;
      case 'headphone':
        return <Headphones className="w-5 h-5 text-[#2B3049] stroke-[2.2]" />;
      case 'sparkle':
        return <Sparkles className="w-5 h-5 text-[#2B3049] fill-[#2B3049]" />;
      default:
        return <Music className="w-5 h-5 text-[#2B3049] stroke-[2.2]" />;
    }
  };

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
            <span className="text-[12px] font-bold text-[#CEAB98]">第 3 期</span>
            <span className="text-[11px] text-[#A3A7BA]">· 集章中</span>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 可滾動主內容區域 (垂直滾動) */}
        {/* ============================================================ */}
        <main className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] flex flex-col gap-3 pb-8">
          
          {/* 1. 標題與統計區塊 */}
          <section className="px-5 pt-3 pb-1 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#2B3049] text-[20px] font-bold tracking-tight">
                成就徽章與集章卡
              </h1>
              <p className="text-[#6F6F6F] text-[12px] font-normal">
                每一天的練習，都是通往夢想的音符 🎶
              </p>
            </div>

            {/* 連續打卡與本期已打卡統計卡片 */}
            <div className="p-3.5 bg-white shadow-[0px_4px_8px_rgba(201,162,89,0.08)] rounded-2xl border-[3px] border-[#FDEBD0] flex justify-between items-center">
              {/* 連續打卡 */}
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🔥</span>
                <div className="flex flex-col">
                  <span className="text-[#2B3049] text-[13px] font-extrabold">
                    連續打卡
                  </span>
                  <span className="text-[#E74C3C] text-[12px] font-bold">
                    {streakDays} 天
                  </span>
                </div>
              </div>

              {/* 垂直分割線 */}
              <div className="w-[2px] h-8 bg-[#ECEAE6]" />

              {/* 本期已打卡 */}
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🎹</span>
                <div className="flex flex-col">
                  <span className="text-[#2B3049] text-[13px] font-extrabold">
                    本期已集章
                  </span>
                  <span className="text-[#2B3049] text-[12px] font-bold">
                    {stampedCount} / 60 格
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 前往練習打卡快捷引導橫幅 */}
          <div className="px-5">
            <button
              type="button"
              onClick={() => router.push('/student/practice')}
              className="w-full p-3 bg-gradient-to-r from-[#68C5AB]/15 via-[#CEAB98]/20 to-[#68C5AB]/15 hover:from-[#68C5AB]/25 hover:to-[#CEAB98]/30 rounded-2xl border border-[#68C5AB]/30 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#68C5AB] text-white flex items-center justify-center shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-bold text-[#2B3049] group-hover:text-[#68C5AB] transition-colors">
                    今天也來練習打卡！
                  </div>
                  <div className="text-[11px] text-[#6F6F6F]">
                    錄音 15 秒即可獲得 AI 診斷並蓋上專屬章
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#68C5AB] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 3. 本期課程集章卡片 (Stamp Card) */}
          <section className="px-5 py-1 flex flex-col">
            <div className="p-4 bg-white shadow-[0px_8px_16px_rgba(43,48,73,0.03)] rounded-2xl border border-[rgba(43,48,73,0.06)] flex flex-col gap-4">
              
              {/* 頂部切換箭頭列 */}
              <div className="w-full flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-full border border-[rgba(43,48,73,0.06)] flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? 'bg-[#FAF6F0] text-[#A3A7BA] cursor-not-allowed opacity-60'
                      : 'bg-[#FAF6F0] text-[#2B3049] hover:bg-slate-100 cursor-pointer active:scale-95'
                  }`}
                  title="上一頁"
                >
                  <span className="text-[16px] font-extrabold">‹</span>
                </button>

                <div className="text-[#2B3049] text-[14px] font-extrabold tracking-wide">
                  本期課程 {currentPage === 1 ? '(1~30)' : '(31~60)'}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  disabled={currentPage === 2}
                  className={`w-8 h-8 rounded-full border border-[rgba(43,48,73,0.06)] flex items-center justify-center transition-all ${
                    currentPage === 2
                      ? 'bg-[#FAF6F0] text-[#A3A7BA] cursor-not-allowed opacity-60'
                      : 'bg-[#FAF6F0] text-[#2B3049] hover:bg-slate-100 cursor-pointer active:scale-95'
                  }`}
                  title="下一頁"
                >
                  <span className="text-[16px] font-extrabold">›</span>
                </button>
              </div>

              {/* 30 格集章網格 (5 欄 × 6 列) */}
              <div className="grid grid-cols-5 gap-y-3.5 gap-x-2.5 justify-items-center py-1">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const actualIndex = currentPage === 1 ? idx + 1 : idx + 31;
                  const isStamped = actualIndex <= stampedCount;
                  const stamp = stampList.find((s) => s.slot_index === actualIndex);

                  if (isStamped && stamp) {
                    return (
                      <div
                        key={actualIndex}
                        className="w-[50px] h-[50px] flex items-center justify-center"
                      >
                        {/* 旋轉彩色印章實體 */}
                        <div
                          className="w-[44px] h-[44px] rounded-[22px] shadow-[1px_3px_4px_rgba(43,48,73,0.15)] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: stamp.color,
                            transform: `rotate(${stamp.rotation}deg)`,
                          }}
                          title={`第 ${actualIndex} 次打卡 (${stamp.checked_date})`}
                          onClick={() => {
                            alert(`🏅 第 ${actualIndex} 次練習印章\n打卡日期：${stamp.checked_date}\n演奏回饋：節奏音準表現優異！`);
                          }}
                        >
                          {renderStampIcon(stamp.icon_type)}
                        </div>
                      </div>
                    );
                  }

                  // 未蓋章的空格子 (灰色線框 + 數字)
                  return (
                    <div
                      key={actualIndex}
                      className="w-[50px] h-[50px] flex items-center justify-center"
                    >
                      <div className="w-[44px] h-[44px] rounded-[22px] border-[1.5px] border-[rgba(43,48,73,0.25)] flex items-center justify-center text-[rgba(43,48,73,0.25)] text-[12px] font-bold">
                        {actualIndex}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 頁碼提示 */}
              <div className="w-full text-center text-[#7A7672] text-[12px] font-bold pt-1">
                第 {currentPage} 頁 / 共 2 頁
              </div>
            </div>
          </section>

          {/* 4. 成就徽章區塊 (🏅 成就徽章) */}
          <section className="px-5 py-2 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#2B3049] text-[16px] font-extrabold">
                🏅 成就徽章
              </h2>
              <p className="text-[#7A7672] text-[12px] font-bold">
                持續練習解鎖更多成就！
              </p>
            </div>

            {/* 5 大成就進度卡片列表 */}
            <div className="flex flex-col gap-2.5">
              
              {/* 徽章 1: 努力堅持 */}
              <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
                <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-11 h-11 bg-[#FDEBD0] rounded-full flex items-center justify-center text-[22px]">
                    🔥
                  </div>
                  <span className="text-[#2B3049] text-[12px] font-extrabold">
                    Lv.1
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="text-[#2B3049] text-[14px] font-extrabold">
                    🔥 努力堅持
                  </div>
                  <div className="text-[#7A7672] text-[12px] font-normal">
                    連續練習打卡天數
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FDEBD0] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (streakDays / 14) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                      {streakDays}/14
                    </span>
                  </div>
                </div>
              </div>

              {/* 徽章 2: 節奏大師 */}
              <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
                <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-11 h-11 bg-[#E8D7F5] rounded-full flex items-center justify-center text-[22px]">
                    ⭐
                  </div>
                  <span className="text-[#2B3049] text-[12px] font-extrabold">
                    Lv.2
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="text-[#2B3049] text-[14px] font-extrabold">
                    ⭐ 節奏大師
                  </div>
                  <div className="text-[#7A7672] text-[12px] font-normal">
                    AI 節奏穩定度評分達標
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E8D7F5] rounded-full transition-all duration-500"
                        style={{ width: `${rhythmScore}%` }}
                      />
                    </div>
                    <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                      {rhythmScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* 徽章 3: 音樂探索家 */}
              <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
                <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-11 h-11 bg-[#D1F2EB] rounded-full flex items-center justify-center text-[22px]">
                    🎵
                  </div>
                  <span className="text-[#2B3049] text-[12px] font-extrabold">
                    Lv.1
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="text-[#2B3049] text-[14px] font-extrabold">
                    🎵 音樂探索家
                  </div>
                  <div className="text-[#7A7672] text-[12px] font-normal">
                    累積練習曲目數
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D1F2EB] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (repertoireCount / 10) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                      {repertoireCount}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* 徽章 4: 完美演奏 */}
              <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
                <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-11 h-11 bg-[#FFDDE2] rounded-full flex items-center justify-center text-[22px]">
                    ✨
                  </div>
                  <span className="text-[#2B3049] text-[12px] font-extrabold">
                    Lv.1
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="text-[#2B3049] text-[14px] font-extrabold">
                    ✨ 完美演奏
                  </div>
                  <div className="text-[#7A7672] text-[12px] font-normal">
                    單次 AI 評分達 90 分以上
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFDDE2] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (perfectCount / 5) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                      {perfectCount}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* 徽章 5: 認真學員 */}
              <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
                <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-11 h-11 bg-[#D4E6F1] rounded-full flex items-center justify-center text-[22px]">
                    🎧
                  </div>
                  <span className="text-[#2B3049] text-[12px] font-extrabold">
                    Lv.2
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="text-[#2B3049] text-[14px] font-extrabold">
                    🎧 認真學員
                  </div>
                  <div className="text-[#7A7672] text-[12px] font-normal">
                    累計練琴時長達標
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4E6F1] rounded-full transition-all duration-500"
                        style={{ width: '80%' }}
                      />
                    </div>
                    <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                      24/30hr
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </main>

        {/* ============================================================ */}
        {/* 底部 TabBar */}
        {/* ============================================================ */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar
            activeTab="more"
            onMoreClick={() => setIsMoreDrawerOpen(true)}
          />
        </footer>

        {/* 更多功能側選單抽屜 */}
        <StudentMoreDrawer
          isOpen={isMoreDrawerOpen}
          onClose={() => setIsMoreDrawerOpen(false)}
        />

      </div>
    </div>
  );
}
