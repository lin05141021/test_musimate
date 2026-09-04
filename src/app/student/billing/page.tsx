'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';
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
  const studentNameFromDb = currentStudentInfo?.user?.name?.replace(/\s*\(.*?\)\s*/g, '').trim() || '陳小明';

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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [activeInputField, setActiveInputField] = useState<'amount' | 'last5Digits' | null>(null);

  // 辨識結果資料 (對齊使用者提供之富邦企鵝轉帳截圖: NT$ 8,000, 轉出 50638, 轉入 36610)
  const [billingData, setBillingData] = useState({
    studentName: '王小明',
    paymentItem: '週二團體低音提琴 10堂',
    amount: 'NT$ 8,000',
    numericAmount: 8000,
    deadline: '2026/09/20',
    uploadTime: '2026/09/20 下午4:02',
    receivingAccount: '012 台北富邦銀行 (36610)',
    last5Digits: '50638',
  });

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
    setIsKeyboardOpen(false);
    setActiveInputField(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingData({ ...editForm });
    setShowEditModal(false);
    setIsKeyboardOpen(false);
    if (uploadState === 'before_upload') {
      setUploadState('after_upload');
    }
  };

  // 模擬虛擬鍵盤點擊處理
  const handleKeypadPress = (key: string) => {
    const field = activeInputField || 'last5Digits';
    if (field === 'last5Digits') {
      if (key === 'CLEAR') {
        setEditForm((prev) => ({ ...prev, last5Digits: '' }));
      } else if (key === 'BACKSPACE') {
        setEditForm((prev) => ({ ...prev, last5Digits: prev.last5Digits.slice(0, -1) }));
      } else if (editForm.last5Digits.length < 5) {
        setEditForm((prev) => ({ ...prev, last5Digits: prev.last5Digits + key }));
      }
    } else if (field === 'amount') {
      if (key === 'CLEAR') {
        setEditForm((prev) => ({ ...prev, amount: 'NT$ 0' }));
      } else if (key === 'BACKSPACE') {
        const digits = editForm.amount.replace(/[^0-9]/g, '').slice(0, -1) || '0';
        setEditForm((prev) => ({ ...prev, amount: `NT$ ${Number(digits).toLocaleString()}` }));
      } else {
        const digits = (editForm.amount.replace(/[^0-9]/g, '') + key).replace(/^0+/, '');
        setEditForm((prev) => ({ ...prev, amount: `NT$ ${Number(digits).toLocaleString()}` }));
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] sm:bg-[#EDE8DE] flex justify-center items-center py-0 sm:py-6 select-none font-['Sora','Noto_Sans_TC',sans-serif]">
      {/* 360px Google Pixel 9a 標準尺寸手機主視窗容器 (固定高度 800px / 100dvh，超過版面由中間區域垂直滾動 vertical scroll) */}
      <div className="w-[360px] h-[800px] max-w-full max-h-[100dvh] sm:max-h-[820px] bg-[#FAF6F0] flex flex-col justify-between relative shadow-2xl sm:rounded-[36px] overflow-hidden border border-[#E5DEC9]">
        
        {/* 頂部固定品牌列 (flex-shrink-0 置頂) */}
        <header className="flex-shrink-0 w-full h-16 px-5 py-3 flex items-center bg-[#FAF6F0] border-b border-[#F0EBE1]/80 z-20">
          <div className="w-[161px] h-10 flex items-center">
            <img
              src="/UI/logo.png"
              alt="MusiMate"
              className="h-9 w-auto object-contain cursor-pointer"
              onClick={() => router.push('/')}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/logo.png')) {
                  target.src = '/logo.png';
                }
              }}
            />
          </div>

          {/* 右側：手動編輯按鈕 (Figma 規範 32x32 白底圓鈕) 與狀態快捷切換開關 */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEditModal}
              title="手動編輯繳費資料"
              className="w-8 h-8 bg-white rounded-full outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] flex items-center justify-center cursor-pointer hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2B3049]" />
            </button>

            <div className="flex items-center gap-1 bg-[#82AAD8]/15 px-2 py-1 rounded-full text-[11px] font-bold text-[#4B709E]">
              <button
                type="button"
                onClick={() => setUploadState('before_upload')}
                className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  uploadState === 'before_upload' ? 'bg-white text-[#2B3049] shadow-2xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                未上傳
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setUploadState('after_upload')}
                className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  uploadState === 'after_upload' ? 'bg-[#82AAD8] text-white shadow-2xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                已上傳
              </button>
            </div>
          </div>
        </header>

        {/* 隱藏的檔案上傳 Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 主要內容區域 (flex-1 獨立垂直滾動 vertical scroll；彈窗開啟時依 Figma 規範呈現 opacity-35) */}
        <main
          className={`flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-10 flex flex-col gap-4 [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] transition-opacity duration-200 ${
            showEditModal ? 'opacity-35 pointer-events-none' : ''
          }`}
        >
          
          {/* ======================================================== */}
          {/* 頁面標題與副標題                                        */}
          {/* ======================================================== */}
          <div className="w-full flex flex-col items-center gap-1.5 shrink-0">
            <h1 className="text-center text-[#2B3049] text-[20px] font-bold leading-tight">
              智慧繳費核對
            </h1>
            <p className="text-center text-[#6F6F6F] text-[14px] font-normal leading-[19.6px]">
              {uploadState === 'after_upload'
                ? '請上傳匯款截圖，AI 自動辨識'
                : '請上傳繳費截圖，AI 自動核對'}
            </p>
          </div>

          {/* ======================================================== */}
          {/* AI 掃描動畫過場 (Scanning State)                         */}
          {/* ======================================================== */}
          {uploadState === 'scanning' && (
            <div className="w-full p-6 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col items-center justify-center gap-3 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-[rgba(130,170,216,0.15)] flex items-center justify-center relative">
                <Sparkles className="w-7 h-7 text-[#82AAD8] animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-[#82AAD8] border-t-transparent animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-[15px] font-bold text-[#2B3049]">AI 自動辨識影像中...</span>
                <span className="text-[12px] text-[#6F6F6F]">正在解析匯款金額、末五碼與交易時間</span>
              </div>
              <div className="w-full bg-[#FAF6F0] h-2 rounded-full overflow-hidden mt-1">
                <div className="bg-[#82AAD8] h-full w-4/5 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 卡片 1：上傳截圖區域 (Before vs. After)                   */}
          {/* ======================================================== */}
          {uploadState !== 'scanning' && (
            <>
              {uploadState === 'before_upload' ? (
                /* --- 上傳前：虛線拖曳區域與上傳按鈕 --- */
                <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col gap-4">
                  
                  {/* 標題列 */}
                  <div className="w-full flex items-center gap-2">
                    <div className="w-[18px] h-[18px] relative flex items-center justify-center">
                      <div className="w-[15px] h-[13.5px] outline outline-2 outline-[#82AAD8] rounded-xs" />
                    </div>
                    <h2 className="flex-1 text-[#2B3049] text-[14px] font-bold">
                      上傳繳費截圖
                    </h2>
                  </div>

                  <p className="text-[#6F6F6F] text-[12px] font-normal leading-normal">
                    支援 JPG、PNG 格式，檔案大小不超過 10MB
                  </p>

                  {/* 點擊選擇檔案/拖曳框 */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-6 bg-[rgba(130,170,216,0.08)] rounded-xl outline outline-1 outline-[#82AAD8] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[rgba(130,170,216,0.14)] active:scale-[0.99] transition-all"
                  >
                    <div className="w-8 h-8 relative flex items-center justify-center text-[#82AAD8]">
                      <UploadCloud className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-[#82AAD8] text-[14px] font-normal text-center">
                      點擊此處選擇檔案 或 拖曳圖片至此
                    </span>
                  </div>

                  {/* 選擇檔案上傳按鈕 */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-10 rounded-lg outline outline-[1.5px] outline-[#82AAD8] outline-offset-[-1.5px] text-[#82AAD8] hover:bg-[#82AAD8] hover:text-white font-bold text-[14px] flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                    >
                      選擇檔案上傳
                    </button>

                    {/* 示範捷徑按鈕 */}
                    <button
                      type="button"
                      onClick={handleLoadDemoReceipt}
                      className="w-full py-1 text-center text-xs text-[#82AAD8] hover:underline font-medium cursor-pointer"
                    >
                      ⚡ 載入示範匯款截圖（NT$ 8,000）
                    </button>
                  </div>

                </div>
              ) : (
                /* --- 上傳後：截圖預覽與重新上傳 --- */
                <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col gap-3">
                  
                  {/* 標題列 + 重新上傳按鈕 */}
                  <div className="w-full flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-[13.33px] h-[10.67px] outline outline-2 outline-[#2B3049] rounded-xs" />
                    </div>
                    <h2 className="flex-1 text-[#2B3049] text-[14px] font-bold">
                      上傳匯款截圖
                    </h2>
                    
                    {/* 彩虹漸層圖示 + 重新上傳按鈕 */}
                    <button
                      type="button"
                      onClick={handleResetUpload}
                      className="flex items-center gap-1 text-[#6F6F6F] hover:text-[#2B3049] text-[12px] font-semibold cursor-pointer transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-b from-[#C9A259] via-[#D5CC6A] to-[#68C5AB] p-0.5">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <RotateCcw className="w-2.5 h-2.5 text-[#2B3049]" />
                        </div>
                      </div>
                      <span>重新上傳</span>
                    </button>
                  </div>

                  {/* 截圖真實影像 (展示使用者指定之富邦企鵝轉帳明細截圖) */}
                  <div className="w-full h-[120px] rounded-xl overflow-hidden border border-[#E2E8F0] relative bg-[#F8FAFC] flex items-center justify-center shadow-xs">
                    <img
                      src={uploadedImageUrl || '/demo_img/fubon_transfer.jpg'}
                      alt="富邦企鵝轉帳截圖"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <p className="text-[#6F6F6F] text-[12px] font-normal">
                    上傳時間：{billingData.uploadTime}
                  </p>

                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* 卡片 2：AI 系統自動辨識結果                               */}
          {/* ======================================================== */}
          <div className="w-full p-4 bg-white rounded-2xl outline outline-1 outline-[rgba(130,170,216,0.25)] shadow-[0px_4px_12px_rgba(43,48,73,0.03)] flex flex-col gap-3.5">
            
            {/* 標題列 */}
            <div className="w-full flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <div
                  className={`w-[13.34px] h-[13.34px] outline outline-2 rounded-xs ${
                    uploadState === 'after_upload' ? 'outline-[#82AAD8]' : 'outline-[#B0B0B0]'
                  }`}
                />
              </div>
              <h2
                className={`flex-1 text-[14px] font-bold ${
                  uploadState === 'after_upload' ? 'text-[#82AAD8]' : 'text-[#6F6F6F]'
                }`}
              >
                AI 系統自動辨識結果
              </h2>
            </div>

            {/* 未上傳狀態之提示框 */}
            {uploadState === 'before_upload' && (
              <div className="w-full p-3 bg-[#FAF6F0] rounded-lg outline outline-1 outline-[#B0B0B0] flex items-center justify-center">
                <span className="text-center text-[#6F6F6F] text-[12px] font-normal">
                  尚未上傳截圖，AI 辨識結果將顯示於此
                </span>
              </div>
            )}

            {/* 欄位明細清單 */}
            <div className="w-full flex flex-col gap-2.5">
              {/* 1. 學生姓名 */}
              <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
                <span className="text-[#6F6F6F] text-[14px] font-normal">學生姓名</span>
                <span
                  className={`text-[14px] font-semibold ${
                    uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
                  }`}
                >
                  {uploadState === 'after_upload' ? billingData.studentName : '---'}
                </span>
              </div>

              {/* 2. 對應課程 */}
              <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
                <span className="text-[#6F6F6F] text-[14px] font-normal">
                  {uploadState === 'after_upload' ? '對應課程' : '課程資訊'}
                </span>
                <span
                  className={`text-[14px] font-semibold ${
                    uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
                  }`}
                >
                  {uploadState === 'after_upload' ? billingData.paymentItem : '---'}
                </span>
              </div>

              {/* 3. 學費金額 / 辨識金額 */}
              <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
                <span className="text-[#6F6F6F] text-[14px] font-normal">
                  {uploadState === 'after_upload' ? '辨識金額' : '學費金額'}
                </span>
                <span
                  className={
                    uploadState === 'after_upload'
                      ? 'text-[#2B3049] text-[16px] font-bold'
                      : 'text-[#B0B0B0] text-[14px] font-semibold'
                  }
                >
                  {uploadState === 'after_upload' ? billingData.amount : '---'}
                </span>
              </div>

              {/* 4. 繳費日期 / 匯款日期 */}
              <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
                <span className="text-[#6F6F6F] text-[14px] font-normal">
                  {uploadState === 'after_upload' ? '匯款日期' : '繳費日期'}
                </span>
                <span
                  className={`text-[14px] font-semibold ${
                    uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
                  }`}
                >
                  {uploadState === 'after_upload' ? billingData.deadline : '---'}
                </span>
              </div>

              {/* 5. 匯款銀行 (上傳後專屬) */}
              {uploadState === 'after_upload' && (
                <div className="w-full pb-2 border-b border-[#FAF6F0] flex justify-between items-center">
                  <span className="text-[#6F6F6F] text-[14px] font-normal">匯款銀行</span>
                  <span className="text-[#2B3049] text-[14px] font-semibold">
                    {billingData.receivingAccount}
                  </span>
                </div>
              )}

              {/* 6. 轉帳帳號末五碼 */}
              <div className="w-full flex justify-between items-center">
                <span className="text-[#6F6F6F] text-[14px] font-normal">
                  {uploadState === 'after_upload' ? '帳號末五碼' : '轉帳帳號末五碼'}
                </span>
                <span
                  className={`text-[14px] font-semibold ${
                    uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#B0B0B0]'
                  }`}
                >
                  {uploadState === 'after_upload' ? billingData.last5Digits : '---'}
                </span>
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
                <div className="w-4 h-4 flex items-center justify-center">
                  <div
                    className={`w-[13.33px] h-[13.33px] outline outline-2 rounded-xs ${
                      uploadState === 'after_upload' ? 'outline-[#82AAD8]' : 'outline-[#B0B0B0]'
                    }`}
                  />
                </div>
                <h2
                  className={`text-[14px] font-bold ${
                    uploadState === 'after_upload' ? 'text-[#2B3049]' : 'text-[#6F6F6F]'
                  }`}
                >
                  AI 比對核銷結果
                </h2>
              </div>

              {/* 上傳後：通過標籤 */}
              {uploadState === 'after_upload' && (
                <div className="px-2 py-0.5 bg-[rgba(130,170,216,0.30)] rounded">
                  <span className="text-[#2B3049] text-[12px] font-semibold">
                    全部項目通過驗證
                  </span>
                </div>
              )}
            </div>

            {/* 未上傳狀態之次標題 */}
            {uploadState === 'before_upload' && (
              <p className="text-[#6F6F6F] text-[12px] font-normal">
                等待上傳截圖後自動核對
              </p>
            )}

            {/* 驗證項目清單 */}
            <div className="w-full flex flex-col gap-2">
              {/* 項目 1：金額一致 */}
              <div className="w-full flex items-center gap-2">
                {uploadState === 'after_upload' ? (
                  <div className="w-4 h-4 bg-[#82AAD8] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-[1.5px] border-[#6F6F6F] shrink-0" />
                )}
                <span className="text-[#2B3049] text-[14px] font-normal">
                  {uploadState === 'after_upload'
                    ? `金額完全一致 (${billingData.amount})`
                    : '金額是否一致'}
                </span>
              </div>

              {/* 項目 2：末五碼正確 */}
              <div className="w-full flex items-center gap-2">
                {uploadState === 'after_upload' ? (
                  <div className="w-4 h-4 bg-[#82AAD8] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-[1.5px] border-[#6F6F6F] shrink-0" />
                )}
                <span className="text-[#2B3049] text-[14px] font-normal">
                  {uploadState === 'after_upload'
                    ? `末五碼一致 (${billingData.last5Digits})`
                    : '末五碼是否正確'}
                </span>
              </div>

              {/* 項目 3：交易日期合理 */}
              <div className="w-full flex items-center gap-2">
                {uploadState === 'after_upload' ? (
                  <div className="w-4 h-4 bg-[#82AAD8] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-[1.5px] border-[#6F6F6F] shrink-0" />
                )}
                <span className="text-[#2B3049] text-[14px] font-normal">
                  {uploadState === 'after_upload'
                    ? '交易日期在合理範圍內 (09/20 合理)'
                    : '交易日期是否在合理範圍'}
                </span>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* 底部功能按鈕區域                                        */}
          {/* ======================================================== */}
          <div className="w-full flex flex-col gap-2.5 mt-1 shrink-0">
            {uploadState === 'before_upload' ? (
              /* --- 未上傳狀態之禁用按鈕與手動連結 --- */
              <>
                <button
                  type="button"
                  disabled
                  className="w-full h-12 bg-[#E5E5E5] rounded-xl text-[#707070] font-bold text-[14px] flex items-center justify-center cursor-not-allowed"
                >
                  確認無誤，資料正確
                </button>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="w-full text-center text-[#6F6F6F] text-[14px] font-normal underline hover:text-[#2B3049] cursor-pointer"
                >
                  資料有疑問？手動修正
                </button>
              </>
            ) : (
              /* --- 已上傳狀態之核銷按鈕與手動修正 --- */
              <>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(true)}
                  className="w-full h-12 bg-[#82AAD8] hover:bg-[#6e97c4] active:scale-[0.99] rounded-xl text-white font-bold text-[14px] flex items-center justify-center cursor-pointer transition-all shadow-xs"
                >
                  確認核銷，資料正確
                </button>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="w-full h-12 rounded-xl outline outline-1 outline-[#6F6F6F] outline-offset-[-1px] text-[#6F6F6F] hover:bg-slate-50 font-normal text-[14px] flex items-center justify-center cursor-pointer transition-all"
                >
                  資料有誤，手動修正
                </button>
                <p className="text-center text-[#6F6F6F] text-[12px] font-normal">
                  確認後系統將自動更新繳費狀態
                </p>
              </>
            )}
          </div>

        </main>

        {/* 底部固定五大功能 TabBar (繳費 Active) */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar
            activeTab="billing"
            onMoreClick={() => setIsMenuOpen(true)}
          />
        </footer>

        {/* 側邊漢堡側選單抽屜 */}
        <StudentMoreDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        {/* ======================================================== */}
        {/* 核銷成功彈窗 Modal                                       */}
        {/* ======================================================== */}
        {showSuccessModal && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-[320px] bg-white rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 border border-slate-100 animate-in zoom-in-95 text-center">
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
          <div className="absolute inset-0 z-50 bg-[rgba(17,17,22,0.52)] flex items-center justify-center px-4 py-6 backdrop-blur-2xs animate-in fade-in">
            <div className="w-full max-w-[328px] max-h-[92vh] overflow-y-auto bg-white rounded-[24px] p-5 shadow-[0px_8px_24px_rgba(43,48,73,0.14)] flex flex-col gap-4.5 [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] animate-in zoom-in-95">
              
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
                    <div className="flex justify-between items-center">
                      <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                        繳費金額 (Payment Amount)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsKeyboardOpen(true);
                          setActiveInputField('amount');
                        }}
                        className="text-[11px] text-[#82AAD8] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                      >
                        📱 升起鍵盤
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editForm.amount}
                      onFocus={() => {
                        setIsKeyboardOpen(true);
                        setActiveInputField('amount');
                      }}
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
                    <div className="flex justify-between items-center">
                      <label className="text-[#6F6F6F] text-[12px] font-semibold font-['Sora']">
                        帳戶末五碼 (Last 5 Digits)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsKeyboardOpen(true);
                          setActiveInputField('last5Digits');
                        }}
                        className="text-[11px] text-[#82AAD8] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                      >
                        📱 升起鍵盤
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={5}
                      value={editForm.last5Digits}
                      onFocus={() => {
                        setIsKeyboardOpen(true);
                        setActiveInputField('last5Digits');
                      }}
                      onChange={(e) => setEditForm({ ...editForm, last5Digits: e.target.value })}
                      className="w-full h-10 px-3 py-2.5 bg-[rgba(250,246,240,0.50)] rounded-[10px] outline outline-1 outline-[rgba(130,170,216,0.25)] outline-offset-[-1px] text-[#2B3049] text-[14px] font-normal font-['Sora'] focus:outline-[#82AAD8] focus:bg-white transition-all"
                    />
                  </div>

                </div>

                {/* 模擬手機升起鍵盤 (Demo Keyboard) */}
                {isKeyboardOpen && (
                  <div className="w-full bg-[#EDE8DE] rounded-2xl p-2.5 flex flex-col gap-1.5 border border-[#D5CCBA] animate-in slide-in-from-bottom duration-200">
                    <div className="flex justify-between items-center px-1 text-[11px] text-[#6F6F6F]">
                      <span className="font-semibold text-[#2B3049]">
                        📱 模擬虛擬數字鍵盤（{activeInputField === 'last5Digits' ? '帳戶末五碼' : '繳費金額'}）
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsKeyboardOpen(false)}
                        className="text-[#82AAD8] font-bold hover:underline cursor-pointer"
                      >
                        收起鍵盤 ▼
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#DDD6C7] rounded-xl">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleKeypadPress(String(n))}
                          className="h-10 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-lg font-bold text-[18px] text-[#2B3049] shadow-xs flex items-center justify-center transition-all cursor-pointer"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('CLEAR')}
                        className="h-10 bg-[#E5DEC9] hover:bg-slate-200 active:bg-slate-300 rounded-lg font-bold text-[12px] text-[#6F6F6F] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        清除
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('0')}
                        className="h-10 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-lg font-bold text-[18px] text-[#2B3049] shadow-xs flex items-center justify-center transition-all cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('BACKSPACE')}
                        className="h-10 bg-[#E5DEC9] hover:bg-slate-200 active:bg-slate-300 rounded-lg font-bold text-[15px] text-[#6F6F6F] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        ⌫
                      </button>
                    </div>
                  </div>
                )}

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
    </div>
  );
}
