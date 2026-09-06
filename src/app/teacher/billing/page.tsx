'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Check,
  Bell,
  AlertCircle,
  Calendar,
  Send,
  DollarSign,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  TeacherStudentBilling,
  LeaveRetainRecord,
  AbsentDeductionRecord,
  getBillingStudentsFromStorage,
  saveBillingStudentsToStorage,
  getLeaveRecordsFromStorage,
  getAbsentRecords,
  calculateTeacherBillingStats,
  sendDunningNotifications,
  markStudentBillingAsPaid,
} from '@/lib/teacherData';

export default function TeacherBillingPage() {
  const [billingList, setBillingList] = useState<TeacherStudentBilling[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRetainRecord[]>([]);
  const [absentRecords, setAbsentRecords] = useState<AbsentDeductionRecord[]>([]);
  
  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  
  // Dunning Modal State
  const [showDunningModal, setShowDunningModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState<'gentle' | 'formal'>('gentle');
  const [sendViaLine, setSendViaLine] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 初始化讀取資料庫
  useEffect(() => {
    const students = getBillingStudentsFromStorage();
    const leaves = getLeaveRecordsFromStorage();
    const absents = getAbsentRecords();
    setBillingList(students);
    setLeaveRecords(leaves);
    setAbsentRecords(absents);
  }, []);

  // 動態計算財務統計指標
  const stats = useMemo(() => {
    return calculateTeacherBillingStats(billingList);
  }, [billingList]);

  // 未繳費清單
  const unpaidStudents = useMemo(() => {
    return billingList.filter(
      (s) => s.payment_status === 'unpaid' || s.payment_status === 'partial'
    );
  }, [billingList]);

  // 已繳費清單
  const paidStudents = useMemo(() => {
    return billingList.filter((s) => s.payment_status === 'paid');
  }, [billingList]);

  // 顯示 Toast 訊息
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 開啟一鍵催款彈窗（預設勾選所有未繳費學員）
  const handleOpenDunningModalAll = () => {
    const overdueIds = unpaidStudents.map((s) => s.id);
    setSelectedStudentIds(overdueIds);
    setMessageTemplate('gentle');
    setShowDunningModal(true);
  };

  // 開啟單一學員催款彈窗
  const handleOpenDunningModalSingle = (studentId: string) => {
    setSelectedStudentIds([studentId]);
    setMessageTemplate('gentle');
    setShowDunningModal(true);
  };

  // 切換勾選催款對象學員
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // 取得當前選中学員的代表名稱與金額
  const selectedStudentsData = useMemo(() => {
    return unpaidStudents.filter((s) => selectedStudentIds.includes(s.id));
  }, [unpaidStudents, selectedStudentIds]);

  // 動態生成訊息預覽
  const previewMessageText = useMemo(() => {
    const sampleStudent = selectedStudentsData[0] || unpaidStudents[0] || {
      student_name: '[學生姓名]',
      course_name: '[課程名稱]',
      total_fee: 8000,
      payment_deadline: '2026/09/10',
    };

    if (messageTemplate === 'gentle') {
      return `親愛的家長您好，溫馨提醒您 ${
        selectedStudentsData.length > 1
          ? `${selectedStudentsData.map((s) => s.student_name).join('、')} 等 ${selectedStudentsData.length} 位同學`
          : sampleStudent.student_name
      } 的 ${sampleStudent.course_name} 學費 NT$${sampleStudent.total_fee.toLocaleString()} 尚未完成繳納，請協助於 ${
        sampleStudent.payment_deadline || '近期'
      } 前透過系統或轉帳方式完成繳費，如有任何疑問歡迎隨時與老師聯絡，感謝您的配合！ — MusiMate 音樂學院 敬上 ✨`;
    } else {
      return `親愛的家長您好，此為正式學費催繳通知。${
        selectedStudentsData.length > 1
          ? `${selectedStudentsData.map((s) => s.student_name).join('、')} 等 ${selectedStudentsData.length} 位同學`
          : sampleStudent.student_name
      } 之 ${sampleStudent.course_name} 累計逾期學費 NT$${sampleStudent.total_fee.toLocaleString()}，請儘速於 3 日內完成轉帳核銷，以保障後續排課與保留時段權益。如有特殊狀況請盡速聯繫老師，感謝您的重視與配合。 — MusiMate 教務組 敬啟`;
    }
  }, [selectedStudentsData, unpaidStudents, messageTemplate]);

  // 送出催款通知
  const handleConfirmSendDunning = async () => {
    if (selectedStudentIds.length === 0) {
      alert('請至少選擇一位發送對象！');
      return;
    }
    if (!sendViaLine && !sendViaEmail) {
      alert('請至少選擇一種發送方式（LINE 或 Email）！');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendDunningNotifications({
        targetStudentIds: selectedStudentIds,
        templateType: messageTemplate,
        channels: { line: sendViaLine, email: sendViaEmail },
      });

      // 更新本機狀態
      const updated = getBillingStudentsFromStorage();
      setBillingList(updated);

      setShowDunningModal(false);
      showToast(`🎉 ${res.message}`);
    } catch (err) {
      console.error('Dunning notice error:', err);
      showToast('❌ 發送催繳通知時發生錯誤，請稍後重試。');
    } finally {
      setIsSending(false);
    }
  };

  // 老師手動核銷單筆款項
  const handleMarkAsPaid = (invoiceId: string, studentName: string) => {
    if (confirm(`確認已收到「${studentName}」之學費款項，執行入帳核銷？`)) {
      const updated = markStudentBillingAsPaid(invoiceId);
      setBillingList(updated);
      showToast(`✅ 已成功核銷 ${studentName} 的學費，帳款總覽已即時更新！`);
    }
  };

  return (
    <div className="w-full min-h-[1024px] bg-[#FAF6F0] flex flex-col font-['Noto_Sans_TC',sans-serif]">
      {/* Toast 提示條 */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#2B3049] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 主內容區 (1440px 容器規範) */}
      <main className="w-full max-w-[1440px] mx-auto pt-10 pb-16 px-6 sm:px-12 lg:px-[80px] flex flex-col gap-8">
        {/* 頂部標題與路徑 */}
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-[#6F6F6F] font-bold">智慧薪資對帳</span>
              <span className="text-[#6F6F6F] font-medium">/</span>
              <span className="text-[#2B3049] font-bold">{stats.month_label}</span>
            </div>
            <h1 className="text-[#2B3049] text-[32px] font-['Noto_Serif_TC',serif] font-bold tracking-tight">
              智慧帳款總覽
            </h1>
          </div>
        </div>

        {/* 頂部三大財務核心卡片 (Row, Gap 16px) */}
        <div className="w-full flex flex-col md:flex-row items-stretch gap-4">
          {/* 卡片 1: 當月應收總額 */}
          <div className="flex-1 p-5 bg-white shadow-xs rounded-[20px] ring-1 ring-[#82AAD8]/30 flex flex-col justify-between gap-3">
            <div className="text-[#6F6F6F] text-sm font-medium">當月應收總額</div>
            <div className="text-[#2B3049] text-[28px] font-['Noto_Serif_TC',serif] font-bold">
              NT$ {stats.total_receivable.toLocaleString()}
            </div>
            <div className="w-full flex flex-col gap-1.5">
              {/* 進度條 */}
              <div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#82AAD8] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, stats.collection_rate)}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10B981] text-xs font-bold">
                  +{stats.growth_vs_last_month}% vs 上月
                </span>
                <span className="text-[#6F6F6F] text-[11px] font-normal">
                  實收率 {stats.collection_rate}%
                </span>
              </div>
            </div>
          </div>

          {/* 卡片 2: 本月已完成堂數 */}
          <div className="flex-1 p-5 bg-white shadow-xs rounded-[20px] ring-1 ring-[#82AAD8]/30 flex flex-col justify-between gap-3">
            <div className="text-[#6F6F6F] text-sm font-medium">本月已完成堂數</div>
            <div className="text-[#2B3049] text-[28px] font-['Noto_Serif_TC',serif] font-bold">
              {stats.completed_lessons_count}堂 / {stats.total_scheduled_lessons_count}堂
            </div>
            <div className="w-full flex flex-col gap-1.5">
              {/* 進度條 */}
              <div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#82AAD8] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, stats.completion_rate)}%` }}
                />
              </div>
              <div className="text-[#6F6F6F] text-[11px] font-normal">
                完成率 {stats.completion_rate}%
              </div>
            </div>
          </div>

          {/* 卡片 3: 待確認入帳事項 */}
          <div className="flex-1 p-5 bg-white shadow-xs rounded-[20px] ring-1 ring-[#82AAD8]/30 flex flex-col justify-start gap-3">
            <div className="text-[#6F6F6F] text-sm font-medium">待確認入帳事項</div>
            <div className="text-[#2B3049] text-[28px] font-['Noto_Serif_TC',serif] font-bold">
              {stats.pending_action_count} 件
            </div>
          </div>
        </div>

        {/* 核心雙欄對帳與異常追蹤區 (Row, Gap 24px) */}
        <div className="w-full flex flex-col lg:flex-row items-start gap-6">
          {/* 左欄：繳費狀態追蹤 (flex: 1) */}
          <div className="flex-1 w-full p-6 bg-white shadow-sm rounded-[24px] ring-1 ring-[#82AAD8]/30 flex flex-col gap-5">
            {/* 標題與「一鍵通知催繳」按鈕 */}
            <div className="w-full flex justify-between items-center">
              <h2 className="text-[#2B3049] text-xl font-['Noto_Serif_TC',serif] font-bold">
                繳費狀態追蹤
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleOpenDunningModalAll}
                  disabled={unpaidStudents.length === 0}
                  className="px-4 py-2 bg-[#82AAD8] hover:bg-[#6f96c2] active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs"
                >
                  一鍵通知催繳
                </button>
              </div>
            </div>

            {/* 標籤列 (未繳費 vs 已繳費) */}
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('unpaid')}
                  className={`px-5 py-2 rounded-full text-sm transition-all cursor-pointer ${
                    activeTab === 'unpaid'
                      ? 'bg-[#82AAD8] text-white font-bold shadow-xs'
                      : 'border border-[#82AAD8] text-[#6F6F6F] font-medium hover:bg-[#FAF6F0]'
                  }`}
                >
                  未繳費 ({unpaidStudents.length})
                </button>
                <button
                  onClick={() => setActiveTab('paid')}
                  className={`px-5 py-2 rounded-full text-sm transition-all cursor-pointer ${
                    activeTab === 'paid'
                      ? 'bg-[#82AAD8] text-white font-bold shadow-xs'
                      : 'border border-[#82AAD8] text-[#6F6F6F] font-medium hover:bg-[#FAF6F0]'
                  }`}
                >
                  已繳費 ({paidStudents.length})
                </button>
              </div>

              {/* 表格標頭 (對齊 Figma 規範) */}
              <div className="w-full px-4 py-3 bg-[#FAF6F0] rounded-xl flex items-center gap-5 text-base font-bold text-[#2B3049]">
                <div className="w-[120px] shrink-0">學生姓名</div>
                <div className="flex-1">課程名稱</div>
                <div className="w-[120px] shrink-0">
                  {activeTab === 'unpaid' ? '應繳金額' : '已繳金額'}
                </div>
                <div className="w-[120px] shrink-0">狀態標籤</div>
                <div className="w-[110px] shrink-0 text-right">
                  {activeTab === 'unpaid' ? '催繳動作' : '核銷狀態'}
                </div>
              </div>

              {/* 未繳費表格清單 */}
              {activeTab === 'unpaid' && (
                <div className="w-full flex flex-col divide-y divide-[#F0EAE1]">
                  {unpaidStudents.length === 0 ? (
                    <div className="py-12 text-center text-[#6F6F6F] text-sm">
                      🎉 太棒了！當月所有學員皆已完成學費繳納，無未繳款項。
                    </div>
                  ) : (
                    unpaidStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-4 flex items-center gap-5 hover:bg-[#FAF6F0]/40 transition-colors"
                      >
                        <div className="w-[120px] shrink-0 text-base font-bold text-[#2B3049] flex items-center gap-2">
                          <img
                            src={student.avatar_url}
                            alt={student.student_name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span>{student.student_name}</span>
                        </div>
                        <div className="flex-1 text-sm font-medium text-[#6F6F6F]">
                          {student.course_name}
                        </div>
                        <div className="w-[120px] shrink-0 text-base font-bold text-[#2B3049]">
                          NT$ {student.total_fee.toLocaleString()}
                        </div>
                        <div className="w-[120px] shrink-0 flex items-center">
                          {student.delay_days > 0 ? (
                            <span className="px-2.5 py-1 bg-[#D98C8C]/10 text-[#D98C8C] text-xs font-bold rounded-full">
                              逾期{student.delay_days}天
                            </span>
                          ) : student.delay_days === 0 ? (
                            <span className="px-2.5 py-1 bg-[#CEAB98]/15 text-[#CEAB98] text-xs font-bold rounded-full">
                              今日到期
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-[#82AAD8]/10 text-[#82AAD8] text-xs font-bold rounded-full">
                              即將到期
                            </span>
                          )}
                        </div>
                        <div className="w-[110px] shrink-0 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDunningModalSingle(student.id)}
                            title="開啟催款通知視窗"
                            className="px-3.5 py-1.5 border border-[#2B3049] text-[#2B3049] hover:bg-[#2B3049] hover:text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                          >
                            發送通知
                          </button>
                          <button
                            onClick={() => handleMarkAsPaid(student.id, student.student_name)}
                            title="手動標記已入帳"
                            className="p-1.5 text-[#10B981] hover:bg-[#10B981]/10 rounded-full transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 已繳費表格清單 */}
              {activeTab === 'paid' && (
                <div className="w-full flex flex-col divide-y divide-[#F0EAE1]">
                  {paidStudents.length === 0 ? (
                    <div className="py-12 text-center text-[#6F6F6F] text-sm">
                      尚無已入帳紀錄。
                    </div>
                  ) : (
                    paidStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-4 flex items-center gap-5 hover:bg-[#FAF6F0]/40 transition-colors"
                      >
                        <div className="w-[120px] shrink-0 text-base font-bold text-[#2B3049] flex items-center gap-2">
                          <img
                            src={student.avatar_url}
                            alt={student.student_name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span>{student.student_name}</span>
                        </div>
                        <div className="flex-1 text-sm font-medium text-[#6F6F6F]">
                          <div>{student.course_name}</div>
                          <div className="text-[11px] text-[#8C90A4]">
                            {student.payment_method || '銀行轉帳'} · {student.paid_at || '已核銷'}
                          </div>
                        </div>
                        <div className="w-[120px] shrink-0 text-base font-bold text-[#10B981]">
                          NT$ {student.total_fee.toLocaleString()}
                        </div>
                        <div className="w-[120px] shrink-0 flex items-center">
                          <span className="px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-bold rounded-full">
                            已入帳
                          </span>
                        </div>
                        <div className="w-[110px] shrink-0 text-right text-xs font-medium text-[#6F6F6F]">
                          信託託管中
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右欄：課堂異常追蹤 (480px 固定寬度) */}
          <div className="w-full lg:w-[480px] p-6 bg-white shadow-sm rounded-[24px] ring-1 ring-[#82AAD8]/30 flex flex-col gap-5 shrink-0">
            <h2 className="text-[#2B3049] text-xl font-['Noto_Serif_TC',serif] font-bold">
              課堂異常追蹤
            </h2>

            <div className="w-full flex flex-col gap-4">
              {/* 卡片 1: 請假保留課堂 */}
              <div className="w-full p-4 bg-[#FAF6F0] rounded-2xl flex flex-col gap-3">
                <div className="w-full flex justify-between items-center">
                  <span className="text-[#2B3049] text-base font-bold">
                    請假保留課堂 ({leaveRecords.length})
                  </span>
                  <span className="text-[#6F6F6F] text-[11px] font-normal">
                    需於到期日前補課
                  </span>
                </div>

                <div className="w-full flex flex-col gap-2">
                  {leaveRecords.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx > 0 && (
                        <div className="w-full border-t border-[#82AAD8]/30 my-1" />
                      )}
                      <div className="w-full flex flex-col gap-1">
                        <div className="w-full flex justify-between items-start">
                          <span className="text-[#2B3049] text-sm font-medium">
                            {item.student_name} / {item.course_name}
                          </span>
                          <span className="text-[#D98C8C] text-sm font-medium">
                            保留 {item.retained_lessons} 堂
                          </span>
                        </div>
                        <div className="text-[#6F6F6F] text-[11px] font-normal">
                          到期日：{item.expiry_date}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 卡片 2: 保留時數即將過期警示 */}
              <div className="w-full p-4 bg-[#CEAB98]/15 rounded-2xl ring-1 ring-[#CEAB98] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#CEAB98] rounded-full" />
                  <span className="text-[#2B3049] text-base font-bold">
                    保留時數即將過期 (1)
                  </span>
                </div>
                <div className="text-[#6F6F6F] text-sm font-medium leading-relaxed">
                  林志玲 的 1 堂保留時數將於 7 天內到期，建議即時聯絡學生安排補課時間。
                </div>
              </div>

              {/* 卡片 3: 曠課扣款紀錄 */}
              <div className="w-full p-4 bg-[#FAF6F0] rounded-2xl flex flex-col gap-3">
                <div className="w-full flex justify-between items-center">
                  <span className="text-[#2B3049] text-base font-bold">
                    曠課扣款紀錄 ({absentRecords.length})
                  </span>
                </div>

                <div className="w-full flex flex-col gap-3">
                  {absentRecords.map((absent) => (
                    <div
                      key={absent.id}
                      className="w-full flex justify-between items-start"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[#2B3049] text-sm font-medium">
                          {absent.student_name}
                        </span>
                        <span className="text-[#6F6F6F] text-[11px] font-normal">
                          {absent.date_desc}
                        </span>
                      </div>
                      <span className="text-[#D98C8C] text-base font-bold">
                        扣款 NT$ {absent.penalty_amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          一鍵催款彈出視窗 (Modal, 寬度 640px, 圓角 28px, 對齊 Figma 規範)
          ========================================================================= */}
      {showDunningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[640px] bg-white rounded-[28px] shadow-2xl p-8 sm:p-9 flex flex-col gap-6 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center">
              <h3 className="text-[#2B3049] text-2xl font-['Noto_Serif_TC',serif] font-bold">
                發送催款通知
              </h3>
              <button
                onClick={() => setShowDunningModal(false)}
                className="p-2 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full border-t border-[#EFECE6]" />

            {/* 發送對象 */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#2B3049] text-[15px] font-bold">發送對象</span>
                <span className="px-2 py-0.5 bg-[#FAF0EC] text-[#CEAB98] text-xs font-bold rounded-full">
                  已選擇 {selectedStudentIds.length} 位學生
                </span>
              </div>

              {/* 學生卡片選擇列 */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unpaidStudents.map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleStudentSelection(s.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#82AAD8]/30 border-[#82AAD8] shadow-xs'
                          : 'bg-white border-[#EFECE6] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="text-[#2B3049] text-sm font-bold truncate">
                        {s.student_name}
                      </div>
                      <div className="text-[#D9668C] text-xs font-normal">
                        逾期 NT$ {s.total_fee.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 訊息範本切換 */}
            <div className="w-full flex flex-col gap-3">
              <span className="text-[#2B3049] text-[15px] font-bold">訊息範本</span>
              <div className="w-full flex flex-col sm:flex-row gap-4">
                {/* 範本 1: 溫和提醒 */}
                <div
                  onClick={() => setMessageTemplate('gentle')}
                  className={`flex-1 p-4 rounded-[14px] transition-all cursor-pointer flex items-center gap-3 ${
                    messageTemplate === 'gentle'
                      ? 'bg-[#E6F3F4] ring-[1.5px] ring-[#52959D]'
                      : 'bg-white border border-[#EFECE6] hover:bg-[#FAF6F0]/50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                      messageTemplate === 'gentle'
                        ? 'bg-[#52959D]'
                        : 'border-2 border-[#6F6F6F] bg-white'
                    }`}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-bold ${
                        messageTemplate === 'gentle' ? 'text-[#52959D]' : 'text-[#2B3049]'
                      }`}
                    >
                      溫和提醒
                    </span>
                    <span className="text-[#6F6F6F] text-xs font-normal">
                      適用於剛逾期或日常催款
                    </span>
                  </div>
                </div>

                {/* 範本 2: 正式通知 */}
                <div
                  onClick={() => setMessageTemplate('formal')}
                  className={`flex-1 p-4 rounded-[14px] transition-all cursor-pointer flex items-center gap-3 ${
                    messageTemplate === 'formal'
                      ? 'bg-[#E6F3F4] ring-[1.5px] ring-[#52959D]'
                      : 'bg-white border border-[#EFECE6] hover:bg-[#FAF6F0]/50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                      messageTemplate === 'formal'
                        ? 'bg-[#52959D]'
                        : 'border-2 border-[#6F6F6F] bg-white'
                    }`}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-bold ${
                        messageTemplate === 'formal' ? 'text-[#52959D]' : 'text-[#2B3049]'
                      }`}
                    >
                      正式通知
                    </span>
                    <span className="text-[#6F6F6F] text-xs font-normal">
                      適用於逾期兩週以上未聯絡
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 訊息預覽 */}
            <div className="w-full flex flex-col gap-3">
              <span className="text-[#2B3049] text-[15px] font-bold">訊息預覽</span>
              <div className="w-full p-4 bg-[#82AAD8]/25 border border-[#EFECE6] rounded-[14px]">
                <p className="text-[#2B3049] text-sm font-normal leading-[22.4px]">
                  {previewMessageText}
                </p>
              </div>
            </div>

            {/* 發送方式 */}
            <div className="w-full flex flex-col gap-3">
              <span className="text-[#2B3049] text-[15px] font-bold">發送方式</span>
              <div className="flex items-center gap-6">
                {/* LINE 自動發送 */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setSendViaLine(!sendViaLine)}
                    className="w-[22px] h-[22px] bg-[#FAF6F0] rounded-md border border-[#2B3049]/20 flex items-center justify-center"
                  >
                    {sendViaLine && <Check className="w-3.5 h-3.5 text-[#2B3049]" />}
                  </div>
                  <span className="text-[#2B3049] text-sm font-bold">LINE 自動發送</span>
                </label>

                {/* Email 備份通知 */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setSendViaEmail(!sendViaEmail)}
                    className="w-[22px] h-[22px] bg-[#FAF6F0] rounded-md border border-[#2B3049]/20 flex items-center justify-center"
                  >
                    {sendViaEmail && <Check className="w-3.5 h-3.5 text-[#2B3049]" />}
                  </div>
                  <span className="text-[#2B3049] text-sm font-bold">Email 備份通知</span>
                </label>
              </div>
            </div>

            {/* 操作按鈕與免責說明 */}
            <div className="w-full flex flex-col items-center gap-4 pt-2">
              <div className="w-full flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowDunningModal(false)}
                  className="flex-1 py-3 px-8 border-[1.5px] border-[#82AAD8] text-[#82AAD8] hover:bg-[#82AAD8]/10 text-[15px] font-bold rounded-full transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isSending || selectedStudentIds.length === 0}
                  onClick={handleConfirmSendDunning}
                  className="flex-1 py-3 px-8 bg-[#82AAD8] hover:bg-[#6f96c2] disabled:opacity-50 text-white text-[15px] font-bold rounded-full transition-all cursor-pointer shadow-xs"
                >
                  {isSending ? '發送中...' : '確認發送'}
                </button>
              </div>
              <span className="text-[#6F6F6F] text-xs font-normal">
                ℹ️ 系統將自動記錄催繳歷史，避免對同一位家長重複發送
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 頁尾 (Footer) */}
      <footer className="w-full border-t border-[#F0EAE1] bg-[#FAF6F0] mt-auto">
        <div className="max-w-[1440px] mx-auto py-10 px-6 sm:px-12 lg:px-[80px] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#2B3049] text-white flex items-center justify-center text-xs font-bold font-serif">
              M
            </span>
            <span className="text-[#6F6F6F] text-sm font-medium">
              專業音樂教育最貼心的好夥伴，陪您一起發掘音符中的無限可能。
            </span>
          </div>
          <div className="text-[#4A3A31] text-xs font-medium">
            © 2026 MusiMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
