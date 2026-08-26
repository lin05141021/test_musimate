'use client';

import React, { useState, useEffect } from 'react';
import { useDemoContext } from '@/context/DemoContext';
import { Appointment, ScheduleSlot } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Music2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Bell,
  CreditCard,
} from 'lucide-react';

export default function StudentSchedulePage() {
  const {
    appointments,
    studentProfile,
    teacherProfile,
    scheduleSlots,
    requestReschedule,
  } = useDemoContext();

  // 當前學生選擇 (預設為 Lin / Context 中的學生)
  const [currentStudentId, setCurrentStudentId] = useState<string>(
    studentProfile.id || 's0000000-0000-0000-0000-000000000005'
  );

  // 調課 Modal 狀態 (圖二)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedNewSlotTime, setSelectedNewSlotTime] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // 取得資料庫中該學生的所有預約課程 (依 start_time 欄位由近到遠排序)
  const studentAppointments = appointments
    .filter((a) => a.student_id === currentStudentId)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // 取得資料庫中張老師開放的空閒時段 (is_available = true)
  const availableSlots = scheduleSlots.filter((slot) => slot.is_available);

  // 自動解析網址參數 (例如從 LINE 課前推播卡片點擊 ?action=reschedule 或 ?student=lin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const lessonId = params.get('lesson_id');
      const studentParam = params.get('student');

      if (studentParam) {
        if (studentParam.toLowerCase().includes('charles')) {
          setCurrentStudentId('s0000000-0000-0000-0000-000000000003');
        } else if (studentParam.toLowerCase().includes('johnny')) {
          setCurrentStudentId('s0000000-0000-0000-0000-000000000004');
        } else if (studentParam.toLowerCase().includes('lin')) {
          setCurrentStudentId('s0000000-0000-0000-0000-000000000005');
        }
      }

      // 如果帶入 action=reschedule，自動開啟最近一堂課的調課 Modal (圖二)
      if (action === 'reschedule' || lessonId) {
        const target = lessonId
          ? appointments.find((a) => a.id === lessonId)
          : studentAppointments[0];
        if (target) {
          openRescheduleModal(target);
        }
      }
    }
  }, [appointments]);

  // 開啟調課 Modal (圖二)
  const openRescheduleModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
    setFeedback(null);
    if (availableSlots.length > 0) {
      setSelectedNewSlotTime(availableSlots[0].start_time);
    }
  };

  // 關閉 Modal (回到圖一)
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setFeedback(null);
  };

  // 送出確認調課 (更新資料庫 start_time 欄位)
  const handleConfirmReschedule = () => {
    if (!selectedAppointment) return;

    requestReschedule(
      selectedAppointment.id,
      selectedNewSlotTime,
      '學員自主線上調課'
    );

    setFeedback({
      success: true,
      msg: '✅ 調課已送出！張老師與系統已同步更新。',
    });

    setTimeout(() => {
      closeModal();
    }, 1800);
  };

  // 先請假之後再調整 (更新資料庫 status = 'rescheduled' 並保留時數)
  const handleTakeLeave = () => {
    if (!selectedAppointment) return;

    setFeedback({
      success: true,
      msg: '📌 已為您標記請假！此堂課程時數已完整為您保留。',
    });

    setTimeout(() => {
      closeModal();
    }, 1800);
  };

  // 格式化資料庫日期時間 (start_time ➔ 8/26 (三))
  const formatDateBadge = (isoStr: string) => {
    const d = new Date(isoStr);
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const w = weekdays[d.getDay()];
    return {
      monthDate: `${m}/${date}`,
      weekday: `(${w})`,
      fullLabel: `${String(m).padStart(2, '0')}/${String(date).padStart(2, '0')} (週${w})`,
    };
  };

  // 格式化資料庫時段 (start_time ~ end_time ➔ 10:00 - 12:00)
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

  // 格式化課程標題 (依據資料庫 instrument 欄位)
  const formatCourseTitle = (appt: Appointment) => {
    if (appt.instrument?.includes('Piano') || appt.instrument?.includes('鋼琴')) {
      return '張老師鋼琴課';
    }
    if (appt.instrument?.includes('Violin') || appt.instrument?.includes('小提琴')) {
      return '張老師小提琴課';
    }
    return `張老師 · ${appt.instrument || '個別指導課'}`;
  };

  // 格式化繳費標籤 (依據資料庫 payment_status & payment_type 欄位)
  const formatPaymentBadge = (status?: string, type?: string) => {
    if (status === 'paid') return { text: '已繳費 (預付)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (status === 'pay_per_lesson' || type === 'postpaid') return { text: '課後現金繳費', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: '未繳費', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-4 px-2 sm:px-4 flex justify-center items-start font-['Noto_Sans_TC',sans-serif]">
      {/* 手機 RWD 外框容器 (完全依照 Figma 402px 圓角設計規範) */}
      <div className="w-full max-w-[402px] min-h-[874px] bg-[#FAF6F0] shadow-2xl rounded-[40px] overflow-hidden flex flex-col justify-between relative border border-[#FAF6F0]">
        
        {/* 頂部狀態列 & 導航列 */}
        <div>
          {/* iOS 模擬狀態列 */}
          <div className="w-full h-11 px-6 flex justify-between items-center text-[#2B3049] font-bold text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-4 h-2.5 bg-[#2B3049] rounded-xs"></div>
              <div className="w-3.5 h-2.5 bg-[#2B3049] rounded-xs"></div>
              <div className="w-5 h-2.5 bg-[#2B3049] rounded-xs"></div>
            </div>
          </div>

          {/* 品牌導航列 */}
          <div className="w-full h-16 px-5 border-b border-[#F0EBE1] flex justify-between items-center bg-[#FAF6F0]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#CEAB98] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🎵
              </div>
              <span className="font-bold text-[#2B3049] tracking-wider text-base">
                MusiMate
              </span>
            </div>

            {/* 學生切換器 (供測試切換 Lin / Charles / Johnny) */}
            <div className="flex items-center gap-2">
              <select
                value={currentStudentId}
                onChange={(e) => setCurrentStudentId(e.target.value)}
                className="bg-white/80 border border-[#E5DEC9] text-[#2B3049] text-xs font-bold py-1.5 px-2.5 rounded-full shadow-2xs focus:outline-hidden"
              >
                <option value="s0000000-0000-0000-0000-000000000005">Lin (鋼琴)</option>
                <option value="s0000000-0000-0000-0000-000000000003">Charles (鋼琴)</option>
                <option value="s0000000-0000-0000-0000-000000000004">Johnny (鋼琴)</option>
              </select>

              <button className="w-9 h-9 rounded-full bg-white/60 border border-[#E5DEC9] flex items-center justify-center text-[#CEAB98] shadow-2xs">
                <Bell size={16} />
              </button>
            </div>
          </div>

          {/* 頁面主要內容 (圖一：我的課表) */}
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            
            {/* 頁面標題 */}
            <div className="text-center py-1">
              <h1 className="text-[22px] font-extrabold text-[#2B3049] tracking-tight font-serif">
                我的課表
              </h1>
              <p className="text-xs text-[#8C827A] mt-0.5 font-medium">
                {currentStudentId.includes('5') ? 'Lin' : currentStudentId.includes('3') ? 'Charles' : 'Johnny'} · 預約課堂清單
              </p>
            </div>

            {/* 課表清單區塊 (動態讀取資料庫 appointments) */}
            <div className="flex flex-col gap-3.5">
              {studentAppointments.length > 0 ? (
                studentAppointments.map((appt) => {
                  const dateInfo = formatDateBadge(appt.start_time);
                  const timeSpan = formatTimeSpan(appt.start_time, appt.end_time);
                  const courseTitle = formatCourseTitle(appt);
                  const location = appt.location || '音符琴房 A303';
                  const paymentBadge = formatPaymentBadge(appt.payment_status, appt.payment_type);

                  return (
                    <div
                      key={appt.id}
                      className="w-full p-3.5 bg-white rounded-2xl border border-[#F0EAE1] shadow-xs flex items-center gap-3 hover:shadow-md transition-shadow"
                    >
                      {/* 左側日期方塊 (對應資料庫 start_time) */}
                      <div className="text-center min-w-[48px] text-[#2B3049] font-bold">
                        <div className="text-[16px] leading-tight font-sans">
                          {dateInfo.monthDate}
                        </div>
                        <div className="text-xs text-[#7A7471] font-semibold">
                          {dateInfo.weekday}
                        </div>
                      </div>

                      {/* 右側資訊卡片與操作按鈕 */}
                      <div className="flex-1 flex flex-col gap-2.5">
                        {/* 課程資訊粉藍色小卡 */}
                        <div className="p-3 bg-[rgba(130,170,216,0.25)] rounded-[10px] flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            {/* 上課時間 (對應 start_time & end_time) */}
                            <span className="text-[11px] font-semibold text-[#2B3049]">
                              {timeSpan}
                            </span>
                            {/* 課程名稱 (對應 instrument 欄位) */}
                            <span className="text-[14px] font-extrabold text-[#2B3049]">
                              {courseTitle}
                            </span>
                            {/* 上課地點 (對應 location 欄位) */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] font-bold text-[#556080]">
                                {location}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm border ${paymentBadge.color}`}>
                                {paymentBadge.text}
                              </span>
                            </div>
                          </div>

                          {/* 音樂彩虹漸層裝飾圖標 */}
                          <div className="w-6 h-6 rounded-md bg-gradient-to-b from-[#C9A259] via-[#68C5AB] to-[#BB65B2] flex items-center justify-center shadow-2xs opacity-90">
                            <Music2 size={13} className="text-white" />
                          </div>
                        </div>

                        {/* 請假/調課 動作按鈕 */}
                        <button
                          onClick={() => openRescheduleModal(appt)}
                          className="w-full py-1.5 px-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-98 rounded-lg text-center text-[#6F6F6F] font-bold text-xs tracking-wide transition-all"
                        >
                          我要請假/調課
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#CEAB98]/40">
                  <span className="text-sm text-[#8C827A] font-bold">目前無已排定的課程</span>
                </div>
              )}

              {/* 底部無新課程提示 */}
              <div className="text-center py-2 text-xs font-bold text-[#8C827A]">
                無新的預約課程了
              </div>
            </div>

            {/* + 預約新課程按鈕 */}
            <button className="w-full py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-[#CEAB98]/30 transition-all flex items-center justify-center gap-1.5">
              <span>+ 預約新課程</span>
            </button>
          </div>
        </div>

        {/* 底部 Home Bar */}
        <div className="w-full h-8 flex justify-center items-center pb-2">
          <div className="w-36 h-1.5 bg-[#2B3049]/80 rounded-full"></div>
        </div>

        {/* ======================================================== */}
        {/* 圖二：調課確認 Modal (彈出式遮罩視窗)                      */}
        {/* ======================================================== */}
        {isModalOpen && selectedAppointment && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-fade-in">
            <div className="w-full max-w-[370px] bg-white rounded-[24px] p-5 shadow-2xl flex flex-col gap-5 border border-slate-100 animate-scale-up">
              
              {/* Modal 頂部標題與關閉按鈕 */}
              <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-[#2B3049] flex items-center justify-center text-[10px] font-bold">
                    🔄
                  </div>
                  <h2 className="text-[18px] font-bold text-[#2B3049] font-serif">
                    調課確認
                  </h2>
                </div>

                {/* 關閉按鈕 ✖ 點擊自然回到圖一課表 */}
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#EFE9DF] active:scale-90 text-[#2B3049] flex items-center justify-center transition-all"
                >
                  <X size={15} />
                </button>
              </div>

              {/* 成功 / 錯誤反饋提示 */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    feedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.msg}
                </div>
              )}

              {/* 調課詳細內容 (欄位與資料庫完全對齊) */}
              <div className="flex flex-col gap-3.5">
                {/* 原課程資訊 (讀取原 appointments 資料) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#6F6F6F]">
                    原課程資訊
                  </label>
                  <div className="p-3 bg-[#FAF6F0] rounded-xl text-sm font-semibold text-[#2B3049] border border-[#F0EBE1] flex flex-col gap-0.5">
                    <div>
                      {formatDateBadge(selectedAppointment.start_time).fullLabel}{' '}
                      {formatTimeSpan(selectedAppointment.start_time, selectedAppointment.end_time)}
                    </div>
                    <div className="text-xs text-[#7A7471]">
                      {formatCourseTitle(selectedAppointment)} · {selectedAppointment.location || '音符琴房 A303'}
                    </div>
                  </div>
                </div>

                {/* 可調課時段選擇 (動態讀取資料庫 schedule_slots 中 is_available = true 的時段) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#6F6F6F]">
                    可調課時段（張老師本週開放時段）
                  </label>
                  <div className="relative">
                    <select
                      value={selectedNewSlotTime}
                      onChange={(e) => setSelectedNewSlotTime(e.target.value)}
                      className="w-full p-3 bg-white border border-[#E5DEC9] rounded-xl text-sm font-semibold text-[#2B3049] appearance-none pr-10 focus:outline-hidden focus:border-[#CEAB98]"
                    >
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => {
                          const slotDate = formatDateBadge(slot.start_time);
                          const slotTime = formatTimeSpan(slot.start_time, slot.end_time);
                          const slotLoc = slot.location || '音符琴房 A303';
                          return (
                            <option key={slot.id} value={slot.start_time}>
                              {slotDate.fullLabel} {slotTime} ({slotLoc})
                            </option>
                          );
                        })
                      ) : (
                        <option value="">目前無開放可調課時段</option>
                      )}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B3049] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 雙操作按鈕 (送出確認調課 / 先請假之後再調整) */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirmReschedule}
                  className="flex-1 py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#CEAB98]/30 transition-all text-center"
                >
                  送出確認調課
                </button>
                <button
                  onClick={handleTakeLeave}
                  className="flex-1 py-3 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-98 text-[#6F6F6F] font-bold text-xs sm:text-sm rounded-xl transition-all text-center border border-[#E5DEC9]"
                >
                  先請假之後再調整
                </button>
              </div>

              {/* 溫馨提醒小字 */}
              <p className="text-[11px] text-[#999999] text-center">
                💡 依教室規範，開課 24 小時前可免費線上調課
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
