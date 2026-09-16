'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { StudentTabBar } from './StudentTabBar';
import { StudentMoreDrawer } from './StudentMoreDrawer';

export function MobileContainer({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { activeStudentId } = useDemoContext();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const hasDispatchedRef = useRef(false);

  // 游標 / 點擊指示小圓點 (Visual Click & Cursor Indicator for Recording)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isClicking, setIsClicking] = useState(false);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let x = 0;
      let y = 0;
      if ('touches' in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ('clientX' in e) {
        x = (e as MouseEvent).clientX;
        y = (e as MouseEvent).clientY;
      }
      setCursorPos({ x, y });
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      let x = 0;
      let y = 0;
      if ('touches' in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ('clientX' in e) {
        x = (e as MouseEvent).clientX;
        y = (e as MouseEvent).clientY;
      }
      setCursorPos({ x, y });
      setIsClicking(true);

      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev.slice(-6), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 550);
    };

    const handleUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    window.addEventListener('touchstart', handleDown, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // 全域 LIFF 路由智慧分發器：攔截所有來自 LINE 的 liff.state / redirect 參數並即時跳轉至對應頁面 (僅在初始掛載執行 1 次，避免循環觸發)
  useEffect(() => {
    if (typeof window === 'undefined' || hasDispatchedRef.current) return;

    try {
      const currentPath = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(search);

      let target: string | null = urlParams.get('redirect') || urlParams.get('to') || urlParams.get('target');
      let page = urlParams.get('page');
      let action = urlParams.get('action');
      const liffClientId = urlParams.get('liffClientId');

      // 1. 檢查 liff.state (可能在 query 或 hash 中)
      const liffStateRaw = urlParams.get('liff.state') || (hash.includes('liff.state=') ? hash.split('liff.state=')[1]?.split('&')[0] : null);

      if (liffStateRaw) {
        let decoded = decodeURIComponent(liffStateRaw);
        if (decoded.includes('%')) {
          try { decoded = decodeURIComponent(decoded); } catch (e) {}
        }
        if (decoded.startsWith('?') || decoded.startsWith('&')) {
          decoded = decoded.substring(1);
        }

        const stateParams = new URLSearchParams(decoded);
        const stateRedirect = stateParams.get('redirect') || stateParams.get('to') || stateParams.get('target');
        const statePage = stateParams.get('page');
        const stateAction = stateParams.get('action');

        if (stateRedirect) target = stateRedirect;
        if (statePage && !target) page = statePage;
        if (stateAction && !target) action = stateAction;

        // 關鍵字模糊匹配
        if (!target && !action && !page) {
          if (decoded.includes('faq')) target = '/student/faq';
          else if (decoded.includes('practice')) target = '/student/practice';
          else if (decoded.includes('summary') || decoded.includes('report')) target = '/student/summary/lesson-7';
          else if (decoded.includes('stamps')) target = '/student/stamps';
          else if (decoded.includes('billing')) target = '/student/billing';
          else if (decoded.includes('history')) target = '/student/history';
          else if (decoded.includes('contracts')) target = '/student/contracts';
          else if (decoded.includes('courses') || decoded.includes('newclass')) target = '/student/courses';
          else if (decoded.includes('more')) target = '/student/more';
          else if (decoded.includes('reschedule') || decoded.includes('leave')) action = 'reschedule';
        }
      }

      // 2. 檢查 page 參數
      if (!target && page) {
        if (page === 'faq') target = '/student/faq';
        else if (page === 'practice') target = '/student/practice';
        else if (page === 'summary' || page === 'report') target = '/student/summary/lesson-7';
        else if (page === 'stamps') target = '/student/stamps';
        else if (page === 'billing') target = '/student/billing';
        else if (page === 'history') target = '/student/history';
        else if (page === 'contracts') target = '/student/contracts';
        else if (page === 'courses' || page === 'newclass') target = '/student/courses';
        else if (page === 'more') target = '/student/more';
        else if (page === 'reschedule' || page === 'leave') action = 'reschedule';
        else target = page.startsWith('/') ? page : `/student/${page}`;
      }

      // 3. 檢查 action 參數
      if (!target && (action === 'reschedule' || action === 'leave')) {
        if (currentPath !== '/student/schedule') {
          target = '/student/schedule?action=reschedule';
        }
      }

      // 4. 檢查專屬 LIFF Client ID
      if (!target && liffClientId) {
        if (liffClientId === '2011164851-3YNtzchu') {
          if (currentPath !== '/student/schedule') {
            target = '/student/schedule?action=reschedule';
          }
        } else if (liffClientId === '2011164851-id3vAnRx') {
          target = '/student/courses';
        }
      }

      // 5. 若已解析出明確目標且與當前路徑不同，使用 SPA router.replace 執行跳轉（不破壞 LINE Webview Session）
      if (target) {
        if (!target.startsWith('/')) target = '/' + target;
        const targetPathOnly = target.split('?')[0];
        if (currentPath !== targetPathOnly || (target.includes('action=') && !search.includes('action='))) {
          hasDispatchedRef.current = true;
          console.log('[MobileContainer] LIFF Client-Side Router ->', target);
          router.replace(target);
        }
      }
    } catch (err) {
      console.warn('[MobileContainer] LIFF Router Error:', err);
    }
  }, [router]);

  // 動態判定當前頁面表頭徽章 (繳費、FAQ、新課程等獨立功能頁不顯示「第 3 期」)
  const renderHeaderBadge = () => {
    if (pathname.includes('/student/schedule')) {
      let termBadge = '第 3 期';
      if (activeStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150') {
        termBadge = '第 1 期 (7/10)';
      } else if (activeStudentId === 'b0000000-0000-0000-0000-000000000001') {
        termBadge = '第 1 期 (3/10)';
      } else if (activeStudentId === '55555555-5555-4555-b555-555555555555') {
        termBadge = '第 3 期 (6/10)';
      } else {
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#4DADB8]">新生探索</span>
            <span className="text-[11px] text-[#A3A7BA]">· 預約體驗</span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#68C5AB]">{termBadge}</span>
          <span className="text-[11px] text-[#A3A7BA]">· 進行中</span>
        </div>
      );
    }
    if (pathname.includes('/student/practice')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#49BB87]">練琴打卡</span>
          <span className="text-[11px] text-[#A3A7BA]">· 每日激勵</span>
        </div>
      );
    }
    if (pathname.includes('/student/summary')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#E5A100]">智慧聯絡簿</span>
          <span className="text-[11px] text-[#A3A7BA]">· 課後週報</span>
        </div>
      );
    }
    if (pathname.includes('/student/stamps')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#4A72E8]">集章冊</span>
          <span className="text-[11px] text-[#A3A7BA]">· 成就徽章</span>
        </div>
      );
    }
    if (pathname.includes('/student/billing')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#82AAD8]">繳費核對</span>
          <span className="text-[11px] text-[#A3A7BA]">· 憑證上傳</span>
        </div>
      );
    }
    if (pathname.includes('/student/faq')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#B58EBE]">FAQ</span>
          <span className="text-[11px] text-[#A3A7BA]">· 常見問題</span>
        </div>
      );
    }
    if (pathname.includes('/student/courses')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#4DADB8]">新課程</span>
          <span className="text-[11px] text-[#A3A7BA]">· 預約試上</span>
        </div>
      );
    }
    if (pathname.includes('/student/history')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#4A8FD9]">歷史紀錄</span>
          <span className="text-[11px] text-[#A3A7BA]">· 課程與繳費</span>
        </div>
      );
    }
    if (pathname.includes('/student/more')) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#9B7EC8]">選單</span>
          <span className="text-[11px] text-[#A3A7BA]">· 更多功能</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] md:bg-[#EDE8DE] text-[#2B3049] flex flex-col items-center justify-start antialiased selection:bg-[#68C5AB] selection:text-white py-0 md:py-4 font-['Sora',sans-serif]">
      <div className="w-full md:max-w-md min-h-screen md:min-h-[92vh] flex flex-col bg-[#FAF6F0] border-0 md:border-x md:border-[#EBDCB9] shadow-none md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:rounded-3xl relative pb-20 overflow-x-hidden">
        
        {/* 頂部 Musi Mate Logo 標頭 */}
        <header className="w-full h-14 px-5 py-3 bg-[#FAF6F0]/90 border-b border-[#F0EAE1]/80 flex justify-between items-center shrink-0 z-20 backdrop-blur-xs">
          <img
            src="/UI/logo.png"
            alt="Musi Mate"
            className="h-8 object-contain object-left cursor-pointer"
            onClick={() => {
              router.push('/student/schedule');
            }}
          />
          {renderHeaderBadge()}
        </header>

        {/* 頁面主要內容 */}
        <main className="flex-1 w-full p-4 overflow-y-auto">
          {children}
        </main>

        {/* 底部導覽列 (StudentTabBar 彩虹水彩選單) */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
          <StudentTabBar onMoreClick={() => setIsMoreDrawerOpen(true)} />
        </div>

        {/* 側邊更多功能抽屜 */}
        <StudentMoreDrawer
          isOpen={isMoreDrawerOpen}
          onClose={() => setIsMoreDrawerOpen(false)}
        />

        {/* 全域點擊/游標動態小圓點 (錄影與展示專用) */}
        {cursorPos && (
          <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
            {ripples.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
                style={{
                  left: r.x,
                  top: r.y,
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'rgba(239, 68, 68, 0.45)',
                  border: '2px solid rgba(239, 68, 68, 0.9)',
                }}
              />
            ))}
            <div
              className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 flex items-center justify-center"
              style={{
                left: cursorPos.x,
                top: cursorPos.y,
                width: '24px',
                height: '24px',
                backgroundColor: isClicking ? 'rgba(220, 38, 38, 0.95)' : 'rgba(239, 68, 68, 0.85)',
                border: '2.5px solid #ffffff',
                transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.8), 0 2px 6px rgba(0, 0, 0, 0.45)',
              }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

