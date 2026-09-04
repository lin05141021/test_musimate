'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/context/DemoContext';
import { StudentTabBar } from './StudentTabBar';
import { Users, ChevronUp, Check } from 'lucide-react';

export const StudentBottomNav: React.FC = () => {
  const {
    activeStudentId,
    isMultiChildParent,
    linkedStudents,
    allStudents,
    switchStudent,
  } = useDemoContext();

  const [showChildSwitcher, setShowChildSwitcher] = useState(false);
  const currentStudent = allStudents.find((s) => s.student.id === activeStudentId) || allStudents[0];

  return (
    <>
      {/* 多小孩家長身份切換選單彈窗（僅限同 LINE 帳號綁定 2 位以上小孩之家庭） */}
      {isMultiChildParent && showChildSwitcher && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-4 pointer-events-auto">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#EFECE6] space-y-4 animate-in fade-in slide-in-from-bottom-6"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF2EC] text-[#8C6D53] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#332C27]">切換小孩課表</h3>
                  <p className="text-[11px] text-[#7A736E]">同一個 LINE 帳號名下學員</p>
                </div>
              </div>
              <button
                onClick={() => setShowChildSwitcher(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7A736E] text-xs font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {linkedStudents.map((item) => {
                const isSelected = item.student.id === activeStudentId;
                return (
                  <button
                    key={item.student.id}
                    onClick={() => {
                      switchStudent(item.student.id);
                      setShowChildSwitcher(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? 'bg-[#FAF2EC] border-[#8C6D53] text-[#8C6D53] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#EFECE6] text-[#332C27] hover:border-[#8C6D53]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.user.avatar_url}
                        alt={item.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          <span>{item.user.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-[#8C6D53] text-white text-[10px] font-bold">
                              目前身分
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#7A736E] font-medium mt-0.5">
                          {item.instrument} · {item.user.email}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-5 h-5 text-[#8C6D53]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 底部固定導航列與身份指示條 (居中 390px 寬度) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
        {/* 頂部學員身分指示條 (多小孩家庭才顯示，浮動於 TabBar 上緣) */}
        {isMultiChildParent && (
          <div className="w-full max-w-[390px] px-4 py-1.5 bg-white/95 backdrop-blur-md border-t border-x border-[#EFECE6] rounded-t-2xl shadow-sm flex items-center justify-between text-[11px] text-[#7A736E] pointer-events-auto">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>學員：</span>
              <span className="font-bold text-[#332C27]">{currentStudent?.user?.name}</span>
              <span className="text-[#8C6D53] font-medium text-[10px]">({currentStudent?.instrument})</span>
            </div>

            <button
              onClick={() => setShowChildSwitcher(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF2EC] hover:bg-[#EFE4DC] text-[#8C6D53] font-bold text-[10px] transition-all"
            >
              <Users className="w-3 h-3" />
              <span>切換小孩</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 新版 390px 水彩風格 TabBar */}
        <div className="w-full max-w-[390px] pointer-events-auto shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
          <StudentTabBar />
        </div>
      </div>
    </>
  );
};

export default StudentBottomNav;
