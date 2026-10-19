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
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Star,
  Award,
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
  Eye,
  Search,
  X,
  User,
  FileText,
  CreditCard,
} from 'lucide-react';

interface AdminAnalyticsViewProps {
  reviews: Review[];
  departments: Department[];
  getDeptCategory: (d: { category?: string; name: string; code?: string }) => 'noi' | 'ngoai' | 'canlamsang';
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
  const [rankingTab, setRankingTab] = useState<'all' | 'top' | 'needs_attention'>('all');
  // State mở modal chi tiết cho từng thẻ KPI tổng quan
  const [activeKpiModal, setActiveKpiModal] = useState<'total' | 'rating' | 'csat' | 'verified' | null>(null);

  // Bộ lọc và tìm kiếm riêng cho danh sách chi tiết lượt đánh giá
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all'>('all');
  const [selectedReviewDetail, setSelectedReviewDetail] = useState<Review | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 8;

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

  // Danh sách lượt đánh giá chi tiết có tìm kiếm & lọc sao
  const detailedReviewsList = useMemo(() => {
    return filteredReviews.filter((r) => {
      // Lọc theo sao
      if (reviewRatingFilter !== 'all' && r.overallRating !== reviewRatingFilter) {
        return false;
      }
      // Tìm kiếm theo từ khóa
      if (reviewSearch.trim()) {
        const q = reviewSearch.toLowerCase().trim();
        const matchName = r.userName?.toLowerCase().includes(q);
        const matchDept = r.departmentName?.toLowerCase().includes(q);
        const matchContent = r.content?.toLowerCase().includes(q);
        const matchCard = r.cardNumber?.toLowerCase().includes(q);
        if (!matchName && !matchDept && !matchContent && !matchCard) {
          return false;
        }
      }
      return true;
    });
  }, [filteredReviews, reviewRatingFilter, reviewSearch]);

  const totalDetailedPages = Math.ceil(detailedReviewsList.length / REVIEWS_PER_PAGE) || 1;
  const currentReviewsPage = Math.min(reviewPage, totalDetailedPages);
  const pagedReviews = detailedReviewsList.slice(
    (currentReviewsPage - 1) * REVIEWS_PER_PAGE,
    currentReviewsPage * REVIEWS_PER_PAGE
  );

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

  // Dữ liệu hiệu suất khoa phòng chi tiết
  const deptPerformanceData = useMemo(() => {
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

    list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

    if (rankingTab === 'top') {
      return list.slice(0, 5);
    }
    if (rankingTab === 'needs_attention') {
      return list.filter((d) => d.rating < 4.6 || d.waitTime < 4.2);
    }

    return list;
  }, [departments, filteredReviews, getDeptCategory, rankingTab]);

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
          THANH ĐIỀU HƯỚNG BỘ LỌC ĐA CHIỀU & HÀNH ĐỘNG XUẤT BÁO CÁO
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">
                Bộ Lọc & Phân Tích Dữ Liệu Đánh Giá
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Hệ thống lọc thời gian thực từ máy Kiosk tại các sảnh và khoa phòng Bệnh viện Quân y 7A
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
              title="Xuất bảng số liệu ra file Excel (.CSV)"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel/CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 cursor-pointer transition active:scale-95"
              title="In báo cáo tổng hợp A4"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* Cụm chọn các tiêu chí lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Lọc theo thời gian */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Khoảng Thời Gian:</span>
            </label>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value as any);
                setReviewPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Toàn bộ thời gian ({reviews.length} lượt)</option>
              <option value="7days">7 ngày vừa qua</option>
              <option value="30days">30 ngày gần nhất</option>
              <option value="quarter">Quý này (3 tháng)</option>
              <option value="year">Năm hiện tại (2026)</option>
            </select>
          </div>

          {/* Lọc theo khối chuyên môn */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Khối Chuyên Môn:</span>
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as any);
                setSelectedDeptId('all');
                setReviewPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Tất cả các khối viện</option>
              <option value="noi">Khối Nội Khoa</option>
              <option value="ngoai">Khối Ngoại & Chấn Thương</option>
              <option value="canlamsang">Khối Cận Lâm Sàng & Dược</option>
            </select>
          </div>

          {/* Lọc theo từng khoa cụ thể */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Khoa Phòng Cụ Thể:</span>
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setReviewPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none truncate"
            >
              <option value="all">Toàn viện (Tất cả khoa)</option>
              {departments
                .filter((d) => categoryFilter === 'all' || getDeptCategory(d) === categoryFilter)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Lọc theo nguồn xác thực thẻ */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nguồn Dữ Liệu:</span>
            </label>
            <select
              value={cardFilter}
              onChange={(e) => {
                setCardFilter(e.target.value as any);
                setReviewPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Tất cả nguồn khảo sát</option>
              <option value="verified">Đã quét CCCD / BHYT ({verifiedCount})</option>
              <option value="anonymous">Khảo sát ẩn danh ({totalRev - verifiedCount})</option>
            </select>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------------------
          CỤM 4 THẺ KPI TỔNG THỂ (EXECUTIVE KPI CARDS)
      --------------------------------------------------------------------- */}
      {/* ---------------------------------------------------------------------
          CỤM 4 THẺ KPI TỔNG THỂ (EXECUTIVE KPI CARDS) - CÓ THỂ NHẤN ĐỂ XEM CHI TIẾT
      --------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Tổng lượt đánh giá */}
        <div 
          onClick={() => setActiveKpiModal('total')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-teal-500 hover:shadow-md transition group select-none"
          title="Nhấn để xem chi tiết phân bố lượt khảo sát"
        >
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
              Tổng Lượt Khảo Sát
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 mt-1 group-hover:text-teal-600 transition-colors">
              {totalRev}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Phủ kín {departments.length} khoa phòng</span>
          </div>
        </div>

        {/* KPI 2: Điểm TB Toàn Diện */}
        <div 
          onClick={() => setActiveKpiModal('rating')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-500 hover:shadow-md transition group select-none"
          title="Nhấn để xem chi tiết cơ cấu điểm trung bình"
        >
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
              Điểm TB Toàn Diện
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1 flex items-baseline gap-1">
              <span>★ {avgRating}</span>
              <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-emerald-600 font-semibold">
            {parseFloat(avgRating) >= 4.5 ? 'Đạt loại Xuất sắc' : parseFloat(avgRating) >= 4.0 ? 'Đạt chuẩn chất lượng' : 'Cần chấn chỉnh'}
          </div>
        </div>

        {/* KPI 3: Chỉ số CSAT */}
        <div 
          onClick={() => setActiveKpiModal('csat')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-teal-500 hover:shadow-md transition group select-none"
          title="Nhấn để xem chi tiết tỷ lệ hài lòng"
        >
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
              Tỷ Lệ Hài Lòng (CSAT)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-teal-600 mt-1">
              {csatScore}%
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-slate-500 font-medium">
            Chỉ tiêu Bộ Y tế: ≥ 90%
          </div>
        </div>

        {/* KPI 4: Tỷ lệ quét thẻ xác thực */}
        <div 
          onClick={() => setActiveKpiModal('verified')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-500 hover:shadow-md transition group select-none"
          title="Nhấn để xem chi tiết cơ cấu xác thực thẻ chip"
        >
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
              Xác Thực CCCD / BHYT
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
              {verifiedRate}%
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-blue-600/90 font-medium">
            {verifiedCount} lượt quét thẻ chip
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------------------------
          PHÂN TÍCH 4 TIÊU CHÍ CỐT LÕI CỦA BỘ Y TẾ
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Chấm Điểm 4 Trụ Cột Chất Lượng Dịch Vụ Khám Chữa Bệnh</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Theo khung tiêu chí khảo sát hài lòng người bệnh nội trú và ngoại trú
            </p>
          </div>
          {criteriaStats.lowestKey === 'waitTime' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 text-xs font-bold self-start sm:self-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Lưu ý: Thời gian chờ đợi là khâu thấp điểm nhất</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tiêu chí 1: Thái độ phục vụ */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300">1. Thái độ phục vụ & Y đức</span>
              <span className="font-extrabold text-emerald-600 text-sm">★ {criteriaStats.serviceAttitude}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(parseFloat(criteriaStats.serviceAttitude) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
              Bác sĩ, điều dưỡng, nhân viên hướng dẫn nhiệt tình, chu đáo
            </p>
          </div>

          {/* Tiêu chí 2: Cơ sở vật chất */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300">2. Cơ sở vật chất & Buồng bệnh</span>
              <span className="font-extrabold text-blue-600 text-sm">★ {criteriaStats.facilities}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(parseFloat(criteriaStats.facilities) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
              Khuôn viên sạch sẽ, buồng bệnh thoáng mát, trang thiết bị đồng bộ
            </p>
          </div>

          {/* Tiêu chí 3: Thời gian chờ đợi */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            criteriaStats.lowestKey === 'waitTime' 
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' 
              : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/70 dark:border-zinc-700/60'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300">3. Thời gian chờ đợi</span>
              <span className="font-extrabold text-amber-600 text-sm">★ {criteriaStats.waitTime}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(parseFloat(criteriaStats.waitTime) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
              Thời gian lấy số, khám bệnh, xét nghiệm và nhận thuốc
            </p>
          </div>

          {/* Tiêu chí 4: Minh bạch chi phí */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300">4. Minh bạch viện phí & BHYT</span>
              <span className="font-extrabold text-purple-600 text-sm">★ {criteriaStats.costTransparency}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(parseFloat(criteriaStats.costTransparency) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
              Bảng giá công khai, giải thích cặn kẽ quyền lợi thanh toán BHYT
            </p>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------------------
          2 BIỂU ĐỒ TRỰC QUAN: SO SÁNH TIÊU CHÍ VÀ CƠ CẤU PHÂN BỐ SAO
      --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Biểu đồ 1: Cột so sánh 4 tiêu chí */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Mức Điểm Từng Tiêu Chí (Thang 5.0)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Chuẩn mục tiêu: ≥ 4.5</span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={criteriaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 5]} stroke="#888888" fontSize={11} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip formatter={(value: any) => [`${value} / 5.0`, 'Điểm trung bình']} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {criteriaChartData.map((entry, index) => (
                    <Cell key={`crit-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ 2: Cơ cấu phân bố số sao (1 đến 5 sao) */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Phân Bố Số Lượt Theo Mức Sao (1 - 5 Sao)</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold">
              {csatScore}% Hài lòng
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistributionData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" stroke="#888888" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} width={65} />
                <Tooltip formatter={(value: any) => [`${value} lượt`, 'Số lượng đánh giá']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Top Điểm Khen Ngợi */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ThumbsUp className="w-4 h-4" />
              </span>
              <span>Top Điểm Người Bệnh Hài Lòng Nhất</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold">Khen ngợi nhiều nhất</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {tagAnalytics.topPraises.length > 0 ? (
              tagAnalytics.topPraises.map((item, idx) => (
                <div key={item.tag} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item.tag}</span>
                  </div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
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
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <ThumbsDown className="w-4 h-4" />
              </span>
              <span>Top Vấn Đề Người Bệnh Góp Ý / Phàn Nàn</span>
            </h3>
            <span className="text-xs text-rose-600 font-bold">Cần khắc phục ngay</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {tagAnalytics.topComplaints.length > 0 ? (
              tagAnalytics.topComplaints.map((item, idx) => (
                <div key={item.tag} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200">
                    <span className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item.tag}</span>
                  </div>
                  <span className="font-bold text-rose-700 dark:text-rose-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-rose-200/60 dark:border-rose-800 shadow-2xs">
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

      {/* ---------------------------------------------------------------------
          BẢNG XẾP HẠNG CHI TIẾT KHOA PHÒNG ĐẦY ĐỦ 4 TIÊU CHÍ
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-zinc-900/60">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Bảng Xếp Hạng Chất Lượng & Chi Tiết 4 Tiêu Chí Từng Khoa ({deptPerformanceData.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Bấm vào nút mắt <Eye className="w-3.5 h-3.5 inline text-teal-600" /> để xem trực tiếp các đánh giá của khoa tương ứng
            </p>
          </div>

          {/* Tab chuyển đổi chế độ xem */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto print:hidden">
            <button
              type="button"
              onClick={() => setRankingTab('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                rankingTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Tất Cả ({departments.length})
            </button>
            <button
              type="button"
              onClick={() => setRankingTab('top')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                rankingTab === 'top'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Top 5 Tiêu Biểu
            </button>
            <button
              type="button"
              onClick={() => setRankingTab('needs_attention')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                rankingTab === 'needs_attention'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Cần Cải Thiện
            </button>
          </div>
        </div>

        {/* Chế độ xem máy tính để bàn (Bảng đầy đủ) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[880px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                <th className="py-3 px-3 w-12 text-center">Hạng</th>
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
                <th className="py-3 px-3 text-center w-16">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {deptPerformanceData.map((d, idx) => (
                <tr 
                  key={d.id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 px-3 text-center font-bold">
                    {idx === 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs">1</span>
                    ) : idx === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs">2</span>
                    ) : idx === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs">3</span>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">#{idx + 1}</span>
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
                    <span className="font-extrabold text-amber-500 text-xs">
                      ★ {d.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-emerald-600">{d.service.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-semibold text-blue-600">{d.facilities.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-semibold text-amber-600">{d.waitTime.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-semibold text-purple-600">{d.cost.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-bold text-teal-600">{d.csat}%</td>
                  <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400">{d.reviews}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      d.rating >= 4.8 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300' 
                        : d.rating >= 4.5 
                        ? 'bg-teal-100 text-teal-800 border border-teal-200/60 dark:bg-teal-950/60 dark:text-teal-300' 
                        : d.rating >= 4.0
                        ? 'bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {d.rating >= 4.8 ? 'Xuất sắc' : d.rating >= 4.5 ? 'Tốt' : d.rating >= 4.0 ? 'Đạt chuẩn' : 'Cần chấn chỉnh'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(d.id);
                        setReviewPage(1);
                        const el = document.getElementById('patient-reviews-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 hover:bg-teal-100 transition cursor-pointer"
                      title={`Xem danh sách các lượt đánh giá của ${d.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ---------------------------------------------------------------------
          MỤC MỚI: DANH SÁCH CHI TIẾT CÁC LƯỢT ĐÁNH GIÁ CỦA BỆNH NHÂN
      --------------------------------------------------------------------- */}
      <div id="patient-reviews-section" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-4">
        
        {/* Tiêu đề & thanh tìm kiếm */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                Nhật Ký & Chi Tiết Lượt Đánh Giá Của Bệnh Nhân ({detailedReviewsList.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Bấm vào bất kỳ dòng nào để xem chi tiết thẻ CCCD/BHYT, 4 tiêu chí và phản hồi của người bệnh
            </p>
          </div>

          {/* Ô tìm kiếm & lọc sao */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, khoa, nội dung, mã thẻ..."
                value={reviewSearch}
                onChange={(e) => {
                  setReviewSearch(e.target.value);
                  setReviewPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-teal-500"
              />
              {reviewSearch && (
                <button
                  type="button"
                  onClick={() => setReviewSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Lọc theo sao */}
            <select
              value={reviewRatingFilter}
              onChange={(e) => {
                setReviewRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setReviewPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả số sao</option>
              <option value="5">★ 5 Sao (Rất tốt)</option>
              <option value="4">★ 4 Sao (Hài lòng)</option>
              <option value="3">★ 3 Sao (Bình thường)</option>
              <option value="2">★ 2 Sao (Chưa hài lòng)</option>
              <option value="1">★ 1 Sao (Thất vọng)</option>
            </select>
          </div>
        </div>

        {/* Bảng danh sách các lượt đánh giá */}
        {detailedReviewsList.length > 0 ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <th className="py-2.5 px-3">Người Bệnh</th>
                    <th className="py-2.5 px-3">Xác Thực Thẻ</th>
                    <th className="py-2.5 px-3">Khoa Phòng</th>
                    <th className="py-2.5 px-3 text-center">Đánh Giá</th>
                    <th className="py-2.5 px-3">Tiêu Chí Chọn Nhanh & Lời Nhắn</th>
                    <th className="py-2.5 px-3 text-center">Thời Gian</th>
                    <th className="py-2.5 px-3 text-center w-20">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {pagedReviews.map((r) => {
                    const parsed = parseReviewContent(r.content || '');
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReviewDetail(r)}
                        className="hover:bg-teal-50/40 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {r.userName?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-zinc-100 block group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                {r.userName || 'Bệnh nhân'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {r.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {r.hasCardVerified || (!r.isAnonymous && r.cardNumber) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{(r.cardType || 'Thẻ').toUpperCase()}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] font-medium">
                              Ẩn danh
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                            {r.departmentName}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            r.overallRating >= 4 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : r.overallRating === 3
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            <Star className="w-3 h-3 fill-current" />
                            <span>{r.overallRating}.0</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          {parsed.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {parsed.tags.slice(0, 2).map((t) => (
                                <span key={t} className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded text-[10px] truncate max-w-[150px]">
                                  {t}
                                </span>
                              ))}
                              {parsed.tags.length > 2 && (
                                <span className="text-[10px] text-slate-400 font-semibold">
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

                        <td className="py-3 px-3 text-center whitespace-nowrap text-slate-500 dark:text-zinc-400 text-[11px]">
                          {new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReviewDetail(r);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang danh sách đánh giá */}
            {totalDetailedPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Hiển thị {(currentReviewsPage - 1) * REVIEWS_PER_PAGE + 1} - {Math.min(currentReviewsPage * REVIEWS_PER_PAGE, detailedReviewsList.length)} trong tổng số {detailedReviewsList.length} lượt
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentReviewsPage <= 1}
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
                  >
                    Trang trước
                  </button>
                  <span className="px-2 font-bold text-slate-700 dark:text-zinc-300">
                    {currentReviewsPage} / {totalDetailedPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentReviewsPage >= totalDetailedPages}
                    onClick={() => setReviewPage((p) => Math.min(totalDetailedPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 space-y-1">
            <p className="text-sm font-semibold">Không tìm thấy lượt đánh giá nào phù hợp với bộ lọc hiện tại</p>
            <p className="text-xs">Thử đổi từ khóa tìm kiếm hoặc chọn &quot;Toàn bộ thời gian&quot; ở bộ lọc trên</p>
          </div>
        )}

      </div>

      {/* ---------------------------------------------------------------------
          MODAL CHI TIẾT TOÀN DIỆN MỘT LƯỢT ĐÁNH GIÁ CỦA BỆNH NHÂN
      --------------------------------------------------------------------- */}
      {selectedReviewDetail && (() => {
        const parsed = parseReviewContent(selectedReviewDetail.content || '');
        const r = selectedReviewDetail;
        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-300"
            onClick={() => setSelectedReviewDetail(null)}
          >
            <div 
              className="bg-white dark:bg-zinc-900 w-full max-w-xl sm:max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header Drawer */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-teal-800 text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-white">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Chi Tiết Phiếu Đánh Giá Người Bệnh
                    </h3>
                    <span className="text-[11px] text-teal-100 font-mono">
                      Mã phiếu: {r.id}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReviewDetail(null)}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-white transition cursor-pointer"
                  title="Đóng (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal (Cuộn được) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* THẺ 1: HỒ SƠ ĐỊNH DANH NGƯỜI BỆNH */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Thông Tin Định Danh Người Bệnh</span>
                    </span>
                    {r.hasCardVerified || (!r.isAnonymous && r.cardNumber) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ĐÃ QUÉT THẺ {(r.cardType || 'CCCD').toUpperCase()}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-medium text-[10px]">
                        Khảo sát ẩn danh
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
                        <span className="text-slate-400 block text-[11px]">Số thẻ {(r.cardType || 'CCCD').toUpperCase()}:</span>
                        <strong className="font-mono text-teal-700 dark:text-teal-400 text-sm font-bold">
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
                        <span className="text-slate-400 block text-[11px]">Địa chỉ cư trú / Quê quán:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{r.patientAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* THẺ 2: KHOA PHÒNG & THỜI GIAN TIẾP NHẬN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/50">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Khoa phòng khảo sát:</span>
                    <strong className="text-teal-800 dark:text-teal-300 font-extrabold text-sm block mt-0.5">
                      {r.departmentName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thời gian gửi phiếu:</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300 block mt-0.5">
                      {new Date(r.createdAt || r.visitDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* THẺ 3: ĐÁNH GIÁ 4 TRỤ CỘT CHẤT LƯỢNG */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 text-xs uppercase tracking-wider">
                      Kết Quả Đánh Giá Dịch Vụ:
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-black text-sm border border-amber-200/60 dark:border-amber-800">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{r.overallRating}.0 / 5.0</span>
                    </div>
                  </div>

                  {/* 4 Tiêu chí cốt lõi: Thiết kế thẻ trung tính, thanh lịch, chuẩn bệnh viện */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* 1. Thái độ */}
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">1. Thái độ phục vụ & Y đức</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                          {r.criteria?.serviceAttitude >= 4 ? 'Tận tình, chu đáo' : r.criteria?.serviceAttitude === 3 ? 'Bình thường' : 'Chưa niềm nở'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                        <span>{r.criteria?.serviceAttitude || r.overallRating}</span>
                      </span>
                    </div>

                    {/* 2. Cơ sở vật chất */}
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">2. Cơ sở vật chất & Thiết bị</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                          {r.criteria?.facilities >= 4 ? 'Sạch sẽ, tiện nghi' : r.criteria?.facilities === 3 ? 'Tương đối đầy đủ' : 'Cần bảo trì'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                        <span>{r.criteria?.facilities || r.overallRating}</span>
                      </span>
                    </div>

                    {/* 3. Thời gian chờ */}
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">3. Thời gian tiếp nhận & chờ đợi</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                          {r.criteria?.waitTime >= 4 ? 'Nhanh chóng, kịp thời' : r.criteria?.waitTime === 3 ? 'Chờ vừa phải' : 'Chờ đợi lâu'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                        <span>{r.criteria?.waitTime || r.overallRating}</span>
                      </span>
                    </div>

                    {/* 4. Viện phí & BHYT */}
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">4. Minh bạch viện phí & BHYT</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                          {r.criteria?.costTransparency >= 4 ? 'Minh bạch, rõ ràng' : r.criteria?.costTransparency === 3 ? 'Đầy đủ phiếu thu' : 'Chưa rõ ràng'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                        <span>{r.criteria?.costTransparency || r.overallRating}</span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* THẺ 4: CÁC TIÊU CHÍ CHỌN NHANH */}
                {parsed.tags.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 space-y-2">
                    <span className="font-bold text-slate-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider block">
                      Các Tiêu Chí Chọn Nhanh ({parsed.tags.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {parsed.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium text-xs shadow-2xs"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* THẺ 5: Ý KIẾN / GÓP Ý THÊM CỦA NGƯỜI BỆNH */}
                {parsed.comment && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 space-y-2">
                    <span className="font-bold text-slate-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider block">
                      Ý Kiến / Lời Nhắn Gửi Của Người Bệnh:
                    </span>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap text-xs shadow-2xs">
                      &ldquo;{parsed.comment}&rdquo;
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-zinc-800/30">
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
                  onClick={() => setSelectedReviewDetail(null)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Đóng Lại
                </button>
              </div>

            </div>
          </div>
        );
      })()}

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
            <div className={`p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between text-white shrink-0 ${
              activeKpiModal === 'total' ? 'bg-teal-700' :
              activeKpiModal === 'rating' ? 'bg-amber-600' :
              activeKpiModal === 'csat' ? 'bg-emerald-700' : 'bg-blue-700'
            }`}>
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs text-white">
                  {activeKpiModal === 'total' && <Layers className="w-5 h-5" />}
                  {activeKpiModal === 'rating' && <Star className="w-5 h-5" />}
                  {activeKpiModal === 'csat' && <ThumbsUp className="w-5 h-5" />}
                  {activeKpiModal === 'verified' && <ShieldCheck className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                    {activeKpiModal === 'total' && 'Chi Tiết: Tổng Lượt Khảo Sát & Độ Phủ'}
                    {activeKpiModal === 'rating' && 'Chi Tiết: Phân Tích Điểm TB Toàn Diện'}
                    {activeKpiModal === 'csat' && 'Chi Tiết: Chỉ Số Hài Lòng Người Bệnh (CSAT)'}
                    {activeKpiModal === 'verified' && 'Chi Tiết: Tỷ Lệ Xác Thực Thẻ CCCD / BHYT'}
                  </h3>
                  <span className="text-xs opacity-90">
                    Dữ liệu phân tích theo bộ lọc hiện tại ({filteredReviews.length} lượt)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition cursor-pointer"
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
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80">
                      <div className="text-[11px] text-teal-700 dark:text-teal-300 font-bold uppercase">Tổng Lượt Nhận Được</div>
                      <div className="text-3xl font-black text-teal-800 dark:text-teal-200 mt-1">{totalRev}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80">
                      <div className="text-[11px] text-slate-500 font-bold uppercase">Khoa Nhận Khảo Sát</div>
                      <div className="text-3xl font-black text-slate-800 dark:text-zinc-200 mt-1">
                        {new Set(filteredReviews.map((r) => r.departmentId)).size} / {departments.length}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs mb-2">
                      Top 5 Khoa Phòng Nhận Nhiều Đánh Giá Nhất:
                    </h4>
                    <div className="space-y-2">
                      {departments
                        .map((d) => ({
                          dept: d,
                          count: filteredReviews.filter((r) => r.departmentId === d.id).length
                        }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5)
                        .map((item, i) => (
                          <div key={item.dept.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                                {i + 1}
                              </span>
                              {item.dept.name}
                            </span>
                            <span className="font-bold text-teal-700 dark:text-teal-300">
                              {item.count} lượt ({totalRev ? Math.round((item.count / totalRev) * 100) : 0}%)
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: ĐIỂM TB TOÀN DIỆN === */}
              {activeKpiModal === 'rating' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-200 font-bold uppercase">Điểm Trung Bình Chung</div>
                      <div className="text-3xl font-black text-amber-600 mt-0.5">★ {avgRating} / 5.0</div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-xs">
                      {parseFloat(avgRating) >= 4.5 ? 'Xuất sắc' : parseFloat(avgRating) >= 4.0 ? 'Tốt' : 'Trung bình'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs mb-2">
                      Chi Tiết 4 Trụ Cột Thành Phần:
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                        <span className="font-semibold text-emerald-900">1. Thái độ phục vụ & Y đức</span>
                        <span className="font-extrabold text-emerald-700 text-sm">★ {criteriaStats.serviceAttitude}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                        <span className="font-semibold text-blue-900">2. Cơ sở vật chất & Tiện nghi</span>
                        <span className="font-extrabold text-blue-700 text-sm">★ {criteriaStats.facilities}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                        <span className="font-semibold text-amber-900">3. Thời gian chờ đợi</span>
                        <span className="font-extrabold text-amber-700 text-sm">★ {criteriaStats.waitTime}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between">
                        <span className="font-semibold text-purple-900">4. Minh bạch viện phí & BHYT</span>
                        <span className="font-extrabold text-purple-700 text-sm">★ {criteriaStats.costTransparency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: CSAT === */}
              {activeKpiModal === 'csat' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-teal-800 dark:text-teal-200 font-bold uppercase">Chỉ Số CSAT Đạt</div>
                      <div className="text-3xl font-black text-teal-600 mt-0.5">{csatScore}%</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div>Mục tiêu Bộ Y tế: <strong>≥ 90%</strong></div>
                      <div className={csatScore >= 90 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {csatScore >= 90 ? '✓ Đạt chỉ tiêu' : '⚠ Cần nâng cao'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs mb-2">
                      Cơ Cấu Mức Độ Hài Lòng:
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-emerald-700">★ Tích cực (4 - 5 Sao)</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {filteredReviews.filter((r) => r.overallRating >= 4).length} lượt ({csatScore}%)
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-amber-700">★ Trung tính (3 Sao)</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {filteredReviews.filter((r) => r.overallRating === 3).length} lượt ({totalRev ? Math.round((filteredReviews.filter((r) => r.overallRating === 3).length / totalRev) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-rose-700">★ Chưa hài lòng (1 - 2 Sao)</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {filteredReviews.filter((r) => r.overallRating <= 2).length} lượt ({totalRev ? Math.round((filteredReviews.filter((r) => r.overallRating <= 2).length / totalRev) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 4: XÁC THỰC THẺ === */}
              {activeKpiModal === 'verified' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-blue-800 dark:text-blue-200 font-bold uppercase">Tỷ Lệ Quét Thẻ Xác Thực</div>
                      <div className="text-3xl font-black text-blue-600 mt-0.5">{verifiedRate}%</div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                      {verifiedCount} / {totalRev} lượt
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs mb-2">
                      Cơ Cấu Định Danh Người Bệnh:
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Đã quét thẻ CCCD gắn chip</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {filteredReviews.filter((r) => (r.cardType || '').toLowerCase().includes('cccd') || r.hasCardVerified).length} lượt
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Thẻ BHYT</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {filteredReviews.filter((r) => (r.cardType || '').toLowerCase().includes('bhyt')).length} lượt
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Khảo sát ẩn danh (không quét thẻ)</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {filteredReviews.filter((r) => r.isAnonymous || !r.hasCardVerified).length} lượt ({100 - verifiedRate}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end bg-slate-50/50 dark:bg-zinc-800/30">
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
