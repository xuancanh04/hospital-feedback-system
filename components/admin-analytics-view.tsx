'use client';

import React, { useState, useMemo } from 'react';
import { Review, Department } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Star,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Activity,
  X,
  User,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

interface AdminAnalyticsViewProps {
  reviews: Review[];
  departments: Department[];
  getDeptCategory: (d: { category?: string; name: string; code?: string }) => 'noi' | 'ngoai' | 'canlamsang';
  onNavigateToReviews?: () => void;
  onNavigateToRankings?: () => void;
}

export function AdminAnalyticsView({
  reviews,
  departments,
  getDeptCategory,
}: AdminAnalyticsViewProps) {
  // Bộ lọc thời gian và chuyên khoa
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days' | 'quarter' | 'year'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'noi' | 'ngoai' | 'canlamsang'>('all');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<'all' | 'verified' | 'anonymous'>('all');
  // State mở modal chi tiết cho từng thẻ KPI tổng quan
  const [activeKpiModal, setActiveKpiModal] = useState<'total' | 'rating' | 'csat' | 'verified' | null>(null);



  // Lọc danh sách reviews dựa trên các điều kiện
  const filteredReviews = useMemo(() => {
    const now = new Date();
    return reviews.filter((r) => {
      // 1. Lọc thời gian
      if (timeFilter !== 'all') {
        const revDate = new Date(r.createdAt || r.visitDate || now);
        const diffDays = (now.getTime() - revDate.getTime()) / (1000 * 3600 * 24);
        if (timeFilter === '7days' && diffDays > 7) return false;
        if (timeFilter === '30days' && diffDays > 30) return false;
        if (timeFilter === 'quarter' && diffDays > 90) return false;
        if (timeFilter === 'year' && diffDays > 365) return false;
      }

      // 2. Lọc khoa phòng cụ thể
      if (selectedDeptId !== 'all' && r.departmentId !== selectedDeptId) {
        return false;
      }

      // 3. Lọc theo khối chuyên môn (nếu chưa chọn khoa cụ thể)
      if (selectedDeptId === 'all' && categoryFilter !== 'all') {
        const dept = departments.find((d) => d.id === r.departmentId);
        if (!dept || getDeptCategory(dept) !== categoryFilter) {
          return false;
        }
      }

      // 4. Lọc theo nguồn xác thực thẻ
      if (cardFilter === 'verified' && !r.hasCardVerified && r.isAnonymous) return false;
      if (cardFilter === 'anonymous' && (r.hasCardVerified || !r.isAnonymous)) return false;

      return true;
    });
  }, [reviews, departments, timeFilter, categoryFilter, selectedDeptId, cardFilter, getDeptCategory]);

  // Các chỉ số KPI tổng quan
  const totalRev = filteredReviews.length;
  const verifiedCount = filteredReviews.filter((r) => r.hasCardVerified || !r.isAnonymous).length;
  const verifiedRate = totalRev > 0 ? Math.round((verifiedCount / totalRev) * 100) : 0;

  const avgRating = totalRev > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalRev).toFixed(2)
    : '0.00';

  const positiveReviews = filteredReviews.filter((r) => r.overallRating >= 4).length;
  const csatScore = totalRev > 0 ? Math.round((positiveReviews / totalRev) * 100) : 0;

  // 4 Tiêu chí cốt lõi của Bộ Y Tế
  const criteriaStats = useMemo(() => {
    if (totalRev === 0) {
      return {
        serviceAttitude: '0.0',
        facilities: '0.0',
        waitTime: '0.0',
        costTransparency: '0.0',
        lowestKey: 'waitTime',
      };
    }
    const sums = filteredReviews.reduce(
      (acc, r) => {
        acc.serviceAttitude += r.criteria?.serviceAttitude || r.overallRating;
        acc.facilities += r.criteria?.facilities || r.overallRating;
        acc.waitTime += r.criteria?.waitTime || r.overallRating;
        acc.costTransparency += r.criteria?.costTransparency || r.overallRating;
        return acc;
      },
      { serviceAttitude: 0, facilities: 0, waitTime: 0, costTransparency: 0 }
    );

    const scores = {
      serviceAttitude: (sums.serviceAttitude / totalRev).toFixed(1),
      facilities: (sums.facilities / totalRev).toFixed(1),
      waitTime: (sums.waitTime / totalRev).toFixed(1),
      costTransparency: (sums.costTransparency / totalRev).toFixed(1),
    };

    const entries = Object.entries(scores) as [string, string][];
    entries.sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));
    const lowestKey = entries[0][0];

    return { ...scores, lowestKey };
  }, [filteredReviews, totalRev]);

  // Dữ liệu phân bố số sao (1 đến 5)
  const ratingDistributionData = useMemo(() => {
    return [
      { name: '5 Sao', count: filteredReviews.filter((r) => r.overallRating === 5).length, fill: '#10b981' },
      { name: '4 Sao', count: filteredReviews.filter((r) => r.overallRating === 4).length, fill: '#0ea5e9' },
      { name: '3 Sao', count: filteredReviews.filter((r) => r.overallRating === 3).length, fill: '#f59e0b' },
      { name: '2 Sao', count: filteredReviews.filter((r) => r.overallRating === 2).length, fill: '#f97316' },
      { name: '1 Sao', count: filteredReviews.filter((r) => r.overallRating === 1).length, fill: '#ef4444' },
    ];
  }, [filteredReviews]);

  // Biểu đồ so sánh 4 tiêu chí
  const criteriaChartData = useMemo(() => {
    return [
      { name: 'Thái độ phục vụ', score: parseFloat(criteriaStats.serviceAttitude), fill: '#10b981' },
      { name: 'Cơ sở vật chất', score: parseFloat(criteriaStats.facilities), fill: '#0ea5e9' },
      { name: 'Thời gian chờ đợi', score: parseFloat(criteriaStats.waitTime), fill: '#f59e0b' },
      { name: 'Minh bạch viện phí', score: parseFloat(criteriaStats.costTransparency), fill: '#8b5cf6' },
    ];
  }, [criteriaStats]);

  // Phân tích thẻ đánh giá nhanh (Trích xuất từ trường content)
  const tagAnalytics = useMemo(() => {
    const praiseMap: Record<string, number> = {};
    const complaintMap: Record<string, number> = {};

    filteredReviews.forEach((r) => {
      if (!r.content) return;
      const match = r.content.match(/\[Đánh giá nhanh\]:\s*([^\n]+)/);
      if (match && match[1]) {
        const rawTags = match[1].split(',').map((t) => t.trim()).filter(Boolean);
        rawTags.forEach((tag) => {
          if (r.overallRating >= 4) {
            praiseMap[tag] = (praiseMap[tag] || 0) + 1;
          } else {
            complaintMap[tag] = (complaintMap[tag] || 0) + 1;
          }
        });
      }
    });

    const topPraises = Object.entries(praiseMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topComplaints = Object.entries(complaintMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topPraises, topComplaints };
  }, [filteredReviews]);



  // Trích xuất thẻ và lời nhắn từ content
  const parseReviewContent = (content: string) => {
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

  // Xuất file CSV báo cáo cho Excel (có BOM để hiển thị tiếng Việt UTF-8 chuẩn xác)
  const handleExportCSV = () => {
    const headers = [
      'Mã Đánh Giá',
      'Người Bệnh',
      'Loại Xác Thực',
      'Mã Thẻ (Nếu có)',
      'Khoa Phòng',
      'Số Sao Tổng',
      'Thái Độ Phục Vụ',
      'Cơ Sở Vật Chất',
      'Thời Gian Chờ',
      'Minh Bạch Viện Phí',
      'Tiêu Chí Chọn Nhanh',
      'Ý Kiến Đóng Góp',
      'Ngày Khảo Sát'
    ];

    const rows = filteredReviews.map((r) => {
      const parsed = parseReviewContent(r.content || '');
      const authType = r.hasCardVerified
        ? `Xác thực (${(r.cardType || 'Thẻ').toUpperCase()})`
        : r.isAnonymous
        ? 'Ẩn danh'
        : 'Người bệnh';

      return [
        `"${r.id}"`,
        `"${r.userName}"`,
        `"${authType}"`,
        `"${r.cardNumber || ''}"`,
        `"${r.departmentName}"`,
        r.overallRating,
        r.criteria?.serviceAttitude || r.overallRating,
        r.criteria?.facilities || r.overallRating,
        r.criteria?.waitTime || r.overallRating,
        r.criteria?.costTransparency || r.overallRating,
        `"${parsed.tags.join('; ')}"`,
        `"${parsed.comment.replace(/"/g, '""')}"`,
        `"${new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chi_Tiet_Danh_Gia_Benh_Nhan_BV7A_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 print:space-y-4">
      
      {/* ---------------------------------------------------------------------
          CỤM 4 THẺ KPI TỔNG THỂ (EXECUTIVE KPI CARDS) - CÓ THỂ NHẤN ĐỂ XEM CHI TIẾT
      --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Tổng lượt đánh giá */}
        <div 
          onClick={() => setActiveKpiModal('total')}
          className="relative overflow-hidden bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all duration-200 cursor-pointer group select-none"
          title="Nhấn để xem chi tiết phân bố lượt khảo sát"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Tổng Lượt Khảo Sát
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {totalRev.toLocaleString('vi-VN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Độ phủ:</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{departments.length} khoa phòng</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Điểm TB Toàn Diện */}
        <div 
          onClick={() => setActiveKpiModal('rating')}
          className="relative overflow-hidden bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-amber-500/50 transition-all duration-200 cursor-pointer group select-none"
          title="Nhấn để xem chi tiết cơ cấu điểm trung bình"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Điểm TB Toàn Diện
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-baseline gap-1.5">
                <span className="text-amber-500">{avgRating}</span>
                <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Đánh giá chung:</span>
            <span className={`font-semibold flex items-center gap-1.5 ${
              parseFloat(avgRating) >= 4.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${parseFloat(avgRating) >= 4.5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{parseFloat(avgRating) >= 4.5 ? 'Xuất sắc' : parseFloat(avgRating) >= 4.0 ? 'Đạt chuẩn' : 'Cần chấn chỉnh'}</span>
            </span>
          </div>
        </div>

        {/* KPI 3: Chỉ số CSAT */}
        <div 
          onClick={() => setActiveKpiModal('csat')}
          className="relative overflow-hidden bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-200 cursor-pointer group select-none"
          title="Nhấn để xem chi tiết tỷ lệ hài lòng"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Tỷ Lệ Hài Lòng (CSAT)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                {csatScore}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Mục tiêu Bộ Y tế:</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300">≥ 90%</span>
          </div>
        </div>

        {/* KPI 4: Tỷ lệ quét thẻ xác thực */}
        <div 
          onClick={() => setActiveKpiModal('verified')}
          className="relative overflow-hidden bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-blue-500/50 transition-all duration-200 cursor-pointer group select-none"
          title="Nhấn để xem chi tiết cơ cấu xác thực thẻ chip"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Xác Thực CCCD / BHYT
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight mt-1">
                {verifiedRate}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Đã quét chip:</span>
            <span className="font-semibold text-blue-700 dark:text-blue-300">{verifiedCount} lượt</span>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------------------------
          THANH BỘ LỌC TINH GỌN & NÚT THAO TÁC XUẤT BÁO CÁO (ĐẶT TRỰC TIẾP TRÊN NỀN)
      --------------------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 print:hidden">
        {/* Bộ chọn các tiêu chí lọc tinh gọn */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
          {/* Lọc theo thời gian */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value as 'all' | '7days' | '30days' | 'quarter' | 'year');
              }}
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

          {/* Lọc theo khối chuyên môn */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as 'all' | 'noi' | 'ngoai' | 'canlamsang');
                setSelectedDeptId('all');
              }}
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

          {/* Lọc theo từng khoa cụ thể */}
          <div className="relative">
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
              }}
              className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
            >
              <option value="all">Khoa: Tất cả 20 khoa</option>
              {departments
                .filter((d) => categoryFilter === 'all' || getDeptCategory(d) === categoryFilter)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc theo nguồn xác thực thẻ */}
          <div className="relative">
            <select
              value={cardFilter}
              onChange={(e) => {
                setCardFilter(e.target.value as 'all' | 'verified' | 'anonymous');
              }}
              className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
            >
              <option value="all">Nguồn: Tất cả khảo sát</option>
              <option value="verified">Nguồn: Quét CCCD/BHYT ({verifiedCount})</option>
              <option value="anonymous">Nguồn: Ẩn danh ({totalRev - verifiedCount})</option>
            </select>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Nút Xuất Excel & In Báo Cáo */}
        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs cursor-pointer transition active:scale-95"
            title="Xuất bảng số liệu ra file Excel (.CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200/80 dark:border-zinc-800 shadow-2xs cursor-pointer transition active:scale-95"
            title="In báo cáo tổng hợp A4"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          NỘI DUNG 4 TRỤ CỘT BỘ Y TẾ, BIỂU ĐỒ & TOP THẺ ĐÁNH GIÁ
      --------------------------------------------------------------------- */}
      <div className="space-y-5 animate-in fade-in duration-200">
        
        {/* PHÂN TÍCH 4 TIÊU CHÍ CỐT LÕI CỦA BỘ Y TẾ */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Chấm Điểm 4 Trụ Cột Chất Lượng Dịch Vụ Khám Chữa Bệnh</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Theo chuẩn Bộ Y tế: Thang điểm 5.0 • Càng cao thể hiện chất lượng phục vụ và sự hài lòng càng tốt
              </p>
            </div>
            {criteriaStats.lowestKey === 'waitTime' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60 text-xs font-semibold self-start sm:self-auto">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Thời gian chờ đợi cần chú trọng cải thiện</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Tiêu chí 1: Thái độ phục vụ */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">1. Thái độ & Y đức</span>
                <span className="font-black text-emerald-600 text-sm">★ {criteriaStats.serviceAttitude}</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(parseFloat(criteriaStats.serviceAttitude) / 5) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Nhiệt tình, chu đáo</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{Math.round((parseFloat(criteriaStats.serviceAttitude) / 5) * 100)}%</span>
              </div>
            </div>

            {/* Tiêu chí 2: Cơ sở vật chất */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2 hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">2. Cơ sở vật chất</span>
                <span className="font-black text-blue-600 text-sm">★ {criteriaStats.facilities}</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(parseFloat(criteriaStats.facilities) / 5) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Buồng bệnh & thiết bị</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{Math.round((parseFloat(criteriaStats.facilities) / 5) * 100)}%</span>
              </div>
            </div>

            {/* Tiêu chí 3: Thời gian chờ đợi */}
            <div className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
              criteriaStats.lowestKey === 'waitTime' 
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60' 
                : 'bg-slate-50/70 dark:bg-zinc-800/50 border-slate-200/70 dark:border-zinc-700/60'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">3. Thời gian chờ đợi</span>
                <span className="font-black text-amber-600 text-sm">★ {criteriaStats.waitTime}</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(parseFloat(criteriaStats.waitTime) / 5) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Khám, xét nghiệm, thuốc</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{Math.round((parseFloat(criteriaStats.waitTime) / 5) * 100)}%</span>
              </div>
            </div>

            {/* Tiêu chí 4: Minh bạch chi phí */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2 hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">4. Viện phí & BHYT</span>
                <span className="font-black text-purple-600 text-sm">★ {criteriaStats.costTransparency}</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(parseFloat(criteriaStats.costTransparency) / 5) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Công khai & minh bạch</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{Math.round((parseFloat(criteriaStats.costTransparency) / 5) * 100)}%</span>
              </div>
            </div>

          </div>
        </div>

        {/* ---------------------------------------------------------------------
            2 BIỂU ĐỒ TRỰC QUAN: SO SÁNH TIÊU CHÍ VÀ CƠ CẤU PHÂN BỐ SAO
        --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Biểu đồ 1: Cột so sánh 4 tiêu chí */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Mức Điểm Từng Tiêu Chí Cốt Lõi</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">So sánh tương quan giữa 4 trụ cột đánh giá</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 font-semibold text-slate-600 dark:text-zinc-300">
                Mục tiêu ≥ 4.5★
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={criteriaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} tickLine={false} />
                  <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={11} ticks={[1, 2, 3, 4, 5]} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none', fontSize: '12px' }}
                    formatter={(value) => [`${value} / 5.0★`, 'Điểm trung bình']} 
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={48}>
                    {criteriaChartData.map((entry, index) => (
                      <Cell key={`crit-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ 2: Cơ cấu phân bố số sao (1 đến 5 sao) */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Phân Bố Số Lượt Theo Mức Sao (1 - 5 Sao)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Cơ cấu mức độ hài lòng của người bệnh</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60">
                {csatScore}% Hài lòng
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistributionData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={50} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none', fontSize: '12px' }}
                    formatter={(value) => [`${value} lượt`, 'Số lượng đánh giá']} 
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {ratingDistributionData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------------------------
            PHÂN TÍCH THẺ ĐÁNH GIÁ NHANH: TOP KHEN NGỢI VS TOP CẦN CẢI THIỆN
        --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Top Điểm Khen Ngợi */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <ThumbsUp className="w-4 h-4" />
                </span>
                <span>Top Điểm Người Bệnh Hài Lòng Nhất</span>
              </h3>
              <span className="text-xs text-emerald-600 font-bold">Khen ngợi nhiều</span>
            </div>

            <div className="space-y-2 pt-1">
              {tagAnalytics.topPraises.length > 0 ? (
                tagAnalytics.topPraises.map((item, idx) => (
                  <div key={item.tag} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item.tag}</span>
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/70">
                      {item.count} lượt
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">Chưa có dữ liệu thẻ khen trong bộ lọc này</p>
              )}
            </div>
          </div>

          {/* Top Điểm Góp Ý / Cần Cải Thiện */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <ThumbsDown className="w-4 h-4" />
                </span>
                <span>Top Vấn Đề Người Bệnh Góp Ý / Phàn Nàn</span>
              </h3>
              <span className="text-xs text-rose-600 font-bold">Cần cải thiện</span>
            </div>

            <div className="space-y-2 pt-1">
              {tagAnalytics.topComplaints.length > 0 ? (
                tagAnalytics.topComplaints.map((item, idx) => (
                  <div key={item.tag} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200">
                      <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item.tag}</span>
                    </div>
                    <span className="font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-lg border border-rose-200/70 dark:border-rose-800/70">
                      {item.count} lượt
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">Không ghi nhận ý kiến phàn nàn trong bộ lọc này</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------------------
          DRAWER CHI TIẾT CHUYÊN SÂU KHI BẤM VÀO THẺ KPI (XỔ TỪ BÊN PHẢI RA)
      --------------------------------------------------------------------- */}
      {activeKpiModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-300"
          onClick={() => setActiveKpiModal(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 w-full max-w-xl sm:max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            {/* Header Drawer */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeKpiModal === 'total' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400' :
                  activeKpiModal === 'rating' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                  activeKpiModal === 'csat' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                }`}>
                  {activeKpiModal === 'total' && <Layers className="w-5 h-5" />}
                  {activeKpiModal === 'rating' && <Star className="w-5 h-5" />}
                  {activeKpiModal === 'csat' && <ThumbsUp className="w-5 h-5" />}
                  {activeKpiModal === 'verified' && <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {activeKpiModal === 'total' && 'Chi Tiết: Tổng Lượt Khảo Sát & Độ Phủ'}
                    {activeKpiModal === 'rating' && 'Chi Tiết: Phân Tích Điểm TB Toàn Diện'}
                    {activeKpiModal === 'csat' && 'Chi Tiết: Chỉ Số Hài Lòng Người Bệnh (CSAT)'}
                    {activeKpiModal === 'verified' && 'Chi Tiết: Tỷ Lệ Xác Thực Thẻ CCCD / BHYT'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Phân tích từ <strong className="text-slate-800 dark:text-zinc-200">{filteredReviews.length} lượt khảo sát</strong> theo bộ lọc hiện tại
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung chi tiết từng thẻ */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* === TAB 1: TỔNG LƯỢT KHẢO SÁT === */}
              {activeKpiModal === 'total' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60">
                      <div className="text-[11px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider">Tổng Lượt Đánh Giá</div>
                      <div className="text-3xl font-black text-teal-800 dark:text-teal-200 mt-1">{totalRev}</div>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 block">Toàn bộ hồ sơ khảo sát</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Khoa Phòng Phủ Sóng</div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {new Set(filteredReviews.map((r) => r.departmentId)).size} <span className="text-base font-normal text-slate-400">/ {departments.length}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Đạt {departments.length ? Math.round((new Set(filteredReviews.map((r) => r.departmentId)).size / departments.length) * 100) : 0}% độ phủ khoa phòng
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                      <span>Top 5 Khoa Phòng Nhận Nhiều Đánh Giá Nhất:</span>
                      <span className="text-[11px] text-slate-400 font-normal">Tỷ trọng</span>
                    </h4>
                    <div className="space-y-2">
                      {departments
                        .map((d) => ({
                          dept: d,
                          count: filteredReviews.filter((r) => r.departmentId === d.id).length
                        }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5)
                        .map((item, i) => {
                          const pct = totalRev ? Math.round((item.count / totalRev) * 100) : 0;
                          return (
                            <div key={item.dept.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {i + 1}
                                  </span>
                                  <span>{item.dept.name}</span>
                                </span>
                                <span className="font-bold text-teal-700 dark:text-teal-300">
                                  {item.count} lượt <span className="text-slate-400 font-normal">({pct}%)</span>
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                                <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: ĐIỂM TB TOÀN DIỆN === */}
              {activeKpiModal === 'rating' && (
                <div className="space-y-4">
                  {/* Banner điểm tổng quan */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-200 font-bold uppercase tracking-wider">Điểm Trung Bình Chung</div>
                      <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                        <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                        <span>{avgRating} <span className="text-lg font-bold text-slate-400">/ 5.0</span></span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 block">
                        Đánh giá dựa trên chuẩn chất lượng 83 tiêu chí Bộ Y tế
                      </span>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-xs">
                      {parseFloat(avgRating) >= 4.5 ? 'Xuất Sắc' : parseFloat(avgRating) >= 4.0 ? 'Hài Lòng Tốt' : 'Cần Cải Thiện'}
                    </span>
                  </div>

                  {/* Chi tiết 4 trụ cột có thanh progress bar trực quan */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                      Chi Tiết 4 Trụ Cột Đánh Giá Trọng Điểm:
                    </h4>
                    
                    <div className="space-y-2.5">
                      {/* 1. Thái độ */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">1. Thái độ phục vụ & Y đức</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{criteriaStats.serviceAttitude} / 5.0</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all" 
                            style={{ width: `${(parseFloat(criteriaStats.serviceAttitude) / 5) * 100}%` }} 
                          />
                        </div>
                      </div>

                      {/* 2. Cơ sở vật chất */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">2. Cơ sở vật chất & Tiện nghi</span>
                          <span className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{criteriaStats.facilities} / 5.0</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all" 
                            style={{ width: `${(parseFloat(criteriaStats.facilities) / 5) * 100}%` }} 
                          />
                        </div>
                      </div>

                      {/* 3. Thời gian chờ đợi */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">3. Thời gian tiếp nhận & chờ đợi</span>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{criteriaStats.waitTime} / 5.0</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all" 
                            style={{ width: `${(parseFloat(criteriaStats.waitTime) / 5) * 100}%` }} 
                          />
                        </div>
                      </div>

                      {/* 4. Viện phí & BHYT */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">4. Minh bạch viện phí & BHYT</span>
                          <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{criteriaStats.costTransparency} / 5.0</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all" 
                            style={{ width: `${(parseFloat(criteriaStats.costTransparency) / 5) * 100}%` }} 
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: CSAT === */}
              {activeKpiModal === 'csat' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-200 font-bold uppercase tracking-wider">Chỉ Số CSAT Hài Lòng</div>
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{csatScore}%</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Mục tiêu chuẩn quốc gia: <strong>≥ 90%</strong></span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold ${
                        csatScore >= 90 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {csatScore >= 90 ? '✓ Đạt Chuẩn' : '⚠ Cần Cải Thiện'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                      Phân Bố Mức Độ Hài Lòng:
                    </h4>
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-700">★ Tích cực (4 - 5 Sao)</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {filteredReviews.filter((r) => r.overallRating >= 4).length} lượt ({csatScore}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${csatScore}%` }} />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-1.5">
                        {(() => {
                          const c3 = filteredReviews.filter((r) => r.overallRating === 3).length;
                          const p3 = totalRev ? Math.round((c3 / totalRev) * 100) : 0;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-amber-700">★ Trung tính (3 Sao)</span>
                                <span className="font-bold text-slate-800 dark:text-zinc-200">{c3} lượt ({p3}%)</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p3}%` }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-1.5">
                        {(() => {
                          const c12 = filteredReviews.filter((r) => r.overallRating <= 2).length;
                          const p12 = totalRev ? Math.round((c12 / totalRev) * 100) : 0;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-rose-700">★ Chưa hài lòng (1 - 2 Sao)</span>
                                <span className="font-bold text-slate-800 dark:text-zinc-200">{c12} lượt ({p12}%)</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${p12}%` }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 4: XÁC THỰC THẺ === */}
              {activeKpiModal === 'verified' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-blue-800 dark:text-blue-200 font-bold uppercase tracking-wider">Tỷ Lệ Quét Thẻ Xác Thực</div>
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{verifiedRate}%</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Xác thực bằng CCCD hoặc BHYT điện tử</span>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-xs">
                      {verifiedCount} / {totalRev} lượt
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                      Cơ Cấu Định Danh Người Bệnh:
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="font-semibold text-emerald-700 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Đã quét thẻ CCCD gắn chip</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                          {filteredReviews.filter((r) => (r.cardType || '').toLowerCase().includes('cccd') || r.hasCardVerified).length} lượt
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="font-semibold text-blue-700 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Thẻ BHYT</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                          {filteredReviews.filter((r) => (r.cardType || '').toLowerCase().includes('bhyt')).length} lượt
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="font-semibold text-slate-500 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Khảo sát ẩn danh (không quét thẻ)</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                          {filteredReviews.filter((r) => r.isAnonymous || !r.hasCardVerified).length} lượt ({100 - verifiedRate}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end bg-slate-50/50 dark:bg-zinc-850">
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
