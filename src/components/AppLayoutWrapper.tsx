'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '';
  const isStudentPage = pathname.startsWith('/student');
  const isTeacherPage = pathname.startsWith('/teacher');

  // 如果是在學生端手機版頁面（/student/*）或教師端頁面（/teacher/*），
  // 完全移除全站通用舊版 Navbar 與 Footer，讓各子系統自帶專屬沉浸式頂部導航
  if (isStudentPage || isTeacherPage) {
    return (
      <div className="w-full min-h-screen bg-[#FAF6F0]">
        {children}
      </div>
    );
  }

  // 老師端或系統首頁 (桌面版模式)
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="border-t border-[#EFECE6] py-6 text-center text-xs text-[#7A736E] bg-white/80 backdrop-blur-md mt-12">
        Harmonix AI Studio &copy; {new Date().getFullYear()} - 溫暖音樂教室 AI 小幫手 (MVP Version)
      </footer>
    </>
  );
};

export default AppLayoutWrapper;
