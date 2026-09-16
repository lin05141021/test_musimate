'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';

export default function LiffEntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let redirect = urlParams.get('redirect');
      let page = urlParams.get('page');
      let action = urlParams.get('action');

      if (urlParams.get('liff.state')) {
        try {
          let liffState = decodeURIComponent(urlParams.get('liff.state') || '');
          if (liffState.includes('%')) {
            try { liffState = decodeURIComponent(liffState); } catch (e) {}
          }
          if (liffState.startsWith('?') || liffState.startsWith('&')) {
            liffState = liffState.substring(1);
          }
          const stateParams = new URLSearchParams(liffState);
          const stateRedirect = stateParams.get('redirect') || stateParams.get('to') || stateParams.get('target');
          const statePage = stateParams.get('page');
          const stateAction = stateParams.get('action');

          if (stateRedirect) redirect = stateRedirect;
          if (statePage && !redirect) page = statePage;
          if (stateAction && !redirect) action = stateAction;

          if (!redirect && !action && !page) {
            if (liffState.includes('faq')) redirect = '/student/faq';
            else if (liffState.includes('reschedule') || liffState.includes('leave')) action = 'reschedule';
            else if (liffState.includes('practice')) redirect = '/student/practice';
            else if (liffState.includes('summary') || liffState.includes('report')) redirect = '/student/summary/lesson-1';
            else if (liffState.includes('stamps')) redirect = '/student/stamps';
            else if (liffState.includes('billing')) redirect = '/student/billing';
            else if (liffState.includes('history')) redirect = '/student/history';
            else if (liffState.includes('courses') || liffState.includes('newclass')) redirect = '/student/courses';
            else if (liffState.includes('more')) redirect = '/student/more';
          }
        } catch (e) {
          console.warn('liff.state parse error:', e);
        }
      }

      if (redirect) {
        router.replace(redirect);
      } else if (action === 'reschedule' || action === 'leave' || page === 'leave' || page === 'reschedule') {
        const lid = urlParams.get('lesson_id');
        router.replace(`/student/schedule?action=reschedule${lid ? `&lesson_id=${lid}` : ''}`);
      } else if (page === 'practice') {
        router.replace('/student/practice');
      } else if (page === 'summary' || page === 'report') {
        router.replace('/student/summary/lesson-1');
      } else if (page === 'stamps') {
        router.replace('/student/stamps');
      } else if (page === 'contracts' || page === 'billing') {
        router.replace('/student/billing');
      } else if (page === 'history') {
        router.replace('/student/history');
      } else if (page === 'faq') {
        router.replace('/student/faq');
      } else if (page === 'courses' || page === 'newclass') {
        router.replace('/student/courses');
      } else if (page === 'more') {
        router.replace('/student/more');
      } else {
        const queryStudentId =
          urlParams.get('student_id') ||
          urlParams.get('line_user_id') ||
          urlParams.get('user_id') ||
          urlParams.get('student') ||
          urlParams.get('mock_user') ||
          localStorage.getItem('musimate_student_id');

        const queryStr = urlParams.toString();
        if (queryStudentId && queryStudentId !== 'new_student' && queryStudentId !== 'guest') {
          router.replace(queryStr ? `/student/schedule?${queryStr}` : `/student/schedule?student_id=${encodeURIComponent(queryStudentId)}`);
        } else {
          // 未帶身分訪客/新生：引導至 8 大樂器探索與預約試上體驗頁
          router.replace('/student/courses');
        }
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
        <Music className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-amber-200">MusiMate 音符助理</h2>
        <p className="text-xs text-stone-400">正在引導您前往專屬學生學習中心...</p>
      </div>
    </div>
  );
}
