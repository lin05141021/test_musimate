'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { useStudentToast } from '@/context/ToastContext';
import {
  UploadCloud,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  RotateCcw,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  Edit3,
  Building,
  CreditCard,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function StudentBillingPage() {
  const router = useRouter();
  const { showToast } = useStudentToast();
  const {
    activeStudentId,
    allStudents,
    switchStudent,
  } = useDemoContext();

  // 自動依據使用者 LINE ID 或全組 Demo 學生切換身分防呆
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const studentParam = urlParams.get('student') || urlParams.get('student_id');
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
    }
  }, [activeStudentId, allStudents, switchStudent]);

  // 當前學生資訊
  const currentStudentInfo = allStudents.find((s) => s.student.id === activeStudentId) || allStudents[0];
  const studentNameFromDb = currentStudentInfo?.user?.name?.replace(/\s*\(.*?\)\s*/g, '').trim() || '劉心悅';

  // 狀態管理：'before_upload' (未上傳) | 'scanning' (AI辨識中) | 'after_upload' (已辨識核銷)
  const [uploadState, setUploadState] = useState<'before_upload' | 'scanning' | 'after_upload'>('before_upload');
  
  // 自訂上傳圖片 URL
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 側邊選單抽屜
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 核銷成功彈窗
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 手動修正彈窗
  const [showEditModal, setShowEditModal] = useState(false);

  // 辨識結果資料 (對齊使用者提供之富邦企鵝轉帳截圖: NT$ 8,000, 轉出 50638, 轉入 36610)
  const [billingData, setBillingData] = useState({
    studentName: '劉心悅',
    paymentItem: '古典鋼琴個別課 (第 4 期 10堂)',
    amount: 'NT$ 8,000',
    numericAmount: 8000,
    deadline: '2026/09/20',
    uploadTime: '2026/09/20 下午4:02',
    receivingAccount: '012 台北富邦銀行 (36610)',
    last5Digits: '50638',
  });

  useEffect(() => {
    if (studentNameFromDb) {
      setBillingData((prev) => ({
        ...prev,
        studentName: studentNameFromDb,
      }));
    }
  }, [studentNameFromDb]);

  // 處理實際檔案上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setUploadedImageUrl(preview);
      startAiScan();
    }
  };

  // 模擬 AI 辨識掃描過程
  const startAiScan = () => {
    setUploadState('scanning');
    setTimeout(() => {
      setUploadState('after_upload');
    }, 1500);
  };

  // 一鍵載入示範截圖並進入已上傳狀態
  const handleLoadDemoReceipt = () => {
    setUploadedImageUrl('/demo_img/fubon_transfer.jpg');
    startAiScan();
  };

  // 重新上傳
  const handleResetUpload = () => {
    setUploadState('before_upload');
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 手動修正暫存表單
  const [editForm, setEditForm] = useState({ ...billingData });

  const handleOpenEditModal = () => {
    setEditForm({ ...billingData });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingData({ ...editForm });
    setShowEditModal(false);
    showToast('繳費資料已更新');
    if (uploadState === 'before_upload') {
      setUploadState('after_upload');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none font-['Sora','Noto_Sans_TC',sans-serif] pb-12 animate-in fade-in">
      {/* 隱藏的檔案上傳 Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 頁面標題列 */}
      <div className="w-full flex items-center justify-between px-1 pt-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-[#2B3049] text-[20px] font-bold leading-tight">
              智慧繳費核對
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#82AAD8]/15 text-[#4B709E] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#82AAD8]" />
              GPT-4o Vision
            </span>
          </div>
          <p className="text-[#6F6F6F] text-[13px] font-normal">
            {uploadState === 'after_upload'
              ? '✅ 已完成 AI 影像辨識與自動比對'
              : uploadState === 'scanning'
              ? '✨ AI 視覺辨識模型正在解析轉帳收據與金額...'
              : '請上傳網銀或 ATM 轉帳截圖，AI 將自動辨識'}
          </p>
        </div>

        {/* 右側：手動編輯按鈕 */}
        <button
          type="button"
          onClick={handleOpenEditModal}
          title="手動編輯繳費資料"
          className="w-9 h-9 bg-white rounded-full outline outline-1 outline-[rgba(130,170,216,0.3)] flex items-center justify-center cursor-pointer hover:bg-slate-50 active:scale-95 transition-all shadow-xs shrink-0"
        >
          <Edit3 className="w-4 h-4 text-[#2B3049]" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 卡片 1：上傳截圖區域 (未上傳 / 掃描中 / 已辨識)             */}
      {/* ======================================================== */}
      <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col gap-3">
        {uploadState === 'before_upload' && (
          /* --- 1. 未上傳狀態：拖曳/點擊上傳區域 --- */
          <div className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center text-[#82AAD8]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <h2 className="flex-1 text-[#2B3049] text-[14px] font-bold">
                上傳轉帳明細截圖
              </h2>
              <span className="text-[11px] text-[#9CA3AF]">支援 JPG / PNG</span>
            </div>

            {/* 點擊選擇檔案/拖曳框 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-7 bg-[rgba(130,170,216,0.06)] rounded-xl outline outline-1.5 outline-dashed outline-[#82AAD8]/70 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-[rgba(130,170,216,0.12)] active:scale-[0.99] transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-white shadow-xs flex items-center justify-center text-[#82AAD8] group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-[#4B709E] text-[14px] font-bold">
                  點擊選擇截圖 或 拍照上傳
                </span>
                <span className="text-[#9CA3AF] text-[11px]">
                  包含轉帳金額、交易時間與帳號末五碼
                </span>
              </div>
            </div>

            {/* 選擇檔案上傳與快速測試示範按鈕 */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-10.5 rounded-xl bg-[#82AAD8] hover:bg-[#6e97c4] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
              >
                <UploadCloud className="w-4 h-4" />
                <span>選擇手機相簿截圖</span>
              </button>

              <button
                type="button"
                onClick={handleLoadDemoReceipt}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F2ECE1] border border-[#EBDCB9] text-center text-[12px] text-[#885424] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C58D34]" />
                <span>⚡ 載入示範富邦轉帳截圖（NT$ 8,000）</span>
              </button>
            </div>
          </div>
        )}

        {uploadState === 'scanning' && (
          /* --- 2. 掃描中狀態：AI 掃描光條與預覽 --- */
          <div className="w-full flex flex-col gap-3 py-2">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#82AAD8] animate-spin" />
                <span className="text-[14px] font-bold text-[#2B3049]">
                  AI 視覺神經網路辨識中...
                </span>
              </div>
              <span className="text-[11px] text-[#82AAD8] font-bold animate-pulse">
                解析憑證特徵
              </span>
            </div>

            {/* 截圖影像 + 雷射掃描光束效果 */}
            <div className="w-full h-[140px] rounded-xl overflow-hidden border border-[#82AAD8]/40 relative bg-slate-900 flex items-center justify-center shadow-inner">
              <img
                src={uploadedImageUrl || '/demo_img/fubon_transfer.jpg'}
                alt="截圖預覽"
                className="w-full h-full object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#82AAD8]/20 via-transparent to-[#82AAD8]/30" />
              {/* 動態雷射光條 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />
              <div className="absolute bottom-2 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full text-white text-[11px] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
                <span>正在提取匯款金額與帳號末五碼...</span>
              </div>
            </div>

            {/* 進度條 */}
            <div className="w-full bg-[#FAF6F0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#82AAD8] h-full w-4/5 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {uploadState === 'after_upload' && (
          /* --- 3. 辨識完成狀態：縮圖展示 + 重新上傳 --- */
          <div className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-[#2B3049] text-[14px] font-bold">
                  已上傳轉帳截圖
                </h2>
              </div>

              <button
                type="button"
                onClick={handleResetUpload}
                className="flex items-center gap-1 text-[#6F6F6F] hover:text-[#2B3049] text-[12px] font-semibold cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-[#2B3049]" />
                <span>重新上傳</span>
              </button>
            </div>

            {/* 截圖影像 */}
            <div className="w-full h-[120px] rounded-xl overflow-hidden border border-[#E2E8F0] relative bg-[#F8FAFC] flex items-center justify-center shadow-xs">
              <img
                src={uploadedImageUrl || '/demo_img/fubon_transfer.jpg'}
                alt="轉帳截圖"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded-md text-white text-[10px] font-medium">
                {billingData.uploadTime}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 卡片 2：AI 系統自動辨識結果 (動態浮現)                     */}
      {/* ======================================================== */}
      <div className={`w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col gap-3.5 transition-all duration-300 ${
        uploadState === 'after_upload' ? 'ring-2 ring-[#82AAD8]/30' : ''
      }`}>
        {/* 標題列 */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles
              className={`w-4 h-4 shrink-0 ${
                uploadState === 'after_upload' ? 'text-[#82AAD8]' : 'text-[#9CA3AF]'
              }`}
            />
            <h2
              className={`text-[14px] font-bold ${
                uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#6F6F6F]'
              }`}
            >
              AI 自動辨識提取結果
            </h2>
          </div>

          {uploadState === 'after_upload' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              信心度 98.5%
            </span>
          )}
        </div>

        {/* 未上傳狀態之提示框 */}
        {uploadState === 'before_upload' && (
          <div className="w-full py-3 px-4 bg-[#FAF6F0] rounded-xl border border-dashed border-[#EBDCB9] flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C58D34]" />
            <span className="text-center text-[#885424] text-[12px] font-semibold">
              上傳截圖後，AI 將在 1 秒內自動辨識並填入下方資料
            </span>
          </div>
        )}

        {/* 欄位明細清單 */}
        <div className="w-full flex flex-col gap-2.5">
          {/* 1. 學生姓名 */}
          <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
            <span className="text-[#6F6F6F] text-[13px] font-normal">學員姓名</span>
            <span
              className={`text-[14px] font-semibold transition-colors ${
                uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
              }`}
            >
              {uploadState === 'after_upload' ? studentNameFromDb : '---'}
            </span>
          </div>

          {/* 2. 對應課程 */}
          <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
            <span className="text-[#6F6F6F] text-[13px] font-normal">核銷期數/項目</span>
            <span
              className={`text-[14px] font-semibold transition-colors ${
                uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
              }`}
            >
              {uploadState === 'after_upload' ? billingData.paymentItem : '---'}
            </span>
          </div>

          {/* 3. 學費金額 / 辨識金額 */}
          <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
            <span className="text-[#6F6F6F] text-[13px] font-normal">辨識匯款金額</span>
            <div className="flex items-center gap-1.5">
              {uploadState === 'after_upload' && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  ✔ 金額相符
                </span>
              )}
              <span
                className={`transition-all ${
                  uploadState === 'after_upload'
                    ? 'text-emerald-700 text-[17px] font-bold font-mono'
                    : 'text-[#B0B0B0] text-[14px] font-semibold'
                }`}
              >
                {uploadState === 'after_upload' ? billingData.amount : '---'}
              </span>
            </div>
          </div>

          {/* 4. 匯款日期 */}
          <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
            <span className="text-[#6F6F6F] text-[13px] font-normal">交易時間</span>
            <span
              className={`text-[13px] font-semibold transition-colors ${
                uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
              }`}
            >
              {uploadState === 'after_upload' ? billingData.uploadTime : '---'}
            </span>
          </div>

          {/* 5. 匯款銀行 */}
          <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
            <span className="text-[#6F6F6F] text-[13px] font-normal">收款帳戶</span>
            <span
              className={`text-[13px] font-semibold transition-colors ${
                uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
              }`}
            >
              {uploadState === 'after_upload' ? billingData.receivingAccount : '---'}
            </span>
          </div>

          {/* 6. 轉帳帳號末五碼 */}
          <div className="w-full flex justify-between items-center">
            <span className="text-[#6F6F6F] text-[13px] font-normal">轉出帳號末五碼</span>
            <div className="flex items-center gap-1.5">
              {uploadState === 'after_upload' && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                  ✔ 帳號相符
                </span>
              )}
              <span
                className={`font-mono transition-all ${
                  uploadState === 'after_upload'
                    ? 'text-[#2B3049] text-[15px] font-bold bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#EBDCB9]'
                    : 'text-[#B0B0B0] text-[14px] font-semibold'
                }`}
              >
                {uploadState === 'after_upload' ? billingData.last5Digits : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 卡片 3：AI 比對核銷結果                                   */}
      {/* ======================================================== */}
      <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col gap-3">
        {/* 標題列 */}
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                uploadState === 'after_upload' ? 'text-emerald-600' : 'text-[#9CA3AF]'
              }`}
            />
            <h2
              className={`text-[14px] font-bold ${
                uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#6F6F6F]'
              }`}
            >
              AI 比對核銷結果
            </h2>
          </div>

          {uploadState === 'after_upload' ? (
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold">
              全部項目通過驗證
            </div>
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">待上傳核對</span>
          )}
        </div>

        {/* 驗證項目清單 */}
        <div className="w-full flex flex-col gap-2 pt-1">
          {/* 項目 1：金額一致 */}
          <div className="w-full flex items-center gap-2.5">
            {uploadState === 'after_upload' ? (
              <div className="w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-4.5 h-4.5 rounded-full border-[1.5px] border-[#CBD5E1] shrink-0" />
            )}
            <span className={`text-[13px] ${uploadState === 'after_upload' ? 'text-[#2B3049] font-medium' : 'text-[#6F6F6F]'}`}>
              {uploadState === 'after_upload'
                ? `應繳金額與匯款金額完全相符 (${billingData.amount})`
                : '應繳金額與截圖金額是否相符'}
            </span>
          </div>

          {/* 項目 2：末五碼正確 */}
          <div className="w-full flex items-center gap-2.5">
            {uploadState === 'after_upload' ? (
              <div className="w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-4.5 h-4.5 rounded-full border-[1.5px] border-[#CBD5E1] shrink-0" />
            )}
            <span className={`text-[13px] ${uploadState === 'after_upload' ? 'text-[#2B3049] font-medium' : 'text-[#6F6F6F]'}`}>
              {uploadState === 'after_upload'
                ? `帳號末五碼比對正確 (${billingData.last5Digits})`
                : '轉出帳號末五碼是否正確'}
            </span>
          </div>

          {/* 項目 3：交易日期合理 */}
          <div className="w-full flex items-center gap-2.5">
            {uploadState === 'after_upload' ? (
              <div className="w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-4.5 h-4.5 rounded-full border-[1.5px] border-[#CBD5E1] shrink-0" />
            )}
            <span className={`text-[13px] ${uploadState === 'after_upload' ? 'text-[#2B3049] font-medium' : 'text-[#6F6F6F]'}`}>
              {uploadState === 'after_upload'
                ? '交易時間在合理繳費期限內 (09/20 內有效)'
                : '交易時間是否在有效繳費期內'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 底部功能按鈕區域                                        */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col gap-2.5 mt-1 shrink-0">
        {uploadState === 'before_upload' ? (
          /* --- 未上傳狀態之按鈕 --- */
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 bg-[#82AAD8] hover:bg-[#6e97c4] active:scale-[0.99] rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>上傳轉帳截圖開始辨識</span>
            </button>
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="w-full text-center text-[#6F6F6F] text-[13px] font-normal underline hover:text-[#2B3049] cursor-pointer py-1"
            >
              無法提供截圖？手動輸入末五碼
            </button>
          </div>
        ) : uploadState === 'scanning' ? (
          <button
            type="button"
            disabled
            className="w-full h-12 bg-[#82AAD8]/50 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-wait"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI 正在辨識中，請稍候...</span>
          </button>
        ) : (
          /* --- 已辨識狀態：確認核銷按鈕 --- */
          <>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(true);
                showToast('🎉 學費已完成 AI 智慧核銷！');
              }}
              className="w-full h-12 bg-gradient-to-r from-[#82AAD8] to-[#68C5AB] hover:brightness-105 active:scale-[0.99] rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>確認核銷，正式開通新期課程</span>
            </button>
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="w-full h-10 rounded-xl border border-[#CBD5E1] text-[#6F6F6F] hover:bg-slate-50 font-semibold text-[13px] flex items-center justify-center cursor-pointer transition-all"
            >
              辨識內容有誤？手動修正
            </button>
            <p className="text-center text-[#9CA3AF] text-[11px] font-normal">
              點擊確認後系統將自動入帳並發送 LINE 開通通知
            </p>
          </>
        )}
      </div>

        {/* ======================================================== */}
        {/* 核銷成功彈窗 Modal                                       */}
        {/* ======================================================== */}
        {showSuccessModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
            onClick={() => setShowSuccessModal(false)}
          >
            <div 
              className="w-full max-w-[320px] bg-white rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 border border-slate-100 animate-in zoom-in-95 text-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-bold text-[#2B3049]">
                  繳費核銷成功！
                </h3>
                <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                  系統已將學費狀態更新為「已繳清」。感謝您的配合，課表與上課權益已即時生效！
                </p>
              </div>

              <div className="w-full p-3 bg-[#FAF6F0] rounded-xl flex flex-col gap-1 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">學員姓名：</span>
                  <span className="font-bold text-[#2B3049]">{billingData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">核銷金額：</span>
                  <span className="font-bold text-emerald-700">{billingData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">帳號末五碼：</span>
                  <span className="font-bold text-[#2B3049]">{billingData.last5Digits}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/student/schedule');
                }}
                className="w-full py-2.5 bg-[#82AAD8] hover:bg-[#6f96c2] text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer transition-all"
              >
                返回我的課表
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 手動修正彈窗 Modal (依據 Figma 規範完整精準切版)           */}
        {/* ======================================================== */}
        {showEditModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
            onClick={() => setShowEditModal(false)}
          >
            <div 
              className="w-full max-w-[328px] max-h-[85vh] overflow-y-auto bg-white rounded-[24px] p-5 shadow-[0px_8px_24px_rgba(43,48,73,0.14)] flex flex-col gap-4.5 [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] animate-in zoom-in-95 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* 頂部標題列與關閉按鈕 */}
              <div className="w-full flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-[18px] height-[18px] relative flex items-center justify-center shrink-0">
                    <div className="w-[14.25px] h-[14.25px] outline outline-2 outline-[#82AAD8] outline-offset-[-1px] rounded-xs flex items-center justify-center">
                      <Edit3 className="w-2.5 h-2.5 text-[#82AAD8]" />
                    </div>
                  </div>
                  <h3 className="text-[#2B3049] text-[16px] font-bold font-['Sora'] leading-none">
                    編輯繳費資料
                  </h3>
                </div>

                {/* 圓形關閉按鈕 (28x28) */}
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  aria-label="關閉彈出視窗"
                  className="w-7 h-7 bg-[#FAF6F0] hover:bg-[#F2ECE1] active:scale-95 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-[#2B3049]" strokeWidth={2.5} />
                </button>
              </div>

              {/* 上分隔線 */}
              <div className="w-full h-0 border-b-[1.5px] border-[#FAF6F0] shrink-0" />

              {/* 6 個表單欄位 */}
              <form onSubmit={handleSaveEdit} className="w-full flex flex-col gap-3">
                <div className="w-full flex flex-col gap-3">
                  
                  {/* 1. 學生姓名 */}
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                      學生姓名 (Student Name)
                    </label>
                    <input
                      type="text"
                      value={editForm.studentName}
                      onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                  {/* 2. 繳費項目 */}
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                      繳費項目 (Payment Item)
                    </label>
                    <input
                      type="text"
                      value={editForm.paymentItem}
                      onChange={(e) => setEditForm({ ...editForm, paymentItem: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                  {/* 3. 繳費金額 */}
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                      繳費金額 (Payment Amount)
                    </label>
                    <input
                      type="text"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                  {/* 4. 繳費期限 */}
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                      繳費期限 (Payment Deadline)
                    </label>
                    <input
                      type="text"
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                  {/* 5. 收款帳戶 */}
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                      收款帳戶 (Receiving Account)
                    </label>
                    <input
                      type="text"
                      value={editForm.receivingAccount}
                      onChange={(e) => setEditForm({ ...editForm, receivingAccount: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                  {/* 6. 帳戶末五碼 */}
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                      帳戶末五碼 (Last 5 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={editForm.last5Digits}
                      onChange={(e) => setEditForm({ ...editForm, last5Digits: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                </div>

                {/* 下分隔線 */}
                <div className="w-full h-0 border-b-[1.5px] border-[#FAF6F0] my-1 shrink-0" />

                {/* 底部雙操作按鈕 */}
                <div className="w-full flex items-center gap-2.5 shrink-0">
                  {/* 取消按鈕 */}
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 h-[42px] bg-white hover:bg-slate-50 active:scale-95 rounded-xl outline outline-1 outline-[#6F6F6F] outline-offset-[-1px] text-[#6F6F6F] text-[14px] font-semibold font-['Sora'] flex items-center justify-center cursor-pointer transition-all"
                  >
                    取消
                  </button>

                  {/* 確認修改按鈕 */}
                  <button
                    type="submit"
                    className="flex-1 h-[42px] bg-[#82AAD8] hover:bg-[#6e97c4] active:scale-95 rounded-xl text-white text-[14px] font-bold font-['Sora'] flex items-center justify-center cursor-pointer transition-all shadow-xs"
                  >
                    確認修改
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}
    </div>
  );
}
