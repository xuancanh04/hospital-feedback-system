'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/auth-context';
import { FeedbackProvider } from '@/context/feedback-context';
import { Navbar, Footer } from '@/components/navbar';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isKioskMode = pathname === '/' || pathname === '/kiosk';

  return (
    <AuthProvider>
      <FeedbackProvider>
        {isKioskMode ? (
          // Chế độ Kiosk Toàn Màn Hình Cảm Ứng (Không Navbar, Không Footer thừa)
          <div className="min-h-screen w-full bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
            {children}
          </div>
        ) : (
          // Các trang quản trị (Admin/Staff Portal, Reviews)
          <div className="min-h-screen flex flex-col bg-[#fbfdfc] text-slate-900 antialiased selection:bg-emerald-800 selection:text-white">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        )}
      </FeedbackProvider>
    </AuthProvider>
  );
}
