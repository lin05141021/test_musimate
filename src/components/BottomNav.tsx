'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Mic, RefreshCw, BookOpen, CreditCard } from 'lucide-react';
import clsx from 'clsx';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/student/schedule', label: '課表報到', icon: Calendar },
    { href: '/student/practice', label: '練習打卡', icon: Mic },
    { href: '/student/reschedule', label: '調課請假', icon: RefreshCw },
    { href: '/student/summary', label: '老師聯絡簿', icon: BookOpen },
    { href: '/student/contracts', label: '續約繳費', icon: CreditCard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FAF6F0]/95 md:rounded-b-3xl border-t border-[#EBDCB9] backdrop-blur-md px-2 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium transition-all',
              isActive
                ? 'text-[#C58D34] font-bold scale-105 bg-[#C58D34]/10'
                : 'text-[#63667B] hover:text-[#2B3049]'
            )}
          >
            <Icon className={clsx('w-5 h-5', isActive ? 'text-[#C58D34] stroke-[2.4]' : 'text-[#8E90A6]')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
