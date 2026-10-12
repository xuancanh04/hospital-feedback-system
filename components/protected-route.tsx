'use client';

import React, { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Role } from '@/types';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const emptySubscribe = () => () => {};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Khu vực này yêu cầu xác thực danh tính. Vui lòng đăng nhập với tài khoản có thẩm quyền để tiếp tục.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập ngay
            </Link>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu vai trò không nằm trong danh sách được phép
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-amber-200 dark:border-amber-900 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Không có quyền truy cập</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tài khoản của bạn ({currentUser.email} - Vai trò: <strong>{currentUser.role}</strong>) không có quyền truy cập khu vực này.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
