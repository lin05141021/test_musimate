'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { ContactSupportModal } from '@/components/ContactSupportModal';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Award,
  CreditCard,
  FileText,
  Plus,
  HelpCircle,
  Headphones,
  ChevronRight,
  User,
} from 'lucide-react';

function StudentMoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const {
    studentProfile,
    activeStudentId,
    allStudents,
  } = useDemoContext();

  const queryStudentId =
    searchParams?.get('student_id') ||
    searchParams?.get('line_user_id') ||
    searchParams?.get('user_id') ||
    searchParams?.get('student') ||
    searchParams?.get('mock_user');

  let resolvedStudentId = '';
  if (queryStudentId) {
    const qLower = queryStudentId.toLowerCase().trim();
    if (
      queryStudentId === 'U26ed3c0e48864aebdc244594cf780df0' ||
      queryStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150' ||
      qLower.includes('charles') ||
      qLower.includes('查爾斯') ||
      qLower.includes('許雅婷')
    ) {
      resolvedStudentId = '89e45974-7f00-4bfd-bd84-3eb26351a150';
    } else if (
      queryStudentId === 'U2a2f432d824e353e8eb3fbe579def2cf' ||
      queryStudentId === 'b0000000-0000-0000-0000-000000000001' ||
      queryStudentId === 'u0000000-0000-0000-0000-000000000004' ||
      qLower.includes('johnny') ||
      qLower.includes('阿堅') ||
      qLower.includes('陳子翔')
    ) {
      resolvedStudentId = 'b0000000-0000-0000-0000-000000000001';
    } else if (
      queryStudentId === 'Uf2457bf35e0d6d3060b60838d9a9c91c' ||
      queryStudentId === '55555555-5555-4555-b555-555555555555' ||
      qLower.includes('劉心悅') ||
      qLower.includes('心悅') ||
      qLower === 'lin'
    ) {
      resolvedStudentId = '55555555-5555-4555-b555-555555555555';
    }
  } else if (activeStudentId && activeStudentId !== 'new_student') {
    resolvedStudentId = activeStudentId;
  }

  const isVerified = Boolean(
    resolvedStudentId &&
    (resolvedStudentId === '55555555-5555-4555-b555-555555555555' ||
      resolvedStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150' ||
      resolvedStudentId === 'b0000000-0000-0000-0000-000000000001' ||
      allStudents.some((s) => s.student.id === resolvedStudentId && s.student.id !== 'new_student'))
  );

  const currentStudentId = resolvedStudentId;
  const currentStudentInfo = allStudents.find((s) => s.student.id === currentStudentId);

  const defaultFallbackName =
    currentStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150'
      ? '許雅婷 (Charles)'
      : currentStudentId === 'b0000000-0000-0000-0000-000000000001'
      ? '陳子翔 (Johnny)'
      : currentStudentId === '55555555-5555-4555-b555-555555555555'
      ? '劉心悅 (Lin)'
      : '新生訪客';

  const defaultFallbackAvatar =
    currentStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150'
      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
      : currentStudentId === 'b0000000-0000-0000-0000-000000000001'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      : currentStudentId === '55555555-5555-4555-b555-555555555555'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  const studentFullName = currentStudentInfo?.user?.name || defaultFallbackName;
  const cleanStudentName = studentFullName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const studentDisplayName = isVerified ? `${cleanStudentName} 同學` : '新生訪客 (未綁定)';
  const studentAvatarUrl = currentStudentInfo?.user?.avatar_url || defaultFallbackAvatar;
  const studentInstrument = currentStudentInfo?.instrument?.split(' ')[0] || '古典鋼琴';
  const studentPeriod = currentStudentId === '55555555-5555-4555-b555-555555555555' ? 3 : 1;
  const studentCourseSubtitle = isVerified ? `${studentInstrument}課 · 第${studentPeriod}期進行中` : '探索中 · 尚未綁定正式學員合約';

  return (
    <div className="w-full flex flex-col gap-4 font-['Sora',sans-serif] select-none pb-12 animate-in fade-in">
      
      {/* 頂部學員個人資料卡片 */}
      <div className="w-full p-5 bg-white rounded-2xl border border-[#F0EAE1] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[rgba(155,126,200,0.14)] border-2 border-[rgba(155,126,200,0.25)] flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={
                currentStudentInfo?.user?.avatar_url ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
              }
              alt={studentDisplayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[18px] font-extrabold text-[#2B3049] leading-tight">
              {studentDisplayName}
            </div>
            <div className="text-[12px] text-[#7A7E90] font-medium flex items-center gap-1.5">
              <span>{studentCourseSubtitle}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                已連線
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: 功能選單 */}
      <div className="w-full bg-white rounded-2xl border border-[#F0EAE1] p-4 shadow-xs flex flex-col gap-1">
        <div className="text-[#7A7E90] text-[11px] font-bold uppercase tracking-wider px-2 py-1">
          功能選單
        </div>

        {/* 1. 我的課表 */}
        <button
          type="button"
          onClick={() => router.push('/student/schedule')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FDF1EC] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#E8734A]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">我的課表</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 2. 請假/調課 */}
        <button
          type="button"
          onClick={() => router.push('/student/schedule?action=reschedule')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FDF1EC] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#E8734A]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">請假/調課</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 3. 智慧聯絡簿 */}
        <button
          type="button"
          onClick={() => router.push('/student/summary/lesson-7')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FEF7E6] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-[#E5A100]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">智慧聯絡簿</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 4. 練習打卡 */}
        <button
          type="button"
          onClick={() => router.push('/student/practice')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ECFAF3] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#49BB87]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">練習打卡</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 5. 成就徽章 */}
        <button
          type="button"
          onClick={() => router.push('/student/stamps')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F3F4FD] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-[#4A72E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">成就徽章與集章卡</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>
      </div>

      {/* Section 2: 課程與行政 */}
      <div className="w-full bg-white rounded-2xl border border-[#F0EAE1] p-4 shadow-xs flex flex-col gap-1">
        <div className="text-[#7A7E90] text-[11px] font-bold uppercase tracking-wider px-2 py-1">
          課程與帳務
        </div>

        {/* 6. 開始新課程 */}
        <button
          type="button"
          onClick={() => router.push('/student/courses')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F3F8FD] flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-[#2E86DE]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">預約新課程</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 7. 上傳繳費證明 */}
        <button
          type="button"
          onClick={() => router.push('/student/billing')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FCF3EB] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-[#E67E22]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">上傳繳費證明</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 8. 課程與繳費紀錄 */}
        <button
          type="button"
          onClick={() => router.push('/student/history')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5EEF8] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#8E44AD]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">課程與繳費紀錄</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 9. FAQ 常見問題 */}
        <button
          type="button"
          onClick={() => router.push('/student/faq')}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EAECEE] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-[#34495E]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">FAQ 常見問題</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>

        {/* 10. 聯繫系統客服 */}
        <button
          type="button"
          onClick={() => setIsSupportModalOpen(true)}
          className="w-full p-3 flex justify-between items-center hover:bg-[#FAF6F0] active:bg-[#F4ECE1] rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F8F5] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4 text-[#16A085]" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-bold text-[#2B3049]">聯繫系統客服</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
        </button>
      </div>

      {/* 聯繫客服彈窗 */}
      <ContactSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

    </div>
  );
}

export default function StudentMorePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-[#7A7E90]">載入中...</div>}>
      <StudentMoreContent />
    </Suspense>
  );
}
