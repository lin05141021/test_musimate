'use client';

import { Role } from '@/types';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickFill: (role: Role) => void;
}

export function DemoGuideModal({ isOpen, onClose, onQuickFill }: DemoGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Demo 快速登入</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          選擇一個角色，快速體驗系統功能。
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onQuickFill('teacher')}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition"
          >
            以老師身分登入
          </button>
          <button
            onClick={() => onQuickFill('student')}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 transition"
          >
            以學生身分登入
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          取消
        </button>
      </div>
    </div>
  );
}