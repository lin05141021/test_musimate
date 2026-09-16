'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDemoContext, MOCK_STUDENT } from '@/context/DemoContext';
import { useStudentToast } from '@/context/ToastContext';
import { Appointment } from '@/types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  BookOpen,
  Award,
  CreditCard,
  FileText,
  Plus,
  HelpCircle,
  Headphones,
  AlertTriangle,
  RotateCw,
  Check,
} from 'lucide-react';
import { ContactSupportModal } from '@/components/ContactSupportModal';

function StudentScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    checkInAppointment,
  } = useDemoContext();

  // 解析 URL 帶入的身分參數
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
    } else {
      const match = allStudents.find(
        (s) =>
          s.student.id === queryStudentId ||
          s.user.name.toLowerCase() === qLower
      );
      if (match && match.student.id !== 'new_student') {
        resolvedStudentId = match.student.id;
      }
    }
  } else if (activeStudentId && activeStudentId !== 'new_student') {
    resolvedStudentId = activeStudentId;
  }

  // 判定是否為已驗證且具有正式合約的正式學員 (嚴防資料外洩)
  const isVerifiedStudent = Boolean(
    resolvedStudentId &&
    (resolvedStudentId === '55555555-5555-4555-b555-555555555555' ||
      resolvedStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150' ||
      resolvedStudentId === 'b0000000-0000-0000-0000-000000000001' ||
      allStudents.some((s) => s.student.id === resolvedStudentId && s.student.id !== 'new_student'))
  );

  // 當前學生 ID (同步 Context 與中央資料庫)
  const currentStudentId = resolvedStudentId;
  const currentStudentInfo = allStudents.find((s) => s.student.id === currentStudentId);

  // LIFF 初始化安全核對狀態 (避免畫面閃爍訪客頁)
  const [isLiffChecking, setIsLiffChecking] = useState<boolean>(true);
  // 已打卡報到之課堂 ID 記錄
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);

  // LINE LIFF Native 運行環境身分自動校準
  useEffect(() => {
    let timer = setTimeout(() => {
      setIsLiffChecking(false);
    }, 800);

    async function checkLiffProfile() {
      try {
        const liff = (await import('@line/liff')).default;
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2011164851-lGsEnQWB';
        await liff.init({ liffId });
        if (liff.isLoggedIn() || liff.isInClient()) {
          const profile = await liff.getProfile().catch(() => null);
          const uid = profile?.userId || liff.getContext()?.userId;
          const displayName = (profile?.displayName || '').trim();
          const dLower = displayName.toLowerCase();
          const candidate = `${uid || ''} ${displayName}`.toLowerCase();

          if (
            uid === 'U26ed3c0e48864aebdc244594cf780df0' ||
            candidate.includes('charles') ||
            candidate.includes('查爾斯') ||
            candidate.includes('許雅婷')
          ) {
            switchStudent('89e45974-7f00-4bfd-bd84-3eb26351a150');
          } else if (
            uid === 'U2a2f432d824e353e8eb3fbe579def2cf' ||
            candidate.includes('johnny') ||
            candidate.includes('阿堅') ||
            candidate.includes('陳子翔')
          ) {
            switchStudent('b0000000-0000-0000-0000-000000000001');
          } else if (
            uid === 'Uf2457bf35e0d6d3060b60838d9a9c91c' ||
            candidate.includes('劉心悅') ||
            candidate.includes('心悅') ||
            dLower === 'lin'
          ) {
            switchStudent('55555555-5555-4555-b555-555555555555');
          } else {
            // 未綁定之全新 LINE 帳號 (新生)
            console.log(`✨ [LIFF Schedule] 偵測到新成員訪客: ${displayName} (${uid})`);
          }
        }
      } catch (e) {
        console.warn('LIFF init error in schedule page:', e);
      } finally {
        setIsLiffChecking(false);
      }
    }
    checkLiffProfile();
    return () => clearTimeout(timer);
  }, [switchStudent]);

  // 實時資料庫資料 State
  const [dbData, setDbData] = useState<any>(null);

  useEffect(() => {
    if (!currentStudentId) return;
    async function fetchLiveSchedule() {
      try {
        const res = await fetch(`/api/student/schedule-db?student_id=${currentStudentId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDbData(json.data);
            console.log('📡 [Live DB API] 成功載入實時資料庫課表與契約:', json.data);
          }
        }
      } catch (err) {
        console.warn('ℹ️ [/api/student/schedule-db] 讀取失敗:', err);
      }
    }
    fetchLiveSchedule();
  }, [currentStudentId]);

  // 學生名稱與選單資訊 (優先使用實時 DB 回傳)
  const defaultFallbackName =
    currentStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150'
      ? '許雅婷 (Charles)'
      : currentStudentId === 'b0000000-0000-0000-0000-000000000001'
      ? '陳子翔 (Johnny)'
      : currentStudentId === '55555555-5555-4555-b555-555555555555'
      ? '劉心悅 (Lin)'
      : '新生訪客';

  const studentFullName = dbData?.student_name || currentStudentInfo?.user?.name || defaultFallbackName;
  const cleanStudentName = studentFullName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const teacherName = '林佩芬 老師';

  // 契約動態 Tab 選擇 (預設為「當前契約」索引 0)
  const [activeContractIndex, setActiveContractIndex] = useState<number>(0);

  // 解析來自資料庫/API 的契約列表 (支援分期管理)
  const contractsList = useMemo(() => {
    if (dbData?.contracts && Array.isArray(dbData.contracts) && dbData.contracts.length > 0) {
      return dbData.contracts;
    }
    if (dbData?.contract) {
      return [{
        contract_id: dbData.contract.contract_id || 'c0000000-0000-0000-0000-000000000001',
        title: `當前契約 (${dbData.contract.instrument || '古典鋼琴'})`,
        instrument: dbData.contract.instrument || '古典鋼琴',
        is_current: true,
      }];
    }
    if (currentStudentId === '89e45974-7f00-4bfd-bd84-3eb26351a150') {
      return [
        {
          contract_id: 'contract-charles-term-1',
          title: '第 1 期 (進行中 7/10 堂)',
          instrument: '古典鋼琴',
          is_current: true,
        },
        {
          contract_id: 'contract-charles-term-2',
          title: '第 2 期 (已排定 10 堂)',
          instrument: '古典鋼琴',
          is_current: false,
        },
      ];
    }
    if (currentStudentId === 'b0000000-0000-0000-0000-000000000001' || currentStudentId.includes('b0000000')) {
      return [
        {
          contract_id: 'contract-johnny-term-1',
          title: '第 1 期 (進行中 3/10 堂)',
          instrument: '古典鋼琴',
          is_current: true,
        },
        {
          contract_id: 'contract-johnny-term-2',
          title: '第 2 期 (已排定 10 堂)',
          instrument: '古典鋼琴',
          is_current: false,
        },
      ];
    }
    if (currentStudentId === '55555555-5555-4555-b555-555555555555') {
      return [
        {
          contract_id: 'contract-lin-term-3',
          title: '第 3 期 (進行中 6/10 堂)',
          instrument: '古典鋼琴',
          is_current: true,
        },
        {
          contract_id: 'contract-lin-term-4',
          title: '第 4 期 (已排定 10 堂)',
          instrument: '古典鋼琴',
          is_current: false,
        },
      ];
    }
    return [];
  }, [dbData, currentStudentId]);

  // 展開/收合已過課程狀態 (預設收合)
  const [isPastExpanded, setIsPastExpanded] = useState(false);

  // 切換學生或契約時，自動保持已過課程收合狀態
  useEffect(() => {
    setIsPastExpanded(false);
  }, [currentStudentId, activeContractIndex]);

  // 預約成功彈出視窗反饋
  const [bookingSuccessModal, setBookingSuccessModal] = useState<boolean>(false);

  // 預約下一期課程 (3步驟排課與衝堂調整流程) 狀態
  interface NewTermLesson {
    order: number;
    date: string;
    time: string;
    hasConflict: boolean;
    conflictReason?: string;
    originalDate?: string;
    isResolved?: boolean;
    resolvedSlot?: string;
    alternateOptions: string[];
    currentAltIndex: number;
  }

  const [isNewTermModalOpen, setIsNewTermModalOpen] = useState(false);
  const [newTermStep, setNewTermStep] = useState<1 | 2 | 3>(1);
  const [newTermContract, setNewTermContract] = useState('每週一堂，一堂2小時，共十堂課');
  const [newTermStartDate, setNewTermStartDate] = useState('2026/10/06 (二) 起算 · 推薦無縫接續');
  const [newTermPreferredSlot, setNewTermPreferredSlot] = useState('每週二 19:00-21:00 (延續現有時段)');
  const [newTermPaymentMethod, setNewTermPaymentMethod] = useState('整期匯款繳費');

  const [newTermLessons, setNewTermLessons] = useState<NewTermLesson[]>([
    {
      order: 1,
      date: '10/06 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['10/06 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 2,
      date: '10/13 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['10/13 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 3,
      date: '10/20 (二)',
      time: '19:00-21:00',
      hasConflict: true,
      conflictReason: '林佩芬老師當日有音樂會研習',
      originalDate: '10/20 (二)',
      isResolved: false,
      resolvedSlot: '10/21 (三) 19:00-21:00',
      alternateOptions: [
        '10/21 (三) 19:00-21:00',
        '10/22 (四) 16:30-18:30',
        '10/24 (六) 10:00-12:00',
        '10/20 (二) 19:00-21:00 (原時段待確認)',
      ],
      currentAltIndex: 0,
    },
    {
      order: 4,
      date: '10/27 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['10/27 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 5,
      date: '11/03 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['11/03 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 6,
      date: '11/10 (二)',
      time: '19:00-21:00',
      hasConflict: true,
      conflictReason: '林佩芬老師當日為術科檢定評審',
      originalDate: '11/10 (二)',
      isResolved: false,
      resolvedSlot: '11/11 (三) 19:00-21:00',
      alternateOptions: [
        '11/11 (三) 19:00-21:00',
        '11/12 (四) 16:30-18:30',
        '11/14 (六) 10:00-12:00',
        '11/10 (二) 19:00-21:00 (原時段待確認)',
      ],
      currentAltIndex: 0,
    },
    {
      order: 7,
      date: '11/17 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['11/17 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 8,
      date: '11/24 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['11/24 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 9,
      date: '12/01 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['12/01 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
    {
      order: 10,
      date: '12/08 (二)',
      time: '19:00-21:00',
      hasConflict: false,
      alternateOptions: ['12/08 (二) 19:00-21:00'],
      currentAltIndex: 0,
    },
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

  // 課前 24 小時請假須知 Modal 狀態
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeAppointment, setNoticeAppointment] = useState<Appointment | null>(null);
  const [isUrgentWarning, setIsUrgentWarning] = useState(false);

  // 報到成功反饋 Toast
  const [checkinToast, setCheckinToast] = useState<string | null>(null);

  // 呼叫真實 API: GET /api/schedule/available-slots
  const [apiSlots, setApiSlots] = useState<
    { slot_id: string; start_time: string; end_time: string; is_available: boolean }[]
  >([]);

  useEffect(() => {
    const fetchSlotsFromApi = async () => {
      try {
        const teacherId = currentStudentInfo?.student.teacher_id || 'df637b26-7cab-443b-8801-4361fb35afdd';
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

  // 取得該學生所有課程 (優先從實態 DB 資料 mapping)
  const studentAppointments = useMemo(() => {
    if (dbData?.lessons && Array.isArray(dbData.lessons) && dbData.lessons.length > 0) {
      return dbData.lessons.map((l: any, idx: number) => ({
        id: l.id,
        contract_id: l.contract_id,
        student_id: l.student_id,
        student_name: l.student_name || cleanStudentName,
        teacher_id: l.teacher_id,
        teacher_name: teacherName,
        start_time: l.start_time,
        end_time: l.end_time,
        status: l.status === 'COMPLETED' ? 'completed' : l.status === 'STUDENT_ARRIVED' ? 'confirmed' : 'confirmed',
        instrument: '古典鋼琴 (Piano)',
        location: l.room || '音符琴房 A301',
        payment_status: 'paid',
        payment_type: 'prepaid',
        lesson_index: idx + 1,
        student_checkin_at: l.student_checkin_at,
      }));
    }
    return appointments
      .filter((a) => a.student_id === currentStudentId)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [appointments, currentStudentId, dbData, cleanStudentName]);

  // 依選取的契約動態篩選課堂
  const periodAppointments = useMemo<Appointment[]>(() => {
    const activeContract = contractsList[activeContractIndex] || contractsList[0];
    const cid = activeContract?.contract_id;
    if (cid && studentAppointments.some((a: any) => a.contract_id === cid)) {
      return studentAppointments.filter((a: any) => a.contract_id === cid);
    }
    return studentAppointments;
  }, [studentAppointments, contractsList, activeContractIndex]);

  // 劃分「本期已過課程」與「即將到來的課程」
  const pastAppointments = useMemo<Appointment[]>(() => {
    return periodAppointments
      .filter((a: Appointment) => a.status === 'completed')
      .sort((a: Appointment, b: Appointment) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [periodAppointments]);

  const upcomingAppointments = useMemo<Appointment[]>(() => {
    return periodAppointments
      .filter((a: Appointment) => a.status !== 'completed')
      .sort((a: Appointment, b: Appointment) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [periodAppointments]);

  // 本期總堂數與進度計算 (根據選取契約與真實資料庫筆數)
  const totalLessons = periodAppointments.length || 8;
  const progressCount = pastAppointments.length;
  const progressPercent = Math.min(100, Math.round((progressCount / (totalLessons || 1)) * 100));

  // 老師開放的可用調課時段
  const availableSlots = useMemo(() => {
    if (apiSlots.length > 0) {
      return apiSlots.map((s) => ({
        id: s.slot_id,
        teacher_id: currentStudentInfo?.student.teacher_id || 'df637b26-7cab-443b-8801-4361fb35afdd',
        start_time: s.start_time,
        end_time: s.end_time,
        is_available: s.is_available,
        location: '音符琴房 A303',
      }));
    }
    return scheduleSlots.filter((slot) => slot.is_available);
  }, [apiSlots, scheduleSlots, currentStudentInfo]);

  // 點擊更換衝突時段輪播切換
  const handleCycleConflictSlot = (order: number) => {
    setNewTermLessons((prev) =>
      prev.map((l) => {
        if (l.order === order) {
          const nextIndex = (l.currentAltIndex + 1) % l.alternateOptions.length;
          const nextSlot = l.alternateOptions[nextIndex];
          const isOriginal = nextIndex === l.alternateOptions.length - 1;
          return {
            ...l,
            currentAltIndex: nextIndex,
            resolvedSlot: nextSlot,
            isResolved: !isOriginal,
          };
        }
        return l;
      })
    );
  };

  // 開啟調課/請假 Modal
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

  // 聯繫客服 / 提出申訴 Modal 狀態
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);

  // 監聽 URL 動作指令 (例如從 LINE Flex 卡片點擊進來)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'checkin') {
        const target = upcomingAppointments[0];
        if (target) {
          checkInAppointment(target.id);
        }
        setCheckinToast('🎉 課前報到成功！已完成今日 (09/16) 課前報到打卡。');
        setTimeout(() => setCheckinToast(null), 5000);
      } else if (action === 'renew' || action === 'resume') {
        setIsNewTermModalOpen(true);
        setNewTermStep(1);
      } else if (action === 'reschedule') {
        if (upcomingAppointments.length > 0) {
          openRescheduleModal(upcomingAppointments[0], 'reschedule');
        }
      } else if (action === 'dispute') {
        setIsContactSupportOpen(true);
      }
    }
  }, [upcomingAppointments]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setFeedback(null);
    setLeaveReason('');
    setLeaveNotes('');
    setIsSubmitting(false);
    setIsUrgentWarning(false);
  };

  // 課前 24 小時檢查
  const handleCardRescheduleClick = (appt: Appointment) => {
    const lessonTime = new Date(appt.start_time).getTime();
    const now = Date.now();
    const diffHours = (lessonTime - now) / (1000 * 60 * 60);
    const urgent = diffHours >= 0 && diffHours < 24;

    if (urgent) {
      setNoticeAppointment(appt);
      setIsNoticeModalOpen(true);
    } else {
      setIsUrgentWarning(false);
      openRescheduleModal(appt, 'reschedule');
    }
  };

  // 送出確認調課
  const handleConfirmReschedule = async () => {
    if (!selectedAppointment) return;
    setIsSubmitting(true);

    const res = requestReschedule(
      selectedAppointment.id,
      selectedNewSlotTime,
      '學員自主線上調課'
    );

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
      msg: res.message || '✅ 調課申請已確認送出！林佩芬老師與系統已即時同步更新。',
    });

    setTimeout(() => {
      closeModal();
    }, 1200);
  };

  // 送出確認請假
  const handleConfirmLeave = async () => {
    if (!selectedAppointment) return;
    if (!leaveReason) {
      alert('請先選擇請假原因');
      return;
    }
    setIsSubmitting(true);

    const res = requestLeave(
      selectedAppointment.id,
      leaveReason,
      leaveNotes
    );

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

  // 報到按鈕點擊處理
  const handleCheckin = (appt: Appointment) => {
    checkInAppointment(appt.id);
    setCheckedInIds((prev) => [...prev, appt.id]);
    showToast('報到成功！已完成課前出席報到');
    setCheckinToast(`🎉 ${formatDateBadge(appt.start_time).monthDate} 堂課報到成功！已即時通知 ${teacherName}。`);
    setTimeout(() => {
      setCheckinToast(null);
    }, 3500);
  };

  // 格式化日期與星期
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
      fullLabel: `${m}/${formattedDate} (${w})`,
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

  // 格式化課程標題 (動態結合師生與樂器)
  const formatCourseTitle = (appt: Appointment) => {
    const inst = appt.instrument || dbData?.contract?.instrument || '鋼琴';
    const tName = appt.teacher_name || teacherName;
    return `${tName} ${inst}課`;
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

  // 找出該堂課關聯的週報/聯絡簿 ID (嚴格對應 1~6 堂鋼琴課)
  const findLessonRecordId = (apptId: string) => {
    if (apptId === 'app-lin-past-1') return 'lesson-1';
    if (apptId === 'app-lin-past-2') return 'lesson-2';
    if (apptId === 'app-lin-1') return 'lesson-3';
    if (apptId === 'app-lin-2') return 'lesson-4';
    if (apptId === 'app-lin-3') return 'lesson-5';
    if (apptId === 'app-lin-4') return 'lesson-6';
    const record = lessonRecords.find((r) => r.appointment_id === apptId);
    return record?.id || 'lesson-1';
  };

  // LIFF 身分核對過渡狀態：顯示雅緻載入畫面，避免閃現訪客畫面
  if (isLiffChecking) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center gap-4 text-center p-6 select-none animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-[rgba(206,171,152,0.15)] border border-[#CEAB98]/30 flex items-center justify-center text-[#CEAB98] shadow-sm">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[17px] font-bold text-[#2B3049] flex items-center justify-center gap-2">
            <span>LINE 身分安全核對中</span>
            <span className="inline-block animate-bounce">🎵</span>
          </div>
          <p className="text-[13px] text-[#7A7E90] max-w-[260px] leading-relaxed">
            正在為您即時載入專屬課表、最新期數進度與教材大腦...
          </p>
        </div>
      </div>
    );
  }

  // 未驗證或新訪客：顯示專屬新生歡迎詞與 8 大樂器探索預約，嚴格防護現有學員隱私
  if (!isVerifiedStudent) {
    return (
      <div className="w-full flex flex-col gap-4 font-['Sora','Noto_Sans_TC',sans-serif] pb-20 select-none animate-in fade-in">
        {/* Hero 歡迎區塊 */}
        <section className="px-2 py-3 flex flex-col items-center gap-2 text-center">
          {/* 徽章標籤 */}
          <div className="px-3.5 py-1 bg-[rgba(77,173,184,0.12)] rounded-full inline-flex items-center gap-1.5 border border-[#4DADB8]/30">
            <span className="text-[#4DADB8] text-[12px] font-bold">✦</span>
            <span className="text-[#4DADB8] text-[12px] font-bold tracking-wider">MUSIMATE 音樂私塾</span>
          </div>

          {/* 主標題 */}
          <h1 className="w-full text-[#2B3049] text-[22px] font-extrabold leading-[30px] tracking-tight">
            陪你探索音樂天賦的好夥伴
          </h1>

          {/* 新生歡迎詞卡片 */}
          <div className="w-full p-4 bg-white rounded-2xl border border-[#F0EAE1] shadow-xs flex flex-col gap-2 text-left mt-1">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">✨</span>
              <span className="text-[14px] font-bold text-[#2B3049]">歡迎來到 MusiMate 音樂教室！</span>
            </div>
            <p className="text-[#6F6F6F] text-[13px] leading-[21px]">
              在悠揚的旋律中，找尋屬於你的律動。<br />
              您目前尚未綁定正式學員合約。歡迎挑選心儀的樂器，立即預約免費試上，與專業導師一起譜寫美妙的樂章！
            </p>
          </div>

          {/* 免費預約試上大型行動按鈕 */}
          <button
            type="button"
            onClick={() => router.push('/student/courses')}
            className="w-full h-12 px-6 bg-[#B58EBE] text-white font-bold text-[14px] rounded-2xl shadow-[0px_4px_14px_rgba(181,142,190,0.35)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <Sparkles className="w-4 h-4" />
            <span>探索 8 大樂器 · 免費預約試上</span>
          </button>
        </section>

        {/* 8 大樂器快速探索網格 (點擊直接進入該樂器師資與預約) */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[#2B3049] text-[14px] font-bold">探索熱門樂器課程</span>
            <button
              type="button"
              onClick={() => router.push('/student/courses')}
              className="text-[12px] font-bold text-[#B58EBE] hover:underline cursor-pointer"
            >
              查看全部 ➔
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'piano', name: '鋼琴', enName: 'PIANO', color: '#D9668C', bg: 'rgba(217,102,140,0.10)', icon: '🎹' },
              { id: 'guitar', name: '吉他', enName: 'GUITAR', color: '#E58C4D', bg: 'rgba(229,140,77,0.08)', icon: '🎸' },
              { id: 'violin', name: '小提琴', enName: 'VIOLIN', color: '#8C73C7', bg: 'rgba(140,115,199,0.08)', icon: '🎻' },
              { id: 'saxophone', name: '薩克斯風', enName: 'SAXOPHONE', color: '#4DADB8', bg: 'rgba(77,173,184,0.10)', icon: '🎷' },
              { id: 'drums', name: '爵士鼓', enName: 'DRUMS', color: '#D9668C', bg: 'rgba(217,102,140,0.10)', icon: '🥁' },
              { id: 'trumpet', name: '小號', enName: 'TRUMPET', color: '#E58C4D', bg: 'rgba(229,140,77,0.08)', icon: '🎺' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/student/courses?instrument=${item.id}`)}
                className="p-3.5 bg-white rounded-2xl border border-[#F0EAE1] shadow-2xs hover:shadow-md hover:border-[#CEAB98] active:scale-[0.98] transition-all cursor-pointer flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-full h-[64px] rounded-xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: item.bg }}
                >
                  {item.icon}
                </div>
                <div className="text-[14px] font-bold text-[#2B3049]">{item.name}</div>
                <div className="text-[10px] font-semibold text-[#A3A7BA] tracking-wider uppercase">{item.enName}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 預約體驗 3 步驟指南 */}
        <section className="p-4 bg-white rounded-2xl border border-[#F0EAE1] shadow-xs flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B58EBE]" />
            <span className="text-[13px] font-bold text-[#2B3049]">預約體驗課 3 步驟</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2.5 bg-[#FAF6F0] rounded-xl flex flex-col items-center gap-1.5 border border-[#F0EAE1]">
              <span className="w-6 h-6 rounded-full bg-[#B58EBE] text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span className="text-[11px] font-bold text-[#2B3049]">挑選樂器</span>
              <span className="text-[9px] text-[#7A7E90]">8 大熱門項目</span>
            </div>
            <div className="p-2.5 bg-[#FAF6F0] rounded-xl flex flex-col items-center gap-1.5 border border-[#F0EAE1]">
              <span className="w-6 h-6 rounded-full bg-[#4DADB8] text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <span className="text-[11px] font-bold text-[#2B3049]">選擇師資</span>
              <span className="text-[9px] text-[#7A7E90]">專業名師指導</span>
            </div>
            <div className="p-2.5 bg-[#FAF6F0] rounded-xl flex flex-col items-center gap-1.5 border border-[#F0EAE1]">
              <span className="w-6 h-6 rounded-full bg-[#68C5AB] text-white text-[11px] font-bold flex items-center justify-center">3</span>
              <span className="text-[11px] font-bold text-[#2B3049]">線上預約</span>
              <span className="text-[9px] text-[#7A7E90]">享受專屬試上</span>
            </div>
          </div>
        </section>

        {/* 聯繫客服 Modal 按鈕 */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setIsContactSupportOpen(true)}
            className="text-[12px] font-semibold text-[#7A7E90] hover:text-[#2B3049] flex items-center gap-1 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>需要協助？聯繫官方客服或老師諮詢</span>
          </button>
        </div>

        <ContactSupportModal
          isOpen={isContactSupportOpen}
          onClose={() => setIsContactSupportOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 font-['Sora','Noto_Sans_TC',sans-serif] pb-20 select-none animate-in fade-in">
      {/* 頂部通知 Toast */}
      {checkinToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[340px] w-[92%] px-4 py-3 bg-[#2B3049] text-white text-xs font-semibold rounded-2xl shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{checkinToast}</span>
        </div>
      )}

      {/* 頁面標題 */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <h1 className="text-[20px] font-extrabold text-[#2B3049] tracking-tight">我的課表</h1>
        <p className="text-[13px] text-[#6F6F6F] font-normal">
          {cleanStudentName} 同學 · 指導教師：{teacherName}
        </p>
      </div>

      {/* 契約 Tab 按鈕 (動態依契約數量增加，預設為「當前契約」) */}
      <div className="w-full p-1 bg-[#EBE4D8] rounded-2xl flex items-center gap-1 shadow-inner overflow-x-auto">
        {contractsList.map((c: any, index: number) => {
          const isActive = activeContractIndex === index;
          const tabTitle = c.title || (index === 0 ? '當前契約' : `契約 ${index + 1}`);
          return (
            <button
              key={c.contract_id || index}
              type="button"
              onClick={() => setActiveContractIndex(index)}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-center text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#885424] shadow-sm'
                  : 'text-[#6F6F6F] hover:text-[#2B3049]'
              }`}
            >
              {tabTitle}
            </button>
          );
        })}
      </div>

      {/* 契約進行進度長條指示器 */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBDCB9] shadow-xs flex flex-col gap-2">
        <div className="flex justify-between items-center text-[13px] font-bold">
          <span className="text-[#2B3049] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C58D34]" />
            {contractsList[activeContractIndex]?.title || '當前契約進行進度'}
          </span>
          <span className="text-[#885424]">
            {progressCount} / {totalLessons} 堂 (進行中)
          </span>
        </div>
        <div className="w-full h-[10px] bg-[#F2EDE5] rounded-full overflow-hidden flex">
          <div
            className="bg-[#CEAB98] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-[#8E90A6] flex justify-between" suppressHydrationWarning>
          <span suppressHydrationWarning>
            已完成 {progressCount} 堂 · 剩餘抵扣 {Math.max(0, totalLessons - progressCount)} 堂
          </span>
          <span>共 {totalLessons} 堂課</span>
        </div>
      </div>

      {/* 待繳費提醒橫幅 (例如第 4 期已排定尚未繳費核銷) */}
      {activeContractIndex > 0 && (
        <div className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col gap-2.5 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[14px] font-bold text-amber-900">
                {contractsList[activeContractIndex]?.title || '第 4 期課堂'} · 待完成繳費對帳
              </div>
              <div className="text-[12px] text-amber-800/90 leading-relaxed">
                老師已為您排定並保留專屬時段（保留期限 14 天）。請盡速前往「上傳繳費證明」完成核銷，正式開通新期課堂！
              </div>
            </div>
          </div>
          <div className="pt-0.5 flex items-center gap-2">
            <Link
              href="/student/billing"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[12px] rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>前往繳費對帳 (NT$ 8,000)</span>
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. 查看本期已過課程 (顯示可收合列表，點擊直達鋼琴聯絡簿)  */}
      {/* ======================================================== */}
      {pastAppointments.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setIsPastExpanded(!isPastExpanded)}
            className="w-full px-3.5 py-2.5 bg-white/70 hover:bg-white rounded-xl flex justify-between items-center text-left transition-colors border border-[#EBDCB9]/60 cursor-pointer"
          >
            <span className="text-[13px] font-bold text-[#6F6F6F] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#C58D34]" />
              查看已完成歷史課堂 (共 {pastAppointments.length} 堂)
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                isPastExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isPastExpanded && (
            <div className="flex flex-col gap-2.5 pt-1 animate-in fade-in duration-200">
              {pastAppointments.map((appt: Appointment, idx: number) => {
                const dateInfo = formatDateBadge(appt.start_time);
                const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
                const courseTitle = formatCourseTitle(appt);
                const location = appt.location || '音符琴房 A303';
                const payment = formatPaymentBadge(appt.payment_status, appt.payment_type);
                const recordId = findLessonRecordId(appt.id);
                const lessonNum = pastAppointments.length - idx;

                return (
                  <div
                    key={appt.id}
                    className="w-full p-3.5 rounded-2xl bg-white/90 border border-[#EBDCB9] shadow-xs flex flex-col gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      {/* 左側日期 */}
                      <div className="w-14 h-16 rounded-xl flex flex-col justify-center items-center gap-0.5 shrink-0 bg-[#FAF6F0] border border-[#EBDCB9]/50">
                        <span className="text-[16px] font-bold text-[#2B3049] leading-tight" suppressHydrationWarning>
                          {dateInfo.monthDate}
                        </span>
                        <span className="text-[12px] font-normal text-[#6F6F6F] leading-tight" suppressHydrationWarning>
                          {dateInfo.weekday}
                        </span>
                      </div>

                      {/* 右側資訊 */}
                      <div className="flex-1 p-2.5 bg-[#F3F4F6] rounded-xl flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-[12px] font-semibold text-[#6F6F6F]">
                            <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            <span>{timeSpan}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${payment.color}`}>
                            {payment.text}
                          </span>
                        </div>
                        <div className="text-[14px] font-bold text-[#2B3049]">
                          第 {lessonNum} 堂 · {courseTitle}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6F6F6F]">
                          <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                          <span>{location}</span>
                        </div>
                      </div>
                    </div>

                    {/* 查看該堂專屬鋼琴聯絡簿 */}
                    <Link
                      href={`/student/summary/${recordId}`}
                      className="w-full py-2 px-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-[0.99] rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#EBDCB9] text-[#885424] text-[12px] font-bold"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#C58D34]" />
                      <span>查看第 {lessonNum} 堂課堂聯絡簿 (AI 語音週報)</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. 即將到來的課程清單                                     */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-3">
        <div className="px-1 flex justify-between items-center">
          <span className="text-[14px] font-bold text-[#2B3049] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C58D34]" />
            即將到來的課程 (本期剩餘 {upcomingAppointments.length} 堂)
          </span>
          <span className="text-xs text-[#8E90A6]">
            {upcomingAppointments.length > 0
              ? `第 ${pastAppointments.length + 1} ~ ${pastAppointments.length + upcomingAppointments.length} 堂`
              : '無未到來課程'}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appt: Appointment, idx: number) => {
              const dateInfo = formatDateBadge(appt.start_time);
              const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
              const courseTitle = formatCourseTitle(appt);
              const location = appt.location || '音符琴房 A303';
              const payment = formatPaymentBadge(appt.payment_status, appt.payment_type);
              const isFirstUpcoming = idx === 0;
              const lessonNum = pastAppointments.length + 1 + idx;

              return (
                <div
                  key={appt.id}
                  className="w-full p-4 bg-white rounded-2xl shadow-xs border border-[#EBDCB9] flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* 左側日期 */}
                    <div className="w-14 h-16 rounded-xl flex flex-col justify-center items-center gap-0.5 shrink-0 bg-[#FAF6F0] border border-[#EBDCB9]/50">
                      <span className="text-[16px] font-bold text-[#2B3049] leading-tight" suppressHydrationWarning>
                        {dateInfo.monthDate}
                      </span>
                      <span className="text-[12px] font-normal text-[#6F6F6F] leading-tight" suppressHydrationWarning>
                        {dateInfo.weekday}
                      </span>
                    </div>

                    {/* 右側暖米色卡片 */}
                    <div className="flex-1 p-3 bg-[#FAF6F0] rounded-xl flex flex-col gap-1.5 border border-[#EBDCB9]/40">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#6F6F6F]">
                          <Clock className="w-3.5 h-3.5 text-[#6F6F6F]" />
                          <span>{timeSpan}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${payment.color}`}>
                          {payment.text}
                        </span>
                      </div>
                      <div className="text-[15px] font-bold text-[#2B3049]">
                        第 {lessonNum} 堂 · {courseTitle}
                      </div>
                      <div className="flex items-center gap-1 text-[12px] font-normal text-[#6F6F6F]">
                        <MapPin className="w-3 h-3 text-[#6F6F6F]" />
                        <span>{location}</span>
                      </div>
                    </div>
                  </div>

                  {/* 動作按鈕：首堂即將到來課程提供 15 分鐘前報到與請假調課 */}
                  {isFirstUpcoming ? (
                    <div className="w-full flex flex-col gap-2 pt-1">
                      {appt.status === 'attended' || (appt as any).attendance === 'attended' || (appt as any).student_checkin_at || checkedInIds.includes(appt.id) ? (
                        <div className="w-full py-2.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex justify-center items-center gap-2 font-bold text-[13px] select-none">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>✔ 已成功報到（準時出席）</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCheckin(appt)}
                            className="w-full py-2.5 px-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] rounded-xl flex justify-center items-center gap-2 text-white font-bold text-[14px] shadow-sm shadow-[#CEAB98]/25 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>課前15分鐘開放報到</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCardRescheduleClick(appt)}
                            className="w-full py-2 px-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-[0.99] rounded-xl flex justify-center items-center gap-1.5 text-[#6F6F6F] font-bold text-[13px] transition-all cursor-pointer border border-[#EBDCB9]"
                          >
                            <span>請於課前24小時前完成請假/調課</span>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCardRescheduleClick(appt)}
                      className="w-full py-2 px-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-[0.99] rounded-xl flex justify-center items-center gap-1.5 text-[#6F6F6F] font-bold text-[13px] transition-all cursor-pointer border border-[#EBDCB9]"
                    >
                      <span>請於課前24小時前完成請假/調課</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#CEAB98]/40">
              <span className="text-sm text-[#8C827A] font-bold">目前無排定的新課程</span>
            </div>
          )}

          {/* 預約下一期課程按鈕 (原老師續約) */}
          <div className="w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  setNewTermStep(1);
                  setIsNewTermModalOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#CEAB98] to-[#BA947F] hover:brightness-105 active:scale-[0.99] rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-[15px] shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>預約下一期課程 (第 4 期續約)</span>
              </button>
            </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 請假／調課 彈出視窗 (點擊背景關閉)                        */}
      {/* ======================================================== */}
      {isModalOpen && selectedAppointment && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] max-h-[90vh] overflow-y-auto bg-white rounded-[24px] p-6 shadow-2xl flex flex-col gap-4 border border-[#EBDCB9] animate-in zoom-in-95 [scrollbar-width:thin]"
          >
            {/* 雙分頁切換 */}
            <div className="w-full p-1 bg-[#F2EDE5] rounded-xl flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setModalTab('reschedule');
                  setFeedback(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-center text-[14px] font-bold transition-all cursor-pointer ${
                  modalTab === 'reschedule'
                    ? 'bg-white shadow-xs text-[#E8734A]'
                    : 'text-[#808080] hover:text-[#2B3049]'
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
                className={`flex-1 py-1.5 rounded-lg text-center text-[14px] font-bold transition-all cursor-pointer ${
                  modalTab === 'leave'
                    ? 'bg-white shadow-xs text-[#E8734A]'
                    : 'text-[#808080] hover:text-[#2B3049]'
                }`}
              >
                請假
              </button>
            </div>

            {/* 標題與關閉按鈕 */}
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2B3049]" />
                <h2 className="text-[18px] font-bold text-[#2B3049]">
                  {modalTab === 'reschedule' ? '線上課堂調課' : '線上請假申請'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#2B3049] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 反饋訊息 */}
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

            {/* 調課分頁 */}
            {modalTab === 'reschedule' && (
              <div className="w-full flex flex-col gap-3">
                <div className="w-full flex flex-col gap-1">
                  <span className="text-[#6F6F6F] text-[13px] font-bold">原排定課堂</span>
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EBDCB9] text-xs font-semibold text-[#2B3049]">
                    {formatDateBadge(selectedAppointment.start_time).fullLabel} {formatTimeSpan(selectedAppointment.start_time, selectedAppointment.end_time)} · {formatCourseTitle(selectedAppointment)}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <span className="text-[#6F6F6F] text-[13px] font-bold">選擇欲調至之新時段</span>
                  <select
                    value={selectedNewSlotTime}
                    onChange={(e) => setSelectedNewSlotTime(e.target.value)}
                    className="w-full p-3 bg-white border border-[#EBDCB9] rounded-xl text-[13px] font-bold text-[#2B3049] outline-hidden focus:ring-2 focus:ring-[#CEAB98]"
                  >
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => {
                        const slotDate = formatDateBadge(slot.start_time);
                        const slotTime = formatTimeSpan(slot.start_time, slot.end_time);
                        return (
                          <option key={slot.id} value={slot.start_time}>
                            {slotDate.fullLabel} {slotTime}
                          </option>
                        );
                      })
                    ) : (
                      <option value="">目前無開放可調課時段</option>
                    )}
                  </select>
                </div>

                <div className="w-full pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmReschedule}
                    disabled={!selectedNewSlotTime || isSubmitting}
                    className="flex-1 py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-[14px] rounded-xl shadow-sm transition-all text-center cursor-pointer"
                  >
                    {isSubmitting ? '處理中...' : '送出確認調課'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('leave')}
                    className="py-3 px-4 bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#6F6F6F] font-bold text-[13px] rounded-xl border border-[#EBE5DB] cursor-pointer"
                  >
                    先請假
                  </button>
                </div>
              </div>
            )}

            {/* 請假分頁 */}
            {modalTab === 'leave' && (
              <div className="w-full flex flex-col gap-3">
                <div className="w-full flex flex-col gap-1">
                  <span className="text-[#6F6F6F] text-[13px] font-bold">選擇欲請假之課堂</span>
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EBDCB9] text-xs font-semibold text-[#2B3049]">
                    {formatDateBadge(selectedAppointment.start_time).fullLabel} {formatTimeSpan(selectedAppointment.start_time, selectedAppointment.end_time)} · {formatCourseTitle(selectedAppointment)}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <span className="text-[#6F6F6F] text-[13px] font-bold">請假原因</span>
                  <select
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full p-3 bg-white border border-[#EBDCB9] rounded-xl text-[13px] font-bold text-[#2B3049] outline-hidden focus:ring-2 focus:ring-[#CEAB98]"
                  >
                    <option value="" disabled>請選擇原因</option>
                    <option value="事假 (個人行程)">事假 (個人行程)</option>
                    <option value="病假 (身體不適)">病假 (身體不適)</option>
                    <option value="學校活動 / 段考">學校活動 / 段考</option>
                    <option value="家庭出遊 / 聚會">家庭出遊 / 聚會</option>
                    <option value="其他原因">其他原因</option>
                  </select>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <span className="text-[#6F6F6F] text-[13px] font-bold">備註（選填）</span>
                  <textarea
                    value={leaveNotes}
                    onChange={(e) => setLeaveNotes(e.target.value)}
                    placeholder="如需向老師說明請在此填寫"
                    rows={2}
                    className="w-full p-2.5 bg-[#FAF6F0] rounded-xl text-[13px] font-medium text-[#2B3049] border border-[#EBDCB9] resize-none"
                  />
                </div>

                <div className="w-full pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-[#6F6F6F] font-bold text-[14px] hover:bg-slate-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLeave}
                    disabled={!leaveReason || isSubmitting}
                    className="flex-1 py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-[14px] rounded-xl shadow-sm transition-all text-center cursor-pointer"
                  >
                    {isSubmitting ? '處理中...' : '確認請假'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. 課前 24 小時內請假須知 彈出視窗 (點擊背景關閉)          */}
      {/* ======================================================== */}
      {isNoticeModalOpen && noticeAppointment && (
        <div
          onClick={() => {
            setIsNoticeModalOpen(false);
            setNoticeAppointment(null);
          }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white rounded-[24px] p-6 shadow-2xl flex flex-col gap-4 border border-rose-200 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#2B3049]">請假／調課須知</h3>
                <span className="text-[11px] font-semibold text-rose-600">課前 24 小時內扣款提醒</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#EBE5DB] text-xs text-[#6F6F6F] leading-relaxed space-y-2">
              <p className="font-bold text-rose-700">⚠️ 依據鋼琴教室上課規範：</p>
              <p>• 課前 24 小時前可<strong>免費線上調課</strong>或<strong>保留課程額度</strong>。</p>
              <p>• 當前已進入<strong>【課前 24 小時內】</strong>，臨時請假或調課將<strong>照常扣除該堂學費／時數（扣款 1 堂）</strong>。</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsNoticeModalOpen(false);
                  setNoticeAppointment(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[#6F6F6F] font-bold text-[13px] hover:bg-slate-50 cursor-pointer"
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
                className="flex-1 py-2.5 bg-[#E8734A] hover:bg-[#D3633C] text-white font-bold text-[13px] rounded-xl shadow-sm cursor-pointer"
              >
                確定知悉並繼續
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 預約下一期課程 (3步驟排課與衝堂調整) 彈出視窗 (點擊背景關閉)*/}
      {/* ======================================================== */}
      {isNewTermModalOpen && (
        <div
          onClick={() => setIsNewTermModalOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] max-h-[88vh] bg-[#FAF6F0] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-[#EBDCB9] animate-in zoom-in-95"
          >
            {/* 頂部標題與指示器 */}
            <div className="p-4 bg-white border-b border-[#EBDCB9] flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#CEAB98]/20 flex items-center justify-center text-[#CEAB98]">
                    <Calendar className="w-4 h-4 text-[#CEAB98]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#2B3049]">預約下一期課程 (第 4 期)</h3>
                    <p className="text-[11px] text-[#6F6F6F]">指導老師：{teacherName}</p>
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

              {/* 3 步驟指示器 */}
              <div className="flex items-center justify-between pt-1">
                {[
                  { step: 1, label: '偏好設定' },
                  { step: 2, label: '時段比對' },
                  { step: 3, label: '確認送出' },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-1.5 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        newTermStep >= s.step ? 'bg-[#CEAB98] text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {s.step}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        newTermStep >= s.step ? 'text-[#2B3049]' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {s.label}
                    </span>
                    {s.step < 3 && <div className="flex-1 h-[1px] bg-slate-200 mx-1" />}
                  </div>
                ))}
              </div>
            </div>

            {/* 內容滾動區 */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 [scrollbar-width:thin]">
              {/* 步驟 1: 預約偏好選擇 (開課日期設定為 3 週後) */}
              {newTermStep === 1 && (
                <div className="flex flex-col gap-3 text-[13px]">
                  <div className="bg-white p-3.5 rounded-xl border border-[#EBDCB9] flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-[#6F6F6F]">續約方案合約</label>
                    <div className="font-bold text-[#2B3049]">{newTermContract}</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#EBDCB9] flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#6F6F6F]">
                      期望起算開課週（本期結束後三週）
                    </label>
                    <select
                      value={newTermStartDate}
                      onChange={(e) => setNewTermStartDate(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF6F0] rounded-lg border border-[#EBDCB9] font-bold text-[#2B3049] text-[13px] outline-hidden"
                    >
                      <option value="2026/10/06 (二) 起算 · 推薦無縫接續">
                        2026/10/06 (二) 起算 · 推薦無縫接續
                      </option>
                      <option value="2026/10/13 (二) 起算 · 延後一週">
                        2026/10/13 (二) 起算 · 延後一週
                      </option>
                      <option value="2026/10/20 (二) 起算 · 延後兩週">
                        2026/10/20 (二) 起算 · 延後兩週
                      </option>
                    </select>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#EBDCB9] flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#6F6F6F]">常規期望時段</label>
                    <select
                      value={newTermPreferredSlot}
                      onChange={(e) => setNewTermPreferredSlot(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF6F0] rounded-lg border border-[#EBDCB9] font-bold text-[#2B3049] text-[13px] outline-hidden"
                    >
                      <option value="每週二 19:00-21:00 (延續現有時段)">
                        每週二 19:00-21:00 (延續現有固定時段)
                      </option>
                      <option value="每週四 16:30-18:30">每週四 16:30-18:30</option>
                      <option value="每週六 10:00-12:00">每週六 10:00-12:00</option>
                      <option value="每週日 14:00-16:00">每週日 14:00-16:00</option>
                    </select>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#EBDCB9] flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#6F6F6F]">預計繳費方式</label>
                    <div className="flex gap-2">
                      {['整期匯款繳費', 'LINE Pay / 信用卡'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setNewTermPaymentMethod(m)}
                          className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all border cursor-pointer ${
                            newTermPaymentMethod === m
                              ? 'bg-[#CEAB98] text-white border-[#CEAB98]'
                              : 'bg-[#FAF6F0] text-[#6F6F6F] border-[#EBDCB9]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 步驟 2: 系統排課與衝堂比對 (支援點擊多次輪播更換時段) */}
              {newTermStep === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[12px] text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      系統為您比對 10 堂時段，檢測到 <strong>2 堂課</strong> 與老師既定行程衝堂。您可<strong>點擊更換時段</strong>循環挑選適合時間！
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-[12px]">
                    {newTermLessons.map((item) => (
                      <div
                        key={item.order}
                        className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                          item.hasConflict && !item.isResolved
                            ? 'bg-rose-50/70 border-rose-200'
                            : item.isResolved
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-white border-[#EBDCB9]'
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
                              已調課 ({item.currentAltIndex + 1}/{item.alternateOptions.length})
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#6F6F6F]">
                              時段正常
                            </span>
                          )}
                        </div>

                        {/* 衝突時段可點選按鈕循環切換 */}
                        {item.hasConflict && (
                          <div className="pt-1 flex items-center justify-between border-t border-rose-100/80">
                            <span className="text-[11px] text-rose-600">
                              {item.conflictReason}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCycleConflictSlot(item.order)}
                              className="px-2.5 py-1 bg-[#CEAB98] hover:bg-[#BA947F] text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>換其他時段</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 步驟 3: 最終確認送出 (指導老師林佩芬) */}
              {newTermStep === 3 && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-[13px]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong>10 堂課時段皆已排妥！</strong>
                      <div className="text-[11px] text-emerald-700">時段無衝突，已準備好送出第 4 期預約。</div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#EBDCB9] flex flex-col gap-2 text-[12px]">
                    <div className="flex justify-between text-[#6F6F6F]">
                      <span>指導老師</span>
                      <span className="font-bold text-[#2B3049]">{teacherName} (鋼琴)</span>
                    </div>
                    <div className="flex justify-between text-[#6F6F6F]">
                      <span>課程期別</span>
                      <span className="font-bold text-[#2B3049]">第 4 期 (共 10 堂課)</span>
                    </div>
                    <div className="flex justify-between text-[#6F6F6F]">
                      <span>預估開課區間</span>
                      <span className="font-bold text-[#2B3049]">2026/10/06 ~ 2026/12/08</span>
                    </div>
                    <div className="flex justify-between text-[#6F6F6F]">
                      <span>應繳學費總額</span>
                      <span className="font-bold text-[#CEAB98] text-[14px]">NT$ 14,000</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#9CA3AF] text-center leading-relaxed">
                    送出後將為您保留名額與時段，林佩芬老師將於 24 小時內審核確認。
                  </div>
                </div>
              )}
            </div>

            {/* 底部動作按鈕 (上一步寬度充裕，送出按鈕醒目) */}
            <div className="p-3 bg-white border-t border-[#EBDCB9] flex items-center gap-2.5 shrink-0">
              {newTermStep > 1 && (
                <button
                  type="button"
                  onClick={() => setNewTermStep((prev) => (prev - 1) as any)}
                  className="w-28 py-3 px-4 rounded-xl border border-[#EBDCB9] text-[#6F6F6F] font-bold text-[14px] bg-white hover:bg-slate-50 transition-all cursor-pointer text-center shrink-0"
                >
                  上一步
                </button>
              )}
              {newTermStep === 1 && (
                <button
                  type="button"
                  onClick={() => setNewTermStep(2)}
                  className="w-full py-3.5 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] text-white font-bold text-[14px] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  下一步：比對課表時段
                </button>
              )}
              {newTermStep === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setNewTermLessons((prev) =>
                      prev.map((l) => ({
                        ...l,
                        isResolved: true,
                        resolvedSlot: l.resolvedSlot || l.alternateOptions[0],
                      }))
                    );
                    setNewTermStep(3);
                  }}
                  className="flex-1 py-3.5 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] text-white font-bold text-[14px] rounded-xl shadow-sm transition-all cursor-pointer"
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
                    setIsNewTermModalOpen(false);
                    setNewTermStep(1);
                    setBookingSuccessModal(true);
                    showToast('🎉 下一期課程預約成功！');
                  }}
                  className="flex-1 py-3.5 px-4 bg-[#E05D52] hover:bg-[#C94A3F] active:scale-[0.99] text-white font-bold text-[15px] rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  確認送出下一期預約
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. 預約成功回饋彈窗 (告知預約成功並可檢視第 4 期課表)          */}
      {/* ======================================================== */}
      {bookingSuccessModal && (
        <div
          onClick={() => setBookingSuccessModal(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white rounded-[24px] p-6 shadow-2xl flex flex-col items-center text-center gap-3 border border-emerald-200 animate-in zoom-in-95"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#2B3049]">第 4 期課程預約成功！</h3>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              系統已自動為您預約 <strong>林佩芬 老師</strong> 2026/10/06 起算共 10 堂鋼琴課。時段已更新至您的課表清單！
            </p>
            <button
              type="button"
              onClick={() => setBookingSuccessModal(false)}
              className="w-full py-3 bg-[#CEAB98] hover:bg-[#BA947F] text-white font-bold text-[14px] rounded-xl shadow-md transition-all mt-2 cursor-pointer"
            >
              查看第 4 期課表
            </button>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* 7. 聯繫客服 / 提出申訴彈窗                                    */}
      {/* ======================================================== */}
      <ContactSupportModal
        isOpen={isContactSupportOpen}
        onClose={() => setIsContactSupportOpen(false)}
      />
    </div>
  );
}

export default function StudentSchedulePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-stone-400">正在載入學生課表...</div>}>
      <StudentScheduleContent />
    </Suspense>
  );
}

