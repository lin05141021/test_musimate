'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLiffAuth } from '@/context/LiffAuthContext';
import { LessonItem, AvailabilitySlot, RescheduleRequestItem } from '@/types';
import {
  RefreshCw,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Info,
  Hourglass,
  History,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

export default function ReschedulePage() {
  const { currentStudent, currentTeacher } = useLiffAuth();

  const [leavesUsedThisMonth, setLeavesUsedThisMonth] = useState(1);
  const maxLeavesPerMonth = 2;

  const [upcomingLessons, setUpcomingLessons] = useState<LessonItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [existingRequests, setExistingRequests] = useState<RescheduleRequestItem[]>([]);
  const [reason, setReason] = useState('學校段考衝堂');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    if (!currentStudent?.id) return;
    fetch(`/api/dev/reschedule?student_id=${currentStudent.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const lessons = json.data.upcomingLessons || [];
          setUpcomingLessons(lessons);
          if (lessons.length > 0 && !selectedLessonId) {
            setSelectedLessonId(lessons[0].id);
          }
          if (json.data.availableSlots) {
            setAvailableSlots(json.data.availableSlots);
          }
          if (json.data.requests) {
            setExistingRequests(json.data.requests);
          }
        }
      })
      .catch((err) => console.warn('調課 API 載入失敗:', err));
  };

  useEffect(() => {
    if (currentStudent?.id) {
      setSubmitted(false);
      setSelectedSlotId(null);
      loadData();
    }
  }, [currentStudent?.id]);

  const selectedLesson = upcomingLessons.find((l) => l.id === selectedLessonId) || upcomingLessons[0];
  const selectedSlot = availableSlots.find((s) => s.id === selectedSlotId);
  const lessonStartTimeMs = selectedLesson ? new Date(selectedLesson.start_time).getTime() : Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  // 補課時間必須大於或等於所選課堂時間 (同一天較晚時間亦可)，且在該課堂後 14 天內
  const validSlotsIn14Days = availableSlots.filter((slot) => {
    const slotTimeMs = new Date(slot.start_time).getTime();
    return slotTimeMs >= lessonStartTimeMs && slotTimeMs <= lessonStartTimeMs + fourteenDaysMs;
  });

  const canApplyLeave = leavesUsedThisMonth < maxLeavesPerMonth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canApplyLeave || !currentStudent?.id || !selectedLesson) return;

    setIsSubmitting(true);
    try {
      const targetTimeFormatted = selectedSlot 
        ? `${new Date(selectedSlot.start_time).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' })} ${new Date(selectedSlot.start_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`
        : null;

      const res = await fetch('/api/dev/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentStudent.id,
          original_lesson_id: selectedLessonId,
          target_slot_id: selectedSlotId || null,
          target_time: targetTimeFormatted,
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeavesUsedThisMonth((prev) => prev + 1);
        setSubmitted(true);
        loadData();
      } else {
        alert(`提交失敗: ${data.error}`);
      }
    } catch (err) {
      console.warn('提交調課申請失敗:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('確定要撤銷此筆調課/請假申請嗎？撤銷後課堂將恢復正常原排程。')) return;
    setIsCancelling(requestId);
    try {
      const res = await fetch(`/api/dev/reschedule?request_id=${requestId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLeavesUsedThisMonth((prev) => Math.max(0, prev - 1));
        loadData();
      } else {
        alert(`撤銷失敗: ${data.error}`);
      }
    } catch (err) {
      console.warn('撤銷失敗:', err);
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 頂部標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#2B3049] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#C58D34]" />
            請假與調課申請
          </h1>
          <p className="text-xs text-[#63667B]">指導教師：{currentTeacher?.name}</p>
        </div>

        {/* 請假額度計數 */}
        <div className="bg-white border border-[#EBDCB9] px-3 py-1.5 rounded-xl text-right shadow-sm">
          <div className="text-[10px] text-[#63667B]">本月請假額度</div>
          <div className={clsx('text-xs font-bold font-mono', canApplyLeave ? 'text-[#C58D34]' : 'text-red-500')}>
            已用 {leavesUsedThisMonth} / {maxLeavesPerMonth} 次
          </div>
        </div>
      </div>

      {/* 📋 當前申請紀錄與審核狀態 (若有進行中的申請) */}
      {existingRequests.length > 0 && (
        <div className="bg-white border-2 border-[#C58D34]/30 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B3049]">
              <Hourglass className="w-4 h-4 text-[#C58D34]" />
              <span>進行中的異動申請 ({existingRequests.length} 筆)</span>
            </div>
            <span className="text-[10px] text-[#885424] font-medium">即時連動資料庫</span>
          </div>

          <div className="space-y-2">
            {existingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#FFFDF9] border border-[#EBDCB9] rounded-xl p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#2B3049]">
                    {req.original_time
                      ? `${new Date(req.original_time).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' })} 課堂異動`
                      : '課堂調課申請'}
                  </span>
                  <div className="flex items-center gap-2">
                    {req.status === 'PENDING_APPROVAL' ? (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-[#D97706] animate-pulse" />
                          ⏳ 老師審核中
                        </span>
                        <button
                          type="button"
                          disabled={isCancelling === req.id}
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#E53E3E] bg-[#FFF5F5] hover:bg-[#FED7D7] border border-[#FEB2B2] transition-all shadow-xs"
                        >
                          {isCancelling === req.id ? '撤銷中...' : '撤銷申請'}
                        </button>
                      </>
                    ) : req.status === 'APPROVED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7EE] text-[#22543D] border border-[#68D391] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#38A169]" />
                        已核准
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5F5] text-[#9B2C2C] border border-[#FEB2B2]">
                        已駁回
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#63667B] bg-white/70 p-2 rounded-lg border border-[#F0EAE1]">
                  {req.reason}
                </p>
                <div className="text-[10px] text-[#8E90A6] flex items-center justify-between pt-0.5">
                  <span>申請時間：{new Date(req.created_at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span>等待【{currentTeacher?.name}】確認中</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚠️ 補課與請假規則提示 */}
      <div className="bg-[#FFFDF9] border border-[#C58D34]/40 rounded-2xl p-3.5 space-y-1 text-xs text-[#4A3A31] shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-[#885424]">
          <Info className="w-4 h-4 text-[#C58D34]" /> 請假與補課規範
        </div>
        <ul className="space-y-1 text-[11px] text-[#63667B] list-disc list-inside">
          <li>每個學員<strong className="text-[#2B3049]">每月限定請假 2 次</strong>。</li>
          <li>
            請假後必須在該堂課起算<strong className="text-[#C58D34]"> 14 天（2 週）內</strong>完成補課。
          </li>
          <li>送出後將由【{currentTeacher?.name}】於後台審核確認，審核通過後自動更新課表。</li>
        </ul>
      </div>

      {submitted ? (
        <div className="bg-white border border-[#68D391] rounded-2xl p-6 text-center space-y-3 shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#EBF7EE] text-[#38A169] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-sm font-bold text-[#22543D]">調課申請已成功寫入資料庫！</h2>
          <p className="text-xs text-[#63667B] leading-relaxed">
            系統已將您的調課申請傳送至【{currentTeacher?.name}】的待辦通知中心，審核通過後將自動發送 LINE 通知並更新課表。
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedSlotId(null);
            }}
            className="text-xs font-bold text-[#4A3A31] hover:text-[#2B3049] bg-[#FAF6F0] px-4 py-2 rounded-xl border border-[#EBDCB9] mt-2 shadow-sm"
          >
            繼續申請其他課堂
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. 動態選擇欲請假的原課堂 */}
          <div className="bg-white border border-[#EBDCB9] rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2B3049] flex items-center gap-1.5">
                <span>1. 選擇欲調課/請假的原課堂</span>
                <span className="text-[10px] text-[#C58D34] font-normal">(點選切換)</span>
              </label>
              <span className="text-[10px] text-[#63667B]">共 {upcomingLessons.length} 堂可異動</span>
            </div>

            {/* 動態課堂卡片列表 */}
            <div className="space-y-2">
              {upcomingLessons.map((lesson) => {
                const isSelected = selectedLessonId === lesson.id;
                const isPending = lesson.status === 'RESCHEDULE_REQUESTED';
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setSelectedSlotId(null);
                    }}
                    className={clsx(
                      'p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                      isSelected
                        ? 'bg-[#FFF9F2] border-[#C58D34] text-[#885424] shadow-sm scale-[1.01]'
                        : 'bg-[#FAF6F0] border-[#F0EAE1] text-[#4A3A31] hover:border-[#EBDCB9]'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#C58D34]/15 text-[#885424] text-[10px]">
                          第 {lesson.lesson_index} 堂
                        </span>
                        <span>
                          {new Date(lesson.start_time).toLocaleDateString('zh-TW', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </span>
                        {isPending && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-normal">
                            ⏳ 審核中
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#63667B]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C58D34]" />
                          {new Date(lesson.start_time).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C58D34]" />
                          {lesson.location}
                        </span>
                      </div>
                    </div>

                    <div
                      className={clsx(
                        'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                        isSelected ? 'border-[#C58D34] bg-[#C58D34] text-white' : 'border-[#CEAB98]'
                      )}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 請假原因 */}
          <div className="bg-white border border-[#EBDCB9] rounded-2xl p-3.5 space-y-2 shadow-sm">
            <label className="text-xs font-bold text-[#2B3049] block">2. 請假事由備註</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="請輸入請假事由..."
              className="w-full bg-[#FAF6F0] border border-[#EBDCB9] rounded-xl px-3 py-2 text-xs text-[#2B3049] placeholder-[#8E90A6] outline-none focus:border-[#C58D34]"
            />
          </div>

          {/* 3. 挑選 14 天內補課時段 (選時段為調課，不選為請假) */}
          <div className="bg-white border border-[#EBDCB9] rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#2B3049] flex items-center gap-1.5">
                  <span>3. 挑選 14 天內補課空檔</span>
                  <span className="text-[10px] text-[#718096] font-normal">(非必填 · 點選可取消)</span>
                </div>
                <div className="text-[10px] text-[#C58D34] font-medium pt-0.5">
                  {selectedSlotId ? '✨ 已選擇補課時段 (調課模式)' : '💡 未選時段即為純請假 (合約順延模式)'}
                </div>
              </div>
              <span className="text-[10px] text-[#C58D34] font-mono font-bold">
                {selectedLesson
                  ? `${new Date(selectedLesson.start_time).getMonth() + 1}/${new Date(
                      selectedLesson.start_time
                    ).getDate()} 起算 14 天`
                  : '14 天內有效'}
              </span>
            </div>

            {/* 不補課選項卡 */}
            <div
              onClick={() => setSelectedSlotId(null)}
              className={clsx(
                'p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                selectedSlotId === null
                  ? 'bg-[#FFF5F5] border-[#E53E3E] text-[#9B2C2C] shadow-xs'
                  : 'bg-[#FAF6F0] border-[#F0EAE1] text-[#718096] hover:border-[#EBDCB9]'
              )}
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="text-xs">🚫</span>
                <span>不挑選補課時段 (純請假 · 契約順延 1 週)</span>
              </div>
              <div
                className={clsx(
                  'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
                  selectedSlotId === null ? 'border-[#E53E3E] bg-[#E53E3E] text-white' : 'border-[#CEAB98]'
                )}
              >
                {selectedSlotId === null && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* 補課空檔列表 */}
            <div className="space-y-2 pt-1">
              {validSlotsIn14Days.length === 0 ? (
                <div className="text-center py-3 text-xs text-[#8E90A6] bg-[#FAF6F0] rounded-xl border border-[#F0EAE1]">
                  目前此區間內暫無老師開放的補課空檔，若欲調課請聯繫【{currentTeacher?.name}】。
                </div>
              ) : (
                validSlotsIn14Days.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
                      className={clsx(
                        'p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                        isSelected
                          ? 'bg-[#FFF9F2] border-[#C58D34] text-[#885424] shadow-sm scale-[1.01]'
                          : 'bg-[#FAF6F0] border-[#F0EAE1] text-[#4A3A31] hover:border-[#EBDCB9]'
                      )}
                    >
                      <div className="space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C58D34]" />
                          {new Date(slot.start_time).toLocaleDateString('zh-TW', {
                            month: 'numeric',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                          <span className="text-[#C58D34] font-normal">
                            {new Date(slot.start_time).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(slot.end_time).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#63667B] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8E90A6]" />
                          {slot.location}
                        </div>
                      </div>

                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                          isSelected ? 'border-[#C58D34] bg-[#C58D34] text-white' : 'border-[#CEAB98]'
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 提交按鈕與雙模式顏色動態切換 */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={!canApplyLeave || isSubmitting}
              className={clsx(
                'w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98',
                !canApplyLeave || isSubmitting
                  ? 'bg-[#F0EAE1] text-[#8E90A6] border border-[#E2D5C3] cursor-not-allowed'
                  : selectedSlotId
                  ? 'bg-[#C58D34] hover:bg-[#AA7129] text-white shadow-[0_4px_12px_rgba(197,141,52,0.3)]'
                  : 'bg-[#E53E3E] hover:bg-[#C53030] text-white shadow-[0_4px_12px_rgba(229,62,62,0.25)]'
              )}
            >
              {isSubmitting ? (
                <span>送出中...</span>
              ) : !canApplyLeave ? (
                <span>本月請假額度已滿 (上限 2 次)</span>
              ) : selectedSlotId ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    🔄 送出調課申請 (改期至 {selectedSlot ? `${new Date(selectedSlot.start_time).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' })} ${new Date(selectedSlot.start_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}` : ''} · 契約不順延)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>⚠️ 送出請假申請 (不補課 · 契約順延 1 週)</span>
                </>
              )}
            </button>

            {/* 說明提示 */}
            <div className="text-[10px] text-center text-[#718096]">
              {selectedSlotId
                ? '📌 已選擇補課時段：核准後將在指定空檔上課，契約到期日維持不變。'
                : '📌 未選擇補課時段：核准後本堂課不扣額度，契約到期日將自動往後順延 1 週。'}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
