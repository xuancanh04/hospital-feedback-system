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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full">
        {/* Card chính */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-8 sm:p-10 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md border border-emerald-900/10 mb-2 hover:scale-105 transition-transform overflow-hidden mx-auto">
              <Image
                src="/logo.png"
                alt="Logo Bệnh viện Quân y 7A"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống'}
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              {isRegister 
                ? 'Đăng ký tài khoản Bệnh nhân để gửi và theo dõi các đánh giá y tế' 
                : 'Nhập thông tin xác thực để truy cập cổng dịch vụ Bệnh viện Quân y 7A'}
            </p>
          </div>

          {/* Tiêu đề Đăng Nhập Cán Bộ Quản Trị */}
          <div className="text-center pb-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              Cổng Quản Trị & Bác Sĩ
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Đăng ký: Họ và tên */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Họ và tên của bạn *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <Input
                    type="text"
                    placeholder="VD: Nguyễn Văn Hoàng"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-10.5 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Địa chỉ Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10.5 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mật khẩu *
                </label>
                {!isRegister && (
                  <span className="text-[11px] text-zinc-400">
                    Bảo mật 2 lớp
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10.5 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Đang xác thực...' : isRegister ? 'Hoàn tất Đăng ký' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bảng gợi ý tài khoản mẫu thực tế theo 3 nhóm quyền */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Tài khoản mẫu phân quyền sẵn:
              </span>
              <span>Bấm để điền form</span>
            </div>

            <div className="space-y-1.5">
              {/* 1. Bệnh nhân */}
              <button
                type="button"
                onClick={() => handleFillDemo('hoang.tran@gmail.com', '123')}
                className="w-full text-left p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">1. Khách hàng / Bệnh nhân</span>
                  <span className="text-[10px] text-zinc-500">hoang.tran@gmail.com • pass: 123</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Patient</span>
              </button>

              {/* 2. Bác sĩ / Nhân viên y tế */}
              <button
                type="button"
                onClick={() => handleFillDemo('bacsi.dung@benhvien7a.vn', 'staff')}
                className="w-full text-left p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">2. Bác sĩ chuyên khoa</span>
                  <span className="text-[10px] text-zinc-500">bacsi.dung@benhvien7a.vn • pass: staff</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">Staff</span>
              </button>

              {/* 3. Ban Giám Đốc */}
              <button
                type="button"
                onClick={() => handleFillDemo('admin@benhvien7a.vn', 'admin')}
                className="w-full text-left p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">3. Ban Giám Đốc / Admin</span>
                  <span className="text-[10px] text-zinc-500">admin@benhvien7a.vn • pass: admin</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
