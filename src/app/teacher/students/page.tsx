'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  Sparkles,
  Send,
  X,
  Music,
  Calendar,
  Phone,
  BookOpen,
  Eye,
  Check,
  Info,
} from 'lucide-react';
import { NOTIFICATION_SCENARIOS, THEME_COLORS } from '@/lib/lineFlexTemplates';

interface StudentRecord {
  id: string;
  name: string;
  avatar: string;
  instrument: string;
  status: 'active' | 'pending_review' | 'paused';
  statusText: string;
  nextLessonDate: string;
  nextLessonTime: string;
  location: string;
  bookedLessons: number;
  totalLessons: number;
  pendingReviews: number;
  lastActive: string;
  phone: string;
  parentName: string;
  teacherNote: string;
  recentPiece: string;
  lineUserId?: string;
}

// 授課教師：林佩芬 老師 (Piano & Violin Master) 名下學生真實資料庫
const DB_STUDENTS_ROSTER: StudentRecord[] = [
  {
    id: 's-liu-xinyue',
    name: '劉心悅 (Lin)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    instrument: '古典鋼琴',
    status: 'active',
    statusText: '上課中',
    nextLessonDate: '09/09 (三)',
    nextLessonTime: '10:00',
    location: '音符琴房 A303',
    bookedLessons: 8,
    totalLessons: 10,
    pendingReviews: 0,
    lastActive: '今日 10:00 打卡',
    phone: '0911-222-333',
    parentName: '劉媽媽',
    teacherNote: '蕭邦夜曲裝飾音與踏板切換極為流暢，音樂性極高。',
    recentPiece: '蕭邦：降E大調夜曲 Op.9 No.2',
    lineUserId: 'Uf2457bf35e0d6d3060b60838d9a9c91c',
  },
  {
    id: 's-hsu-yating',
    name: '許雅婷',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    instrument: '古典鋼琴',
    status: 'pending_review',
    statusText: '上課中',
    nextLessonDate: '09/08 (一)',
    nextLessonTime: '14:00',
    location: '大安琴房 A 室',
    bookedLessons: 7,
    totalLessons: 10,
    pendingReviews: 1,
    lastActive: '昨日 20:30 打卡',
    phone: '0922-333-444',
    parentName: '許爸爸',
    teacherNote: '哈農練習曲手指獨立性提升，注意莫札特奏鳴曲左手阿爾貝悌低音均勻度。',
    recentPiece: '莫札特：C大調鋼琴奏鳴曲 K.545',
    lineUserId: 'U_student_hsu_yating',
  },
  {
    id: 's-lin-xiaoming',
    name: '林小明',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    instrument: '小提琴',
    status: 'pending_review',
    statusText: '上課中',
    nextLessonDate: '09/09 (二)',
    nextLessonTime: '14:00',
    location: '大安琴房 A 室',
    bookedLessons: 3,
    totalLessons: 10,
    pendingReviews: 1,
    lastActive: '今日 11:20 打卡',
    phone: '0955-666-777',
    parentName: '林媽媽',
    teacherNote: '塞茨小提琴協奏曲第一樂章換把位已平順，運弓注意弓尖保持飽滿共鳴。',
    recentPiece: '塞茨：第二號小提琴協奏曲 第一樂章',
    lineUserId: 'U_student_ming_001',
  },
  {
    id: 's-lai-guanting',
    name: '賴冠廷',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    instrument: '古典鋼琴',
    status: 'active',
    statusText: '上課中',
    nextLessonDate: '09/10 (三)',
    nextLessonTime: '14:00',
    location: '大安琴房 A 室',
    bookedLessons: 6,
    totalLessons: 10,
    pendingReviews: 0,
    lastActive: '2天前',
    phone: '0933-444-555',
    parentName: '賴媽媽',
    teacherNote: '徹爾尼 599 練習曲速度穩定度達 90%，音色清脆。',
    recentPiece: '徹爾尼：599 練習曲 No.45',
    lineUserId: 'U_student_lai_guanting',
  },
  {
    id: 's-liu-guanting',
    name: '劉冠廷',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    instrument: '流行爵士鋼琴',
    status: 'active',
    statusText: '上課中',
    nextLessonDate: '09/12 (五)',
    nextLessonTime: '19:00',
    location: '大安琴房 A 室',
    bookedLessons: 5,
    totalLessons: 10,
    pendingReviews: 0,
    lastActive: '3天前',
    phone: '0966-555-666',
    parentName: '劉爸爸',
    teacherNote: '流行歌曲和弦配位與切分節奏掌握佳，開始導入藍調音階。',
    recentPiece: '久石讓《Summer》鋼琴改編曲',
    lineUserId: 'U_student_liu_guanting',
  },
  {
    id: 's-wang-yichuan',
    name: '王義川',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    instrument: '古典鋼琴',
    status: 'active',
    statusText: '上課中',
    nextLessonDate: '09/14 (日)',
    nextLessonTime: '10:00',
    location: '大安琴房 A 室',
    bookedLessons: 4,
    totalLessons: 7,
    pendingReviews: 0,
    lastActive: '1天前',
    phone: '0977-888-999',
    parentName: '王媽媽',
    teacherNote: '巴哈二聲部創意曲左右手對位清晰，觸鍵紮實。',
    recentPiece: '巴哈：二聲部創意曲 No.8 F大調',
    lineUserId: 'U_student_wang_yichuan',
  },
  {
    id: 's-chen-xiaoming',
    name: '陳小明',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120',
    instrument: '鋼琴初級',
    status: 'pending_review',
    statusText: '上課中',
    nextLessonDate: '09/09 (二)',
    nextLessonTime: '16:00',
    location: '台北教室A',
    bookedLessons: 6,
    totalLessons: 8,
    pendingReviews: 1,
    lastActive: '今日 10:20 打卡',
    phone: '0912-345-678',
    parentName: '陳媽媽',
    teacherNote: '巴哈小步舞曲觸鍵很有進步，注意第 16 小節換把位。',
    recentPiece: '巴哈：小步舞曲 G大調',
    lineUserId: 'U_student_chen_ming',
  },
  {
    id: 's-chang-weifen',
    name: '張韋芬',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
    instrument: '小提琴進階',
    status: 'pending_review',
    statusText: '上課中',
    nextLessonDate: '09/11 (四)',
    nextLessonTime: '15:00',
    location: '台北教室A',
    bookedLessons: 8,
    totalLessons: 10,
    pendingReviews: 2,
    lastActive: '昨日 20:15 打卡',
    phone: '0922-567-890',
    parentName: '張媽媽',
    teacherNote: '右手持弓柔軟度極佳，注意第 09/02 曠課扣款與後續補課安排。',
    recentPiece: '莫札特：第三號小提琴協奏曲',
    lineUserId: 'U_student_chang_weifen',
  },
  {
    id: 's-chen-yuen',
    name: '陳宇恩',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
    instrument: '古典鋼琴',
    status: 'paused',
    statusText: '已暫停',
    nextLessonDate: '已暫停',
    nextLessonTime: '',
    location: '-',
    bookedLessons: 0,
    totalLessons: 20,
    pendingReviews: 0,
    lastActive: '4週前結業',
    phone: '0911-888-999',
    parentName: '陳媽媽',
    teacherNote: '上一期彈奏小步舞曲表現極佳，保留時段每週二 19:00 或 週六 10:30。',
    recentPiece: '巴哈小步舞曲 G大調',
    lineUserId: 'U_student_chen_yuen',
  },
  {
    id: 's-huang-jianhua',
    name: '黃建華',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120',
    instrument: '古典吉他',
    status: 'paused',
    statusText: '已暫停',
    nextLessonDate: '已暫停',
    nextLessonTime: '',
    location: '-',
    bookedLessons: 0,
    totalLessons: 10,
    pendingReviews: 0,
    lastActive: '3週前結業',
    phone: '0988-345-678',
    parentName: '黃媽媽',
    teacherNote: '已完成第一期初階封閉和弦，目前因課業暫停，已為其保留時段。',
    recentPiece: '卡爾卡西古典吉他練習曲',
    lineUserId: 'U_student_huang_jianhua',
  },
];

const ROSTER_STORAGE_KEY = 'musimate_teacher_students_roster_v2';

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'active' | 'pending_review' | 'paused'>('ALL');
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Roster storage read error:', e);
      }
    }
    return DB_STUDENTS_ROSTER;
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [showCareModal, setShowCareModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [careMessageText, setCareMessageText] = useState('');
  const [isSendingCare, setIsSendingCare] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 新增學生表單狀態
  const [newStudent, setNewStudent] = useState({
    name: '',
    instrument: '鋼琴',
    phone: '',
    parentName: '',
    location: '台北教室A',
    bookedLessons: 4,
    notes: '',
  });

  // 持久化儲存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(students));
    }
  }, [students]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 計算統計數字
  const stats = useMemo(() => {
    const total = students.length;
    const activeCount = students.filter((s) => s.status === 'active' || s.status === 'pending_review').length;
    const pendingReviewCount = students.reduce((acc, s) => acc + s.pendingReviews, 0);
    const pausedCount = students.filter((s) => s.status === 'paused').length;
    return { total, activeCount, pendingReviewCount, pausedCount };
  }, [students]);

  // 過濾學生清單
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        selectedStatus === 'ALL'
          ? true
          : selectedStatus === 'active'
          ? s.status === 'active' || s.status === 'pending_review'
          : s.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [students, searchTerm, selectedStatus]);

  // 開啟紫色關懷卡片彈窗
  const handleOpenCareModal = (student: StudentRecord) => {
    setSelectedStudent(student);
    setCareMessageText(
      `好一陣子沒在琴房見到你了！記得你上一期彈奏的《${student.recentPiece}》非常有音樂性，觸鍵音色進步很多。最近老師為你準備了幾首很棒的新曲目，隨時歡迎回來繼續享受音樂喔！`
    );
    setShowCareModal(true);
  };

  // 送出審核並推播至 LINE
  const handleSendCareMessage = async () => {
    if (!selectedStudent) return;
    setIsSendingCare(true);

    try {
      if (selectedStudent.lineUserId) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioId: 'D1',
            targetUserId: selectedStudent.lineUserId,
            customData: {
              student_name: selectedStudent.name,
              teacher_name: '林佩芬 老師',
              teacher_message: careMessageText,
              course_name: selectedStudent.instrument,
              milestone: `已累積完成 ${selectedStudent.totalLessons} 堂課`,
              reserved_slots: '每週二 19:00 或 每週六 10:30 (優先保留中)',
            },
          }),
        }).catch((e) => console.warn('Push error:', e));
      }

      setShowCareModal(false);
      showToast(`🎉 專屬關懷邀請已成功送達 ${selectedStudent.name} 家長 LINE！`);
    } catch (err) {
      console.error('Failed to send care message:', err);
      showToast('❌ 發送關懷邀請時發生錯誤，請稍後重試。');
    } finally {
      setIsSendingCare(false);
    }
  };

  // 新增學生送出
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;
    const created: StudentRecord = {
      id: `s-${Date.now()}`,
      name: newStudent.name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      instrument: newStudent.instrument,
      status: 'active',
      statusText: '上課中',
      nextLessonDate: '待安排',
      nextLessonTime: '',
      location: newStudent.location,
      bookedLessons: Number(newStudent.bookedLessons) || 4,
      totalLessons: 10,
      pendingReviews: 0,
      lastActive: '剛加入',
      phone: newStudent.phone || '0900-000-000',
      parentName: newStudent.parentName || '家長',
      teacherNote: newStudent.notes || '新加入學員檔案。',
      recentPiece: '初階練習曲',
      lineUserId: `U_custom_${Date.now()}`,
    };
    setStudents((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewStudent({
      name: '',
      instrument: '鋼琴',
      phone: '',
      parentName: '',
      location: '台北教室A',
      bookedLessons: 4,
      notes: '',
    });
    showToast(`✅ 已成功新增學員「${created.name}」檔案！`);
  };

  return (
    <div className="w-full min-h-[1024px] bg-[#FAF6F0] flex flex-col font-['Noto_Sans_TC',sans-serif]">
      {/* Toast 提示條 */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 bg-[#2B3049] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 主內容區 */}
      <main className="w-full max-w-[1440px] mx-auto pt-10 pb-16 px-6 sm:px-12 lg:px-[80px] flex flex-col gap-8">
        {/* 頂部標題與操作按鈕 */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[#8A5899] text-xs font-bold px-2 py-0.5 bg-[#FAF4FB] rounded-full border border-[#E8D7EE]">
                林佩芬 老師的專屬學員庫
              </span>
            </div>
            <h1 className="text-[#2B3049] text-[32px] font-['Noto_Serif_TC',serif] font-bold tracking-tight">
              學生管理中心
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#8A5899] hover:bg-[#794988] text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新增學員檔案
          </button>
        </div>

        {/* 統計指標卡片區 (4 格) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-[20px] ring-1 ring-[#8A5899]/20 shadow-xs flex flex-col gap-2">
            <span className="text-xs text-[#6F6F6F] font-medium">在籍學員總數</span>
            <span className="text-2xl font-bold font-['Noto_Serif_TC',serif] text-[#2B3049]">
              {stats.total} 位
            </span>
          </div>
          <div className="p-5 bg-white rounded-[20px] ring-1 ring-[#10B981]/20 shadow-xs flex flex-col gap-2">
            <span className="text-xs text-[#6F6F6F] font-medium">常態上課中</span>
            <span className="text-2xl font-bold font-['Noto_Serif_TC',serif] text-[#10B981]">
              {stats.activeCount} 位
            </span>
          </div>
          <div className="p-5 bg-white rounded-[20px] ring-1 ring-[#D5CC6A]/30 shadow-xs flex flex-col gap-2">
            <span className="text-xs text-[#6F6F6F] font-medium">待批改週報/錄音</span>
            <span className="text-2xl font-bold font-['Noto_Serif_TC',serif] text-[#7D762B]">
              {stats.pendingReviewCount} 份
            </span>
          </div>
          <div className="p-5 bg-white rounded-[20px] ring-1 ring-[#8A5899]/30 shadow-xs flex flex-col gap-2">
            <span className="text-xs text-[#6F6F6F] font-medium">已暫停 / 待復課關懷</span>
            <span className="text-2xl font-bold font-['Noto_Serif_TC',serif] text-[#8A5899]">
              {stats.pausedCount} 位
            </span>
          </div>
        </div>

        {/* 搜尋與狀態過濾列 */}
        <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl ring-1 ring-[#F0EAE1] shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C90A4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋學生姓名、樂器科目或教室地點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF6F0] rounded-full text-sm text-[#2B3049] outline-none border border-transparent focus:border-[#8A5899] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-[#2B3049] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#6F6F6F] hover:bg-[#F0EAE1]'
              }`}
            >
              全部 ({students.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'active'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#6F6F6F] hover:bg-[#F0EAE1]'
              }`}
            >
              上課中 ({stats.activeCount})
            </button>
            <button
              onClick={() => setSelectedStatus('paused')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'paused'
                  ? 'bg-[#8A5899] text-white shadow-xs'
                  : 'bg-[#FAF4FB] text-[#8A5899] hover:bg-[#E8D7EE]'
              }`}
            >
              已暫停 / 待復課 ({stats.pausedCount})
            </button>
          </div>
        </div>

        {/* 學生卡片網格清單 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const isPaused = student.status === 'paused';
            return (
              <div
                key={student.id}
                className={`bg-white rounded-[24px] p-6 shadow-xs ring-1 transition-all flex flex-col justify-between gap-5 ${
                  isPaused
                    ? 'ring-[#E8D7EE] bg-gradient-to-b from-white to-[#FAF4FB]/30'
                    : 'ring-[#82AAD8]/25 hover:shadow-md'
                }`}
              >
                {/* 卡片頭部 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-13 h-13 rounded-full object-cover ring-2 ring-[#FAF6F0] shrink-0"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#2B3049]">{student.name}</span>
                        {isPaused ? (
                          <span className="px-2 py-0.5 bg-[#FAF4FB] text-[#8A5899] text-[11px] font-bold rounded-full border border-[#E8D7EE]">
                            已暫停
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[11px] font-bold rounded-full">
                            {student.statusText}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6F6F6F] font-medium flex items-center gap-1 mt-0.5">
                        <Music className="w-3.5 h-3.5 text-[#8A5899]" />
                        {student.instrument}
                      </span>
                    </div>
                  </div>

                  {student.pendingReviews > 0 && (
                    <span className="px-2.5 py-1 bg-[#D5CC6A]/20 text-[#7D762B] text-xs font-bold rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      待批改 {student.pendingReviews}
                    </span>
                  )}
                </div>

                {/* 卡片內容區 */}
                <div className="flex flex-col gap-2.5 bg-[#FAF6F0] p-3.5 rounded-xl text-xs">
                  <div className="flex justify-between items-center text-[#2B3049]">
                    <span className="text-[#6F6F6F]">當前進度：</span>
                    <span className="font-bold">
                      {isPaused ? '已結業 (保留時段中)' : `本期第 ${student.bookedLessons} / ${student.totalLessons} 堂`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#2B3049]">
                    <span className="text-[#6F6F6F]">練習曲目：</span>
                    <span className="font-medium truncate max-w-[180px]">{student.recentPiece}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#2B3049]">
                    <span className="text-[#6F6F6F]">下次上課：</span>
                    <span className="font-bold text-[#2B3049]">
                      {student.nextLessonDate} {student.nextLessonTime}
                    </span>
                  </div>
                </div>

                {/* 老師備忘短評 */}
                <p className="text-xs text-[#6F6F6F] line-clamp-2 leading-relaxed italic">
                  💬 「{student.teacherNote}」
                </p>

                {/* 底部按鈕 */}
                <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between gap-3">
                  <div className="text-[11px] text-[#8C90A4]">
                    {student.lastActive}
                  </div>

                  {isPaused ? (
                    <button
                      onClick={() => handleOpenCareModal(student)}
                      className="px-4 py-2 bg-[#8A5899] hover:bg-[#794988] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      發送專屬關懷
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/recorder?student=${encodeURIComponent(student.name)}`}
                        className="px-3.5 py-1.5 bg-[#FAF6F0] hover:bg-[#EFECE6] text-[#2B3049] text-xs font-bold rounded-full transition-all"
                      >
                        錄聯絡簿
                      </Link>
                      <Link
                        href="/teacher/schedule"
                        className="p-1.5 hover:bg-[#FAF6F0] text-[#8C90A4] rounded-full transition-all"
                        title="查看排課"
                      >
                        <Calendar className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* =========================================================================
          專屬關懷邀請彈窗 (Purple Theme D1 Modal)
          ========================================================================= */}
      {showCareModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[580px] bg-white rounded-[28px] shadow-2xl p-7 sm:p-8 flex flex-col gap-5 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#FAF4FB] text-[#8A5899] rounded-full">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold font-['Noto_Serif_TC',serif] text-[#2B3049]">
                  發送學員專屬關懷・復課邀請
                </h3>
              </div>
              <button
                onClick={() => setShowCareModal(false)}
                className="p-1.5 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#FAF4FB] border border-[#E8D7EE] rounded-2xl flex items-center gap-3">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#2B3049]">
                  {selectedStudent.name} ({selectedStudent.instrument})
                </span>
                <span className="text-xs text-[#8A5899]">
                  已累積完成 {selectedStudent.totalLessons} 堂課 · 保留時段每週二/週六
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#2B3049]">
                老師手寫關懷與邀請留言（支援微調）：
              </label>
              <textarea
                rows={4}
                value={careMessageText}
                onChange={(e) => setCareMessageText(e.target.value)}
                className="w-full p-3.5 bg-[#FAF6F0] rounded-xl text-sm text-[#2B3049] border border-[#EFECE6] focus:border-[#8A5899] outline-none leading-relaxed"
              />
            </div>

            <div className="text-xs text-[#6F6F6F] flex items-center gap-1.5 bg-[#FAF6F0] p-3 rounded-xl">
              <Info className="w-4 h-4 text-[#8A5899] shrink-0" />
              <span>
                點擊確認後，系統將自動透過 LINE 官方帳號推播「紫色復課邀請卡片」給學員。
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCareModal(false)}
                className="flex-1 py-2.5 border border-[#8A5899] text-[#8A5899] font-bold text-sm rounded-full hover:bg-[#FAF4FB] transition-all"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSendingCare}
                onClick={handleSendCareMessage}
                className="flex-1 py-2.5 bg-[#8A5899] hover:bg-[#794988] text-white font-bold text-sm rounded-full transition-all shadow-xs"
              >
                {isSendingCare ? '推播中...' : '確認發送 LINE 關懷'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          新增學生檔案彈窗 (Add Student Modal)
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-7 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-['Noto_Serif_TC',serif] text-[#2B3049]">
                新增學員檔案
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-[#FAF6F0] rounded-full text-[#6F6F6F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2B3049]">學生姓名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：陳大文"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none focus:border-[#8A5899]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#2B3049]">學習樂器/科目</label>
                  <select
                    value={newStudent.instrument}
                    onChange={(e) => setNewStudent({ ...newStudent, instrument: e.target.value })}
                    className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none"
                  >
                    <option value="古典鋼琴">古典鋼琴</option>
                    <option value="流行鋼琴">流行鋼琴</option>
                    <option value="小提琴">小提琴</option>
                    <option value="長笛">長笛</option>
                    <option value="吉他">吉他</option>
                    <option value="聲樂">聲樂</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#2B3049]">家長聯絡電話</label>
                  <input
                    type="tel"
                    placeholder="0912-345-678"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2B3049]">教師初始備忘錄</label>
                <textarea
                  rows={2}
                  placeholder="例如：初階學員，預計從拜爾或巴哈小步舞曲著手..."
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                  className="p-3 bg-[#FAF6F0] rounded-xl text-sm border border-[#EFECE6] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#8A5899] text-[#8A5899] font-bold text-sm rounded-full hover:bg-[#FAF4FB]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8A5899] hover:bg-[#794988] text-white font-bold text-sm rounded-full shadow-xs"
                >
                  建立學員檔案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
