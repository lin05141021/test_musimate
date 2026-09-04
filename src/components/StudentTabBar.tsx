'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface StudentTabBarProps {
  activeTab?: 'schedule' | 'summary' | 'practice' | 'billing' | 'more';
  onTabChange?: (tabKey: 'schedule' | 'summary' | 'practice' | 'billing' | 'more') => void;
  onMoreClick?: () => void;
  className?: string;
}

export const StudentTabBar: React.FC<StudentTabBarProps> = ({
  activeTab: controlledActiveTab,
  onTabChange,
  onMoreClick,
  className = '',
}) => {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const action = searchParams ? searchParams.get('action') : null;

  // 自動依據路徑推導當前 Active Tab (也可由外部 props 強制指定)
  const currentTab =
    controlledActiveTab ||
    (() => {
      if (action === 'billing' || pathname.startsWith('/student/billing')) {
        return 'billing';
      }
      if (pathname.startsWith('/student/summary')) {
        return 'summary';
      }
      if (pathname === '/student/practice' || pathname.startsWith('/student/compare') || pathname.startsWith('/student/stamps')) {
        return 'practice';
      }
      return 'schedule'; // 預設為課表
    })();

  const tabs = [
    {
      key: 'schedule' as const,
      label: '課表',
      href: '/student/schedule',
      icon: (
        // 課表日曆：實體彩虹漸層日曆 + 頂部掛耳 + 6 顆純白挖空圓點 (嚴格對齊使用者提供的實心漸層圖標)
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 頂部兩根掛耳 */}
          <rect x="6.5" y="2" width="2.8" height="4.5" rx="1.4" fill="url(#tabbar-rainbow-gradient)" />
          <rect x="14.7" y="2" width="2.8" height="4.5" rx="1.4" fill="url(#tabbar-rainbow-gradient)" />
          {/* 日曆主體實心漸層 */}
          <rect x="3" y="5" width="18" height="16" rx="4" fill="url(#tabbar-rainbow-gradient)" />
          {/* 內部 6 顆純白挖空圓點 (2排 x 3欄) */}
          <circle cx="7.2" cy="11.5" r="1.3" fill="#FFFFFF" />
          <circle cx="12" cy="11.5" r="1.3" fill="#FFFFFF" />
          <circle cx="16.8" cy="11.5" r="1.3" fill="#FFFFFF" />
          <circle cx="7.2" cy="16" r="1.3" fill="#FFFFFF" />
          <circle cx="12" cy="16" r="1.3" fill="#FFFFFF" />
          <circle cx="16.8" cy="16" r="1.3" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      key: 'summary' as const,
      label: '聯絡簿',
      href: '/student/summary/lesson-1',
      icon: (
        // 聯絡簿清單：實體彩虹漸層剪貼簿 + 純白打勾挖空標記
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 頂部金屬夾扣 */}
          <rect x="8.5" y="2" width="7" height="3.5" rx="1.5" fill="url(#tabbar-rainbow-gradient)" />
          {/* 聯絡簿本體實心漸層 */}
          <rect x="3.5" y="4.5" width="17" height="16.5" rx="3.5" fill="url(#tabbar-rainbow-gradient)" />
          {/* 純白打勾挖空細節 */}
          <path
            d="M8 12.8L10.8 15.6L16 10"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: 'practice' as const,
      label: '打卡',
      href: '/student/practice',
      icon: (
        // 練習打卡：底層疊卡 + 實體彩虹漸層音符樂譜卡片 + 純白音符挖空圖示
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 底層折疊紙頁陰影輪廓 */}
          <path
            d="M3.5 7.5V18.5C3.5 19.9 4.6 21 6 21H17"
            stroke="url(#tabbar-rainbow-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 主卡片實心漸層 */}
          <rect x="6" y="3" width="15" height="15.5" rx="3.5" fill="url(#tabbar-rainbow-gradient)" />
          {/* 純白音樂八分音符挖空圖形 */}
          <ellipse cx="11.2" cy="13.2" rx="2.2" ry="1.7" fill="#FFFFFF" />
          <path
            d="M13.2 13.2V7.2C13.2 7.2 14.2 8.5 16.5 8.5"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: 'billing' as const,
      label: '繳費',
      href: '/student/billing',
      icon: (
        // 繳費信用卡：實體彩虹漸層卡片本體 + 純白晶片挖空矩形 (嚴格對齊使用者提供的實心漸層圖標)
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 卡片主體實心漸層 */}
          <rect x="2.5" y="4.5" width="19" height="14.5" rx="3.5" fill="url(#tabbar-rainbow-gradient)" />
          {/* 右下角純白晶片/感應區挖空矩形 */}
          <rect x="13.5" y="11.5" width="5.5" height="4.5" rx="1.2" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      key: 'more' as const,
      label: '更多',
      href: '#more',
      icon: (
        // 更多漢堡選單：三條實體彩虹漸層厚膠囊條 (嚴格對齊使用者提供的實心漸層圖標)
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5.8" width="18" height="2.8" rx="1.4" fill="url(#tabbar-rainbow-gradient)" />
          <rect x="3" y="10.8" width="18" height="2.8" rx="1.4" fill="url(#tabbar-rainbow-gradient)" />
          <rect x="3" y="15.8" width="18" height="2.8" rx="1.4" fill="url(#tabbar-rainbow-gradient)" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 注入共用的彩虹線性漸層定義 (依使用者指定數值精確定義) */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tabbar-rainbow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9A259" stopOpacity="0.95" />
            <stop offset="24%" stopColor="#D5CC6A" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#68C5AB" stopOpacity="0.95" />
            <stop offset="77%" stopColor="#6293CC" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#BB65B3" stopOpacity="0.95" />
          </linearGradient>
        </defs>
      </svg>

      {/* 底部 TabBar 主容器：
          - 使用者水彩底圖旋轉90度 (water_color_nav.png) + fill (cover) 設定
          - 特別加入溫暖輕柔覆蓋層 (避免太紫造成 icon 不清楚，凸顯高雅通透水彩質感)
      */}
      <nav
        role="navigation"
        aria-label="學生端功能導航"
        className={`w-full max-w-[360px] mx-auto border-t border-[#EAE3D6] flex flex-col items-center select-none ${className}`}
        style={{
          paddingTop: '8px',
          paddingBottom: '12px',
          paddingLeft: '8px',
          paddingRight: '8px',
          background:
            "linear-gradient(0deg, rgba(250, 246, 240, 0.72) 0%, rgba(255, 255, 255, 0.60) 100%), url('/water_color_nav.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#FAF7F2',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* 五大功能項目橫向均分 */}
        <div className="w-full flex items-center justify-between">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            const isMore = tab.key === 'more';

            const content = (
              <div
                className="flex-1 flex flex-col items-center justify-center cursor-pointer group transition-transform active:scale-95 py-0.5"
                style={{ gap: '4px' }}
              >
                {/* 圖標外圓：
                    - Active 時為純白立體高亮圓形 (40px x 40px)
                    - Inactive 時具備半透明純白襯底 (bg-white/65)，確保圖標在水彩背景上 100% 清晰分明、永不被底圖紫色遮蔽或混淆！
                */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-[0_3px_10px_rgba(0,0,0,0.12)] scale-105 border border-white'
                      : 'bg-white/65 hover:bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-white/50'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {tab.icon}
                  </div>
                </div>

                {/* 標籤文字：Active 時深色清晰，Inactive 時溫暖灰色 */}
                <span
                  className={`text-[11px] text-center tracking-tight transition-colors duration-150 ${
                    isActive ? 'text-[#2B3049] font-bold' : 'text-[#7D766E] font-semibold'
                  }`}
                  style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
                >
                  {tab.label}
                </span>
              </div>
            );

            if (isMore) {
              return (
                <div
                  key={tab.key}
                  className="flex-1"
                  onClick={() => {
                    onMoreClick?.();
                    onTabChange?.(tab.key);
                  }}
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={tab.key}
                href={tab.href}
                replace={true}
                className="flex-1"
                onClick={() => onTabChange?.(tab.key)}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default StudentTabBar;
