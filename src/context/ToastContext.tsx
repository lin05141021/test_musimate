'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastData {
  id: number;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((message: string, duration = 2600) => {
    const id = Date.now();
    setToast({ id, message });
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 全局浮動通知反饋 Toast (嚴格對齊使用者提供之樣式與毛玻璃高質感) */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          onClick={() => setIsVisible(false)}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] cursor-pointer transition-all duration-300 transform select-none ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
          }`}
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          <div
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '14px',
              paddingBottom: '14px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12), 0px 1px 4px rgba(0, 0, 0, 0.06)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              display: 'inline-flex',
            }}
          >
            {/* 彩虹漸層小圓徽章 */}
            <div
              style={{
                width: '20px',
                height: '20px',
                background:
                  'linear-gradient(180deg, rgba(201.36, 162.06, 89.06, 0.90) 0%, rgba(213.32, 204.34, 105.63, 0.90) 24%, rgba(104.38, 197.38, 171.03, 0.90) 50%, rgba(97.84, 147.15, 203.51, 0.90) 77%, rgba(187.27, 101.11, 178.65, 0.90) 100%)',
                overflow: 'hidden',
                borderRadius: '14px',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 700,
                  wordWrap: 'break-word',
                  lineHeight: 1,
                }}
              >
                ✓
              </div>
            </div>

            {/* 通知提示字串 */}
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: '#333333',
                fontSize: '14px',
                fontFamily: 'Sora, system-ui, sans-serif',
                fontWeight: 600,
                wordWrap: 'break-word',
                whiteSpace: 'nowrap',
              }}
            >
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useStudentToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useStudentToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
