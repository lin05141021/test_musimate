'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// 預設 19 顆已蓋印章 (含 09/13 第 19 顆印章)
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
  { slot_index: 19, color: '#FFDDE2', rotation: -5, icon_type: 'sparkle', checked_date: '09/13' },
];

export default function StudentStampsPage() {
  const router = useRouter();

  // 集章核心狀態 (預設 19 枚印章)
  const [stampedCount, setStampedCount] = useState(19);
  const [streakDays, setStreakDays] = useState(8);
  const [stampList, setStampList] = useState<StampData[]>(INITIAL_STAMPS);

  useEffect(() => {
    fetch('/api/student/stamps')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const apiCount = Math.max(19, json.data.stamped_count || 19);
          setStampedCount(apiCount);
          if (json.data.streak_days) setStreakDays(json.data.streak_days);
          if (Array.isArray(json.data.stamps) && json.data.stamps.length > 0) {
            setStampList(json.data.stamps);
          }
        }
      })
      .catch((err) => console.warn('載入集章失敗:', err));
  }, []);

  // 分頁切換 (第 1 頁: 1~30 格, 第 2 頁: 31~60 格)
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

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
    <div className="w-full flex flex-col gap-4 font-['Sora',sans-serif] select-none pb-12 animate-in fade-in">
      
      {/* 1. 標題與統計區塊 */}
      <section className="flex flex-col gap-2">
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
          <div className="w-[1px] h-8 bg-[#F0EAE1]" />

          {/* 本期已打卡 */}
          <div className="flex items-center gap-2">
            <span className="text-[20px]">⭐</span>
            <div className="flex flex-col">
              <span className="text-[#2B3049] text-[13px] font-extrabold">
                已累積集章
              </span>
              <span className="text-[#CEAB98] text-[12px] font-bold">
                {stampedCount} / 60 格
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 60 格集章卡主體 (30 格分頁切換) */}
      <section className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#C9A259]" />
            <span className="text-[#2B3049] text-[14px] font-bold">
              第 3 期 60 格集章冊
            </span>
          </div>

          {/* 分頁按鈕切換 */}
          <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E8E1D5]">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                currentPage === 1
                  ? 'bg-[#CEAB98] text-white shadow-xs'
                  : 'text-[#7A7672] hover:text-[#2B3049]'
              }`}
            >
              1 ~ 30
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                currentPage === 2
                  ? 'bg-[#CEAB98] text-white shadow-xs'
                  : 'text-[#7A7672] hover:text-[#2B3049]'
              }`}
            >
              31 ~ 60
            </button>
          </div>
        </div>

        {/* 集章卡 5 欄 x 6 列 (每頁 30 格) */}
        <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] shadow-sm">
          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: 30 }).map((_, i) => {
              const slotNumber = (currentPage - 1) * 30 + i + 1;
              const stamp = stampList.find((s) => s.slot_index === slotNumber);
              const isStamped = Boolean(stamp);

              return (
                <div
                  key={slotNumber}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                    isStamped
                      ? 'shadow-xs border border-black/5'
                      : 'bg-[#FAF6F0] border border-dashed border-[#E0D8CB]'
                  }`}
                  style={{
                    backgroundColor: isStamped ? stamp?.color : '#FAF6F0',
                    transform: isStamped ? `rotate(${stamp?.rotation || 0}deg)` : 'none',
                  }}
                >
                  {isStamped ? (
                    <div className="flex flex-col items-center justify-center">
                      {renderStampIcon(stamp?.icon_type || 'note')}
                      <span className="text-[9px] font-extrabold text-[#2B3049] mt-0.5 opacity-90">
                        {stamp?.checked_date}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[12px] font-bold text-[#A3A7BA]">
                      {slotNumber}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex justify-between items-center text-[11px] text-[#7A7672]">
            <span>🎯 累積滿 20 格可兌換「精美樂理文具組」</span>
            <button
              type="button"
              onClick={() => router.push('/student/practice')}
              className="font-bold text-[#CEAB98] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>前往打卡</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. 五大成就徽章清單 */}
      <section className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#C9A259]" />
          <span className="text-[#2B3049] text-[14px] font-bold">
            學員成就徽章
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          
          {/* 徽章 1: 晨光琴童 */}
          <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
            <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-11 h-11 bg-[#FFDDE2] rounded-full flex items-center justify-center text-[22px]">
                ☀️
              </div>
              <span className="text-[#2B3049] text-[12px] font-extrabold">
                Lv.1
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="text-[#2B3049] text-[14px] font-extrabold">
                🌅 晨光琴童
              </div>
              <div className="text-[#7A7672] text-[12px] font-normal">
                早晨 9:00 前完成練習打卡
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFDDE2] rounded-full transition-all duration-500"
                    style={{ width: '60%' }}
                  />
                </div>
                <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                  3/5次
                </span>
              </div>
            </div>
          </div>

          {/* 徽章 2: 節奏大師 */}
          <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
            <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-11 h-11 bg-[#D1F2EB] rounded-full flex items-center justify-center text-[22px]">
                🎵
              </div>
              <span className="text-[#2B3049] text-[12px] font-extrabold">
                Lv.2
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="text-[#2B3049] text-[14px] font-extrabold">
                🥁 節奏大師
              </div>
              <div className="text-[#7A7672] text-[12px] font-normal">
                連續 5 次 AI 節奏評分達 90 分以上
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D1F2EB] rounded-full transition-all duration-500"
                    style={{ width: '80%' }}
                  />
                </div>
                <span className="text-[#2B3049] text-[12px] font-bold shrink-0">
                  4/5次
                </span>
              </div>
            </div>
          </div>

          {/* 徽章 3: 百折不撓 */}
          <div className="p-3 bg-white rounded-2xl border border-[rgba(43,48,73,0.06)] flex items-start gap-3 shadow-xs">
            <div className="w-11 flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-11 h-11 bg-[#E8D7F5] rounded-full flex items-center justify-center text-[22px]">
                💪
              </div>
              <span className="text-[#2B3049] text-[12px] font-extrabold">
                Lv.1
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="text-[#2B3049] text-[14px] font-extrabold">
                🔥 百折不撓
              </div>
              <div className="text-[#7A7672] text-[12px] font-normal">
                連續完成 7 天練習打卡
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-2 bg-[rgba(43,48,73,0.06)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#68C5AB] rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
                <span className="text-emerald-700 text-[12px] font-bold shrink-0 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已達成
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
