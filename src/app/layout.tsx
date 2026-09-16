import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LiffAuthProvider } from '@/context/LiffAuthContext';
import { DemoProvider } from '@/context/DemoContext';
import { ToastProvider } from '@/context/ToastContext';
import { MobileContainer } from '@/components/MobileContainer';

export const metadata: Metadata = {
  title: 'MusiMate 學生學習端 | LINE LIFF',
  description: '獨立音樂教師專屬 Studio OS — 學生課表、練習打卡與學習週報',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-[#FAF6F0] text-[#2B3049] antialiased">
        <ToastProvider>
          <DemoProvider>
            <LiffAuthProvider>
              <MobileContainer>
                {children}
              </MobileContainer>
            </LiffAuthProvider>
          </DemoProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
