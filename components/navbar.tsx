'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  MessageSquarePlus, 
  LayoutDashboard, 
  Stethoscope, 
  Star, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  FileText, 
  Menu, 
  X,
  PhoneCall
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors">
      {/* Top Banner Quân Đội - Xanh Đậm Chuẩn Quân Y (#02633c) */}
      <div className="bg-[#02633c] text-white text-xs py-2 px-4 sm:px-8 flex justify-between items-center font-normal tracking-wide">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            BỘ QUỐC PHÒNG • BỆNH VIỆN QUÂN Y 7A
          </span>
          <span className="hidden sm:inline text-emerald-200/50">|</span>
          <span className="hidden md:inline text-emerald-100 font-light">
            Cổng Lắng Nghe & Đánh Giá Chất Lượng Khám Chữa Bệnh
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-emerald-100">
          <span className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            Cấp cứu 24/7: <strong className="text-white font-bold tracking-wider">(028) 3855 5727</strong>
          </span>
          <span className="hidden lg:inline text-emerald-200/50">•</span>
          <span className="hidden lg:inline text-white">466 Nguyễn Trãi, P.8, Q.5, TP.HCM</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo & Tên Bệnh Viện Quân Y */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image
              src="/logo.png"
              alt="Logo Bệnh viện Quân y 7A"
              width={48}
              height={48}
              className="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              priority
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] tracking-tight text-[#02633c] group-hover:text-[#01472a] transition-colors">
                  BỆNH VIỆN QUÂN Y 7A
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Hệ thống Tiếp nhận Ý kiến & Khảo sát Hài lòng</p>
            </div>
          </Link>

          {/* Menu Điều Hướng Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                pathname === '/'
                  ? 'text-[#02633c] bg-emerald-50/80 font-bold border border-[#02633c]/30'
                  : 'text-slate-600 hover:text-[#02633c] hover:bg-slate-100/70'
              }`}
            >
              Trang Chủ
            </Link>

            <Link
              href="/reviews"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                pathname === '/reviews'
                  ? 'text-[#02633c] bg-emerald-50/80 font-bold border border-[#02633c]/30'
                  : 'text-slate-600 hover:text-[#02633c] hover:bg-slate-100/70'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Đánh Giá Công Khai
            </Link>

            <Link
              href="/feedback"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                pathname === '/feedback'
                  ? 'text-[#02633c] bg-emerald-50/80 font-bold border border-[#02633c]/30'
                  : 'text-slate-600 hover:text-[#02633c] hover:bg-slate-100/70'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4 text-[#02633c]" />
              Gửi Đánh Giá
            </Link>



            {/* Mục Role Riêng Biệt */}
            {currentUser?.role === 'patient' && (
              <Link
                href="/portal/patient"
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-semibold ${
                  pathname.startsWith('/portal/patient')
                    ? 'text-[#1b4332] bg-emerald-50/80 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <FileText className="w-4 h-4 text-[#2d6a4f]" />
                Lịch Sử Của Tôi
              </Link>
            )}

            {currentUser?.role === 'staff' && (
              <Link
                href="/portal/staff"
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  pathname.startsWith('/portal/staff')
                    ? 'text-teal-900 bg-teal-50 font-bold border border-teal-200'
                    : 'text-teal-800 hover:bg-teal-50/60'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-teal-700" />
                Hộp Thư Bác Sĩ / Khoa
              </Link>
            )}

            {currentUser?.role === 'admin' && (
              <Link
                href="/portal/admin"
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  pathname.startsWith('/portal/admin')
                    ? 'text-purple-900 bg-purple-50 font-bold border border-purple-200'
                    : 'text-purple-800 hover:bg-purple-50/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-700" />
                Dashboard Ban Giám Đốc
              </Link>
            )}
          </nav>

          {/* Cụm Đăng Nhập / Đăng Ký / Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-emerald-600/40 hover:bg-emerald-50/40 transition"
                >
                  <Image
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-700/40"
                    unoptimized
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold leading-none text-slate-800">
                      {currentUser.name.length > 15 ? currentUser.name.slice(0, 13) + '...' : currentUser.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium capitalize mt-0.5">
                      {currentUser.role === 'admin' ? 'Ban Giám Đốc' : currentUser.role === 'staff' ? 'Bác sĩ / Khoa' : 'Bệnh nhân'}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  title="Đăng xuất khỏi hệ thống"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-[#02633c] hover:bg-[#01472a] text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-emerald-300" />
                  Đăng Nhập Quản Trị
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100"
          >
            Trang Chủ
          </Link>
          <Link
            href="/reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100"
          >
            Đánh Giá Công Khai
          </Link>
          <Link
            href="/feedback"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100"
          >
            Gửi Đánh Giá
          </Link>

          {currentUser?.role === 'admin' && (
            <Link
              href="/portal/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-purple-800 hover:bg-purple-50"
            >
              Dashboard Ban Giám Đốc
            </Link>
          )}

          {currentUser?.role === 'staff' && (
            <Link
              href="/portal/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-teal-800 hover:bg-teal-50"
            >
              Hộp Thư Bác Sĩ / Khoa
            </Link>
          )}

          {currentUser?.role === 'patient' && (
            <Link
              href="/portal/patient"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#1b4332] hover:bg-emerald-50"
            >
              Lịch Sử Đánh Giá Của Tôi
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#02633c] text-white border-t border-[#01472a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-sm overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Bệnh viện Quân y 7A"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base text-white tracking-wide">
                BỆNH VIỆN QUÂN Y 7A
              </span>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
              Bệnh viện Đa khoa Hạng 1 Quân đội, luôn hướng tới sự hài lòng của bộ đội và nhân dân, không ngừng cải tiến y đức, chuyên môn nghiệp vụ và tác phong phục vụ.
            </p>
            <div className="text-xs text-emerald-100 space-y-1.5 pt-1">
              <p>📍 <strong>Địa chỉ:</strong> 466 Nguyễn Trãi, Phường 8, Quận 5, TP. Hồ Chí Minh</p>
              <p>📞 <strong>Cấp cứu 24/7:</strong> (028) 3855 5727 - (028) 3923 6055</p>
              <p>✉️ <strong>Hòm thư tiếp nhận:</strong> phanhoi@benhvien7a.vn</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs tracking-wider uppercase">Chuyên Mục</h4>
            <ul className="space-y-2 text-xs text-white/90">
              <li><Link href="/feedback" className="hover:text-white hover:underline transition">Khảo sát ý kiến bệnh nhân</Link></li>
              <li><Link href="/reviews" className="hover:text-white hover:underline transition">Xem nhận xét công khai</Link></li>
              <li><Link href="/portal/staff" className="hover:text-white hover:underline transition">Cổng Bác sĩ & Khoa phòng</Link></li>
              <li><Link href="/portal/admin" className="hover:text-white hover:underline transition">Dashboard Ban Giám Đốc</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs tracking-wider uppercase">Tiêu Chuẩn Đánh Giá</h4>
            <p className="text-xs text-white/90 leading-relaxed font-normal">
              Dựa trên bộ tiêu chí chất lượng bệnh viện Việt Nam do Bộ Y tế và Bộ Quốc phòng ban hành, mọi đánh giá đều được xử lý công tâm, bảo mật thông tin tuyệt đối.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-white font-semibold bg-[#01472a] px-3 py-1.5 rounded-lg border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Bảo mật danh tính bệnh nhân 100%
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center text-xs text-emerald-100 font-light">
          © 2026 Bệnh viện Quân y 7A. Cục Hậu cần Quân khu 7.
        </div>
      </div>
    </footer>
  );
}
