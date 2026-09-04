'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentSummaryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 預設導向至最新課堂聯絡簿 (或 lesson-1)
    router.replace('/student/summary/lesson-1');
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-[#FAF6F0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#68C5AB] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#6F6F6F] font-['Sora']">
          正在載入智慧聯絡簿...
        </span>
      </div>
    </div>
  );
}
