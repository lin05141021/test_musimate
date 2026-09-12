'use client';

import React from 'react';
import { useLiffAuth } from '@/context/LiffAuthContext';
import { ShieldAlert, Server, Check } from 'lucide-react';

export function DevMockBar() {
  const { isDevMock, currentStudent, mockStudents, setMockStudent, isLoadedFromApi } = useLiffAuth();

  if (!isDevMock) return null;

  return (
    <div className="bg-[#4A3A31] text-[#FDFBF7] border-b border-[#CEAB98]/40 px-3 py-1.5 text-xs flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-1.5 font-mono">
        <ShieldAlert className="w-3.5 h-3.5 text-[#E6A74C]" />
        <span className="font-semibold text-[#EBDCB9]">DEV MOCK</span>
        {isLoadedFromApi ? (
          <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded flex items-center gap-0.5 font-sans">
            <Server className="w-2.5 h-2.5" /> API (DB連線)
          </span>
        ) : (
          <span className="text-[10px] bg-amber-900/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-sans">
            API (種子名單)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[#EBDCB9]/90 text-[11px]">切換學生:</span>
        <select
          value={currentStudent?.id || ''}
          onChange={(e) => {
            const student = mockStudents.find(s => s.id === e.target.value);
            if (student) setMockStudent(student);
          }}
          className="bg-[#2B3049] border border-[#CEAB98]/60 text-[#FDFBF7] rounded px-2 py-0.5 text-xs outline-none focus:border-[#C58D34]"
        >
          {mockStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.default_instrument})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
