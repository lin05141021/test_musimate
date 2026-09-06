'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

interface TeacherNavbarProps {
  activeTab?: 'schedule' | 'summary' | 'students' | 'billing' | 'profile';
  teacherName?: string;
  teacherAvatar?: string;
  unreadCount?: number;
}

export const TeacherNavbar: React.FC<TeacherNavbarProps> = ({
  activeTab,
  teacherName = '林佩芬 老師',
  teacherAvatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  unreadCount: initialUnreadCount = 3,
}) => {
  const pathname = usePathname() || '';
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 點擊外部關閉通知下拉選單
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 判斷當前 active 標籤
  const currentActive =
    activeTab ||
    (pathname.includes('/teacher/schedule')
      ? 'schedule'
      : pathname.includes('/teacher/recorder') || pathname.includes('/teacher/summary')
      ? 'summary'
      : pathname.includes('/teacher/students')
      ? 'students'
      : pathname.includes('/teacher/billing')
      ? 'billing'
      : pathname.includes('/teacher/profile')
      ? 'profile'
      : 'schedule');

  const navItems = [
    { id: 'schedule', label: '我的課表', href: '/teacher/schedule' },
    { id: 'summary', label: '智慧聯絡簿', href: '/teacher/recorder' },
    { id: 'students', label: '學生管理', href: '/teacher/students' },
    { id: 'billing', label: '薪資看板', href: '/teacher/billing' },
    { id: 'profile', label: '個人介紹', href: '/teacher/profile' },
  ];

  const notifications = [
    {
      id: 'notif-1',
      type: 'billing',
      title: '學費逾期催繳提醒',
      desc: '陳小明 (週二鋼琴初級 8堂) 逾期 3 天未繳費，建議發送 LINE 催繳通知。',
      time: '10 分鐘前',
      link: '/teacher/billing',
      badgeColor: 'bg-[#D98C8C]/15 text-[#D98C8C]',
    },
    {
      id: 'notif-2',
      type: 'leave',
      title: '保留時數即將到期',
      desc: '林志玲 的 1 堂保留時數將於 7 天內到期 (2026/09/30 截止)。',
      time: '1 小時前',
      link: '/teacher/billing',
      badgeColor: 'bg-[#CEAB98]/20 text-[#8C6D53]',
    },
    {
      id: 'notif-3',
      type: 'homework',
      title: '待批改課堂錄音',
      desc: '許雅婷 昨日 20:30 上傳了哈農練習曲錄音待老師批閱。',
      time: '2 小時前',
      link: '/teacher/students',
      badgeColor: 'bg-[#82AAD8]/20 text-[#3B6899]',
    },
  ];

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="w-full bg-[#FAF6F0] bg-[url('/water_color.png')] bg-cover bg-center border-b border-[#F0EAE1] sticky top-0 z-40">
      <div className="max-w-[1440px] h-[88px] mx-auto px-6 sm:px-12 lg:px-[80px] flex items-center justify-between">
        {/* 左側：品牌 Logo (184x40) */}
        <Link href="/teacher/schedule" className="flex items-center shrink-0">
          <div className="h-[40px] px-4 rounded-full bg-white/70 backdrop-blur-xs border border-[#F0EAE1] flex items-center gap-2 shadow-xs hover:bg-white transition-all">
            <span className="w-6 h-6 rounded-full bg-[#2B3049] text-white flex items-center justify-center text-xs font-bold font-serif">
              M
            </span>
            <span className="font-['Noto_Sans_TC',sans-serif] font-bold text-base text-[#2B3049] tracking-tight">
              MusiMate
            </span>
            <span className="text-[10px] font-bold text-[#8A5899] bg-[#FAF4FB] px-2 py-0.5 rounded-full border border-[#E8D7EE]">
              教師端
            </span>
          </div>
        </Link>

        {/* 中間：5 大核心導航標籤 (gap: 40px, font: Noto Sans TC, 15px, 500) */}
        <nav className="hidden md:flex items-center gap-[40px]">
          {navItems.map((item) => {
            const isActive = currentActive === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                data-property-1={isActive ? 'active' : 'defult'}
                className={`px-3 py-2 rounded-full font-['Noto_Sans_TC',sans-serif] text-[15px] transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-white/80 font-bold text-[#2B3049] shadow-xs backdrop-blur-xs'
                    : 'bg-transparent hover:bg-white/40 font-medium text-[#2B3049]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 右側：通知鈴鐺 + 64px 教師大頭貼 */}
        <div className="flex items-center gap-3 shrink-0 relative" ref={dropdownRef}>
          {/* 通知鈴鐺按鈕 (點擊展開通知面板) */}
          <button
            type="button"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            title="通知中心"
            className="w-10 h-10 relative bg-white/60 hover:bg-white border border-[#F0EAE1] rounded-full flex items-center justify-center text-[#2B3049] transition-all shadow-xs cursor-pointer"
          >
            <Bell className="w-5 h-5 text-[#2B3049]" />
            {unreadCount > 0 && (
              <div className="px-1.5 py-0.5 absolute -top-0.5 -right-1 bg-[#D98C8C] rounded-full flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-['Noto_Sans_TC',sans-serif] font-bold leading-none">
                  {unreadCount}
                </span>
              </div>
            )}
          </button>

          {/* 教師頭像 (64x64) -> 會員中心 */}
          <Link
            href="/teacher/account"
            title={`${teacherName} (會員中心 / 帳戶設定)`}
            className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] rounded-full ring-2 ring-[#FAF6F0] ring-offset-1 shadow-xs overflow-hidden flex items-center justify-center bg-[#CEAB98] hover:scale-105 transition-transform shrink-0"
          >
            <img
              src={teacherAvatar}
              alt={teacherName}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>

          {/* 通知快顯視窗 (Notification Dropdown) */}
          {showNotificationDropdown && (
            <div className="absolute right-0 top-14 w-[360px] sm:w-[400px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-4 flex flex-col gap-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2B3049]">即時通知中心</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-[#FAF0EC] text-[#D98C8C] text-xs font-bold rounded-full">
                      {unreadCount} 則未讀
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#82AAD8] hover:underline font-medium cursor-pointer"
                  >
                    全部標為已讀
                  </button>
                )}
              </div>

              {/* 通知項目清單 */}
              <div className="flex flex-col divide-y divide-[#FAF6F0] max-h-[320px] overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setShowNotificationDropdown(false)}
                    className="py-3 px-2 rounded-xl hover:bg-[#FAF6F0] transition-colors flex flex-col gap-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2B3049]">{n.title}</span>
                      <span className="text-[11px] text-[#8C90A4]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#6F6F6F] leading-relaxed line-clamp-2">
                      {n.desc}
                    </p>
                  </Link>
                ))}
              </div>

              {/* 底部功能鏈結 */}
              <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between">
                <Link
                  href="/admin/notifications"
                  onClick={() => setShowNotificationDropdown(false)}
                  className="text-xs text-[#8A5899] hover:underline font-bold"
                >
                  前往 LINE 推播控制台 ➔
                </Link>
                <Link
                  href="/teacher/billing"
                  onClick={() => setShowNotificationDropdown(false)}
                  className="text-xs text-[#82AAD8] hover:underline font-bold"
                >
                  查看薪資看板 ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TeacherNavbar;
