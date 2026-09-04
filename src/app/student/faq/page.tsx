'use client';

import React, { useState } from 'react';
import { StudentTabBar } from '@/components/StudentTabBar';
import { StudentMoreDrawer } from '@/components/StudentMoreDrawer';

interface FAQItem {
  id: string;
  qNum: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: '一、產品特色與亮點介紹',
    items: [
      {
        id: 'q1',
        qNum: 'Q1',
        question: 'MusiMate 是一個什麼樣的系統？',
        answer:
          '專為音樂老師設計的智慧管理與教學輔助系統。利用 AI 技術輔以知識庫，簡化音樂教室繁雜的行政庶務。兼顧教學專業度，同時扮演學生的自主練習激勵夥伴。',
      },
      {
        id: 'q2',
        qNum: 'Q2',
        question: 'MusiMate 的核心特色有哪些？',
        answer:
          '智慧對帳：家長免填複雜表單，AI 自動解析匯款憑證並核對。語音聯絡簿：老師只要講話 60 秒，AI 自動生成專業且具鼓勵性的聯絡簿文字。自主練習即時激勵：AI 即時分析學生每日打卡，給予兼顧專業度與激勵性的回饋。智慧調課管理：線上請假調課自動媒合釋出，省去繁瑣溝通。',
      },
    ],
  },
  {
    title: '二、行政與財務（智慧對帳）相關',
    items: [
      {
        id: 'q3',
        qNum: 'Q3',
        question: '智慧對帳系統有實際串接銀行金流嗎？',
        answer:
          '沒有。本系統不實際經手任何金流。家長仍維持原本的轉帳、匯款或街口等線下管道。系統是透過 AI 技術辨識家長上傳的收據截圖，來完成自動對帳。',
      },
      {
        id: 'q4',
        qNum: 'Q4',
        question: '如果 AI 辨識收據上的轉帳資訊錯了，該怎麼辦？',
        answer:
          '系統在辨識完成後，會先呈現辨識結果給學生/家長確認。家長可以當場手動修改與編輯金額或後五碼，確認無誤後再送出，不會因為 AI 誤判而導致對帳卡關。',
      },
    ],
  },
  {
    title: '三、AI 教學輔助（聯絡簿、打卡）相關',
    items: [
      {
        id: 'q5',
        qNum: 'Q5',
        question: '老師用「語音聯絡簿」功能有時間限制嗎？',
        answer:
          '有，單次錄音上限為 60 秒。系統旨在幫助老師快速口述今日課堂重點，並在最後 10 秒提供倒數提示，省去老師課後瘋狂打字的時間。',
      },
      {
        id: 'q6',
        qNum: 'Q6',
        question: '為什麼限制學生每天只能「自主練習打卡」一次？',
        answer:
          '為了引導學生養成每日規律練習的好習慣，而非在一天內連續上傳。每天完成打卡後，AI 會即時給予兼顧專業與激勵的回饋，維持學生的練習動力。',
      },
    ],
  },
  {
    title: '四、智慧調課與平台防護機制',
    items: [
      {
        id: 'q7',
        qNum: 'Q7',
        question: '為什麼系統要「全面禁止師生私下交流與調課」？',
        answer:
          '防止去平台化風險，保護教室權益。同時，若私下調課沒有同步給系統，會導致 AI 對帳帳單錯誤、課表衝突、以及後續學習數據分析失準。',
      },
      {
        id: 'q8',
        qNum: 'Q8',
        question: '學生如果想要請假或調課，應該怎麼做？',
        answer:
          '必須統一經由系統的「線上請假/智慧調課申請功能」辦理。系統會自動釋出時段並重新媒合，未透過系統的私下變更，系統一律不予承認。',
      },
      {
        id: 'q9',
        qNum: 'Q9',
        question: '通訊功能會屏蔽我的個人聯絡資訊嗎？',
        answer:
          '會的。親師通訊功能會自動偵測並屏蔽 LINE ID、手機號碼、外部通訊軟體連結等關鍵字，以確保溝通留在平台內，保障教學與運作安全。',
      },
    ],
  },
];

export default function FAQPage() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#EDE8DE] sm:bg-[#E5E0D8] flex items-center justify-center p-0 sm:p-4 font-['Sora',sans-serif] select-none">
      {/* 360px Mobile Viewport Container with Smooth Vertical Scrolling */}
      <div className="w-[360px] h-[844px] max-w-full max-h-[100dvh] sm:max-h-[844px] bg-[#FAF6F0] rounded-[40px] shadow-[0px_12px_24px_rgba(43,48,73,0.13)] overflow-hidden flex flex-col relative border border-[#F0EAE1]">
        
        {/* 1. Header Bar (64px) */}
        <header className="w-full h-16 px-5 py-3 bg-[#FAF6F0] border-b border-[#F0EAE1] flex justify-between items-center shrink-0 z-20">
          <div className="w-[161px] h-10 relative flex items-center">
            <img
              src="/UI/logo.png"
              alt="Musi Mate"
              className="w-[161px] h-10 object-contain object-left cursor-pointer"
              onClick={() => typeof window !== 'undefined' && window.history.back()}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-[#2B3049] text-xl font-bold font-['Sora'] tracking-wider hidden [:not([style*='display: none'])+&]:hidden">
              Musi Mate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#B58EBE]">FAQ</span>
            <span className="text-[11px] text-[#A3A7BA]">· 常見問題</span>
          </div>
        </header>

        {/* 2. Main Content Area (flex-1 獨立垂直滾動) */}
        <main className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#D8CFC4_transparent] px-5 pt-4 pb-8 flex flex-col gap-4">
          
          {/* Title and Subtitle */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[#2B3049] text-[20px] font-bold font-['Sora']">
              MusiMate 常見問題
            </h1>
            <p className="text-[#6F6F6F] text-[14px] font-normal leading-[19.6px] font-['Sora']">
              AI 小幫手為您解答
            </p>
          </div>

          {/* FAQ Categories */}
          {FAQ_DATA.map((category, catIdx) => (
            <div
              key={catIdx}
              className="w-full p-4 bg-white rounded-2xl border border-[rgba(181,142,190,0.25)] flex flex-col gap-4 shadow-[0px_4px_12px_rgba(43,48,73,0.02)]"
            >
              {/* Category Pill Badge */}
              <div className="px-3 py-1.5 bg-[rgba(181,142,190,0.13)] rounded-full self-start inline-flex items-center">
                <span className="text-[#B58EBE] text-[14px] font-bold font-['Sora']">
                  {category.title}
                </span>
              </div>

              {/* Q&A Items List */}
              <div className="flex flex-col gap-3.5">
                {category.items.map((item, itemIdx) => (
                  <div key={item.id} className="flex flex-col gap-2.5">
                    
                    {/* Question Row */}
                    <div className="flex items-start gap-2">
                      <div className="px-1.5 py-0.5 bg-[#B58EBE] rounded-md flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-[12px] font-bold font-['Sora']">
                          {item.qNum}
                        </span>
                      </div>
                      <div className="flex-1 text-[#2B3049] text-[14px] font-bold leading-[20px] font-['Sora']">
                        {item.question}
                      </div>
                    </div>

                    {/* Answer Text */}
                    <div className="pl-8 text-[#6F6F6F] text-[14px] font-normal leading-[18px] font-['Sora']">
                      {item.answer}
                    </div>

                    {/* Divider between questions in the same card */}
                    {itemIdx < category.items.length - 1 && (
                      <div className="w-full h-0 border-b border-[rgba(181,142,190,0.25)] pt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Copyright / Footer */}
          <div className="pt-2 pb-2 text-center text-[#6F6F6F] text-[12px] font-['Sora']">
            © 2026 Musi Mate · FAQ
          </div>
        </main>

        {/* 3. Bottom Floating Navigation Bar */}
        <footer className="flex-shrink-0 w-full z-30 bg-[#FAF6F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#EFECE6]">
          <StudentTabBar activeTab="more" onMoreClick={() => setDrawerOpen(true)} />
        </footer>

        {/* 4. Slide-up More Drawer */}
        <StudentMoreDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}
