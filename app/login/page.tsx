'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/form-controls';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIsRegister = searchParams.get('register') === 'true';

  const { login, register, users } = useAuth();

  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMsg('Vui lòng nhập họ và tên của bạn.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Mật khẩu tối thiểu 6 ký tự để đảm bảo an toàn.');
          setLoading(false);
          return;
        }

        const res = await register(name.trim(), email.trim(), password);
        if (res.success) {
          router.push('/portal/patient');
        } else {
          setErrorMsg(res.error || 'Đăng ký không thành công.');
        }
      } else {
        const res = await login(email.trim(), password);
        if (res.success) {
          const target = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
          const role = res.user?.role || target?.role;
          if (role === 'admin') router.push('/portal/admin');
          else if (role === 'staff') router.push('/portal/staff');
          else router.push('/portal/patient');
        } else {
          setErrorMsg(res.error || 'Đăng nhập không thành công.');
        }
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-sm w-full">
        {/* Card chính nhỏ gọn, tinh tế */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-lg shadow-zinc-200/30 dark:shadow-none space-y-4">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <Link href="/" className="inline-flex items-center justify-center h-10 mb-1 hover:scale-105 transition-transform mx-auto">
              <Image
                src="/logo.png"
                alt="Logo Bệnh viện Quân y 7A"
                width={430}
                height={148}
                unoptimized
                className="h-full w-auto max-h-10 object-contain"
                priority
              />
            </Link>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#000080] dark:text-zinc-100 uppercase">
              Cổng Quản Trị Hệ Thống
            </h1>
            <p className="text-[11px] text-zinc-500">
              Đăng nhập tài khoản Quản trị viên (Admin)
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tài khoản Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <Input
                  type="email"
                  placeholder="admin@benhvien7a.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9.5 text-xs sm:text-sm rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-9.5 text-xs sm:text-sm rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#02633c] hover:bg-[#01472a] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-50 uppercase tracking-wide"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Nút bấm tự điền tài khoản Admin */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@benhvien7a.vn', 'admin')}
              className="w-full text-left p-2.5 rounded-lg border border-purple-200 dark:border-purple-900/60 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-100/60 transition text-xs flex items-center justify-between group cursor-pointer"
            >
              <div className="min-w-0">
                <span className="font-bold text-purple-950 dark:text-purple-200 block text-xs truncate">
                  ⚡ Điền nhanh tài khoản Admin mẫu
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block truncate">
                  admin@benhvien7a.vn • pass: admin
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white shrink-0">
                Admin
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-zinc-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Hệ thống xác thực nội bộ chuẩn Bệnh viện Quân y 7A.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Đang tải trang đăng nhập...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
