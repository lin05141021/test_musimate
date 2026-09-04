'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { useStudentToast } from '@/context/ToastContext';
import { StudentTabBar } from '@/components/StudentTabBar';
import { Appointment } from '@/types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  X,
  Users,
  Check,
  Sparkles,
  BookOpen,
  Award,
  CreditCard,
  FileText,
  Plus,
  HelpCircle,
  Headphones,
  AlertTriangle,
} from 'lucide-react';

export default function StudentSchedulePage() {
  const router = useRouter();
  const { showToast } = useStudentToast();
  const {
    appointments,
    studentProfile,
    scheduleSlots,
    requestReschedule,
    requestLeave,
    activeStudentId,
    allStudents,
    switchStudent,
    lessonRecords,
    isMultiChildParent,
    checkInAppointment,
  } = useDemoContext();

  // 當前學生 ID (同步 Context 與中央資料庫)
  const currentStudentId = activeStudentId || studentProfile.id;
  const currentStudentInfo = allStudents.find((s) => s.student.id === currentStudentId) || allStudents[0];
  
  // 學生名稱與選單資訊 (由同一個資料庫 Context 即時動態渲染)
  const studentFullName = currentStudentInfo?.user?.name || '劉心悅';
  const cleanStudentName = studentFullName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const studentDisplayName = `${cleanStudentName} 同學`;
  const studentInstrument = currentStudentInfo?.instrument?.split(' ')[0] || '鋼琴';
  const studentPeriod = 3;
  const studentCourseSubtitle = `${studentInstrument}課 · 第${studentPeriod}期進行中`;

  // 展開/收合已過課程狀態 (依使用者要求：預設收合)
  const [isPastExpanded, setIsPastExpanded] = useState(false);

  // 右上角漢堡選單抽屜 (用於手機版切換學生與查看帳號資訊)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 預約下一期課程 (3步驟排課與衝堂調整流程) 狀態
  interface NewTermLesson {
    order: number;
    date: string;
    time: string;
    hasConflict: boolean;
    conflictReason?: string;
    originalDate?: string;
    isResolving?: boolean;
    isResolved?: boolean;
    resolvedSlot?: string;
  }

  const [isNewTermModalOpen, setIsNewTermModalOpen] = useState(false);
  const [newTermStep, setNewTermStep] = useState<1 | 2 | 3>(1);
  const [newTermContract, setNewTermContract] = useState('每周一堂，一堂2小時，共十堂課');
  const [newTermStartDate, setNewTermStartDate] = useState('09/01 (周二)');
  const [newTermPreferredSlot, setNewTermPreferredSlot] = useState('每週二晚上 19:00-21:00');
  const [newTermPaymentMethod, setNewTermPaymentMethod] = useState('整期匯款繳費');
  const [newTermLessons, setNewTermLessons] = useState<NewTermLesson[]>([
    { order: 1, date: '09/02 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 2, date: '09/09 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 3, date: '09/16 (二)', time: '19:00-21:00', hasConflict: true, conflictReason: '老師時間衝突', originalDate: '09/16 (二)', isResolving: false, isResolved: false, resolvedSlot: '09/17 (三) 10:00-12:00' },
    { order: 4, date: '09/23 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 5, date: '09/30 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 6, date: '10/07 (二)', time: '19:00-21:00', hasConflict: true, conflictReason: '老師時間衝突', originalDate: '10/07 (二)', isResolving: false, isResolved: false, resolvedSlot: '10/08 (三) 10:00-12:00' },
    { order: 7, date: '10/14 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 8, date: '10/21 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 9, date: '10/28 (二)', time: '19:00-21:00', hasConflict: false },
    { order: 10, date: '11/04 (二)', time: '19:00-21:00', hasConflict: false },
  ]);

  // 調課/請假 Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'reschedule' | 'leave'>('reschedule');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedNewSlotTime, setSelectedNewSlotTime] = useState<string>('');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveNotes, setLeaveNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // 課前 24 小時請假須知 (扣款警示) Modal 狀態
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeAppointment, setNoticeAppointment] = useState<Appointment | null>(null);
  const [isUrgentWarning, setIsUrgentWarning] = useState(false);

  // 報到成功反饋 Toast
  const [checkinToast, setCheckinToast] = useState<string | null>(null);

  // 呼叫真實 API: GET /api/schedule/available-slots
  const [apiSlots, setApiSlots] = useState<{ slot_id: string; start_time: string; end_time: string; is_available: boolean }[]>([]);

  useEffect(() => {
    const fetchSlotsFromApi = async () => {
      try {
        const teacherId = currentStudentInfo?.student.teacher_id || 't0000000-0000-0000-0000-000000000001';
        const res = await fetch(`/api/schedule/available-slots?teacherId=${teacherId}&studentId=${currentStudentId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.available_slots)) {
            setApiSlots(json.available_slots);
          }
        }
      } catch (err) {
        console.warn('API fetch available slots error:', err);
      }
    };
    fetchSlotsFromApi();
  }, [currentStudentId, currentStudentInfo]);

  // 呼叫真實 API: POST /api/student/bind-line (無感綁定學員 LINE ID)
  useEffect(() => {
    const bindLineId = async () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const lineId = params.get('line_user_id') || currentStudentInfo?.user.line_user_id;
      if (lineId) {
        try {
          await fetch('/api/student/bind-line', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              line_user_id: lineId,
              student_name: currentStudentInfo?.user.name,
              student_id: currentStudentId,
            }),
          });
        } catch (e) {
          console.warn('Bind line API call:', e);
        }
      }
    };
    bindLineId();
  }, [currentStudentId, currentStudentInfo]);

  // 取得該學生所有課程，依日期排序
  const studentAppointments = appointments
    .filter((a) => a.student_id === currentStudentId)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // 依時間劃分「本期已過課程」與「即將到來的課程」
  // 基準時間：以今日 2026-09-04 為劃分界線 (9/4 之前或狀態為 completed 皆屬已過課程)
  const nowPivot = typeof window !== 'undefined' && new Date().getFullYear() >= 2026
    ? new Date().getTime()
    : new Date('2026-09-04T00:00:00+08:00').getTime();

  // 依規範倒序排列 (最近的課程排在最上方：9/2 -> 8/29 -> 8/26 -> 8/19 -> 8/12)
  const pastAppointments = studentAppointments
    .filter((a) => a.status === 'completed' || new Date(a.start_time).getTime() < nowPivot)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  // 即將到來的課程：尚未完成且開課時間在今天之後 (未來課程)
  const upcomingAppointments = studentAppointments
    .filter((a) => a.status !== 'completed' && new Date(a.start_time).getTime() >= nowPivot)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // 本期總堂數 (由資料庫 package_total_lessons 決定，預設 10 堂)
  const totalLessons = currentStudentInfo?.student?.package_total_lessons || 10;
  const progressCount = pastAppointments.length;
  const progressPercent = Math.min(100, Math.round((progressCount / totalLessons) * 100));

  // 老師開放的可用調課時段 (整合 API 與本機時段)
  const availableSlots = useMemo(() => {
    if (apiSlots.length > 0) {
      return apiSlots.map((s) => ({
        id: s.slot_id,
        teacher_id: currentStudentInfo?.student.teacher_id || 't0000000-0000-0000-0000-000000000001',
        start_time: s.start_time,
        end_time: s.end_time,
        is_available: s.is_available,
        location: '音符琴房 A303',
      }));
    }
    return scheduleSlots.filter((slot) => slot.is_available);
  }, [apiSlots, scheduleSlots, currentStudentInfo]);

  // 網址參數監聽 (LINE 推播 ?action=reschedule 或 ?student=lin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const lessonId = params.get('lesson_id');
      const studentParam = params.get('student') || params.get('student_id');

      if (studentParam) {
        const found = allStudents.find(
          (s) =>
            s.student.id.toLowerCase() === studentParam.toLowerCase() ||
            s.user.name.toLowerCase().includes(studentParam.toLowerCase())
        );
        if (found && found.student.id !== activeStudentId) {
          switchStudent(found.student.id);
        }
      }

      if (action === 'reschedule' || lessonId) {
        const target = lessonId
          ? appointments.find((a) => a.id === lessonId)
          : upcomingAppointments[0] || studentAppointments[0];
        if (target) {
          openRescheduleModal(target);
        }
      }
    }
  }, [appointments, activeStudentId]);

  // 檢查是否距離開課時間不足 24 小時 (基準 2026-09-04 12:00 或本地當前時間)
  const checkIsWithin24Hours = (startIso: string) => {
    const lessonTime = new Date(startIso).getTime();
    const now = typeof window !== 'undefined' && new Date().getFullYear() >= 2026
      ? new Date().getTime()
      : new Date('2026-09-04T12:00:00+08:00').getTime();
    const diffHours = (lessonTime - now) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours < 24;
  };

  // 點擊卡片上的「請於課前24小時前完成請假/調課」按鈕
  // 業務邏輯：課前隨時開放點擊！若在課前 24 小時內，先彈出「請假須知（扣款警示）」確認
  const handleCardRescheduleClick = (appt: Appointment) => {
    const urgent = checkIsWithin24Hours(appt.start_time);
    if (urgent) {
      setNoticeAppointment(appt);
      setIsNoticeModalOpen(true);
    } else {
      setIsUrgentWarning(false);
      openRescheduleModal(appt, 'reschedule');
    }
  };

  // 開啟調課/請假 Modal (可指定初始分頁：reschedule 或 leave)
  const openRescheduleModal = (appointment: Appointment, initialTab: 'reschedule' | 'leave' = 'reschedule') => {
    setSelectedAppointment(appointment);
    setModalTab(initialTab);
    setIsModalOpen(true);
    setFeedback(null);
    setLeaveReason('');
    setLeaveNotes('');
    setIsSubmitting(false);
    if (availableSlots.length > 0) {
      setSelectedNewSlotTime(availableSlots[0].start_time);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setFeedback(null);
    setLeaveReason('');
    setLeaveNotes('');
    setIsSubmitting(false);
    setIsUrgentWarning(false);
  };

  // 送出確認調課 (串接 DemoContext + Supabase 資料庫 + 後端 API)
  const handleConfirmReschedule = async () => {
    if (!selectedAppointment) return;
    setIsSubmitting(true);

    // 1. 同步 DemoContext (更新中央 state 與 LocalStorage)
    const res = requestReschedule(
      selectedAppointment.id,
      selectedNewSlotTime,
      '學員自主線上調課'
    );

    // 2. 呼叫後端 API: POST /api/schedule/reschedule
    try {
      await fetch('/api/schedule/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          studentId: currentStudentId,
          studentName: cleanStudentName,
          newSlotTime: selectedNewSlotTime,
          reason: '學員自主線上調課',
        }),
      });
    } catch (apiErr) {
      console.warn('API reschedule error:', apiErr);
    }

    setIsSubmitting(false);
    showToast('調課申請已送出');
    setFeedback({
      success: true,
      msg: res.message || '✅ 調課申請已確認送出！張老師與系統已即時同步更新。',
    });

    setTimeout(() => {
      closeModal();
    }, 1200);
  };

  // 送出確認請假 (串接 DemoContext + Supabase 資料庫 + 後端 API)
  const handleConfirmLeave = async () => {
    if (!selectedAppointment) return;
    if (!leaveReason) {
      alert('請先選擇請假原因');
      return;
    }
    setIsSubmitting(true);

    // 1. 同步 DemoContext (保留堂數額度，標記請假)
    const res = requestLeave(
      selectedAppointment.id,
      leaveReason,
      leaveNotes
    );

    // 2. 呼叫後端 API: POST /api/schedule/leave
    try {
      await fetch('/api/schedule/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          studentId: currentStudentId,
          studentName: cleanStudentName,
          reason: leaveReason,
          notes: leaveNotes,
        }),
      });
    } catch (apiErr) {
      console.warn('API leave error:', apiErr);
    }

    setIsSubmitting(false);
    showToast('請假申請已送出');
    setFeedback({
      success: true,
      msg: res.message || '📌 請假申請已送出！該堂課時數已完整保留至您的剩餘課堂額度。',
    });

    setTimeout(() => {
      closeModal();
    }, 1200);
  };

  // 報到按鈕點擊處理 (課前打卡持久化儲存)
  const handleCheckin = (appt: Appointment) => {
    const res = checkInAppointment(appt.id);
    showToast('報到成功！已完成課前報到');
    setCheckinToast(`🎉 ${formatDateBadge(appt.start_time).monthDate} 堂課報到成功！已持久化儲存至資料庫。`);
    setTimeout(() => {
      setCheckinToast(null);
    }, 3500);
  };

  // 格式化日期與星期 (8/12, (二) 或 9/02, (三))
  const formatDateBadge = (isoStr: string) => {
    const d = new Date(isoStr);
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const formattedDate = date < 10 ? `0${date}` : `${date}`;
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const w = weekdays[d.getDay()];
    return {
      monthDate: `${m}/${formattedDate}`,
      weekday: `(${w})`,
      fullLabel: `${m}/${formattedDate} (週${w})`,
    };
  };

  // 格式化時間 (10:00 - 12:00)
  const formatTimeSpan = (startIso: string, endIso: string) => {
    const s = new Date(startIso).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const e = new Date(endIso).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${s} - ${e}`;
  };

  // 格式化課程標題
  const formatCourseTitle = (appt: Appointment) => {
    if (appt.teacher_name?.includes('李老師') || (appt.instrument?.includes('小提琴') && !appt.teacher_name?.includes('張'))) {
      return '李老師小提琴課';
    }
    return '張老師鋼琴課';
  };

  // 格式化繳費標籤
  const formatPaymentBadge = (status?: string, type?: string) => {
    if (status === 'paid' || type === 'prepaid') {
      return { text: '已繳費 (預付)', color: 'text-[#137333] bg-[#E6F4EA]' };
    }
    if (status === 'pay_per_lesson' || type === 'postpaid') {
      return { text: '課後現金繳費', color: 'text-amber-700 bg-amber-50' };
    }
    return { text: '未繳費', color: 'text-rose-700 bg-rose-50' };
  };

  // 找出該堂課關聯的週報/聯絡簿 ID
  const findLessonRecordId = (apptId: string) => {
    const record = lessonRecords.find((r) => r.appointment_id === apptId);
    return record?.id || 'lesson-1';
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] sm:bg-[#EDE8DE] flex justify-center items-center py-0 sm:py-6 select-none font-['Sora','Noto_Sans_TC',sans-serif]">
      {/* 手機版主要容器 (適配 Google Pixel 9a 規範尺寸 360px，超出版面卡片由中間區域垂直滾動 vertical scroll) */}
      <div className="w-[360px] h-[800px] max-w-full max-h-[100dvh] sm:max-h-[820px] bg-[#FAF6F0] flex flex-col justify-between relative shadow-2xl sm:rounded-[36px] overflow-hidden border border-[#E5DEC9]">

        {/* 頂部通知 Toast */}
        {checkinToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-[320px] w-[90%] px-4 py-3 bg-[#2B3049] text-white text-xs font-semibold rounded-2xl shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{checkinToast}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. 頂部固定品牌列 (flex-shrink-0 置頂，無漢堡選單)          */}
        {/* ======================================================== */}
        <header className="flex-shrink-0 w-full h-16 px-5 py-3 flex items-center bg-[#FAF6F0] border-b border-[#F0EBE1]/80 z-20">
          {/* 左側 MusiMate 品牌 Logo */}
          <div className="w-[161px] h-10 flex items-center">
            <img
              src="/UI/logo.png"
              alt="MusiMate"
              className="h-9 w-auto object-contain cursor-pointer"
              onClick={() => router.push('/')}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-extrabold text-[22px] tracking-tight bg-gradient-to-r from-[#E88D67] via-[#D5CC6A] to-[#68C5AB] bg-clip-text text-transparent hidden only:block">
              MusiMate
            </span>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. 課表主內容區域 (flex-1 獨立垂直滾動 vertical scroll)   */}
        {/* ======================================================== */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6 flex flex-col gap-5 [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent]">
            {/* 頁面標題 */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-[20px] font-extrabold text-[#2B3049] tracking-tight">
                我的課表
              </h1>
              <p className="text-[14px] text-[#6F6F6F] font-normal">
                {cleanStudentName} · 預約課堂清單
              </p>
            </div>

            {/* 本期進度長條指示器 */}
            <div className="py-1 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[14px] font-semibold">
                <span className="text-[#2B3049]">本期進度</span>
                <span className="text-[#6F6F6F]">
                  {progressCount} / {totalLessons} 堂
                </span>
              </div>
              <div className="w-full h-[10px] bg-[#E5E7EB] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#CEAB98] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. 查看本期已過課程 (可收合/折疊)                        */}
            {/* ======================================================== */}
            {pastAppointments.length > 0 && (
              <div className="flex flex-col gap-1">
                {/* 點擊展開/收合標題列 */}
                <button
                  type="button"
                  onClick={() => setIsPastExpanded(!isPastExpanded)}
                  className="w-full px-3 py-2 rounded-xl flex justify-between items-center text-left hover:bg-white/40 transition-colors"
                >
                  <span className="text-[14px] font-semibold text-[#6F6F6F]">
                    查看本期已過課程
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                      isPastExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* 已過課程卡片清單 (收合區塊) */}
                {isPastExpanded && (
                  <div className="flex flex-col gap-3 pt-1 animate-in fade-in duration-200">
                    {pastAppointments.map((appt) => {
                      const dateInfo = formatDateBadge(appt.start_time);
                      const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
                      const courseTitle = formatCourseTitle(appt);
                      const location = appt.location || '音符琴房 A303';
                      const payment = formatPaymentBadge(appt.payment_status, appt.payment_type);
                      const recordId = findLessonRecordId(appt.id);

                      return (
                        <div
                          key={appt.id}
                          className="w-full p-4 rounded-2xl outline outline-1 outline-white bg-white/70 shadow-xs flex flex-col gap-3"
                        >
                          {/* 課程主資訊橫排 */}
                          <div className="flex items-center gap-3">
                            {/* 左側日期方塊 */}
                            <div className="w-14 h-16 bg-[#FAF6F0] rounded-xl flex flex-col justify-center items-center gap-0.5 shrink-0">
                              <span className="text-[16px] font-bold text-[#6F6F6F] leading-tight">
                                {dateInfo.monthDate}
                              </span>
                              <span className="text-[12px] font-normal text-[#9CA3AF] leading-tight">
                                {dateInfo.weekday}
                              </span>
                            </div>

                            {/* 右側灰色資訊卡片 */}
                            <div className="flex-1 p-3 bg-[#F3F4F6] rounded-xl flex flex-col gap-1.5">
                              {/* 時間與繳費狀態 */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 text-[14px] font-semibold text-[#6F6F6F]">
                                  <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                  <span>{timeSpan}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[12px] font-semibold ${payment.color}`}>
                                  {payment.text}
                                </span>
                              </div>

                              {/* 課程名稱 */}
                              <div className="text-[16px] font-bold text-[#2B3049] leading-snug">
                                {courseTitle}
                              </div>

                              {/* 上課地點 */}
                              <div className="flex items-center gap-1 text-[12px] font-normal text-[#6F6F6F]">
                                <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                                <span>{location}</span>
                              </div>
                            </div>
                          </div>

                          {/* 底部操作：查看聯絡簿 (完全依照 Figma 規範：全寬按鈕、彩虹漸層圖示) */}
                          <Link
                            href={`/student/summary/${recordId}`}
                            className="w-full p-2.5 bg-[#F9FAFB] hover:bg-[#F0EFEA] active:scale-[0.99] rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-100"
                          >
                            <div className="w-5 h-5 rounded-[4px] bg-gradient-to-b from-[#C9A259]/80 via-[#68C5AB]/80 to-[#BB65B2]/80 flex items-center justify-center shrink-0">
                              <span className="text-[11px] text-white font-bold">📄</span>
                            </div>
                            <span className="text-[14px] font-semibold text-[#6F6F6F]">
                              查看聯絡簿
                            </span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. 即將到來的課程                                        */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-3">
              {/* 區塊標籤 */}
              <div className="px-3 py-1 flex justify-between items-center">
                <span className="text-[14px] font-semibold text-[#6F6F6F]">
                  即將到來的課程
                </span>
                <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
              </div>

              {/* 課程卡片列表 */}
              <div className="flex flex-col gap-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appt, idx) => {
                    const dateInfo = formatDateBadge(appt.start_time);
                    const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
                    const courseTitle = formatCourseTitle(appt);
                    const location = appt.location || '音符琴房 A303';
                    const payment = formatPaymentBadge(appt.payment_status, appt.payment_type);
                    const isFirstUpcoming = idx === 0;

                    return (
                      <div
                        key={appt.id}
                        className="w-full p-4 bg-white rounded-2xl shadow-[0px_4px_12px_rgba(43,48,73,0.03)] outline outline-1 outline-[#FAF6F0] flex flex-col gap-3"
                      >
                        {/* 課程主資訊橫排 */}
                        <div className="flex items-center gap-3">
                          {/* 左側日期方塊 */}
                          <div className="w-14 h-16 rounded-xl flex flex-col justify-center items-center gap-0.5 shrink-0">
                            <span className="text-[16px] font-bold text-[#2B3049] leading-tight">
                              {dateInfo.monthDate}
                            </span>
                            <span className="text-[12px] font-normal text-[#6F6F6F] leading-tight">
                              {dateInfo.weekday}
                            </span>
                          </div>

                          {/* 右側暖米色卡片 (bg-[rgba(206,171,152,0.30)]) */}
                          <div className="flex-1 p-3 bg-[rgba(206,171,152,0.30)] rounded-xl flex flex-col gap-1.5">
                            {/* 時間與繳費狀態 */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1 text-[12px] font-semibold text-[#6F6F6F]">
                                <Clock className="w-3.5 h-3.5 text-[#6F6F6F]" />
                                <span>{timeSpan}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[12px] font-semibold ${payment.color}`}>
                                {payment.text}
                              </span>
                            </div>

                            {/* 課程名稱 */}
                            <div className="text-[16px] font-bold text-[#2B3049] leading-snug">
                              {courseTitle}
                            </div>

                            {/* 上課地點 */}
                            <div className="flex items-center gap-1 text-[12px] font-normal text-[#6F6F6F]">
                              <MapPin className="w-3 h-3 text-[#6F6F6F]" />
                              <span>{location}</span>
                            </div>
                          </div>
                        </div>

                        {/* 動作按鈕：最近一堂課為【課前15分鐘開放報到】與【請於課前24小時前完成請假/調課】，其餘堂為【請於課前24小時前完成請假/調課】 */}
                        {isFirstUpcoming ? (
                          <div className="w-full flex flex-col gap-2">
                            {appt.status === 'attended' || (appt as any).attendance === 'attended' ? (
                              <div className="w-full py-2.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-xl flex justify-center items-center gap-2 font-bold text-[14px]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>✔ 已完成課前報到（出席）</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCheckin(appt)}
                                className="w-full py-2.5 px-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] rounded-xl flex justify-center items-center gap-2 text-white font-bold text-[14px] shadow-sm shadow-[#CEAB98]/25 transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                                <span>課前15分鐘開放報到</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCardRescheduleClick(appt)}
                              className="w-full py-2 px-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-[0.99] rounded-xl flex justify-center items-center gap-1.5 text-[#6F6F6F] font-bold text-[13px] sm:text-[14px] transition-all cursor-pointer border border-[#F0EBE1]"
                            >
                              <span>請於課前24小時前完成請假/調課</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCardRescheduleClick(appt)}
                            className="w-full py-2.5 px-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-[0.99] rounded-xl flex justify-center items-center gap-1.5 text-[#6F6F6F] font-bold text-[13px] sm:text-[14px] transition-all cursor-pointer border border-[#F0EBE1]"
                          >
                            <span>請於課前24小時前完成請假/調課</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-white/70 rounded-2xl border border-dashed border-[#CEAB98]/40">
                    <span className="text-sm text-[#8C827A] font-bold">目前無排定的新課程</span>
                  </div>
                )}
                {/* 預約下一期課程按鈕 (直接原老師續約) */}
                <div className="w-full pt-3 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTermStep(1);
                      setIsNewTermModalOpen(true);
                    }}
                    className="w-full py-3.5 px-4 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-[15px] shadow-sm transition-all cursor-pointer font-['Sora']"
                  >
                    <Calendar className="w-4 h-4 text-white" />
                    <span>預約下一期課程 (第 4 期)</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

        {/* ======================================================== */}
        {/* 3. 底部固定五大功能導航列 (flex-shrink-0 置底)           */}
        {/* ======================================================== */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar
            activeTab="schedule"
            onMoreClick={() => setIsMenuOpen(true)}
          />
        </footer>

        {/* ======================================================== */}
        {/* 4. 側邊漢堡側選單 (Drawer - 更多選單，完全依據 Figma 規範) */}
        {/* ======================================================== */}
        {isMenuOpen && (
          <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
            {/* 半透明黑底遮罩 (55% opacity) */}
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* 側邊抽屜本體 (寬度 300px，左側圓角 24px，陰影 box-shadow) */}
            <aside
              className="w-[300px] h-full bg-white shadow-[-8px_0px_24px_rgba(0,0,0,0.12)] rounded-l-[24px] flex flex-col justify-between relative z-10 animate-in slide-in-from-right duration-300 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex flex-col">
                {/* 頂部學員個人資料 (高度 112px 暖杏色背景，右上角 32x32 關閉按鈕) */}
                <div className="relative pt-10 pb-6 px-6 bg-[rgba(250,246,240,0.94)] rounded-tl-[24px] flex flex-col gap-4">
                  {/* 右上角關閉按鈕 (32x32，圓角 16px) */}
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="關閉選單"
                    className="absolute right-6 top-8 w-8 h-8 rounded-full bg-white/70 hover:bg-white active:scale-95 border border-[#F3F1ED] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <X className="w-4 h-4 text-[#2B3049]" strokeWidth={2.5} />
                  </button>

                  {/* 學員資訊 (大頭貼 + 姓名 + 課程期數，同資料庫即時動態渲染) */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[rgba(155,126,200,0.14)] border border-[rgba(155,126,200,0.25)] flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={currentStudentInfo?.user.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
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
                        setIsMenuOpen(false);
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
                        setIsMenuOpen(false);
                        if (upcomingAppointments.length > 0) {
                          openRescheduleModal(upcomingAppointments[0]);
                        } else {
                          router.push('/student/schedule?action=reschedule');
                        }
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
                        setIsMenuOpen(false);
                        const recId = pastAppointments[0]?.id ? findLessonRecordId(pastAppointments[0].id) : 'lesson-1';
                        router.push(`/student/summary/${recId}`);
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
                        setIsMenuOpen(false);
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
                        setIsMenuOpen(false);
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
                        setIsMenuOpen(false);
                        router.push('/student/schedule?action=billing');
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
                        setIsMenuOpen(false);
                        router.push('/student/schedule?action=billing&upload=true');
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
                        setIsMenuOpen(false);
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

                {/* 分隔線 (border-2 #EAE6E1) */}
                <div className="w-full h-0 border-b-2 border-[#EAE6E1]" />

                {/* Section 2: 其他 */}
                <div className="pt-5 pb-6 px-6 flex flex-col gap-2">
                  <div className="text-[#7A7E90] text-[12px] font-semibold uppercase tracking-wider font-['Sora']">
                    其他
                  </div>

                  <div className="flex flex-col">
                    {/* 9. FAQ */}
                    <button
                      type="button"
                      onClick={() => {
                        alert('常見問題 (FAQ)：\nQ: 如何調課？\nA: 請在開課前 24 小時至即將到來課程點擊「請假/調課」。\n\nQ: 聯絡簿何時更新？\nA: 老師於每堂課結束後 30 秒內產出 AI 聯絡簿。');
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

                    {/* 10. 聯繫系統客服 */}
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
        )}

        {/* ======================================================== */}
        {/* 5. 請假／調課 雙分頁彈出視窗 (依據 Figma 規範完整實作)    */}
        {/* ======================================================== */}
        {isModalOpen && selectedAppointment && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-[340px] max-h-[92%] overflow-y-auto bg-white rounded-[24px] p-6 shadow-[0px_8px_20px_rgba(0,0,0,0.25)] flex flex-col gap-5 border border-slate-100 animate-in zoom-in-95 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              
              {/* 1. 雙分頁切換 Segmented Tab Switcher */}
              <div className="w-full p-1 bg-[#F2EDE5] rounded-[12px] flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('reschedule');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-1.5 rounded-[10px] text-center text-[14px] font-['Sora'] transition-all cursor-pointer ${
                    modalTab === 'reschedule'
                      ? 'bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.08)] text-[#E8734A] font-semibold'
                      : 'text-[#808080] font-normal hover:text-[#2B3049]'
                  }`}
                >
                  調課
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('leave');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-1.5 rounded-[10px] text-center text-[14px] font-['Sora'] transition-all cursor-pointer ${
                    modalTab === 'leave'
                      ? 'bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.08)] text-[#E8734A] font-semibold'
                      : 'text-[#808080] font-normal hover:text-[#2B3049]'
                  }`}
                >
                  請假
                </button>
              </div>

              {/* 2. 標題與關閉按鈕 */}
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#2B3049] rounded-[4px] flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-[#2B3049]" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[20px] font-bold text-[#2B3049] font-['Sora']">
                    請假／調課
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="關閉彈出視窗"
                  className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#2B3049] flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-[#2B3049]" strokeWidth={2.5} />
                </button>
              </div>

              {/* 3. 操作反饋 Toast 橫條 */}
              {feedback && (
                <div
                  className={`w-full p-3 rounded-xl text-[13px] font-bold animate-in fade-in ${
                    feedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.msg}
                </div>
              )}

              {/* 課前 24 小時內請假須知警示條 */}
              {isUrgentWarning && (
                <div className="w-full p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 text-rose-800 text-[12px] leading-snug">
                    <span className="font-bold">⚠️ 請假須知（課前 24 小時扣款提醒）</span>
                    <span>本堂課已在開課前 24 小時內，送出後將依教室規定照常扣除該堂學費與時數。</span>
                  </div>
                </div>
              )}

              {/* 4. 分頁 1：調課 (Reschedule) */}
              {modalTab === 'reschedule' && (
                <>
                  <div className="w-full flex flex-col gap-3.5">
                    {/* 原課程資訊 (支援點擊切換當期其他已排定之課堂) */}
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[#6F6F6F] text-[14px] font-bold font-['Sora']">
                        <span>選擇欲調整之課堂</span>
                        <span className="text-[12px] text-[#CEAB98] font-semibold">可點擊切換</span>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedAppointment.id}
                          onChange={(e) => {
                            const found = upcomingAppointments.find((a) => a.id === e.target.value);
                            if (found) {
                              setSelectedAppointment(found);
                              const now = new Date();
                              const classTime = new Date(found.start_time);
                              const diffHours = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                              setIsUrgentWarning(diffHours < 24);
                            }
                          }}
                          className="w-full p-3 bg-[#F3F4F6] border border-[#ECEEF2] rounded-xl text-[#2B3049] text-[14px] font-semibold font-['Sora'] appearance-none pr-10 focus:outline-hidden focus:ring-2 focus:ring-[#CEAB98]"
                        >
                          {upcomingAppointments.map((appt) => {
                            const dateInfo = formatDateBadge(appt.start_time);
                            const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
                            return (
                              <option key={appt.id} value={appt.id}>
                                {dateInfo.monthDate} ({dateInfo.weekday}) {timeSpan} · {formatCourseTitle(appt)}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B3049] pointer-events-none"
                        />
                      </div>
                      <div className="text-[12px] text-[#6F6F6F] font-medium font-['Sora'] px-1">
                        地點：{selectedAppointment.location || '音符音樂教室 A303'}
                      </div>
                    </div>

                    {/* 可調課時段 */}
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="text-[#6F6F6F] text-[14px] font-bold font-['Sora']">
                        可調課時段
                      </div>
                      <div className="relative">
                        <select
                          value={selectedNewSlotTime}
                          onChange={(e) => setSelectedNewSlotTime(e.target.value)}
                          className="w-full p-3 bg-white border border-[#FAF6F0] outline outline-1.5 outline-[#FAF6F0] rounded-xl text-[#2B3049] text-[14px] font-semibold font-['Sora'] appearance-none pr-10 focus:outline-hidden focus:ring-2 focus:ring-[#CEAB98]"
                        >
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => {
                              const slotDate = formatDateBadge(slot.start_time);
                              const slotTime = formatTimeSpan(slot.start_time, slot.end_time);
                              return (
                                <option key={slot.id} value={slot.start_time}>
                                  {slotDate.fullLabel}   {slotTime}
                                </option>
                              );
                            })
                          ) : (
                            <option value="">目前無開放可調課時段</option>
                          )}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B3049] pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 底部按鈕群 (送出確認調課 / 先請假之後再調整) */}
                  <div className="w-full pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmReschedule}
                      disabled={!selectedNewSlotTime || isSubmitting}
                      className="flex-1 py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-[14px] rounded-[10px] shadow-sm transition-all text-center cursor-pointer font-['Sora']"
                    >
                      {isSubmitting ? '處理中...' : '送出確認調課'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab('leave');
                        setFeedback(null);
                      }}
                      className="flex-1 py-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-[0.99] text-[#6F6F6F] font-bold text-[14px] rounded-[10px] transition-all text-center border border-[#EBE5DB] cursor-pointer font-['Sora']"
                    >
                      先請假之後再調整
                    </button>
                  </div>
                </>
              )}

              {/* 5. 分頁 2：請假 (Leave) */}
              {modalTab === 'leave' && (
                <>
                  <div className="w-full flex flex-col gap-3.5">
                    {/* 課程資訊 (支援點擊切換當期其他已排定之課堂) */}
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[#6F6F6F] text-[14px] font-bold font-['Sora']">
                        <span>選擇欲請假之課堂</span>
                        <span className="text-[12px] text-[#CEAB98] font-semibold">可點擊切換</span>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedAppointment.id}
                          onChange={(e) => {
                            const found = upcomingAppointments.find((a) => a.id === e.target.value);
                            if (found) {
                              setSelectedAppointment(found);
                              const now = new Date();
                              const classTime = new Date(found.start_time);
                              const diffHours = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                              setIsUrgentWarning(diffHours < 24);
                            }
                          }}
                          className="w-full p-3 bg-[#F3F4F6] border border-[#ECEEF2] rounded-xl text-[#2B3049] text-[14px] font-semibold font-['Sora'] appearance-none pr-10 focus:outline-hidden focus:ring-2 focus:ring-[#CEAB98]"
                        >
                          {upcomingAppointments.map((appt) => {
                            const dateInfo = formatDateBadge(appt.start_time);
                            const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
                            return (
                              <option key={appt.id} value={appt.id}>
                                {dateInfo.monthDate} ({dateInfo.weekday}) {timeSpan} · {formatCourseTitle(appt)}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B3049] pointer-events-none"
                        />
                      </div>
                      <div className="text-[12px] text-[#6F6F6F] font-medium font-['Sora'] px-1">
                        地點：{selectedAppointment.location || '音符音樂教室 A303'}
                      </div>
                    </div>

                    {/* 請假原因 */}
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="text-[#6F6F6F] text-[14px] font-bold font-['Sora']">
                        請假原因
                      </div>
                      <div className="relative">
                        <select
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full p-3 bg-white border border-[#FAF6F0] outline outline-1.5 outline-[#FAF6F0] rounded-xl text-[14px] font-semibold font-['Sora'] appearance-none pr-10 focus:outline-hidden focus:ring-2 focus:ring-[#CEAB98] text-[#2B3049]"
                        >
                          <option value="" disabled className="text-[#9CA3AF]">請選擇原因</option>
                          <option value="事假 (個人行程)">事假 (個人行程)</option>
                          <option value="病假 (身體不適)">病假 (身體不適)</option>
                          <option value="學校活動 / 考試">學校活動 / 考試</option>
                          <option value="家庭旅遊 / 聚會">家庭旅遊 / 聚會</option>
                          <option value="其他原因">其他原因</option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B3049] pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* 備註（選填） */}
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="text-[#6F6F6F] text-[14px] font-bold font-['Sora']">
                        備註（選填）
                      </div>
                      <textarea
                        value={leaveNotes}
                        onChange={(e) => setLeaveNotes(e.target.value)}
                        placeholder="如需說明請在此填寫"
                        rows={3}
                        className="w-full h-24 p-3 bg-[#F3F4F6] rounded-xl text-[14px] font-semibold font-['Sora'] text-[#2B3049] placeholder-[#9CA3AF] border-none focus:outline-hidden focus:ring-2 focus:ring-[#CEAB98] resize-none"
                      />
                    </div>
                  </div>

                  {/* 底部按鈕群 (取消 / 確認請假) */}
                  <div className="w-full pt-1 flex gap-2.5">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 active:scale-[0.99] text-[#6F6F6F] font-bold text-[14px] transition-all text-center cursor-pointer font-['Sora']"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmLeave}
                      disabled={!leaveReason || isSubmitting}
                      className="flex-1 py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-[14px] rounded-xl shadow-sm transition-all text-center cursor-pointer font-['Sora']"
                    >
                      {isSubmitting ? '處理中...' : '確認請假'}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. 課前 24 小時內請假須知 (扣款警示) 彈出視窗              */}
        {/* ======================================================== */}
        {isNoticeModalOpen && noticeAppointment && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-[340px] bg-white rounded-[24px] p-6 shadow-[0px_8px_20px_rgba(0,0,0,0.25)] flex flex-col gap-4 border border-slate-100 animate-in zoom-in-95">
              
              {/* 頂部圖示與標題 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[18px] font-bold text-[#2B3049] font-['Sora'] leading-tight">
                    請假／調課須知
                  </h3>
                  <span className="text-[12px] font-semibold text-rose-600">
                    課前 24 小時內扣款提醒
                  </span>
                </div>
              </div>

              {/* 說明內文卡片 */}
              <div className="w-full p-3.5 bg-[#FAF6F0] rounded-xl border border-[#F0EBE1] flex flex-col gap-2.5">
                <div className="text-[13px] font-semibold text-[#2B3049] flex flex-col">
                  <span>課程：{formatCourseTitle(noticeAppointment)}</span>
                  <span className="text-[#6F6F6F] text-[12px]">
                    時段：{formatDateBadge(noticeAppointment.start_time).fullLabel} {formatTimeSpan(noticeAppointment.start_time, noticeAppointment.end_time)}
                  </span>
                </div>
                <div className="w-full h-0 border-b border-[#EBE5DB]" />
                <div className="text-[12px] text-[#6F6F6F] leading-relaxed flex flex-col gap-1.5">
                  <p className="font-bold text-rose-700">
                    ⚠️ 依據音樂教室上課規範：
                  </p>
                  <p>
                    • 課前 24 小時前可<strong>免費線上調課</strong>或<strong>保留課程額度</strong>。
                  </p>
                  <p>
                    • 當前已進入<strong>【課前 24 小時內】</strong>，臨時請假或調課將<strong>照常扣除該堂學費／時數（扣款 1 堂）</strong>，無法補課或退費。
                  </p>
                </div>
              </div>

              {/* 雙按鈕：取消 vs 確定知悉並繼續 */}
              <div className="w-full pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNoticeModalOpen(false);
                    setNoticeAppointment(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 active:scale-[0.99] text-[#6F6F6F] font-bold text-[13px] transition-all text-center cursor-pointer font-['Sora']"
                >
                  我再想想
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = noticeAppointment;
                    setIsNoticeModalOpen(false);
                    setNoticeAppointment(null);
                    setIsUrgentWarning(true);
                    if (target) {
                      openRescheduleModal(target, 'reschedule');
                    }
                  }}
                  className="flex-1 py-3 bg-[#E8734A] hover:bg-[#D3633C] active:scale-[0.99] text-white font-bold text-[13px] rounded-xl shadow-sm transition-all text-center cursor-pointer font-['Sora']"
                >
                  確定知悉並繼續
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. 預約下一期課程 (3步驟排課與衝突解決) 彈出視窗            */}
        {/* ======================================================== */}
        {isNewTermModalOpen && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-[340px] max-h-[85vh] bg-[#FAF6F0] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-[#E8E1D5] animate-in zoom-in-95">
              {/* 頂部標題與步驟指示器 */}
              <div className="p-4 bg-white border-b border-[#E8E1D5] flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#CEAB98]/20 flex items-center justify-center text-[#CEAB98]">
                      <Calendar className="w-4 h-4 text-[#CEAB98]" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#2B3049] font-['Sora']">
                        預約下一期課程 (第 4 期)
                      </h3>
                      <p className="text-[11px] text-[#6F6F6F]">指導老師：陳映璇 老師</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewTermModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#6F6F6F] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 3-Step Indicator */}
                <div className="flex items-center justify-between pt-1">
                  {[
                    { step: 1, label: '偏好設定' },
                    { step: 2, label: '時段比對' },
                    { step: 3, label: '確認送出' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          newTermStep >= s.step
                            ? 'bg-[#CEAB98] text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {s.step}
                      </div>
                      <span
                        className={`text-[11px] font-medium ${
                          newTermStep >= s.step ? 'text-[#2B3049] font-bold' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {s.label}
                      </span>
                      {s.step < 3 && <div className="flex-1 h-[1px] bg-slate-200 mx-1" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* 內容區域 (可滾動) */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 [scrollbar-width:thin]">
                {/* 步驟 1: 預約偏好選擇 */}
                {newTermStep === 1 && (
                  <div className="flex flex-col gap-3 text-[13px]">
                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E1D5] flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#6F6F6F]">方案合約</label>
                      <div className="font-semibold text-[#2B3049]">{newTermContract}</div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E1D5] flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#6F6F6F]">期望起算開課週</label>
                      <select
                        value={newTermStartDate}
                        onChange={(e) => setNewTermStartDate(e.target.value)}
                        className="w-full p-2 bg-[#FAF6F0] rounded-lg border border-[#E8E1D5] font-semibold text-[#2B3049] text-[13px] outline-none"
                      >
                        <option value="09/01 (周二)">2026/09/01 (週二起算)</option>
                        <option value="09/08 (周二)">2026/09/08 (週二起算)</option>
                        <option value="09/15 (周二)">2026/09/15 (週二起算)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E1D5] flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#6F6F6F]">常規期望時段 (延續上期)</label>
                      <select
                        value={newTermPreferredSlot}
                        onChange={(e) => setNewTermPreferredSlot(e.target.value)}
                        className="w-full p-2 bg-[#FAF6F0] rounded-lg border border-[#E8E1D5] font-semibold text-[#2B3049] text-[13px] outline-none"
                      >
                        <option value="每週二晚上 19:00-21:00">每週二晚上 19:00-21:00 (現有時段)</option>
                        <option value="每週四下午 16:30-18:30">每週四下午 16:30-18:30</option>
                        <option value="每週六上午 10:00-12:00">每週六上午 10:00-12:00</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E1D5] flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#6F6F6F]">預計繳費方式</label>
                      <div className="flex gap-2">
                        {['整期匯款繳費', 'LINE Pay / 信用卡'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setNewTermPaymentMethod(m)}
                            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all border ${
                              newTermPaymentMethod === m
                                ? 'bg-[#CEAB98] text-white border-[#CEAB98]'
                                : 'bg-[#FAF6F0] text-[#6F6F6F] border-[#E8E1D5]'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 步驟 2: 系統排課與衝堂比對 */}
                {newTermStep === 2 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[12px] text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        系統已為您比對 10 堂時段，檢測到 <strong>2 堂課</strong> 與老師既定行程衝突，請點擊更換為推薦可用時段。
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-[12px]">
                      {newTermLessons.map((item) => (
                        <div
                          key={item.order}
                          className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                            item.hasConflict && !item.isResolved
                              ? 'bg-rose-50/70 border-rose-200'
                              : item.isResolved
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : 'bg-white border-[#E8E1D5]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2B3049]">
                              第 {item.order} 堂 · {item.isResolved ? item.resolvedSlot : `${item.date} ${item.time}`}
                            </span>
                            {item.hasConflict && !item.isResolved ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                衝堂衝突
                              </span>
                            ) : item.isResolved ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                已調課替代
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#6F6F6F]">
                                可預約
                              </span>
                            )}
                          </div>

                          {/* 衝突處理區 */}
                          {item.hasConflict && !item.isResolved && (
                            <div className="pt-1 flex items-center justify-between border-t border-rose-100">
                              <span className="text-[11px] text-rose-600">
                                老師此時段已有音樂會/研習排程
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTermLessons((prev) =>
                                    prev.map((l) =>
                                      l.order === item.order
                                        ? { ...l, isResolved: true }
                                        : l
                                    )
                                  );
                                }}
                                className="px-2 py-1 bg-[#CEAB98] hover:bg-[#C29D89] text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs"
                              >
                                換成推薦時段
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 步驟 3: 最終確認送出 */}
                {newTermStep === 3 && (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-[13px]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong>10 堂時段皆已排妥！</strong>
                        <div className="text-[11px] text-emerald-700">時段皆無衝突，已準備好送出新一期預約。</div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E1D5] flex flex-col gap-2 text-[12px]">
                      <div className="flex justify-between text-[#6F6F6F]">
                        <span>指導老師</span>
                        <span className="font-bold text-[#2B3049]">陳映璇 老師</span>
                      </div>
                      <div className="flex justify-between text-[#6F6F6F]">
                        <span>課程期別</span>
                        <span className="font-bold text-[#2B3049]">第 4 期 (共 10 堂)</span>
                      </div>
                      <div className="flex justify-between text-[#6F6F6F]">
                        <span>預估開課區間</span>
                        <span className="font-bold text-[#2B3049]">2026/09/02 ~ 2026/11/04</span>
                      </div>
                      <div className="flex justify-between text-[#6F6F6F]">
                        <span>應繳學費總額</span>
                        <span className="font-bold text-[#CEAB98] text-[14px]">NT$ 8,000</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#9CA3AF] text-center leading-relaxed">
                      點擊下方按鈕後將為您保留名額，教室將於 24 小時內確認審核並通知您繳費。
                    </div>
                  </div>
                )}
              </div>

              {/* 底部動作按鈕 */}
              <div className="p-3 bg-white border-t border-[#E8E1D5] flex gap-2 shrink-0">
                {newTermStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setNewTermStep((prev) => (prev - 1) as any)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E8E1D5] text-[#6F6F6F] font-bold text-[13px] hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    上一步
                  </button>
                )}
                {newTermStep === 1 && (
                  <button
                    type="button"
                    onClick={() => setNewTermStep(2)}
                    className="w-full py-2.5 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] text-white font-bold text-[13px] rounded-xl shadow-sm transition-all cursor-pointer font-['Sora']"
                  >
                    下一步：比對課表時段
                  </button>
                )}
                {newTermStep === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      // 一鍵解決所有衝突
                      setNewTermLessons((prev) =>
                        prev.map((l) => ({ ...l, isResolved: true }))
                      );
                      setNewTermStep(3);
                    }}
                    className="flex-1 py-2.5 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] text-white font-bold text-[13px] rounded-xl shadow-sm transition-all cursor-pointer font-['Sora']"
                  >
                    {newTermLessons.some((l) => l.hasConflict && !l.isResolved)
                      ? '一鍵排除衝突並確認'
                      : '確認時段，前往下一步'}
                  </button>
                )}
                {newTermStep === 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      showToast('課程預約已送出');
                      setIsNewTermModalOpen(false);
                      setNewTermStep(1);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-[13px] rounded-xl shadow-sm transition-all cursor-pointer font-['Sora']"
                  >
                    確認送出下一期預約
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
