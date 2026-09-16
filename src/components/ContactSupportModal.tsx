'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, X, ExternalLink } from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF6F0] rounded-3xl border border-[#EBDCB9] p-6 shadow-2xl flex flex-col gap-5 relative animate-in zoom-in-95 duration-200"
      >
        {/* 右上角關閉按鈕 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-[#6F6F6F] border border-[#EBDCB9] cursor-pointer transition-colors shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 頂部 Logo 與標題 */}
        <div className="flex flex-col items-center text-center pt-2 gap-2">
          <div className="px-4 py-1.5 bg-[#FAF6F0] rounded-full shadow-[0_2px_8px_rgba(43,48,73,0.06)] border border-[#EBDCB9] flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="MusiMate Logo"
              className="h-8 w-auto object-contain"
              onError={(e: any) => {
                e.currentTarget.src = '/UI/logo.png';
              }}
            />
          </div>
          <h2 className="text-[20px] font-extrabold text-[#2B3049] tracking-tight font-['Sora']">
            聯絡我們
          </h2>
          <p className="text-[12px] text-[#6F6F6F]">
            如有排課、繳費、帳務或系統疑問，歡迎隨時洽詢
          </p>
        </div>

        {/* 聯絡資訊清單 (嚴格對照使用者提供之樣式) */}
        <div className="bg-white rounded-2xl p-4 border border-[#EBDCB9] flex flex-col gap-3.5 shadow-xs">
          {/* 電話 */}
          <a
            href="tel:0223456789"
            className="flex items-center gap-3.5 text-[#2B3049] hover:text-[#885424] transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#EBDCB9] flex items-center justify-center text-[#2B3049] group-hover:scale-105 transition-transform shrink-0">
              <Phone className="w-4.5 h-4.5 text-[#2B3049]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9CA3AF] font-bold">客服專線</span>
              <span className="text-[14px] font-bold font-mono tracking-wide">
                (02) 2345-6789
              </span>
            </div>
          </a>

          <div className="w-full border-b border-[#FAF6F0]" />

          {/* Email */}
          <a
            href="mailto:info@rhythmmusic.tw"
            className="flex items-center gap-3.5 text-[#2B3049] hover:text-[#885424] transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#EBDCB9] flex items-center justify-center text-[#2B3049] group-hover:scale-105 transition-transform shrink-0">
              <Mail className="w-4.5 h-4.5 text-[#2B3049]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9CA3AF] font-bold">電子信箱</span>
              <span className="text-[14px] font-bold font-mono tracking-wide">
                info@rhythmmusic.tw
              </span>
            </div>
          </a>

          <div className="w-full border-b border-[#FAF6F0]" />

          {/* 地址 */}
          <div className="flex items-start gap-3.5 text-[#2B3049]">
            <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#EBDCB9] flex items-center justify-center text-[#2B3049] shrink-0 mt-0.5">
              <MapPin className="w-4.5 h-4.5 text-[#2B3049]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9CA3AF] font-bold">工作室地址</span>
              <span className="text-[13px] font-semibold text-[#2B3049] leading-snug">
                台北市大安區音樂文創路 88 號 2 樓
              </span>
            </div>
          </div>
        </div>

        {/* 底部操作按鈕 */}
        <div className="flex gap-2">
          <a
            href="tel:0223456789"
            className="flex-1 py-3 bg-[#CEAB98] hover:bg-[#C29D89] active:scale-[0.99] text-white font-bold text-[13px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>撥打電話</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-24 py-3 bg-white hover:bg-slate-50 border border-[#EBDCB9] text-[#6F6F6F] font-bold text-[13px] rounded-xl transition-all cursor-pointer text-center"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
