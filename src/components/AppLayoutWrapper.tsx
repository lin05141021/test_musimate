'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '';
  const isStudentPage = pathname.startsWith('/student');
  const isTeacherPage = pathname.startsWith('/teacher');

  // 全域 LIFF 路由智慧分發器：攔截所有來自 LINE 的 liff.state / redirect 參數並即時跳轉至對應頁面
  useEffect(() => {
    if (typeof window === 'undefined') return;

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

        const matchRedirect = decoded.match(/redirect=([^&]+)/);
        if (matchRedirect) target = matchRedirect[1];

        const matchPage = decoded.match(/page=([^&]+)/);
        if (matchPage && !target) page = matchPage[1];

        const matchAction = decoded.match(/action=([^&]+)/);
        if (matchAction && !target) action = matchAction[1];

        // 關鍵字模糊匹配
        if (!target && !action && !page) {
          if (decoded.includes('practice')) target = '/student/practice';
          else if (decoded.includes('summary')) target = '/student/summary/lesson-1';
          else if (decoded.includes('stamps')) target = '/student/stamps';
          else if (decoded.includes('billing')) target = '/student/billing';
          else if (decoded.includes('history')) target = '/student/history';
          else if (decoded.includes('faq')) target = '/student/faq';
          else if (decoded.includes('contracts')) target = '/student/contracts';
          else if (decoded.includes('courses') || decoded.includes('newclass')) target = '/student/courses';
          else if (decoded.includes('reschedule') || decoded.includes('leave')) action = 'reschedule';
        }
      }

      // 2. 檢查 page 參數
      if (!target && page) {
        if (page === 'practice') target = '/student/practice';
        else if (page === 'summary') target = '/student/summary/lesson-1';
        else if (page === 'stamps') target = '/student/stamps';
        else if (page === 'billing') target = '/student/billing';
        else if (page === 'history') target = '/student/history';
        else if (page === 'faq') target = '/student/faq';
        else if (page === 'contracts') target = '/student/contracts';
        else if (page === 'courses' || page === 'newclass') target = '/student/courses';
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
        if (liffClientId === '2011164851-3YNtzchu') { // 調課請假專屬 LIFF
          if (currentPath !== '/student/schedule') {
            target = '/student/schedule?action=reschedule';
          }
        } else if (liffClientId === '2011164851-id3vAnRx') { // 開始新課程專屬 LIFF
          target = '/student/courses';
        }
      }

      // 5. 若已解析出明確目標且與當前路徑不同，立即執行跳轉
      if (target) {
        if (!target.startsWith('/')) target = '/' + target;
        const targetPathOnly = target.split('?')[0];
        if (currentPath !== targetPathOnly || (target.includes('action=') && !search.includes('action='))) {
          console.log('[AppLayoutWrapper] LIFF Smart Dispatch ->', target);
          window.location.replace(target);
        }
      }
    } catch (err) {
      console.warn('[AppLayoutWrapper] LIFF Router Error:', err);
    }
  }, [pathname]);

  // 如果是在學生端手機版頁面（/student/*）或教師端頁面（/teacher/*），
  // 完全移除全站通用舊版 Navbar 與 Footer，讓各子系統自帶專屬沉浸式頂部導航
  if (isStudentPage || isTeacherPage) {
    return (
      <div className="w-full min-h-screen bg-[#FAF6F0]">
        {children}
      </div>
    );
  }

  // 老師端或系統首頁 (桌面版模式)
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="border-t border-[#EFECE6] py-6 text-center text-xs text-[#7A736E] bg-white/80 backdrop-blur-md mt-12">
        Harmonix AI Studio &copy; {new Date().getFullYear()} - 溫暖音樂教室 AI 小幫手 (MVP Version)
      </footer>
    </>
  );
};

export default AppLayoutWrapper;
