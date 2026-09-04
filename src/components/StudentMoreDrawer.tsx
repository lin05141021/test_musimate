'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
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
  X,
} from 'lucide-react';

export interface StudentMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentMoreDrawer: React.FC<StudentMoreDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const {
    studentProfile,
    activeStudentId,
    allStudents,
    appointments,
  } = useDemoContext();

  if (!isOpen) return null;

  const currentStudentId = activeStudentId || studentProfile.id;
  const currentStudentInfo =
    allStudents.find((s) => s.student.id === currentStudentId) || allStudents[0];

  const studentFullName = currentStudentInfo?.user?.name || '劉心悅';
  const cleanStudentName = studentFullName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const studentDisplayName = `${cleanStudentName} 同學`;
  const studentInstrument = currentStudentInfo?.instrument?.split(' ')[0] || '小提琴';
  const studentPeriod = 3;
  const studentCourseSubtitle = `${studentInstrument}課 · 第${studentPeriod}期進行中`;

  return (
    <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
      {/* 半透明黑底遮罩 (55% opacity) */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* 側邊抽屜本體 (寬度 300px，左側圓角 24px) */}
      <aside className="w-[300px] h-full bg-white shadow-[-8px_0px_24px_rgba(0,0,0,0.12)] rounded-l-[24px] flex flex-col justify-between relative z-10 animate-in slide-in-from-right duration-300 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col">
          {/* 頂部學員個人資料 */}
          <div className="relative pt-10 pb-6 px-6 bg-[rgba(250,246,240,0.94)] rounded-tl-[24px] flex flex-col gap-4">
            {/* 右上角關閉按鈕 */}
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉選單"
              className="absolute right-6 top-8 w-8 h-8 rounded-full bg-white/70 hover:bg-white active:scale-95 border border-[#F3F1ED] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4 text-[#2B3049]" strokeWidth={2.5} />
            </button>

            {/* 學員資訊 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(155,126,200,0.14)] border border-[rgba(155,126,200,0.25)] flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={
                    currentStudentInfo?.user.avatar_url ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
                  }
                  alt={studentDisplayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[20px] font-bold text-[#2B3049] leading-tight font-['Sora']">
                  {studentDisplayName}
                </div>
                <div className="text-[13px] text-[#7A7E90] font-normal leading-tight font-['Sora'] flex items-center gap-1.5">
                  <span>{studentCourseSubtitle}</span>
                  {currentStudentInfo?.user.line_user_id && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      已連線
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: 功能選單 */}
          <div className="pt-6 pb-4 px-6 flex flex-col gap-2">
            <div className="text-[#7A7E90] text-[12px] font-semibold uppercase tracking-wider font-['Sora']">
              功能選單
            </div>

            <div className="flex flex-col">
              {/* 1. 我的課表 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/schedule');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8734A] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#FDF1EC] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#E8734A]" />
                  </div>
                  <Calendar className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">我的課表</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 2. 請假/調課 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/schedule?action=reschedule');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8734A] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#FDF1EC] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#E8734A]" />
                  </div>
                  <Clock className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">請假/調課</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 3. 智慧聯絡簿 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/summary/lesson-1');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5A100] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#FEF7E6] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#E5A100]" />
                  </div>
                  <BookOpen className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">智慧聯絡簿</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 4. 練習打卡 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/practice');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#49BB87] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#ECFAF3] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#49BB87]" />
                  </div>
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">練習打卡</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 5. 成就徽章 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/stamps');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#49BB87] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#ECFAF3] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#49BB87]" />
                  </div>
                  <Award className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">成就徽章</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 6. 課程與繳費紀錄 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/history');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4A8FD9] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#EEF4FC] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#4A90D9]" />
                  </div>
                  <CreditCard className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">課程與繳費紀錄</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 7. 上傳繳費證明 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/billing');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4A8FD9] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#EEF4FC] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#4A90D9]" />
                  </div>
                  <FileText className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">上傳繳費證明</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 8. 新增課程 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/newclass');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9B7EC8] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#F6F2FB] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#9B7EC8]" />
                  </div>
                  <Plus className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">新增課程</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* 分隔線 */}
          <div className="w-full h-0 border-b-2 border-[#EAE6E1]" />

          {/* Section 2: 其他 */}
          <div className="pt-5 pb-6 px-6 flex flex-col gap-2">
            <div className="text-[#7A7E90] text-[12px] font-semibold uppercase tracking-wider font-['Sora']">
              其他
            </div>

            <div className="flex flex-col">
              {/* FAQ */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/student/faq');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B3B3B3] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#F3F1ED] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#A3A7BA]" />
                  </div>
                  <HelpCircle className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">FAQ</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 聯繫客服 */}
              <button
                type="button"
                onClick={() => {
                  alert('如需客服協助，請直接於 MusiMate 官方 LINE 官方帳號留言，或洽詢張老師工作室。');
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B3B3B3] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#F3F1ED] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#A3A7BA]" />
                  </div>
                  <Headphones className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">聯繫系統客服</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* 底部版本資訊 */}
        <div className="pb-8 pt-4 flex justify-center items-center">
          <span className="text-[11px] font-normal text-[#A3A7BA] font-['Sora']">
            Musi Mate v1.0
          </span>
        </div>
      </aside>
    </div>
  );
};

export default StudentMoreDrawer;
