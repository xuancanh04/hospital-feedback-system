'use client';

import React, { useState, useMemo } from 'react';
import { Review, Department } from '@/types';
import {
  Award,
  Search,
  Eye,
  Calendar,
  Layers,
  ChevronDown,
  Download,
  X,
} from 'lucide-react';

interface DepartmentRankItem {
  id: string;
  code: string;
  name: string;
  category: 'noi' | 'ngoai' | 'canlamsang';
  rating: number;
  service: number;
  facilities: number;
  waitTime: number;
  cost: number;
  reviews: number;
  csat: number;
  note?: string;
  rank: number;
}

interface DepartmentRankingViewProps {
  departments: Department[];
  reviews: Review[];
  getDeptCategory: (d: { category?: string; name: string; code?: string }) => 'noi' | 'ngoai' | 'canlamsang';
  onNavigateToReviews?: (deptId?: string) => void;
}

export function DepartmentRankingView({
  departments,
  reviews,
  getDeptCategory,
  onNavigateToReviews,
}: DepartmentRankingViewProps) {
  const [rankingTab, setRankingTab] = useState<'all' | 'top' | 'needs_attention'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'noi' | 'ngoai' | 'canlamsang'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days' | 'quarter' | 'year'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<DepartmentRankItem | null>(null);

  // Lọc reviews theo thời gian
  const filteredReviews = useMemo(() => {
    const now = new Date();
    return reviews.filter((r) => {
      if (timeFilter !== 'all') {
        const revDate = new Date(r.createdAt || r.visitDate || now);
        const diffDays = (now.getTime() - revDate.getTime()) / (1000 * 3600 * 24);
        if (timeFilter === '7days' && diffDays > 7) return false;
        if (timeFilter === '30days' && diffDays > 30) return false;
        if (timeFilter === 'quarter' && diffDays > 90) return false;
        if (timeFilter === 'year' && diffDays > 365) return false;
      }
      return true;
    });
  }, [reviews, timeFilter]);

  // Tính toán hiệu suất xếp hạng cho tất cả các khoa
  const rankingData = useMemo(() => {
    const list = departments.map((d) => {
      const dRev = filteredReviews.filter((r) => r.departmentId === d.id);
      const count = dRev.length;

      let avg = 5.0;
      let service = 5.0;
      let facilities = 5.0;
      let waitTime = 5.0;
      let cost = 5.0;
      let positive = 0;

      if (count > 0) {
        avg = parseFloat((dRev.reduce((sum, r) => sum + r.overallRating, 0) / count).toFixed(1));
        service = parseFloat((dRev.reduce((sum, r) => sum + (r.criteria?.serviceAttitude || r.overallRating), 0) / count).toFixed(1));
        facilities = parseFloat((dRev.reduce((sum, r) => sum + (r.criteria?.facilities || r.overallRating), 0) / count).toFixed(1));
        waitTime = parseFloat((dRev.reduce((sum, r) => sum + (r.criteria?.waitTime || r.overallRating), 0) / count).toFixed(1));
        cost = parseFloat((dRev.reduce((sum, r) => sum + (r.criteria?.costTransparency || r.overallRating), 0) / count).toFixed(1));
        positive = dRev.filter((r) => r.overallRating >= 4).length;
      } else {
        avg = d.averageRating || 4.8;
      }

      const csat = count > 0 ? Math.round((positive / count) * 100) : 100;

      return {
        id: d.id,
        code: d.code,
        name: d.name,
        category: getDeptCategory(d),
        rating: avg,
        service,
        facilities,
        waitTime,
        cost,
        reviews: count,
        csat,
        note: d.note,
      };
    });

    // Sắp xếp điểm TB từ cao xuống thấp
    list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

    // Gán thứ hạng
    const rankedList = list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return rankedList;
  }, [departments, filteredReviews, getDeptCategory]);

  // Danh sách hiển thị sau khi lọc tab, khối và từ khóa tìm kiếm
  const displayList = useMemo(() => {
    let result = [...rankingData];

    if (categoryFilter !== 'all') {
      result = result.filter((d) => d.category === categoryFilter);
    }

    if (rankingTab === 'top') {
      result = result.slice(0, 5);
    } else if (rankingTab === 'needs_attention') {
      result = result.filter((d) => d.rating < 4.6 || d.waitTime < 4.2);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.note && d.note.toLowerCase().includes(q))
      );
    }

    return result;
  }, [rankingData, categoryFilter, rankingTab, searchQuery]);

  // Thống kê nhanh
  const totalDepts = departments.length;
  const excellentCount = rankingData.filter((d) => d.rating >= 4.8).length;
  const goodCount = rankingData.filter((d) => d.rating >= 4.5 && d.rating < 4.8).length;
  const attentionCount = rankingData.filter((d) => d.rating < 4.5).length;

  const handleExportCSV = () => {
    const headers = [
      'Thứ Hạng',
      'Mã Khoa',
      'Tên Khoa Phòng',
      'Khối Chuyên Môn',
      'Điểm TB',
      'Thái Độ',
      'Cơ Sở Vật Chất',
      'Thời Gian Chờ',
      'Minh Bạch Chi Phí',
      'Tỷ Lệ CSAT (%)',
      'Số Lượt Khảo Sát',
      'Xếp Loại'
    ];

    const rows = displayList.map((d) => {
      const catText = d.category === 'ngoai' ? 'Ngoại Khoa' : d.category === 'canlamsang' ? 'Cận Lâm Sàng' : 'Nội Khoa';
      const rankTier = d.rating >= 4.8 ? 'Xuất sắc' : d.rating >= 4.5 ? 'Tốt' : d.rating >= 4.0 ? 'Đạt chuẩn' : 'Cần chấn chỉnh';
      return [
        d.rank,
        `"${d.code}"`,
        `"${d.name}"`,
        `"${catText}"`,
        d.rating.toFixed(1),
        d.service.toFixed(1),
        d.facilities.toFixed(1),
        d.waitTime.toFixed(1),
        d.cost.toFixed(1),
        `${d.csat}%`,
        d.reviews,
        `"${rankTier}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Xep_Hang_Khoa_Phong_BV7A_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* 4 Thẻ chỉ số tổng quan xếp hạng */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tổng Khoa Phòng</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalDepts}</div>
          <div className="text-xs text-slate-500 mt-1">100% kết nối Kiosk</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Hạng Xuất Sắc (≥4.8★)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{excellentCount}</div>
          <div className="text-xs text-slate-500 mt-1">Dẫn đầu chất lượng</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">Hạng Tốt (4.5 - 4.7★)</span>
          <div className="text-2xl font-black text-teal-600 mt-1">{goodCount}</div>
          <div className="text-xs text-slate-500 mt-1">Đạt chuẩn Bộ Y tế</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Cần Chú Ý (&lt;4.5★)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{attentionCount}</div>
          <div className="text-xs text-slate-500 mt-1">Cần cải thiện khâu chờ</div>
        </div>
      </div>

      {/* Thanh công cụ lọc & tìm kiếm đặt trực tiếp trên nền trang */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Bộ lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          {/* Tìm kiếm */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã khoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-2xs"
            />
          </div>

          {/* Lọc khối */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'noi' | 'ngoai' | 'canlamsang')}
              className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
            >
              <option value="all">Khối: Tất cả các khối</option>
              <option value="noi">Khối: Nội Khoa</option>
              <option value="ngoai">Khối: Ngoại & Phẫu Thuật</option>
              <option value="canlamsang">Khối: Cận Lâm Sàng & Dược</option>
            </select>
            <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc thời gian */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as 'all' | '7days' | '30days' | 'quarter' | 'year')}
              className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
            >
              <option value="all">Thời gian: Toàn bộ</option>
              <option value="7days">Thời gian: 7 ngày qua</option>
              <option value="30days">Thời gian: 30 ngày qua</option>
              <option value="quarter">Thời gian: Quý này (3T)</option>
              <option value="year">Thời gian: Năm 2026</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tab phân loại và nút xuất báo cáo */}
        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => setRankingTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                rankingTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Tất Cả ({departments.length})
            </button>
            <button
              type="button"
              onClick={() => setRankingTab('top')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                rankingTab === 'top'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Top 5 Tiêu Biểu
            </button>
            <button
              type="button"
              onClick={() => setRankingTab('needs_attention')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                rankingTab === 'needs_attention'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Cần Cải Thiện
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs cursor-pointer transition active:scale-95"
            title="Xuất bảng xếp hạng ra file Excel (.CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Bảng xếp hạng chi tiết */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                <th className="py-3 px-3 w-14 text-center">Hạng</th>
                <th className="py-3 px-3 w-20 text-center">Mã Khoa</th>
                <th className="py-3 px-4">Tên Khoa Phòng</th>
                <th className="py-3 px-3 text-center">Khối</th>
                <th className="py-3 px-3 text-center font-bold text-amber-600">Điểm TB</th>
                <th className="py-3 px-3 text-center">Thái Độ</th>
                <th className="py-3 px-3 text-center">Cơ Sở</th>
                <th className="py-3 px-3 text-center">Thời Gian</th>
                <th className="py-3 px-3 text-center">Viện Phí</th>
                <th className="py-3 px-3 text-center">CSAT</th>
                <th className="py-3 px-3 text-center">Lượt</th>
                <th className="py-3 px-3 text-center">Xếp Loại</th>
                <th className="py-3 px-3 text-center w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {displayList.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 px-3 text-center font-bold">
                    {d.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs shadow-2xs">
                        1
                      </span>
                    ) : d.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs">
                        2
                      </span>
                    ) : d.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">#{d.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700">
                      {d.code}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 block">{d.name}</span>
                    {d.note && (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block line-clamp-1">
                        • {d.note}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">
                      {d.category === 'ngoai' ? 'Ngoại' : d.category === 'canlamsang' ? 'CLS' : 'Nội'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="font-extrabold text-amber-500 text-xs">★ {d.rating.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-emerald-600">{d.service.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-semibold text-blue-600">{d.facilities.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-semibold text-amber-600">{d.waitTime.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-semibold text-purple-600">{d.cost.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-bold text-teal-600">{d.csat}%</td>
                  <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400">{d.reviews}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        d.rating >= 4.8
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : d.rating >= 4.5
                          ? 'bg-teal-100 text-teal-800 border border-teal-200/60 dark:bg-teal-950/60 dark:text-teal-300'
                          : d.rating >= 4.0
                          ? 'bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {d.rating >= 4.8
                        ? 'Xuất sắc'
                        : d.rating >= 4.5
                        ? 'Tốt'
                        : d.rating >= 4.0
                        ? 'Đạt chuẩn'
                        : 'Cần chấn chỉnh'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onNavigateToReviews && onNavigateToReviews(d.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200/60 dark:border-teal-800 transition shadow-2xs cursor-pointer active:scale-95"
                      title={`Xem danh sách các lượt đánh giá của ${d.name}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Modal xem chi tiết 4 tiêu chí của khoa */}
      {selectedDeptDetail && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedDeptDetail(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full max-w-lg h-full shadow-2xl border-l border-slate-200/80 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Hồ Sơ Xếp Hạng Chất Lượng
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khoa {selectedDeptDetail.name} ({selectedDeptDetail.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeptDetail(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Thứ Hạng Hiện Tại</span>
                  <span className="font-black text-amber-600 text-base">Hạng #{selectedDeptDetail.rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Điểm Đánh Giá Trung Bình</span>
                  <span className="font-black text-amber-500 text-base">★ {selectedDeptDetail.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Tỷ Lệ Hài Lòng (CSAT)</span>
                  <span className="font-bold text-teal-600 text-sm">{selectedDeptDetail.csat}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Tổng Số Lượt Khảo Sát</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedDeptDetail.reviews} lượt</span>
                </div>
              </div>

              {/* 4 Trụ Cột Bộ Y Tế */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Chi Tiết 4 Trụ Cột Chất Lượng:
                </h4>

                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>1. Thái độ phục vụ & Y đức</span>
                    <span className="text-emerald-600 font-bold">★ {selectedDeptDetail.service.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(selectedDeptDetail.service / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>2. Cơ sở vật chất & Buồng bệnh</span>
                    <span className="text-blue-600 font-bold">★ {selectedDeptDetail.facilities.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${(selectedDeptDetail.facilities / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>3. Thời gian chờ đợi</span>
                    <span className="text-amber-600 font-bold">★ {selectedDeptDetail.waitTime.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${(selectedDeptDetail.waitTime / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>4. Minh bạch viện phí & BHYT</span>
                    <span className="text-purple-600 font-bold">★ {selectedDeptDetail.cost.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${(selectedDeptDetail.cost / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-zinc-900/50">
              {onNavigateToReviews && (
                <button
                  type="button"
                  onClick={() => {
                    const deptId = selectedDeptDetail.id;
                    setSelectedDeptDetail(null);
                    onNavigateToReviews(deptId);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-2xs"
                >
                  Xem Nhật Ký Đánh Giá Khoa Này
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDeptDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
