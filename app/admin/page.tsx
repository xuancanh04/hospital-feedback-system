'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function AdminRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'admin') {
      router.replace('/portal/admin');
    } else {
      router.replace('/login?role=admin&redirect=/portal/admin');
    }
  }, [isAuthenticated, currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-4 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Đang chuyển đến cổng quản trị...</p>
      </div>
    </div>
  );
}
