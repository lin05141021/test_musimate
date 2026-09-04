'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';

interface LessonRecord {
  id: string;
  order: number;
  time: string;
  attendanceStatus: 'checked_in' | 'leave' | 'rescheduled' | 'absent_unexcused' | 'pending';
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  subtext?: string;
  penaltyRate?: number;
  isPaid: boolean;
}

interface TermBillingSummary {
  dueAmount: number;
  paidAmount: number;
  status: string;
  paymentDeadline: string;
  paymentMethod: string;
  isPaidInFull: boolean;
}

interface TermData {
  termNumber: number;
  teacherName: string;
  instrument: string;
  startDate: string;
  endDate: string;
  totalLessons: number;
  completedLessons: number;
  pendingRescheduleLessons: number;
  rescheduleDeadline: string;
  billingDeadline: string;
  billingSummary: TermBillingSummary;
  lessons: LessonRecord[];
}

interface BillingInvoice {
  id: string;
  termNumber: number;
  amount: number;
  paidDate: string;
  status: string;
}

export default function StudentHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lessons' | 'billing'>('lessons');
  const [currentTerm, setCurrentTerm] = useState<number>(3);
  const [termData, setTermData] = useState<TermData | null>(null);
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchHistoryData(currentTerm);
  }, [currentTerm]);

  const fetchHistoryData = async (term: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/history?term=${term}`);
      const data = await res.json();
      if (data.success) {
        setTermData(data.termData);
        setBillingInvoices(data.billingInvoices || []);
      }
    } catch (err) {
      console.error('Failed to fetch history data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevTerm = () => {
    if (currentTerm > 1) {
      setCurrentTerm((prev) => prev - 1);
    }
  };

  const handleNextTerm = () => {
    if (currentTerm < 3) {
      setCurrentTerm((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE8DE] sm:bg-[#E5E0D8] flex items-center justify-center p-0 sm:p-4 font-['Sora',sans-serif] select-none">
      {/* 360px Mobile Viewport Container */}
      <div className="w-[360px] h-[844px] max-w-full max-h-[100dvh] sm:max-h-[844px] bg-[#FAF6F0] rounded-[40px] shadow-[0px_12px_24px_rgba(43,48,73,0.13)] overflow-hidden flex flex-col relative border border-[#F0EAE1]">
        
        {/* 1. Header Bar (64px) */}
        <header className="w-full h-16 px-5 py-3 bg-[#FAF6F0] border-b border-[#F0EAE1] flex justify-between items-center shrink-0 z-20">
          <div className="w-[161px] h-10 relative flex items-center">
            {/* Logo image with fallback */}
            <img
              src="/UI/logo.png"
              alt="Musi Mate"
              className="w-[161px] h-10 object-contain object-left cursor-pointer"
              onClick={() => router.push('/')}
              onError={(e) => {
                // Fallback if logo not found
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-[#2B3049] text-xl font-bold font-['Sora'] tracking-wider hidden [:not([style*='display: none'])+&]:hidden">
              Musi Mate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#4A8FD9]">第 {currentTerm} 期</span>
            <span className="text-[11px] text-[#A3A7BA]">· 歷史紀錄</span>
          </div>
        </header>

        {/* 2. Main Scrollable Content Area (flex-1 獨立垂直滾動) */}
        <main className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] flex flex-col gap-3 pb-8">

        {/* 2. Top Term Info Card */}
        <div className="px-5 pt-1 pb-3">
          <div className="w-full p-4 bg-white rounded-2xl border border-[#EAE4DC] flex flex-col gap-3 shadow-[0px_4px_16px_rgba(43,48,73,0.02)]">
            
            {/* Subtitle Indicator */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#68C5AB] rounded-full" />
              <span className="text-[#6F6F6F] text-[13px] font-semibold font-['Sora']">
                {termData?.teacherName || '張老師'} · {termData?.instrument || '鋼琴課'} · 課程與繳費紀錄
              </span>
            </div>

            {/* Term Navigation Controls */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrevTerm}
                disabled={currentTerm <= 1}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  currentTerm <= 1 
                    ? 'bg-[#FAF6F0] opacity-40 cursor-not-allowed' 
                    : 'bg-[#FAF6F0] hover:bg-[#F0EAE1] text-[#2B3049]'
                }`}
                title="上一期"
              >
                <ChevronLeft className="w-4 h-4 text-[#2B3049]" />
              </button>

              <div className="text-[#2B3049] text-[18px] font-extrabold font-['Sora']">
                第 {currentTerm} 期
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/student/courses')}
                  className="px-2.5 py-1 bg-[rgba(206,171,152,0.17)] border border-[#CEAB98] rounded-lg text-[#CEAB98] text-[12px] font-bold font-['Sora'] hover:bg-[rgba(206,171,152,0.25)] transition-colors cursor-pointer"
                >
                  預約新一期
                </button>
                <button
                  type="button"
                  onClick={handleNextTerm}
                  disabled={currentTerm >= 3}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    currentTerm >= 3 
                      ? 'bg-[#FAF6F0] opacity-40 cursor-not-allowed' 
                      : 'bg-[#FAF6F0] hover:bg-[#F0EAE1] text-[#2B3049]'
                  }`}
                  title="下一期"
                >
                  <ChevronRight className="w-4 h-4 text-[#2B3049]" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-0 border-b border-[#EAE4DC]" />

            {/* Summary Details */}
            {activeTab === 'lessons' ? (
              <div className="flex flex-col gap-2 font-['Sora']">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#6F6F6F] text-[12px] font-semibold">課程區間</span>
                  <span className="text-[#2B3049] text-[14px] font-bold">
                    {termData?.startDate} - {termData?.endDate}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#6F6F6F] text-[12px] font-semibold">期數統計</span>
                  <span className="text-[#68C5AB] text-[14px] font-bold">
                    共 {termData?.totalLessons} 堂 · 已完成 {termData?.completedLessons} 堂 · 待補課 {termData?.pendingRescheduleLessons} 堂
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#6F6F6F] text-[12px] font-semibold">調課期限</span>
                  <span className="text-[#2B3049] text-[14px] font-bold">
                    {termData?.rescheduleDeadline}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 font-['Sora']">
                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] text-[12px] font-semibold">課程期間</span>
                  <span className="text-[#2B3049] text-[12px] font-semibold">
                    {termData?.startDate} - {termData?.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] text-[12px] font-semibold">課堂統計</span>
                  <span className="text-[#2B3049] text-[12px] font-semibold">
                    共 {termData?.totalLessons} 堂
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] text-[12px] font-semibold">繳費期限</span>
                  <span className="text-[#2B3049] text-[12px] font-semibold">
                    {termData?.billingDeadline}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Dual Tab Switcher */}
        <div className="px-5 py-2 flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 h-10 rounded-xl flex items-center justify-center font-['Sora'] text-[14px] font-semibold transition-all cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-[#CEAB98] text-white shadow-sm'
                : 'bg-[#F1F3F4] text-[#2B3049] hover:bg-[#EAEAEA]'
            }`}
          >
            課程紀錄
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`flex-1 h-10 rounded-xl flex items-center justify-center font-['Sora'] text-[14px] font-semibold transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-[#82AAD8] text-white shadow-sm'
                : 'bg-[#F1F3F4] text-[#2B3049] hover:bg-[#EAEAEA]'
            }`}
          >
            繳費紀錄
          </button>
        </div>

        {/* 4. Tab 1 Content: 課程紀錄 (Lesson List) */}
        {activeTab === 'lessons' && (
          <div className="px-5 pt-2 flex flex-col gap-2.5 pb-6">
            {termData?.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="w-full p-3 bg-white rounded-2xl border border-[#EAE4DC] flex items-center gap-2.5 shadow-[0px_4px_8px_rgba(43,48,73,0.02)]"
              >
                {/* Lesson Order Badge */}
                <div className="w-14 py-1.5 bg-[#FAF6F0] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[#2B3049] text-[12px] font-extrabold font-['Sora']">
                    第 {lesson.order} 堂
                  </span>
                </div>

                {/* Middle Content */}
                <div className="flex-1 flex flex-col gap-1 min-w-0 font-['Sora']">
                  <div className="text-[#2B3049] text-[14px] font-bold leading-tight">
                    {lesson.time}
                  </div>
                  
                  {/* Status Pill */}
                  <div className="flex items-center">
                    <span
                      style={{ backgroundColor: lesson.statusBg, color: lesson.statusColor }}
                      className="px-2 py-0.5 rounded-lg text-[12px] font-bold leading-tight inline-flex items-center"
                    >
                      {lesson.statusLabel}
                    </span>
                  </div>

                  {/* Subtext description (e.g., 请假期限 / 扣款提示) */}
                  {lesson.subtext && (
                    <div
                      style={{ color: lesson.statusColor }}
                      className="text-[12px] font-semibold leading-tight"
                    >
                      {lesson.subtext}
                    </div>
                  )}
                </div>

                {/* Right Actions & Payment Indicator */}
                <div className="flex flex-col items-end gap-2 shrink-0 font-['Sora']">
                  {/* 聯絡簿 Button (Links to Smart Contact Book) */}
                  <button
                    type="button"
                    onClick={() => router.push(`/student/summary/${lesson.id}`)}
                    className="px-2 py-1.5 bg-[#FAF6F0] border border-[#EAE4DC] rounded-lg flex items-center gap-1 hover:bg-[#F3EFE9] transition-colors cursor-pointer shadow-xs"
                    title="檢視本堂聯絡簿與 AI 摘要"
                  >
                    <BookOpen className="w-3 h-3 text-[#6F6F6F]" />
                    <span className="text-[#6F6F6F] text-[12px] font-bold">聯絡簿</span>
                  </button>

                  {/* Payment Status (根據整期已繳清，呈現綠色已繳費) */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        lesson.isPaid ? 'bg-[#137333]' : 'bg-[#C5221F]'
                      }`}
                    />
                    <span
                      className={`text-[12px] font-bold ${
                        lesson.isPaid ? 'text-[#137333]' : 'text-[#C5221F]'
                      }`}
                    >
                      {lesson.isPaid ? '本期已繳費' : '未繳'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Tab 2 Content: 繳費紀錄 (Billing History) */}
        {activeTab === 'billing' && (
          <div className="px-5 pt-2 flex flex-col gap-4 font-['Sora'] pb-6">
            
            {/* Section 1: 本期繳費摘要 */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[#2B3049] text-[16px] font-bold">
                本期繳費摘要
              </h3>
              
              <div className="w-full p-4 bg-white rounded-2xl border border-[#EAE4DC] flex flex-col gap-3 shadow-[0px_4px_16px_rgba(43,48,73,0.03)] text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] font-semibold">應繳金額</span>
                  <span className="text-[#2B3049] font-bold">
                    NT$ {termData?.billingSummary.dueAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] font-semibold">已繳金額</span>
                  <span className="text-[#82AAD8] font-bold">
                    NT$ {termData?.billingSummary.paidAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] font-semibold">繳費狀態</span>
                  <span className="px-2.5 py-1 bg-[#E6F4EA] text-[#49BB87] rounded-full text-[12px] font-bold">
                    {termData?.billingSummary.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] font-semibold">繳費期限</span>
                  <span className="text-[#2B3049] font-bold">
                    {termData?.billingSummary.paymentDeadline}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#6F6F6F] font-semibold">繳費方式</span>
                  <span className="text-[#2B3049] font-bold">
                    {termData?.billingSummary.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: 繳費明細 */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[#2B3049] text-[16px] font-bold">
                繳費明細
              </h3>

              <div className="flex flex-col gap-2">
                {billingInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#EAE4DC] flex justify-between items-center shadow-[0px_2px_8px_rgba(43,48,73,0.02)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1.5 bg-[#82AAD8] rounded-lg flex items-center justify-center">
                        <span className="text-white text-[12px] font-bold">
                          第{inv.termNumber}期
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#2B3049] text-[14px] font-bold">
                          NT$ {inv.amount.toLocaleString()}
                        </span>
                        <span className="text-[#6F6F6F] text-[12px] font-normal">
                          {inv.paidDate}
                        </span>
                      </div>
                    </div>

                    <div className="px-2 py-1 bg-[#E6F4EA] text-[#49BB87] rounded-full text-[12px] font-bold">
                      {inv.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Upload Proof Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/student/billing')}
                className="w-full h-12 bg-gradient-to-r from-[#4A90D9] to-[#2B6CB0] opacity-35 rounded-xl flex items-center justify-center text-white text-[14px] font-bold font-['Sora'] cursor-not-allowed"
                disabled
              >
                上傳本期繳費證明 (無待繳款)
              </button>
            </div>

            {/* Copyright */}
            <div className="pt-2 pb-2 text-center text-[#6F6F6F] text-[12px] font-['Sora']">
              © 2026 Musi Mate
            </div>
          </div>
        )}

        </main>

        {/* 3. Footer TabBar */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar activeTab="more" onMoreClick={() => setDrawerOpen(true)} />
        </footer>

        {/* 4. Slide-up More Drawer */}
        <StudentMoreDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}
