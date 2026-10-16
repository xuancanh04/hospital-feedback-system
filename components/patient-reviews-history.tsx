'use client';

import React, { useState, useMemo } from 'react';
import { Review, Department } from '@/types';
import {
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  Calendar,
  Building2,
  Star,
  ShieldCheck,
  User,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  History,
  FileText
} from 'lucide-react';

interface PatientReviewsHistoryProps {
  reviews: Review[];
  departments: Department[];
  onUpdateStatus?: (reviewId: string, status: any) => void;
}

export function PatientReviewsHistory({
  reviews,
  departments,
  onUpdateStatus,
}: PatientReviewsHistoryProps) {
  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [authFilter, setAuthFilter] = useState<'all' | 'verified' | 'anonymous'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal xem chi tiết bệnh nhân & đánh giá
  const [selectedPatientReview, setSelectedPatientReview] = useState<Review | null>(null);

  // Tách nội dung thẻ và lời nhắn
  const parseContent = (content: string) => {
    let tags: string[] = [];
    let comment = '';

    const tagMatch = content.match(/\[Đánh giá nhanh\]:\s*([^\n]+)/);
    if (tagMatch && tagMatch[1]) {
      tags = tagMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
    }

    const commentMatch = content.match(/\[Ý kiến thêm\]:\s*([\s\S]+)/);
    if (commentMatch && commentMatch[1]) {
      comment = commentMatch[1].trim();
    } else if (!tagMatch) {
      comment = content.trim();
    }

    return { tags, comment };
  };

  // Lọc và sắp xếp danh sách
  const filteredReviews = useMemo(() => {
    const now = new Date();

    return reviews
      .filter((r) => {
        // 1. Khoa phòng
        if (deptFilter !== 'all' && r.departmentId !== deptFilter) return false;

        // 2. Số sao
        if (ratingFilter !== 'all' && r.overallRating !== ratingFilter) return false;

        // 3. Nguồn xác thực thẻ
        if (authFilter === 'verified' && !r.hasCardVerified && r.isAnonymous) return false;
        if (authFilter === 'anonymous' && (r.hasCardVerified || !r.isAnonymous)) return false;

        // 4. Thời gian
        if (timeFilter !== 'all') {
          const revDate = new Date(r.createdAt || r.visitDate || now);
          const diffHours = (now.getTime() - revDate.getTime()) / (1000 * 3600);
          if (timeFilter === 'today' && diffHours > 24) return false;
          if (timeFilter === '7days' && diffHours > 24 * 7) return false;
          if (timeFilter === '30days' && diffHours > 24 * 30) return false;
        }

        // 5. Từ khóa tìm kiếm
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = r.userName?.toLowerCase().includes(q);
          const matchDept = r.departmentName?.toLowerCase().includes(q);
          const matchCard = r.cardNumber?.toLowerCase().includes(q);
          const matchContent = r.content?.toLowerCase().includes(q);
          const matchAddress = r.patientAddress?.toLowerCase().includes(q);
          if (!matchName && !matchDept && !matchCard && !matchContent && !matchAddress) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || b.visitDate).getTime() - new Date(a.createdAt || a.visitDate).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || a.visitDate).getTime() - new Date(b.createdAt || b.visitDate).getTime();
        }
        if (sortBy === 'highest') {
          return b.overallRating - a.overallRating;
        }
        if (sortBy === 'lowest') {
          return a.overallRating - b.overallRating;
        }
        return 0;
      });
  }, [reviews, deptFilter, ratingFilter, authFilter, timeFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedReviews = filteredReviews.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Xuất file CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã Đánh Giá',
      'Họ Tên Người Bệnh',
      'Xác Thực',
      'Loại Thẻ',
      'Số Thẻ',
      'Ngày Sinh',
      'Giới Tính',
      'Địa Chỉ',
      'Khoa Phòng',
      'Số Sao',
      'Thái Độ',
      'Cơ Sở',
      'Thời Gian Chờ',
      'Viện Phí',
      'Tiêu Chí Đã Chọn',
      'Góp Ý Thêm',
      'Ngày Khảo Sát'
    ];

    const rows = filteredReviews.map((r) => {
      const parsed = parseContent(r.content || '');
      const isVer = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
      return [
        `"${r.id}"`,
        `"${r.userName}"`,
        `"${isVer ? 'Đã xác thực' : 'Ẩn danh'}"`,
        `"${r.cardType || ''}"`,
        `"${r.cardNumber || ''}"`,
        `"${r.patientDob || ''}"`,
        `"${r.patientGender || ''}"`,
        `"${r.patientAddress || ''}"`,
        `"${r.departmentName}"`,
        r.overallRating,
        r.criteria?.serviceAttitude || r.overallRating,
        r.criteria?.facilities || r.overallRating,
        r.criteria?.waitTime || r.overallRating,
        r.criteria?.costTransparency || r.overallRating,
        `"${parsed.tags.join('; ')}"`,
        `"${parsed.comment.replace(/"/g, '""')}"`,
        `"${new Date(r.createdAt || r.visitDate).toLocaleString('vi-VN')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lich_Su_Danh_Gia_Benh_Nhan_BV7A_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ---------------------------------------------------------------------
          THANH TÌM KIẾM, BỘ LỌC & NÚT XUẤT DỮ LIỆU
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                <History className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">
                Bảng Lịch Sử Đánh Giá Của Bệnh Nhân
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Ghi nhận toàn bộ lượt phản hồi, hồ sơ thẻ CCCD/BHYT và mức độ hài lòng theo thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel / CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 cursor-pointer transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Danh Sách</span>
            </button>
          </div>
        </div>

        {/* Thanh công cụ tìm kiếm và lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Ô tìm kiếm */}
          <div className="sm:col-span-2 relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Tìm kiếm:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tên người bệnh, số thẻ CCCD, khoa phòng, nội dung..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lọc theo khoa phòng */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Khoa Phòng:
            </label>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none truncate"
            >
              <option value="all">Tất cả khoa phòng ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo số sao */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Mức Đánh Giá:
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Tất cả mức sao</option>
              <option value="5">★ 5 Sao (Rất tốt)</option>
              <option value="4">★ 4 Sao (Hài lòng)</option>
              <option value="3">★ 3 Sao (Bình thường)</option>
              <option value="2">★ 2 Sao (Chưa hài lòng)</option>
              <option value="1">★ 1 Sao (Thất vọng)</option>
            </select>
          </div>

          {/* Lọc nguồn xác thực */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Loại Đối Tượng:
            </label>
            <select
              value={authFilter}
              onChange={(e) => {
                setAuthFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Tất cả đối tượng</option>
              <option value="verified">Đã quét CCCD / BHYT</option>
              <option value="anonymous">Đánh giá ẩn danh</option>
            </select>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------------------
          BẢNG LỊCH SỬ ĐÁNH GIÁ (DESKTOP & MOBILE RESPONSIVE)
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        
        {/* Header bảng */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">
              Tổng số lượt đánh giá:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-xs">
              {filteredReviews.length} lượt
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold outline-none"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="highest">Sao cao nhất</option>
              <option value="lowest">Sao thấp nhất</option>
            </select>
          </div>
        </div>

        {/* Chế độ xem Mobile (Card view) */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-zinc-800">
          {pagedReviews.map((r) => {
            const parsed = parseContent(r.content || '');
            const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
            return (
              <div
                key={r.id}
                onClick={() => setSelectedPatientReview(r)}
                className="p-4 space-y-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {r.userName?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {r.userName || 'Bệnh nhân'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.id} • {new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-xs ${
                    r.overallRating >= 4
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : r.overallRating === 3
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{r.overallRating}.0</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    Khoa: {r.departmentName}
                  </span>
                  <span>•</span>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{r.cardType?.toUpperCase()}: {r.cardNumber || 'Đã xác thực'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Ẩn danh</span>
                  )}
                </div>

                {parsed.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {parsed.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300 font-medium">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                )}

                {parsed.comment && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                    &ldquo;{parsed.comment}&rdquo;
                  </p>
                )}

                <div className="pt-1 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết bệnh nhân</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chế độ xem Desktop (Bảng đầy đủ) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                <th className="py-3 px-3 w-10 text-center">STT</th>
                <th className="py-3 px-3">Người Bệnh</th>
                <th className="py-3 px-3">Định Danh / Thẻ</th>
                <th className="py-3 px-3">Khoa Phòng Tiếp Nhận</th>
                <th className="py-3 px-3 text-center">Đánh Giá</th>
                <th className="py-3 px-3 text-center">Thái Độ</th>
                <th className="py-3 px-3 text-center">Cơ Sở</th>
                <th className="py-3 px-3 text-center">Chờ Đợi</th>
                <th className="py-3 px-3 text-center">Viện Phí</th>
                <th className="py-3 px-4">Tiêu Chí & Lời Nhắn</th>
                <th className="py-3 px-3 text-center">Ngày Khảo Sát</th>
                <th className="py-3 px-3 text-center w-24">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {pagedReviews.map((r, idx) => {
                const parsed = parseContent(r.content || '');
                const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedPatientReview(r)}
                    className="hover:bg-teal-50/40 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-center font-bold text-slate-400 text-[11px]">
                      {(safeCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {r.userName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-zinc-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors block font-bold">
                            {r.userName || 'Bệnh nhân'}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {r.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {isVerified ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/60">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{(r.cardType || 'Thẻ').toUpperCase()}</span>
                          </span>
                          {r.cardNumber && (
                            <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 block mt-0.5">
                              {r.cardNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] font-medium">
                          Ẩn danh
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold block">
                        {r.departmentName}
                      </strong>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                        r.overallRating >= 4
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.overallRating === 3
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        <Star className="w-3 h-3 fill-current" />
                        <span>{r.overallRating}.0</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-semibold text-emerald-600">
                      ★ {r.criteria?.serviceAttitude || r.overallRating}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-blue-600">
                      ★ {r.criteria?.facilities || r.overallRating}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-amber-600">
                      ★ {r.criteria?.waitTime || r.overallRating}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-purple-600">
                      ★ {r.criteria?.costTransparency || r.overallRating}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      {parsed.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {parsed.tags.slice(0, 2).map((t) => (
                            <span key={t} className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded text-[10px] truncate max-w-[130px]">
                              {t}
                            </span>
                          ))}
                          {parsed.tags.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{parsed.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      {parsed.comment && (
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-1 italic">
                          &ldquo;{parsed.comment}&rdquo;
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatientReview(r);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Hiển thị {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredReviews.length)} trong tổng số {filteredReviews.length} lượt đánh giá
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold"
              >
                Trước
              </button>
              <span className="px-2 font-bold text-slate-800 dark:text-zinc-200">
                Trang {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold"
              >
                Sau
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ---------------------------------------------------------------------
          MODAL XEM CHI TIẾT HỒ SƠ BỆNH NHÂN & PHIẾU ĐÁNH GIÁ TOÀN DIỆN
      --------------------------------------------------------------------- */}
      {selectedPatientReview && (() => {
        const r = selectedPatientReview;
        const parsed = parseContent(r.content || '');
        const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);

        // Đếm tổng số lần bệnh nhân này từng gửi đánh giá trong toàn hệ thống
        const patientReviewsHistory = reviews.filter((rev) => {
          if (r.cardNumber && rev.cardNumber === r.cardNumber) return true;
          if (r.userId && rev.userId === r.userId) return true;
          return false;
        });

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
              
              {/* Header Modal */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-teal-800 text-white">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                    <User className="w-5 h-5 text-white" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                      Hồ Sơ Chi Tiết Người Bệnh & Phiếu Đánh Giá
                    </h3>
                    <span className="text-xs text-teal-100 font-mono">
                      Mã phiếu: {r.id} • Ngày: {new Date(r.createdAt || r.visitDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientReview(null)}
                  className="p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal (Cuộn được) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* THẺ 1: HỒ SƠ ĐỊNH DANH NGƯỜI BỆNH */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-600" />
                      <span>Thông Tin Định Danh & Thẻ Bảo Hiểm / CCCD:</span>
                    </span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ĐÃ QUÉT THẺ {(r.cardType || 'CHIP').toUpperCase()}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-[11px]">
                        Khảo sát ẩn danh tại Kiosk
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Họ và tên người bệnh:</span>
                      <strong className="text-slate-900 dark:text-zinc-100 text-sm font-extrabold">
                        {r.userName || 'Bệnh nhân ẩn danh'}
                      </strong>
                    </div>

                    {r.cardNumber && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Số thẻ {r.cardType?.toUpperCase()}:</span>
                        <strong className="font-mono text-sm text-teal-700 dark:text-teal-400 font-bold">
                          {r.cardNumber}
                        </strong>
                      </div>
                    )}

                    {r.patientDob && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ngày sinh:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{r.patientDob}</span>
                      </div>
                    )}

                    {r.patientGender && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Giới tính:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{r.patientGender}</span>
                      </div>
                    )}

                    {r.patientAddress && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Địa chỉ cư trú / Quê quán:</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{r.patientAddress}</span>
                      </div>
                    )}

                    <div className="sm:col-span-2 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Lịch sử đóng góp ý kiến:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        Đã thực hiện {patientReviewsHistory.length} lượt khảo sát tại BV
                      </span>
                    </div>
                  </div>
                </div>

                {/* THẺ 2: CHI TIẾT KHÁM & ĐÁNH GIÁ CHẤT LƯỢNG */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Khoa phòng tiếp nhận đánh giá:</span>
                      <strong className="text-base text-slate-900 dark:text-zinc-100 font-black">
                        {r.departmentName}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Điểm tổng thể:</span>
                      <span className="inline-flex items-center gap-1 text-amber-500 font-black text-lg">
                        <Star className="w-5 h-5 fill-current" />
                        <span>{r.overallRating}.0 / 5.0</span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Tiêu chí cốt lõi */}
                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider block">
                      Chi Tiết 4 Trụ Cột Đánh Giá (Bộ Y Tế):
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400">1. Thái độ phục vụ:</span>
                        <span className="font-extrabold text-emerald-600 text-sm">★ {r.criteria?.serviceAttitude || r.overallRating}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400">2. Cơ sở vật chất:</span>
                        <span className="font-extrabold text-blue-600 text-sm">★ {r.criteria?.facilities || r.overallRating}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400">3. Thời gian chờ đợi:</span>
                        <span className="font-extrabold text-amber-600 text-sm">★ {r.criteria?.waitTime || r.overallRating}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400">4. Minh bạch viện phí:</span>
                        <span className="font-extrabold text-purple-600 text-sm">★ {r.criteria?.costTransparency || r.overallRating}</span>
                      </div>

                    </div>
                  </div>

                  {/* Danh sách thẻ tiêu chí đã chọn */}
                  {parsed.tags.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider block mb-1.5">
                        Các Tiêu Chí Chọn Nhanh ({parsed.tags.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 font-bold text-xs"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lời nhắn / ý kiến góp ý thêm */}
                  {parsed.comment && (
                    <div className="pt-2">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider block mb-1.5">
                        Ý Kiến Góp Ý Thêm Của Người Bệnh:
                      </span>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {parsed.comment}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/30">
                <span className="text-[11px] text-slate-400">
                  Dữ liệu trích xuất từ CSDL Bệnh viện Quân y 7A
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Phiếu Này</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPatientReview(null)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Đóng Lại
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
