'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  PhoneCall
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors">
      {/* Top Banner Quân Đội - Xanh Đậm Chuẩn Quân Y (#02633c) */}
      <div className="bg-[#02633c] text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-8 flex justify-between items-center font-normal tracking-wide">
        <div className="flex items-center gap-2 sm:gap-3 truncate mr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-bold text-white uppercase truncate whitespace-nowrap">
            BỆNH VIỆN QUÂN Y 7A
          </span>
          <span className="hidden md:inline text-emerald-200/50">|</span>
          <span className="hidden md:inline text-emerald-100 font-light truncate">
            Cổng Lắng Nghe & Đánh Giá Chất Lượng
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-emerald-100 shrink-0">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
            <span className="hidden xs:inline">Cấp cứu:</span> <strong className="text-white font-bold tracking-wider">(028) 3855 5727</strong>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-17 gap-2">
          {/* Logo & Tên Bệnh Viện Quân Y */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group min-w-0 shrink">
            <Image
              src="/logo.png"
              alt="Logo Bệnh viện Quân y 7A"
              width={430}
              height={148}
              unoptimized
              className="h-9 sm:h-11 md:h-12 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
              priority
            />
            <div className="min-w-0">
              <span className="font-extrabold text-sm sm:text-base md:text-[17px] tracking-tight text-[#02633c] group-hover:text-[#01472a] transition-colors whitespace-nowrap block truncate">
                BỆNH VIỆN QUÂN Y 7A
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block truncate">
                Hệ thống Tiếp nhận Ý kiến & Khảo sát Hài lòng
              </p>
            </div>
          </Link>

          {/* Cụm Đăng Nhập / Profile */}
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
                      Quản Trị Viên
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
              pathname !== '/login' ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#02633c] hover:bg-[#01472a] text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  >
                    <LogIn className="w-4 h-4 text-emerald-300" />
                    <span>Đăng Nhập</span>
                  </Link>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
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
              <div className="h-10 w-auto px-2 py-1 rounded-lg bg-white flex items-center justify-center border border-white/20 shadow-sm shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Bệnh viện Quân y 7A"
                  width={430}
                  height={148}
                  unoptimized
                  className="h-full w-auto object-contain"
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
              <li><Link href="/portal/admin" className="hover:text-white hover:underline transition">Dashboard Quản Trị</Link></li>
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
