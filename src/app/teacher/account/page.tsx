'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Bell,
  Share2,
  Headphones,
  LogOut,
  ChevronRight,
  Calendar,
  X,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Lock,
  Mail,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useDemoContext } from '@/context/DemoContext';

export default function TeacherAccountPage() {
  const router = useRouter();
  const { logout } = useDemoContext();

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification toggles
  const [notificationSettings, setNotificationSettings] = useState({
    lineLessonReminder: true,
    linePaymentReminder: true,
    emailWeeklySummary: true,
    systemAnnouncements: false,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    showToast('📋 已成功複製連結至剪貼簿！');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('兩次輸入的新密碼不一致！');
      return;
    }
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showToast('🔒 登入密碼已成功更新！');
  };

  const handleLogout = () => {
    if (confirm('確定要登出 MusiMate 教師系統嗎？')) {
      logout();
      showToast('👋 已安全登出！');
      setTimeout(() => {
        router.push('/');
      }, 800);
    }
  };

  return (
    <div className="w-full min-h-[1024px] relative bg-[#FAF6F0] overflow-hidden flex flex-col font-['Noto_Sans_TC',sans-serif]">
      {/* 柔美大光暈漸層背景 (對齊 Figma 規範) */}
      <div
        className="w-[700px] h-[700px] -left-[150px] top-[120px] absolute pointer-events-none rounded-full"
        style={{
          opacity: 0.3,
          background:
            'linear-gradient(180deg, rgba(201.36, 162.06, 89.06, 0.80) 0%, rgba(213.32, 204.34, 105.63, 0.80) 24%, rgba(104.38, 197.38, 171.03, 0.80) 50%, rgba(97.84, 147.15, 203.51, 0.80) 77%, rgba(187.27, 101.11, 178.65, 0.80) 100%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="w-[600px] h-[600px] left-[990px] top-[500px] absolute pointer-events-none rounded-full"
        style={{
          opacity: 0.25,
          background:
            'linear-gradient(180deg, rgba(201.36, 162.06, 89.06, 0.80) 0%, rgba(213.32, 204.34, 105.63, 0.80) 24%, rgba(104.38, 197.38, 171.03, 0.80) 50%, rgba(97.84, 147.15, 203.51, 0.80) 77%, rgba(187.27, 101.11, 178.65, 0.80) 100%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Toast 提示條 */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 bg-[#2B3049] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 主內容區 (1440px 容器規範，左右 padding: 80px) */}
      <main className="w-full max-w-[1440px] mx-auto pt-[60px] pb-[80px] px-6 sm:px-12 lg:px-[80px] flex flex-col lg:flex-row items-start gap-10 relative z-10">
        {/* 左側：教師個人資料卡片 (寬度 360px) */}
        <div className="w-full lg:w-[360px] flex flex-col items-start gap-10 shrink-0">
          {/* 標題與說明 */}
          <div className="w-full pb-2 flex flex-col gap-1.5">
            <h1 className="text-[#2B3049] text-[22px] font-['Noto_Serif_TC',serif] font-bold tracking-tight">
              帳戶設定與管理
            </h1>
            <p className="text-[#7A736E] text-sm font-normal leading-relaxed">
              管理您的教師個人資料、學生課表與系統偏好設定
            </p>
          </div>

          {/* 教師個人檔案卡片 */}
          <div className="w-full p-8 bg-white shadow-[0px_8px_24px_rgba(44,42,41,0.03)] rounded-[24px] ring-1 ring-[#EFECE6] flex flex-col items-center gap-7">
            {/* 160x160 圓形頭像外框 */}
            <div className="w-[160px] h-[160px] rounded-full ring-3 ring-[rgba(201.36,162.06,89.06,0.80)] flex items-center justify-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"
                alt="林佩芬 老師"
                className="w-[148px] h-[148px] rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
                }}
              />
            </div>

            {/* 教師名稱與專長標籤 */}
            <div className="w-full flex flex-col items-center gap-3">
              <h2 className="text-[#2B3049] text-2xl font-['Noto_Serif_TC',serif] font-bold">
                林佩芬
              </h2>
              <div className="px-3 py-1 bg-[rgba(181,142,190,0.12)] rounded-full ring-1 ring-[#B58EBE] flex items-center justify-center">
                <span className="text-[#B58EBE] text-[13px] font-medium tracking-wide">
                  PIANO MATE / 鋼琴老師
                </span>
              </div>
            </div>

            {/* 分隔線 */}
            <div className="w-full border-t border-[#EFECE6]" />

            {/* 加入日期 */}
            <div className="flex items-center justify-center gap-2 text-[#7A736E] text-sm font-normal">
              <Calendar className="w-4 h-4 text-[#7A736E]" />
              <span>加入日期 2024/03</span>
            </div>
          </div>
        </div>

        {/* 右側：5 大帳戶設定操作項目 (flex: 1) */}
        <div className="flex-1 w-full flex flex-col items-start gap-4">
          {/* 項目 1: 修改密碼 */}
          <div
            onClick={() => setShowPasswordModal(true)}
            className="w-full p-6 bg-white rounded-2xl ring-1 ring-[#EFECE6] hover:ring-[#B58EBE] hover:shadow-xs transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#FAF6F0] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5 text-[#C9A259]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#2B3049] text-base font-bold">修改密碼</span>
                <span className="text-[#7A736E] text-sm font-normal">更新您的登入密碼</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#B58EBE] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* 項目 2: 通知設定 */}
          <div
            onClick={() => setShowNotificationModal(true)}
            className="w-full p-6 bg-white rounded-2xl ring-1 ring-[#EFECE6] hover:ring-[#B58EBE] hover:shadow-xs transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[rgba(104,197,171,0.10)] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5 text-[#68C5AB]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#2B3049] text-base font-bold">通知設定</span>
                <span className="text-[#7A736E] text-sm font-normal">管理推播與郵件通知偏好</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#B58EBE] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* 項目 3: 分享 (點選開啟專屬 QR Code 分享彈窗) */}
          <div
            onClick={() => setShowShareModal(true)}
            className="w-full p-6 bg-white rounded-2xl ring-1 ring-[#EFECE6] hover:ring-[#B58EBE] hover:shadow-xs transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[rgba(91,160,201,0.10)] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Share2 className="w-5 h-5 text-[#5BA0C9]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#2B3049] text-base font-bold">分享</span>
                <span className="text-[#7A736E] text-sm font-normal">分享給學生或其他老師</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#B58EBE] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* 項目 4: 聯繫系統客服 */}
          <div
            onClick={() => setShowSupportModal(true)}
            className="w-full p-6 bg-white rounded-2xl ring-1 ring-[#EFECE6] hover:ring-[#B58EBE] hover:shadow-xs transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[rgba(104,197,171,0.10)] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5 text-[#68C5AB]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#2B3049] text-base font-bold">聯繫系統客服</span>
                <span className="text-[#7A736E] text-sm font-normal">與我們的客服團隊取得聯繫</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#B58EBE] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* 項目 5: 登出 (紅色警示風格) */}
          <div
            onClick={handleLogout}
            className="w-full p-6 bg-[#FAF5F5] rounded-2xl ring-1 ring-[#F3E8E8] hover:bg-[#F7EBEB] transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LogOut className="w-5 h-5 text-[#9C4242]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#9C4242] text-base font-bold">登出</span>
                <span className="text-[#B58A88] text-sm font-normal">安全登出您的帳號</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#D6A3A1] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </main>

      {/* =========================================================================
          分享名片與專屬 QR Code 彈出視窗 (Modal)
          ========================================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[620px] bg-white rounded-[28px] shadow-2xl p-7 sm:p-9 flex flex-col gap-6 relative max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[rgba(181,142,190,0.15)] text-[#B58EBE] rounded-full">
                    <Share2 className="w-4 h-4" />
                  </span>
                  <h3 className="text-[#2B3049] text-xl sm:text-2xl font-['Noto_Serif_TC',serif] font-bold">
                    分享個人教師專屬名片
                  </h3>
                </div>
                <p className="text-[#7A736E] text-xs sm:text-sm">
                  提供專屬 QR Code 與預約連結，方便家長與學員快速預約排課
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full border-t border-[#EFECE6]" />

            {/* 中間雙 QR Code 放置卡片 (預留空格，提示系統正式上線後補入) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* QR Code 1: 個人介紹專屬網頁 */}
              <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#EFECE6] flex flex-col items-center gap-3.5 text-center">
                <span className="text-[#2B3049] text-sm font-bold">
                  個人介紹頁 QR Code
                </span>
                <span className="text-[#7A736E] text-xs">
                  掃描瀏覽林佩芬老師完整資歷與示範
                </span>

                {/* QR Code 放置空格 */}
                <div className="w-[160px] h-[160px] bg-white rounded-2xl border-2 border-dashed border-[#82AAD8] flex flex-col items-center justify-center p-3 gap-2 shadow-xs">
                  <QrCode className="w-10 h-10 text-[#82AAD8]" />
                  <span className="text-[11px] font-medium text-[#82AAD8] leading-tight">
                    QR Code 空格
                    <br />
                    <span className="text-[10px] text-[#7A736E]">
                      (上線後帶入正式網址)
                    </span>
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      'https://test-musimate.vercel.app/teacher/profile',
                      'profile'
                    )
                  }
                  className="w-full py-2 bg-white hover:bg-[#FAF0EC] border border-[#CEAB98] text-[#CEAB98] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedKey === 'profile' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  複製介紹頁連結
                </button>
              </div>

              {/* QR Code 2: 官方 LINE 預約直達 */}
              <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#EFECE6] flex flex-col items-center gap-3.5 text-center">
                <span className="text-[#2B3049] text-sm font-bold">
                  LINE 官方帳號預約
                </span>
                <span className="text-[#7A736E] text-xs">
                  直接引導家長加入官方 LINE 並綁定排課
                </span>

                {/* QR Code 放置空格 */}
                <div className="w-[160px] h-[160px] bg-white rounded-2xl border-2 border-dashed border-[#52959D] flex flex-col items-center justify-center p-3 gap-2 shadow-xs">
                  <QrCode className="w-10 h-10 text-[#52959D]" />
                  <span className="text-[11px] font-medium text-[#52959D] leading-tight">
                    QR Code 空格
                    <br />
                    <span className="text-[10px] text-[#7A736E]">
                      (上線後帶入正式網址)
                    </span>
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      'https://line.me/R/ti/p/@musimate',
                      'line'
                    )
                  }
                  className="w-full py-2 bg-white hover:bg-[#E6F3F4] border border-[#52959D] text-[#52959D] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedKey === 'line' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  複製 LINE 預約連結
                </button>
              </div>
            </div>

            {/* 系統溫馨提示 */}
            <div className="w-full p-3.5 bg-[rgba(181,142,190,0.10)] rounded-xl border border-[#E8D7EE] flex items-center gap-2.5 text-xs text-[#8A5899]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                系統正式上線有專屬網址後，將自動生成高解析度 QR Code 圖片供您直接下載列印名片！
              </span>
            </div>

            {/* 底部按鈕 */}
            <div className="w-full flex items-center gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 border border-[#2B3049] text-[#2B3049] hover:bg-[#FAF6F0] text-sm font-bold rounded-full transition-all cursor-pointer"
              >
                關閉
              </button>
              <button
                onClick={() =>
                  handleCopy(
                    '🎵 歡迎預約林佩芬老師音樂課程！專業鋼琴與小提琴教學，點擊專屬連結預約：https://test-musimate.vercel.app/teacher/profile',
                    'all'
                  )
                }
                className="flex-1 py-3 bg-[#2B3049] hover:bg-[#1f2335] text-white text-sm font-bold rounded-full transition-all cursor-pointer shadow-xs"
              >
                {copiedKey === 'all' ? '已複製完整文案' : '複製完整推廣文字'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          修改密碼彈窗 (Password Modal)
          ========================================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[480px] bg-white rounded-[28px] shadow-2xl p-7 sm:p-8 flex flex-col gap-5 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#FAF6F0] text-[#C9A259] rounded-full">
                  <KeyRound className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold font-['Noto_Serif_TC',serif] text-[#2B3049]">
                  修改登入密碼
                </h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2B3049]">原密碼</label>
                <input
                  type="password"
                  required
                  placeholder="請輸入目前密碼 (預設: teacher123)"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none focus:border-[#B58EBE]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2B3049]">新密碼</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="至少 6 位英數字元"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none focus:border-[#B58EBE]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2B3049]">確認新密碼</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="再次輸入新密碼"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none focus:border-[#B58EBE]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 border border-[#2B3049] text-[#2B3049] font-bold text-sm rounded-full hover:bg-[#FAF6F0]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2B3049] hover:bg-[#1f2335] text-white font-bold text-sm rounded-full shadow-xs"
                >
                  確認修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          通知設定彈窗 (Notification Modal)
          ========================================================================= */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-7 sm:p-8 flex flex-col gap-5 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[rgba(104,197,171,0.15)] text-[#68C5AB] rounded-full">
                  <Bell className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold font-['Noto_Serif_TC',serif] text-[#2B3049]">
                  推播與郵件通知偏好
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1.5 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[#EFECE6]">
              <label className="py-3 flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#2B3049]">LINE 上課提醒通知</span>
                  <span className="text-xs text-[#7A736E]">開課前 24H 與 2H 自動發送</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.lineLessonReminder}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      lineLessonReminder: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#68C5AB]"
                />
              </label>

              <label className="py-3 flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#2B3049]">學費核銷與催款進度</span>
                  <span className="text-xs text-[#7A736E]">學員繳費或催繳完成時推播</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.linePaymentReminder}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      linePaymentReminder: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#68C5AB]"
                />
              </label>

              <label className="py-3 flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#2B3049]">每週教學進度 Email 週報</span>
                  <span className="text-xs text-[#7A736E]">週日晚間自動寄發至教師信箱</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailWeeklySummary}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailWeeklySummary: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#68C5AB]"
                />
              </label>
            </div>

            <button
              onClick={() => {
                setShowNotificationModal(false);
                showToast('✅ 通知偏好設定已儲存！');
              }}
              className="w-full py-3 bg-[#2B3049] hover:bg-[#1f2335] text-white text-sm font-bold rounded-full transition-all shadow-xs"
            >
              儲存通知設定
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          聯繫系統客服彈窗 (Customer Support Modal)
          ========================================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[480px] bg-white rounded-[28px] shadow-2xl p-7 sm:p-8 flex flex-col gap-5 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[rgba(104,197,171,0.15)] text-[#68C5AB] rounded-full">
                  <Headphones className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold font-['Noto_Serif_TC',serif] text-[#2B3049]">
                  聯繫 MusiMate 系統客服
                </h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1.5 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[#7A736E] text-sm leading-relaxed">
              若在排課、智慧錄音批改、學費對帳上有任何問題，歡迎隨時聯繫客服專員：
            </p>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-[#FAF6F0] rounded-xl flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5 text-[#2B3049]">
                  <Smartphone className="w-4 h-4 text-[#68C5AB]" />
                  <span className="font-bold">官方 LINE 客服：</span>
                  <span>@musimate_service</span>
                </div>
                <button
                  onClick={() => handleCopy('@musimate_service', 'support-line')}
                  className="text-xs text-[#82AAD8] hover:underline font-bold"
                >
                  複製
                </button>
              </div>

              <div className="p-3.5 bg-[#FAF6F0] rounded-xl flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5 text-[#2B3049]">
                  <Mail className="w-4 h-4 text-[#68C5AB]" />
                  <span className="font-bold">技術支援信箱：</span>
                  <span>support@musimate.edu</span>
                </div>
                <button
                  onClick={() => handleCopy('support@musimate.edu', 'support-email')}
                  className="text-xs text-[#82AAD8] hover:underline font-bold"
                >
                  複製
                </button>
              </div>

              <div className="p-3.5 bg-[#FAF6F0] rounded-xl flex items-center gap-2.5 text-sm text-[#2B3049]">
                <ShieldCheck className="w-4 h-4 text-[#68C5AB]" />
                <span className="font-bold">服務時間：</span>
                <span className="text-[#7A736E]">週一至週日 09:00 - 21:00</span>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 border border-[#2B3049] text-[#2B3049] hover:bg-[#FAF6F0] font-bold text-sm rounded-full transition-all"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* 頁尾 (Footer) */}
      <footer className="w-full border-t border-[#F0EAE1] bg-[#FAF6F0] mt-auto relative z-10">
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
