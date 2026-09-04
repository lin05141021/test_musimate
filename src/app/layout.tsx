import type { Metadata } from 'next';
import './globals.css';
import { DemoProvider } from '@/context/DemoContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppLayoutWrapper } from '@/components/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'Harmonix AI Studio - 溫暖音樂教室 AI 小幫手',
  description: '溫暖柔和的 AI 音樂教學輔助系統，提供智慧調課、課堂情緒過濾摘要與 AI 雙影片比對診斷。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased text-[#332C27] bg-[#FAF7F2] min-h-screen flex flex-col font-sans">
        <DemoProvider>
          <ToastProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </ToastProvider>
        </DemoProvider>
      </body>
    </html>
  );
}

