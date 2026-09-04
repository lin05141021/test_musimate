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
      if (pathname === '/student/practice' || pathname.startsWith('/student/compare')) {
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
        // 日曆圖示：外框 + 頂部掛耳 + 分隔線 + 6顆圓點，彩虹漸層
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" />
          <line x1="3.5" y1="9" x2="20.5" y2="9" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.6" />
          <line x1="7.5" y1="2.5" x2="7.5" y2="5" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16.5" y1="2.5" x2="16.5" y2="5" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="7.5" cy="12.5" r="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <circle cx="12" cy="12.5" r="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <circle cx="16.5" cy="12.5" r="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <circle cx="7.5" cy="16" r="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <circle cx="12" cy="16" r="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <circle cx="16.5" cy="16" r="1.1" fill="url(#tabbar-rainbow-gradient)" />
        </svg>
      ),
    },
    {
      key: 'summary' as const,
      label: '聯絡簿',
      href: '/student/summary/lesson-1',
      icon: (
        // 任務清單/剪貼板圖示：頂部夾扣 + 打勾標記，彩虹漸層
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4.5" width="16" height="16.5" rx="3" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" />
          <path d="M8.5 4.5V3.5C8.5 2.7 9.2 2 10 2H14C14.8 2 15.5 2.7 15.5 3.5V4.5" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.5 12.8L10.8 15.2L15.8 9.8" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: 'practice' as const,
      label: '打卡',
      href: '/student/practice',
      icon: (
        // 音符練習圖示：底層折疊卡片 + 音符卡片，彩虹漸層
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 7.5V18.5C3.5 19.6 4.4 20.5 5.5 20.5H16.5" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="6" y="3.5" width="15" height="15" rx="3" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" />
          <ellipse cx="11.5" cy="13.5" rx="2" ry="1.6" fill="url(#tabbar-rainbow-gradient)" />
          <path d="M13.2 13.5V8C13.2 8 14.5 9.2 16.5 9.2" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: 'billing' as const,
      label: '繳費',
      href: '/student/billing',
      icon: (
        // 信用卡圖示：磁條 + 晶片，彩虹漸層
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4.5" width="18" height="15" rx="3" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="1.8" />
          <line x1="3" y1="8.8" x2="21" y2="8.8" stroke="url(#tabbar-rainbow-gradient)" strokeWidth="2" />
          <rect x="14" y="13" width="4" height="2.5" rx="0.8" fill="url(#tabbar-rainbow-gradient)" />
        </svg>
      ),
    },
    {
      key: 'more' as const,
      label: '更多',
      href: '#more',
      icon: (
        // 更多圖示：三條彩虹漸層橫線 (對齊 Figma 規範)
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="2.2" rx="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <rect x="3" y="11" width="18" height="2.2" rx="1.1" fill="url(#tabbar-rainbow-gradient)" />
          <rect x="3" y="16" width="18" height="2.2" rx="1.1" fill="url(#tabbar-rainbow-gradient)" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 注入共用的彩虹線性漸層定義 */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tabbar-rainbow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9A259" stopOpacity="0.85" />
            <stop offset="24%" stopColor="#D5CC6A" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#68C5AB" stopOpacity="0.85" />
            <stop offset="77%" stopColor="#6293CC" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#BB65B3" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="tabbar-dots-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B28CE5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7F66BF" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* 底部 TabBar 主容器 (寬度 360px 水彩底，適配 Google Pixel 9a) */}
      <nav
        role="navigation"
        aria-label="學生端功能導航"
        className={`w-full max-w-[360px] mx-auto border-t border-[#E5E5E5] flex flex-col items-center select-none ${className}`}
        style={{
          paddingTop: '8px',
          paddingBottom: '12px',
          paddingLeft: '8px',
          paddingRight: '8px',
          backgroundImage: "url('/water_color.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#FAF7F2',
          boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)',
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
                {/* 圖標外圓：Active 時為純白立體高亮圓形 (40px x 40px) */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] scale-105'
                      : 'bg-transparent hover:bg-white/40'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {tab.icon}
                  </div>
                </div>

                {/* 標籤文字：Active 時深色清晰，Inactive 時灰色中性 */}
                <span
                  className={`text-[10px] text-center tracking-tight transition-colors duration-150 ${
                    isActive ? 'text-[#332C27] font-bold' : 'text-[#8C8C8C] font-medium'
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
