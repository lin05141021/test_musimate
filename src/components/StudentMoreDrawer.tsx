'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const {
    studentProfile,
    activeStudentId,
    allStudents,
    appointments,
    switchStudent,
  } = useDemoContext();

  if (!isOpen) return null;

  const isVerified = Boolean(
    activeStudentId &&
    (activeStudentId === '55555555-5555-4555-b555-555555555555' ||
      activeStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150' ||
      activeStudentId === 'b0000000-0000-0000-0000-000000000001' ||
      allStudents.some((s) => s.student.id === activeStudentId && s.student.id !== 'new_student'))
  );

  const currentStudentId = activeStudentId;
  const currentStudentInfo = allStudents.find((s) => s.student.id === currentStudentId);

  const getNavUrl = (url: string) => {
    if (!currentStudentId) return url;
    const hasQuery = url.includes('?');
    return `${url}${hasQuery ? '&' : '?'}student_id=${encodeURIComponent(currentStudentId)}`;
  };

  const defaultFallbackName =
    currentStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150'
      ? '許雅婷 (Charles)'
      : currentStudentId === 'b0000000-0000-0000-0000-000000000001'
      ? '陳子翔 (Johnny / 阿堅)'
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
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* 半透明黑底遮罩 (55% opacity) */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* 側邊抽屜本體 (寬度 300px，左側圓角 24px) */}
      <aside className="w-[300px] h-full bg-white shadow-[-8px_0px_24px_rgba(0,0,0,0.12)] rounded-l-[24px] flex flex-col justify-between relative z-10 animate-in slide-in-from-right duration-300 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col">
          {/* 頂部學員個人資料 */}
          <div className="relative pt-10 pb-5 px-6 bg-[rgba(250,246,240,0.94)] rounded-tl-[24px] flex flex-col gap-3.5">
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
                  src={studentAvatarUrl}
                  alt={studentDisplayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[18px] font-bold text-[#2B3049] leading-tight font-['Sora']">
                  {studentDisplayName}
                </div>
                <div className="text-[12px] text-[#7A7E90] font-normal leading-tight font-['Sora'] flex items-center gap-1.5">
                  <span>{studentCourseSubtitle}</span>
                  {currentStudentInfo?.user.line_user_id && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      已連線
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 快速切換學生身分 (僅正式學員測試模式顯示，訪客完全隱藏) */}
            {isVerified && (
              <div className="flex flex-col gap-1.5 pt-2.5 border-t border-[#EAE6E1]">
                <span className="text-[10px] font-bold text-[#7A7E90] uppercase tracking-wider">
                  👤 切換測試學員：
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: '55555555-5555-4555-b555-555555555555', label: '劉心悅' },
                    { id: '89e45974-7f00-4bfd-bd84-3eb26351a150', label: '許雅婷' },
                    { id: 'b0000000-0000-0000-0000-000000000001', label: '陳子翔(堅)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        switchStudent(s.id);
                        localStorage.setItem('musimate_student_id', s.id);
                        localStorage.setItem('musimate_active_student_id', s.id);
                        onClose();
                        router.push(`/student/schedule?student_id=${s.id}`);
                      }}
                      className={`py-1 px-1 text-center rounded-lg text-[10px] font-bold transition-all truncate ${
                        currentStudentId === s.id
                          ? 'bg-[#68C5AB] text-white shadow-xs'
                          : 'bg-white text-[#2B3049] border border-[#F0EAE1] hover:bg-[#FAF6F0]'
                      }`}
                      title={s.label}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                  router.push(getNavUrl('/student/schedule'));
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
                  router.push(getNavUrl('/student/schedule?action=reschedule'));
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
                  router.push(getNavUrl('/student/summary'));
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
                  router.push(getNavUrl('/student/practice'));
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
                  router.push(getNavUrl('/student/stamps'));
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
                  router.push(getNavUrl('/student/history'));
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
                  router.push(getNavUrl('/student/billing'));
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

              {/* 8. 開始新課程 */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(getNavUrl('/student/courses'));
                }}
                className="w-full h-12 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9B7EC8] shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#F6F2FB] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#9B7EC8]" />
                  </div>
                  <Plus className="w-4.5 h-4.5 text-[#2B3049] shrink-0" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">開始新課程</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* 分隔線 */}
          <div className="w-full h-0 border-b-2 border-[#EAE6E1]" />

          {/* Section 2: 其他與管理 */}
          <div className="pt-5 pb-6 px-6 flex flex-col gap-2">
            <div className="text-[#7A7E90] text-[12px] font-semibold uppercase tracking-wider font-['Sora']">
              其他與管理
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
                  <span className="text-[14px] font-semibold text-[#2B3049] font-['Sora']">FAQ 常見問題</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A7BA] shrink-0" strokeWidth={2} />
              </button>
              <div className="w-full h-0 border-b border-[#F3F1ED]" />

              {/* 聯繫客服 */}
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
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

      {/* 聯繫客服彈出視窗 */}
      <ContactSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};

export default StudentMoreDrawer;
