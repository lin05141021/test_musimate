'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  GraduationCap,
  Music,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';

export default function TeacherProfilePage() {
  const [profile] = useState({
    name: '林佩芬 老師',
    title: '國立維也納音樂學院碩士 · 鋼琴與小提琴名師',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    tags: ['鋼琴演奏碩士', '小提琴教學', 'AI音聲診斷', '音樂素養'],
    bio: '國立維也納音樂暨表演藝術大學碩士，具備 12 年豐富專業教學資歷。專注於觸鍵音色、音樂詮釋與身心放鬆協調。曾指導逾 30 位學員錄取國立音樂班並在各大音樂賽事中屢獲首獎。結合現代 AI 課堂錄音輔助分析，引導每位學員發掘音符中的無限可能。',
    education: [
      '奧地利國立維也納音樂暨表演藝術大學 鋼琴演奏碩士 (Master of Arts)',
      '國立臺灣師範大學 音樂學系鋼琴與小提琴雙主修學士 (Bachelor of Music)',
      '曾獲選維也納國際鋼琴大師班專題示範演奏',
    ],
    highlights: [
      '12 年專業教學資歷，累計輔導逾 30 位學員順利考取國立音樂專班及各大音樂比賽特優',
      '特別著重學員觸鍵發力與身體放鬆協調性，針對不同年齡與基礎量身訂製教材',
      '結合 AI 課堂即時錄音重點摘要與課後音準姿態對比，使自主練習目標清晰明確',
    ],
    teachingLocations: ['音符音樂教室 A303 琴房', '大安琴房 A 室', '台北專業音樂工作室'],
  });

  return (
    <div className="w-full min-h-[1024px] bg-[#FAF6F0] flex flex-col font-['Noto_Sans_TC',sans-serif]">
      {/* Hero Header */}
      <section className="w-full max-w-[1440px] mx-auto pt-10 pb-6 px-6 sm:px-12 lg:px-[80px] flex flex-col items-center text-center gap-4">
        <div className="px-3.5 py-1 bg-[rgba(181,142,190,0.15)] rounded-full border border-[#B58EBE] flex items-center gap-1.5 text-xs font-bold text-[#8A5899]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PIANO & VIOLIN MASTER</span>
        </div>
        <h1 className="text-[#2B3049] text-3xl sm:text-4xl font-['Noto_Serif_TC',serif] font-bold tracking-tight">
          {profile.name} · 名師專欄介紹
        </h1>
        <p className="text-[#7A736E] text-sm max-w-xl">
          {profile.title}
        </p>
      </section>

      {/* Main Content Card */}
      <main className="w-full max-w-[1440px] mx-auto pb-16 px-6 sm:px-12 lg:px-[80px] flex flex-col gap-8">
        {/* 教師核心名片 */}
        <div className="w-full p-8 sm:p-10 bg-white rounded-[28px] shadow-sm ring-1 ring-[#82AAD8]/30 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-[140px] h-[140px] rounded-2xl ring-4 ring-[#FAF6F0] overflow-hidden shadow-md shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[#2B3049] text-2xl sm:text-3xl font-['Noto_Serif_TC',serif] font-bold">
                {profile.name}
              </h2>
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#FAF4FB] text-[#8A5899] text-xs font-bold rounded-full border border-[#E8D7EE]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-[#4A3A31] text-sm sm:text-[15px] leading-relaxed">
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A736E] pt-2">
              <span className="font-bold text-[#2B3049]">授課地點：</span>
              {profile.teachingLocations.map((loc) => (
                <span key={loc} className="px-2.5 py-1 bg-[#FAF6F0] rounded-lg">
                  📍 {loc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 經歷與教學特色 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 學歷與專業演奏文憑 */}
          <div className="p-7 bg-white rounded-[24px] shadow-xs ring-1 ring-[#F0EAE1] flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-[#2B3049]">
              <GraduationCap className="w-5 h-5 text-[#8A5899]" />
              <h3 className="text-lg font-['Noto_Serif_TC',serif] font-bold">
                學歷背景與演奏文憑
              </h3>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-[#6F6F6F] leading-relaxed">
              {profile.education.map((edu, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#8A5899] font-bold shrink-0">✦</span>
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 教學成果與教學亮點 */}
          <div className="p-7 bg-white rounded-[24px] shadow-xs ring-1 ring-[#F0EAE1] flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-[#2B3049]">
              <Award className="w-5 h-5 text-[#C9A259]" />
              <h3 className="text-lg font-['Noto_Serif_TC',serif] font-bold">
                教學成果與專業特色
              </h3>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-[#6F6F6F] leading-relaxed">
              {profile.highlights.map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#C9A259] font-bold shrink-0">✔</span>
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 快速排課入口 */}
        <div className="w-full p-6 bg-gradient-to-r from-[#FAF4FB] to-white rounded-[24px] border border-[#E8D7EE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-base font-bold text-[#2B3049]">
              想查看林佩芬老師的即時課表或學生管理？
            </div>
            <div className="text-xs text-[#7A736E] mt-0.5">
              可直接前往「我的課表」與「薪資看板」進行智慧排課與財務對帳。
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/teacher/schedule"
              className="px-5 py-2.5 bg-[#2B3049] hover:bg-[#1f2335] text-white text-xs font-bold rounded-full transition-all shadow-xs"
            >
              進入我的課表 ➔
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
