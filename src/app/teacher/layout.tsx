import React from 'react';
import { TeacherNavbar } from '@/components/TeacherNavbar';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B3049] flex flex-col font-['Noto_Sans_TC',sans-serif]">
      <TeacherNavbar />
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
