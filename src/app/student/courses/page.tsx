'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X, ChevronDown, Check, Sparkles, Music, Youtube, Instagram, Share2 } from 'lucide-react';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';
import { useStudentToast } from '@/context/ToastContext';

// 8 大樂器資料
interface InstrumentItem {
  id: string;
  name: string;
  enName: string;
  accentColor: string;
  bgTint: string;
  iconSvg: React.ReactNode;
}

const INSTRUMENTS: InstrumentItem[] = [
  {
    id: 'guitar',
    name: '吉他',
    enName: 'GUITAR',
    accentColor: '#E58C4D',
    bgTint: 'rgba(229, 140, 77, 0.08)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E58C4D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.9 12.1a3 3 0 1 0-4.2-4.2l-5.6 5.6a4.5 4.5 0 0 0 6.4 6.4l5.6-5.6a3 3 0 0 0-2.2-2.2z" />
        <path d="m15.5 8.5 5.5-5.5" />
        <path d="m18 6 3 3" />
        <circle cx="8" cy="16" r="1.5" fill="#E58C4D" />
      </svg>
    ),
  },
  {
    id: 'saxophone',
    name: '薩克斯風',
    enName: 'SAXOPHONE',
    accentColor: '#4DADB8',
    bgTint: 'rgba(77, 173, 184, 0.10)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4DADB8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h4v4H6z" />
        <path d="M10 5h6a3 3 0 0 1 3 3v6a5 5 0 0 1-10 0V9" />
        <circle cx="9" cy="17" r="3" fill="rgba(77, 173, 184, 0.2)" />
        <path d="M12 9h4" />
        <path d="M12 12h4" />
      </svg>
    ),
  },
  {
    id: 'drums',
    name: '爵士鼓',
    enName: 'DRUMS',
    accentColor: '#D9668C',
    bgTint: 'rgba(217, 102, 140, 0.10)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D9668C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="7" rx="8" ry="3.5" />
        <path d="M4 7v6c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5V7" />
        <path d="m5 18 3 4" />
        <path d="m19 18-3 4" />
        <circle cx="12" cy="7" r="1.5" fill="#D9668C" />
      </svg>
    ),
  },
  {
    id: 'violin',
    name: '小提琴',
    enName: 'VIOLIN',
    accentColor: '#8C73C7',
    bgTint: 'rgba(140, 115, 199, 0.08)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8C73C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <path d="M8 8c0-2.5 1.8-4 4-4s4 1.5 4 4c0 3-3 4-3 7 0 2 1.5 3 3 3" />
        <path d="M8 8c0 3 3 4 3 7 0 2-1.5 3-3 3" />
        <circle cx="12" cy="12" r="1.5" fill="#8C73C7" />
      </svg>
    ),
  },
  {
    id: 'piano',
    name: '鋼琴',
    enName: 'PIANO',
    accentColor: '#D9668C',
    bgTint: 'rgba(217, 102, 140, 0.10)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D9668C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 5v8" />
        <path d="M11 5v8" />
        <path d="M15 5v8" />
        <path d="M9 5v5" strokeWidth="2.5" />
        <path d="M13 5v5" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'electric_guitar',
    name: '電吉他',
    enName: 'E-GUITAR',
    accentColor: '#4DADB8',
    bgTint: 'rgba(77, 173, 184, 0.10)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4DADB8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14 7 3-3 4 4-3 3" />
        <path d="M14 7 6.5 14.5a3.5 3.5 0 1 0 4 4L18 11" />
        <circle cx="7.5" cy="17.5" r="1" fill="#4DADB8" />
      </svg>
    ),
  },
  {
    id: 'viola',
    name: '中提琴',
    enName: 'VIOLA',
    accentColor: '#8C73C7',
    bgTint: 'rgba(140, 115, 199, 0.08)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8C73C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="13" rx="6" ry="7" />
        <path d="M12 2v4" />
        <path d="M10 6h4" />
        <circle cx="12" cy="13" r="1.5" fill="#8C73C7" />
      </svg>
    ),
  },
  {
    id: 'trumpet',
    name: '小號',
    enName: 'TRUMPET',
    accentColor: '#E58C4D',
    bgTint: 'rgba(229, 140, 77, 0.08)',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E58C4D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 13h13l4 3V8l-4 3H2z" />
        <path d="M6 10v4" />
        <path d="M9 10v4" />
        <path d="M12 10v4" />
      </svg>
    ),
  },
];

// 5 位精選鋼琴導師資料
interface TeacherItem {
  id: string;
  name: string;
  tag: string;
  tags: string[];
  avatar: string;
  shortBio: string;
  fullBio: string;
  accentColor: string;
}

const PIANO_TEACHERS: TeacherItem[] = [
  {
    id: 't-chang',
    name: '張芷嫣',
    tag: '伴奏鋼琴',
    tags: ['伴奏鋼琴', '音樂理論教學', '室內樂鋼琴'],
    avatar: '/UI/teacher_avatar.png',
    shortBio: '國內多所音樂廳特約首席伴奏，合奏經驗無數。深入剖析聲部對位與情感流動，引導學員體驗最動人的合奏藝術。',
    fullBio: '國立師大音樂系碩士，主修鋼琴，副修豎笛。\n音樂教學資歷 10 年，培養超過 30 位學生錄取音樂專班。\n\n曾擔任國內多所音樂廳特約首席伴奏，合奏經驗無數。擅長深入剖析聲部對位與情感流動，引導學員體驗最動人的合奏藝術。',
    accentColor: '#B58EBE',
  },
  {
    id: 't-lin',
    name: '林雅琴',
    tag: '鋼琴',
    tags: ['古典鋼琴', '德奧樂派詮釋', '大師班指導'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    shortBio: '國立維也納音樂大學碩士，曾任多場交響樂團客座獨奏家。擅長因材施教，結合歐式嚴謹技巧與德奧音樂美學詮釋，專注於古典鋼琴演奏與音樂詮釋。',
    fullBio: '國立維也納音樂大學碩士，曾任多場交響樂團客座獨奏家。\n音樂教學資歷 8 年，指導多位學生在國內外鋼琴大賽拔得頭籌。\n\n擅長因材施教，結合歐式嚴謹技巧與德奧音樂美學詮釋，專注於古典鋼琴演奏與音樂詮釋。',
    accentColor: '#B58EBE',
  },
  {
    id: 't-huang',
    name: '黃冠霖',
    tag: '鋼琴 / 爵士',
    tags: ['流行鋼琴', '爵士和弦', '節奏律動'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    shortBio: '知名樂團御用鼓手，後轉向流行與爵士鋼琴演奏。善於將節奏感與打擊元素融入鍵盤，教導學生如何在流行與爵士鋼琴中掌握更強的節奏與和弦變化。',
    fullBio: '知名樂團御用鼓手與鍵盤手，深入研究當代流行與爵士樂。\n教學資歷 7 年，擅長將節奏律動化為直覺反應。\n\n善於將節奏感與打擊元素融入鍵盤，教導學生如何在流行與爵士鋼琴中掌握更強的節奏與和弦變化。',
    accentColor: '#B58EBE',
  },
  {
    id: 't-chen',
    name: '陳柏翰',
    tag: '爵士鋼琴',
    tags: ['即興演奏', '現代和聲', '流行彈唱'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    shortBio: '柏克理音樂學院畢業，專精於現代即興演奏與和聲重組。教學風格活潑，引導學生在黑白鍵上自由探索旋律。',
    fullBio: '美國柏克理音樂學院 (Berklee) 爵士鋼琴碩士。\n曾與多位知名流行歌手合作巡演與專輯編曲。\n\n專精於現代即興演奏與和聲重組。教學風格活潑，引導學生在黑白鍵上自由探索旋律。',
    accentColor: '#B58EBE',
  },
  {
    id: 't-chang2',
    name: '張曉雯',
    tag: '兒童鋼琴',
    tags: ['啟蒙教育', '律動遊戲', '奧福教學法'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    shortBio: '具10年兒童音樂教育與心理學背景。獨創「律動遊戲教學法」，讓孩子在無壓力的歡樂氛圍中奠定完美基礎。',
    fullBio: '國立臺北藝術大學音樂教育碩士，獲國際奧福與達克羅士律動師資認證。\n具 10 年兒童音樂教育與心理學背景。\n\n獨創「律動遊戲教學法」，讓孩子在無壓力的歡樂氛圍中奠定完美基礎。',
    accentColor: '#B58EBE',
  },
];

const TIME_SLOTS = [
  '08/27 (四) 14:00-14:30',
  '08/28 (五) 10:00-10:30',
  '08/29 (六) 15:30-16:00',
  '08/30 (日) 11:00-11:30',
];

export default function CoursesPage() {
  const router = useRouter();
  const { showToast } = useStudentToast();

  // 狀態管理：目前流程步驟
  const [step, setStep] = useState<'instruments' | 'teachers' | 'teacher_detail'>('instruments');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentItem>(
    INSTRUMENTS.find((i) => i.id === 'piano') || INSTRUMENTS[4]
  );
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem>(PIANO_TEACHERS[0]);

  // 預約試上彈窗控制
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<{
    bookingId: string;
    message: string;
    details: any;
  } | null>(null);

  // 更多功能抽屜開關
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  // 處理點擊樂器 -> 進入選老師
  const handleSelectInstrument = (inst: InstrumentItem) => {
    setSelectedInstrument(inst);
    setStep('teachers');
  };

  // 處理點擊「查看個人頁面」 -> 進入看介紹
  const handleViewTeacherDetail = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher);
    setStep('teacher_detail');
  };

  // 處理點擊「預約試上課程」 -> 開啟彈窗
  const handleOpenBookingModal = (teacher?: TeacherItem) => {
    if (teacher) {
      setSelectedTeacher(teacher);
    }
    setIsBookingModalOpen(true);
  };

  // 送出預約
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/courses/trial-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: '劉心悅',
          teacher_name: selectedTeacher.name,
          instrument: selectedInstrument.name,
          time_slot: selectedTimeSlot,
          phone: '0912-345-678',
          notes: '透過 LINE LIFF 預約新生免費試上課程',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsBookingModalOpen(false);
        showToast('試上預約成功！已加入課表');
        setBookingSuccessModal({
          bookingId: data.booking_id,
          message: data.message,
          details: data.details,
        });
      } else {
        alert(data.error || '預約失敗，請稍後再試');
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setIsBookingModalOpen(false);
      showToast('試上預約成功！已加入課表');
      setBookingSuccessModal({
        bookingId: `TB-${Date.now().toString(36).toUpperCase()}`,
        message: `已成功預約 ${selectedTeacher.name} 老師的【${selectedInstrument.name}】免費試上課程！`,
        details: {
          teacher_name: selectedTeacher.name,
          instrument: selectedInstrument.name,
          time_slot: selectedTimeSlot,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] flex items-center justify-center p-0 sm:p-4 font-['Sora',sans-serif]">
      {/* 手機外框容器 (Google Pixel 9a: 360px 寬，可捲動) */}
      <div className="w-[360px] h-[800px] max-w-full max-h-[100dvh] sm:max-h-[820px] bg-[#FAF6F0] rounded-[40px] shadow-[0px_12px_24px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col relative border border-[#F0EAE1]">
        
        {/* ============================================================ */}
        {/* 頂部 Header 列 (高 64px，左 Logo，返回按鈕若非第一步) */}
        {/* ============================================================ */}
        <header className="h-[64px] shrink-0 px-5 border-b border-[#F0EAE1] bg-[#FAF6F0] flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            {step !== 'instruments' && (
              <button
                type="button"
                onClick={() => {
                  if (step === 'teacher_detail') {
                    setStep('teachers');
                  } else if (step === 'teachers') {
                    setStep('instruments');
                  }
                }}
                className="w-8 h-8 rounded-full bg-white/80 border border-[#F0EAE1] flex items-center justify-center text-[#2C2A29] hover:bg-white active:scale-95 transition-all shadow-xs cursor-pointer mr-1"
                title="返回上一頁"
              >
                <ChevronLeft className="w-5 h-5 text-[#2B3049]" />
              </button>
            )}
            <div className="w-[140px] h-[36px] relative cursor-pointer" onClick={() => setStep('instruments')}>
              <Image
                src="/UI/logo.png"
                alt="MusiMate"
                fill
                className="object-contain object-left"
                priority
                onError={(e: any) => {
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'teacher_detail' && (
              <button
                type="button"
                onClick={() => handleOpenBookingModal(selectedTeacher)}
                className="px-3 py-1.5 rounded-full bg-[#B58EBE] text-white text-[12px] font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                預約試上
              </button>
            )}
          </div>
        </header>

        {/* ============================================================ */}
        {/* 可滾動主內容區域 (Step 1, Step 2, Step 3 均在內渲染) */}
        {/* ============================================================ */}
        <main className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
          
          {/* ------------------------------------------------------------ */}
          {/* STEP 1: 選樂器 (Select Instrument) */}
          {/* ------------------------------------------------------------ */}
          {step === 'instruments' && (
            <div className="flex flex-col animate-in fade-in duration-300">
              {/* Hero 區塊 */}
              <section className="px-5 py-3 flex flex-col items-center gap-2">
                {/* 徽章標籤 */}
                <div className="px-3 py-1.5 bg-[rgba(77,173,184,0.10)] rounded-xl inline-flex items-center gap-1.5">
                  <span className="text-[#4DADB8] text-[12px] font-bold">✦</span>
                  <span className="text-[#4DADB8] text-[12px] font-semibold tracking-wider">MUSIMATE</span>
                </div>

                {/* 主標題 */}
                <h1 className="w-full text-center text-[#2C2A29] text-[26px] font-bold leading-[34px] tracking-tight">
                  陪你探索音樂天賦的好夥伴
                </h1>

                {/* 副標題 */}
                <p className="w-full text-center text-[#B58EBE] text-[13px] font-normal leading-[21px]">
                  在悠揚的旋律中，找尋屬於你的律動。<br />
                  挑選心儀的樂器，與專業導師一起譜寫美妙的樂章。
                </p>

                {/* 免費預約試聽按鈕 */}
                <button
                  type="button"
                  onClick={() => {
                    // 開啟彈窗體驗
                    handleOpenBookingModal(PIANO_TEACHERS[0]);
                  }}
                  className="w-full h-12 px-8 bg-[#B58EBE] text-white font-semibold text-[14px] rounded-xl shadow-[0px_4px_12px_rgba(217,102,140,0.20)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer mt-1"
                >
                  免費預約試聽
                </button>

                {/* 探索樂器課程標記 */}
                <div className="flex flex-col items-center gap-1 pt-3 pb-1">
                  <span className="text-[#868686] text-[12px] font-semibold uppercase tracking-wider">
                    探索樂器課程
                  </span>
                  <div className="w-2 h-1 border-b-2 border-[#868686]" />
                </div>
              </section>

              {/* 8 大樂器雙欄網格 */}
              <section className="px-5 py-3 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {INSTRUMENTS.map((inst) => (
                    <div
                      key={inst.id}
                      onClick={() => handleSelectInstrument(inst)}
                      className="p-3 bg-white shadow-[0px_4px_12px_rgba(44,42,41,0.03)] rounded-2xl border border-[#F0EAE1] flex flex-col items-center gap-3 hover:shadow-md hover:border-[#CEAB98] active:scale-[0.98] transition-all cursor-pointer group"
                    >
                      {/* 樂器圖示框 (高 110px，專屬淡底色) */}
                      <div
                        className="w-full h-[110px] rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
                        style={{ background: inst.bgTint }}
                      >
                        {inst.iconSvg}
                      </div>

                      {/* 樂器名稱與前往按鈕 */}
                      <div className="w-full flex flex-col items-center gap-2">
                        <div className="text-[#2C2A29] text-[16px] font-bold">
                          {inst.name}
                        </div>
                        <button
                          type="button"
                          className="w-full px-3 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors"
                          style={{
                            backgroundColor: inst.bgTint,
                            borderColor: inst.accentColor,
                            color: inst.accentColor,
                          }}
                        >
                          <span className="text-[12px] font-semibold">前往學習</span>
                          <span className="text-[10px] font-bold">➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 頁尾版權 */}
              <footer className="pt-6 pb-12 px-5 flex flex-col items-center justify-center">
                <p className="text-center text-[#707070] text-[12px] font-normal">
                  © 2026 Musi Mate
                </p>
              </footer>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 2: 選老師 (Select Teacher) */}
          {/* ------------------------------------------------------------ */}
          {step === 'teachers' && (
            <div className="flex flex-col animate-in fade-in duration-300">
              {/* Header 資訊區 */}
              <section className="pt-4 pb-3 px-5 flex flex-col items-center gap-3">
                {/* 樂器專屬 Tag */}
                <div className="px-3 py-1.5 bg-[rgba(77,173,184,0.10)] rounded-xl inline-flex items-center gap-1.5">
                  <span className="text-[#4DADB8] text-[12px] font-bold">✦</span>
                  <span className="text-[#4DADB8] text-[12px] font-semibold tracking-wider">
                    {selectedInstrument.enName} MATE
                  </span>
                </div>

                {/* 標題 */}
                <h2 className="w-full text-center text-[#2B3049] text-[20px] font-bold leading-[26px]">
                  {selectedInstrument.name}課程 — 專業師資
                </h2>

                {/* 說明文字 */}
                <p className="w-full text-center text-[#6F6F6F] text-[12px] font-normal leading-[19.2px]">
                  匯聚音樂領域的菁英教師，以豐富的教學經驗與演出資歷，為每位學員量身打造專屬的學習路徑。
                </p>
              </section>

              {/* 師資卡片列表 */}
              <section className="px-5 pb-6 flex flex-col gap-3">
                <div className="text-center text-[#2B3049] text-[12px] font-bold tracking-wider mb-1">
                  發現你的音樂導師
                </div>

                <div className="flex flex-col gap-3">
                  {PIANO_TEACHERS.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="p-4 bg-white shadow-[0px_4px_16px_rgba(44,42,41,0.03)] rounded-2xl border border-[#F0EAE1] flex flex-col gap-4"
                    >
                      {/* 教師照片 (288x288 比例) */}
                      <div className="w-full h-[220px] bg-[#B58EBE] rounded-xl overflow-hidden relative shadow-xs">
                        <Image
                          src={teacher.avatar}
                          alt={teacher.name}
                          fill
                          className="object-cover object-center"
                          onError={(e: any) => {
                            e.currentTarget.src = '/UI/teacher_avatar.png';
                          }}
                        />
                      </div>

                      {/* 教師資訊 */}
                      <div className="flex flex-col gap-2.5">
                        {/* 姓名與專長標籤 */}
                        <div className="w-full flex justify-between items-center">
                          <div className="text-[#2B3049] text-[20px] font-bold">
                            {teacher.name}
                          </div>
                          <div className="px-2.5 py-1 bg-[rgba(196,122,190,0.30)] rounded-lg border border-[#B58EBE]">
                            <span className="text-[#B58EBE] text-[12px] font-semibold">
                              {teacher.tag}
                            </span>
                          </div>
                        </div>

                        {/* 簡短介紹 */}
                        <p className="text-[#6F6F6F] text-[13px] font-normal leading-[20px]">
                          {teacher.shortBio}
                        </p>

                        {/* 查看個人頁面連結 */}
                        <button
                          type="button"
                          onClick={() => handleViewTeacherDetail(teacher)}
                          className="pt-1 pb-1 inline-flex items-center gap-1 text-[#B58EBE] text-[14px] font-semibold hover:underline active:scale-95 transition-all self-start cursor-pointer"
                        >
                          <span>查看個人頁面</span>
                          <span className="text-[12px] font-bold">➔</span>
                        </button>

                        {/* 分隔線 */}
                        <div className="w-full border-b border-[#F0EAE1] my-1" />

                        {/* 預約試上課程按鈕 */}
                        <button
                          type="button"
                          onClick={() => handleOpenBookingModal(teacher)}
                          className="w-full h-12 bg-[#B58EBE] text-white font-semibold text-[14px] rounded-xl flex items-center justify-center shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          預約試上課程
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 頁尾版權 */}
              <footer className="pt-6 pb-12 px-5 border-t border-[#F0EAE1] flex flex-col items-center justify-center">
                <p className="text-center text-[#707070] text-[12px] font-normal">
                  © 2026 Musi Mate
                </p>
              </footer>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 3: 看介紹 (Teacher Profile Detail) */}
          {/* ------------------------------------------------------------ */}
          {step === 'teacher_detail' && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <section className="pt-4 pb-8 px-4 flex flex-col gap-4">
                {/* 頂部標籤 */}
                <div className="w-full flex justify-center">
                  <div className="px-3 py-1.5 bg-[rgba(77,173,184,0.10)] rounded-full inline-flex items-center gap-1.5">
                    <span className="text-[#4DADB8] text-[12px] font-bold">✦</span>
                    <span className="text-[#4DADB8] text-[12px] font-semibold tracking-wider">
                      {selectedInstrument.enName} MATE 指導師資
                    </span>
                  </div>
                </div>

                {/* 導師大頭照與標籤行 */}
                <div className="w-full rounded-2xl overflow-hidden flex items-start gap-3 p-1">
                  {/* 大頭照 198x197 比例 */}
                  <div className="w-[140px] h-[150px] shrink-0 rounded-2xl overflow-hidden relative shadow-sm border border-[#F0EAE1] bg-[#B58EBE]">
                    <Image
                      src={selectedTeacher.avatar}
                      alt={selectedTeacher.name}
                      fill
                      className="object-cover object-center"
                      onError={(e: any) => {
                        e.currentTarget.src = '/UI/teacher_avatar.png';
                      }}
                    />
                  </div>

                  {/* 姓名與多重標籤 */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h1 className="text-[#2B3049] text-[26px] font-bold tracking-tight">
                      {selectedTeacher.name}
                    </h1>

                    <div className="flex flex-col gap-1.5">
                      {selectedTeacher.tags.map((tagText, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 bg-[rgba(181,142,190,0.30)] rounded-xl border border-[#B58EBE] self-start"
                        >
                          <span className="text-[#B58EBE] text-[11px] font-semibold">
                            {tagText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 詳細經歷與自介白色卡片 */}
                <div className="w-full p-5 bg-white shadow-[0px_4px_16px_rgba(44,42,41,0.03)] rounded-3xl border border-[#F0EAE1] flex flex-col gap-5">
                  <div className="w-full border-b border-[#F0EAE1]" />

                  {/* 詳細介紹文案 */}
                  <div className="text-[#6F6F6F] text-[14px] font-normal leading-[22.4px] whitespace-pre-line">
                    {selectedTeacher.fullBio}
                  </div>

                  <div className="w-full border-b border-[#F0EAE1]" />

                  {/* 社群關注與互動圖示 */}
                  <div className="w-full flex justify-between items-center">
                    <span className="text-[#B58EBE] text-[14px] font-semibold">
                      社群關注
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => alert(`已開啟 ${selectedTeacher.name} 老師的 Instagram 音樂動態！`)}
                        className="w-10 h-10 rounded-full bg-[rgba(181,142,190,0.25)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                        title="Instagram"
                      >
                        <Instagram className="w-4.5 h-4.5 text-[#B58EBE]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`已開啟 ${selectedTeacher.name} 老師的 YouTube 演奏精華！`)}
                        className="w-10 h-10 rounded-full bg-[rgba(181,142,190,0.25)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                        title="YouTube"
                      >
                        <Youtube className="w-4.5 h-4.5 text-[#B58EBE]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`已分享 ${selectedTeacher.name} 老師的名師專頁至 LINE 好友！`)}
                        className="w-10 h-10 rounded-full bg-[rgba(181,142,190,0.25)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                        title="分享名片"
                      >
                        <Share2 className="w-4.5 h-4.5 text-[#B58EBE]" />
                      </button>
                    </div>
                  </div>

                  {/* 預約試上按鈕 */}
                  <button
                    type="button"
                    onClick={() => handleOpenBookingModal(selectedTeacher)}
                    className="w-full py-3.5 bg-[#B58EBE] text-white text-[16px] font-semibold rounded-2xl shadow-[0px_4px_12px_rgba(181,142,190,0.30)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
                  >
                    預約試上課程
                  </button>
                </div>
              </section>

              {/* 頁尾版權 */}
              <footer className="pt-4 pb-12 px-4 border-t border-[#F0EAE1] flex flex-col items-center justify-center">
                <p className="text-center text-[#707070] text-[12px] font-normal">
                  © 2026 Musi Mate
                </p>
              </footer>
            </div>
          )}
        </main>

        {/* ============================================================ */}
        {/* STEP 4: 預約試上彈出視窗 (Trial Booking Modal) */}
        {/* ============================================================ */}
        {isBookingModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.25)] rounded-3xl p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200 border border-[#F0EAE1]">
              
              {/* Modal 頂部標題與關閉按鈕 */}
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {/* 彩色漸層小圓點 */}
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#C9A259] via-[#68C5AB] to-[#B58EBE]" />
                  <span className="text-[#2B3049] text-[16px] font-bold">
                    新生預約試上
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-[#2B3049] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 試上導師預覽 */}
              <div className="px-3 py-2 bg-[#F8F5F0] rounded-xl flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#6F6F6F]">指定導師 / 科目</span>
                <span className="text-[13px] font-bold text-[#B58EBE]">
                  {selectedTeacher.name} 老師 · {selectedInstrument.name}
                </span>
              </div>

              {/* 試上須知 */}
              <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#FAF6F0] flex flex-col gap-2">
                <div className="text-[#2B3049] text-[14px] font-bold">
                  試上須知
                </div>
                <div className="flex flex-col gap-1 text-[#6F6F6F] text-[12px] font-semibold leading-[18px]">
                  <div>• 每位新生可免費試上一堂課</div>
                  <div>• 試上時間為 30 分鐘</div>
                  <div>• 請於預約時間前 10 分鐘到達以利準備</div>
                </div>
              </div>

              {/* 試上費用 */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[#6F6F6F] text-[13px] font-bold">
                  試上費用
                </div>
                <div className="p-3 bg-[rgba(206,171,152,0.10)] rounded-xl flex items-center">
                  <span className="text-[#B58EBE] text-[16px] font-extrabold mr-2">
                    免費
                  </span>
                  <span className="text-[#6F6F6F] text-[12px] font-semibold line-through">
                    (原價 NT$ 800)
                  </span>
                </div>
              </div>

              {/* 選擇試上時間 (下拉選擇) */}
              <div className="flex flex-col gap-1.5 relative">
                <div className="text-[#6F6F6F] text-[13px] font-bold">
                  選擇試上時間
                </div>
                <div
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                  className="p-3 bg-[#FAF6F0] rounded-xl border border-[#FAF6F0] flex justify-between items-center cursor-pointer hover:border-[#CEAB98] transition-colors"
                >
                  <span className="text-[#2B3049] text-[14px] font-semibold">
                    {selectedTimeSlot}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#2B3049] transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* 下拉時段選單 */}
                {isTimeDropdownOpen && (
                  <div className="absolute top-[70px] left-0 right-0 bg-white rounded-xl shadow-lg border border-[#F0EAE1] overflow-hidden z-30 flex flex-col py-1">
                    {TIME_SLOTS.map((slot) => (
                      <div
                        key={slot}
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`px-3 py-2.5 text-[13px] font-semibold cursor-pointer flex justify-between items-center hover:bg-[#FAF6F0] transition-colors ${
                          selectedTimeSlot === slot ? 'text-[#B58EBE] bg-[rgba(181,142,190,0.10)]' : 'text-[#2B3049]'
                        }`}
                      >
                        <span>{slot}</span>
                        {selectedTimeSlot === slot && <Check className="w-4 h-4 text-[#B58EBE]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作按鈕群 */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitBooking}
                  className="w-full py-3 bg-[#B58EBE] text-white text-[14px] font-bold rounded-xl shadow-sm hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? '預約傳送中...' : '送出預約'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-full py-3 bg-[#FAF6F0] text-[#6F6F6F] text-[14px] font-bold rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 預約成功反饋彈窗 */}
        {/* ============================================================ */}
        {bookingSuccessModal && (
          <div className="absolute inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full bg-white shadow-2xl rounded-3xl p-6 flex flex-col items-center gap-4 text-center border border-[#F0EAE1] animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-7 h-7" strokeWidth={2.5} />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[#2B3049] text-[18px] font-bold">
                  預約試上成功！
                </h3>
                <p className="text-[#6F6F6F] text-[13px]">
                  我們已為您保留試上時段，確認訊息已同步發送至您的 LINE。
                </p>
              </div>

              <div className="w-full p-3.5 bg-[#FAF6F0] rounded-2xl flex flex-col gap-1.5 text-left text-[12px] border border-[#F0EAE1]">
                <div className="flex justify-between">
                  <span className="text-[#868686]">預約序號：</span>
                  <span className="font-mono font-bold text-[#2B3049]">{bookingSuccessModal.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#868686]">試上科目：</span>
                  <span className="font-semibold text-[#2B3049]">{bookingSuccessModal.details.instrument}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#868686]">指導老師：</span>
                  <span className="font-semibold text-[#2B3049]">{bookingSuccessModal.details.teacher_name} 老師</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#868686]">預約時間：</span>
                  <span className="font-semibold text-[#B58EBE]">{bookingSuccessModal.details.time_slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#868686]">試上地點：</span>
                  <span className="font-semibold text-[#2B3049]">MusiMate A303 琴房</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBookingSuccessModal(null);
                  router.push('/student/schedule');
                }}
                className="w-full py-3 bg-[#B58EBE] text-white text-[14px] font-bold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                返回我的課表查看
              </button>
            </div>
          </div>
        )}

        {/* 底部導覽列 */}
        <StudentTabBar activeTab="more" onMoreClick={() => setIsMoreDrawerOpen(true)} />

        {/* 側邊更多功能抽屜 */}
        <StudentMoreDrawer
          isOpen={isMoreDrawerOpen}
          onClose={() => setIsMoreDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
