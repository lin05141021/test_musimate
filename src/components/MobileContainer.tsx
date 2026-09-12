'use client';

import React, { ReactNode } from 'react';
import { DevMockBar } from './DevMockBar';
import { BottomNav } from './BottomNav';

export function MobileContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EAE6DF] text-[#2B3049] flex flex-col items-center justify-start antialiased selection:bg-[#C58D34] selection:text-white py-0 md:py-4">
      <div className="w-full max-w-md min-h-screen md:min-h-[92vh] flex flex-col bg-[#FAF6F0] bg-watercolor-pattern bg-cover bg-center bg-no-repeat border-x border-[#EBDCB9] shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:rounded-3xl relative pb-20 overflow-hidden">
        <DevMockBar />
        <main className="flex-1 w-full p-4 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
