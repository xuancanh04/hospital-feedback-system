'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { useFeedback } from '@/context/feedback-context';
import { Input, Select } from '@/components/ui/form-controls';
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
  Legend,
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  Trash2, 
  Plus, 
  Star, 
  TrendingUp,
  Award,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function AdminPortalPage() {
  const { users, deleteUserByAdmin, toggleUserStatus } = useAuth();
  const {
    reviews,
    departments,
    addDepartment,
    deleteDepartment,
  } = useFeedback();

  const [activeTab, setActiveTab] = useState<'analytics' | 'departments' | 'users'>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Form states for adding department
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptCategory, setNewDeptCategory] = useState<'noi' | 'ngoai' | 'canlamsang'>('noi');
  const [newDeptNote, setNewDeptNote] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  // Department list search & filter
  // Department list search & filter
  const [deptSearch, setDeptSearch] = useState('');
  const [deptFilterCategory, setDeptFilterCategory] = useState<'all' | 'noi' | 'ngoai' | 'canlamsang'>('all');

  // User list search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'staff' | 'patient'>('all');

  // Helper to determine department category
  const getDeptCategory = (d: { category?: string; name: string; code?: string }): 'noi' | 'ngoai' | 'canlamsang' => {
    if (d.category === 'noi' || d.category === 'ngoai' || d.category === 'canlamsang') return d.category;
    const name = (d.name || '').toLowerCase();
    const code = (d.code || '').toLowerCase();
    if (
      name.includes('hình ảnh') || name.includes('xét nghiệm') || name.includes('giải phẫu') ||
      name.includes('dược') || name.includes('trang bị') || name.includes('nhiễm khuẩn') ||
      name.includes('vật lý trị liệu') || name.includes('phục hồi chức năng') ||
      code === 'cdha' || code === 'xn' || code === 'gpbl' || code === 'd-tb' || code === 'ksnk' || code === 'vltl-phcn'
    ) return 'canlamsang';
    if (
      name.includes('ngoại') || name.includes('chấn thương') || name.includes('phụ sản') ||
      name.includes('mắt') || name.includes('tai') || name.includes('răng') || name.includes('thẩm mỹ') ||
      name.includes('phẫu thuật') || code === 'ctch' || code === 'nc-tq' || code === 'gmhs' || code === 'psn'
    ) return 'ngoai';
    return 'noi';
  };

  // Analytics Computations
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const rejectedReviews = reviews.filter((r) => r.status === 'rejected');

  const avgRating = (
    reviews.reduce((acc, cur) => acc + cur.overallRating, 0) / (totalReviews || 1)
  ).toFixed(1);

  const csat = Math.round(
    (reviews.filter((r) => r.overallRating >= 4).length / (totalReviews || 1)) * 100
  );

  // Chart data: Distribution by Rating (1 - 5 stars)
  const ratingDistributionData = [
    { name: '5 Sao', count: reviews.filter((r) => r.overallRating === 5).length, fill: '#10b981' },
    { name: '4 Sao', count: reviews.filter((r) => r.overallRating === 4).length, fill: '#3b82f6' },
    { name: '3 Sao', count: reviews.filter((r) => r.overallRating === 3).length, fill: '#f59e0b' },
    { name: '2 Sao', count: reviews.filter((r) => r.overallRating === 2).length, fill: '#f97316' },
    { name: '1 Sao', count: reviews.filter((r) => r.overallRating === 1).length, fill: '#ef4444' },
  ];

  // Chart data: Monthly satisfaction trend
  const trendData = [
    { month: 'T11/2025', csat: 91, reviews: 45 },
    { month: 'T12/2025', csat: 93, reviews: 52 },
    { month: 'T01/2026', csat: 92, reviews: 60 },
    { month: 'T02/2026', csat: 95, reviews: 48 },
    { month: 'T03/2026', csat: 94, reviews: 68 },
    { month: 'T04/2026', csat: csat, reviews: totalReviews },
  ];

  // Department ranking data
  const deptPerformanceData = departments.map((d) => {
    const deptRev = reviews.filter((r) => r.departmentId === d.id);
    const avg = deptRev.length
      ? (deptRev.reduce((acc, c) => acc + c.overallRating, 0) / deptRev.length).toFixed(1)
      : d.averageRating.toString();
    return {
      id: d.id,
      name: d.code,
      fullName: d.name,
      category: getDeptCategory(d),
      rating: parseFloat(avg),
      reviews: deptRev.length,
    };
  });

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchCat = deptFilterCategory === 'all' || getDeptCategory(d) === deptFilterCategory;
      const q = deptSearch.toLowerCase().trim();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [departments, deptFilterCategory, deptSearch]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const q = userSearch.toLowerCase().trim();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    addDepartment({
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      description: newDeptDesc.trim() || 'Khoa chuyên môn trực thuộc bệnh viện.',
      iconName: 'Building2',
      doctorCount: 4,
      category: newDeptCategory,
      note: newDeptNote.trim() || undefined,
    });
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptNote('');
    setNewDeptDesc('');
  };

  const getCategoryBadge = (cat: 'noi' | 'ngoai' | 'canlamsang') => {
    switch (cat) {
      case 'noi':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Khối Nội</span>;
      case 'ngoai':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Khối Ngoại</span>;
      case 'canlamsang':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Cận Lâm Sàng</span>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row">
        
        {/* =========================================================================
            THANH MENU BÊN TRÁI (CLEAN WHITE SIDEBAR - BỆNH VIỆN QUÂN Y 7A)
        ========================================================================= */}
        {/* Nút bấm mở Menu trên màn hình đứng (Mobile & Tablet Portrait) */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-wider uppercase text-slate-900 dark:text-white">QUẢN TRỊ VIỆN</span>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Bệnh viện Quân y 7A</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{sidebarOpen ? 'Đóng Menu' : 'Menu'}</span>
          </button>
        </div>

        {/* Backdrop che mờ khi mở Menu trên màn hình đứng */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 lg:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Sidebar Container: Hỗ trợ cả Drawer di động và Nút Thu Gọn (Collapsible) trên Desktop */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${
            isCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'
          } fixed inset-y-0 left-0 z-30 lg:static lg:z-20 w-72 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 shrink-0 border-r border-slate-200 dark:border-zinc-800 p-3 sm:p-4 flex flex-col justify-between shadow-xl lg:shadow-xs transition-all duration-300 ease-in-out`}
        >
          <div className="space-y-4">
            {/* Header Nút Thu Gọn Desktop & Tiêu đề danh mục */}
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-zinc-800">
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                  Hạng Mục Quản Lý
                </div>
              )}
              {/* Nút Thu gọn / Mở rộng Sidebar */}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors ${
                  isCollapsed ? 'mx-auto' : 'ml-auto'
                }`}
                title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Danh Mục Điều Hành */}
            <div className="space-y-1.5">
              {/* 1. Thống Kê & Báo Cáo */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('analytics');
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                title="Thống Kê & Báo Cáo"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <BarChart3 className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'analytics' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700'}`} />
                  {!isCollapsed && <span>Thống Kê & Báo Cáo</span>}
                </div>
                {!isCollapsed && (
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === 'analytics' ? 'translate-x-0.5 text-white' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                )}
              </button>

              {/* 2. Quản Lý Khoa Phòng */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('departments');
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                title="Khoa Phòng"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                  activeTab === 'departments'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Building2 className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'departments' ? 'text-white' : 'text-sky-600 dark:text-sky-400 group-hover:text-sky-700'}`} />
                  {!isCollapsed && <span>Khoa Phòng</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${activeTab === 'departments' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
                    {departments.length}
                  </span>
                )}
              </button>

              {/* 3. Tài Khoản Quản Trị */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('users');
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                title="Tài Khoản Quản Trị"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                  activeTab === 'users'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Users className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'users' ? 'text-white' : 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700'}`} />
                  {!isCollapsed && <span>Tài Khoản Quản Trị</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${activeTab === 'users' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
                    {users.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Nút thu gọn nhanh ở chân Sidebar */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 hidden lg:block">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-3 py-2'
              } text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer`}
              title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    <span>Thu gọn thanh menu</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </aside>

        {/* =========================================================================
            VÙNG NỘI DUNG CHÍNH (CONTENT AREA)
        ========================================================================= */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Header Title Bar nhỏ gọn phía trên nội dung */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#000080] dark:text-white tracking-tight uppercase">
                {activeTab === 'analytics' && 'Thống Kê & Báo Cáo Chất Lượng'}
                {activeTab === 'departments' && 'Quản Lý Danh Sách Khoa Phòng'}
                {activeTab === 'users' && 'Quản Lý Tài Khoản Quản Trị'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                Cổng giám sát điều hành thời gian thực • Bệnh viện Quân y 7A
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSAT Toàn Viện: {avgRating}/5.0</span>
              </span>
            </div>
          </div>

        {/* =========================================================================
            TAB 1: THỐNG KÊ & BÁO CÁO (ANALYTICS)
        ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* HÀNG KPI: 2 CỘT TRÊN MOBILE NHỎ, 4 CỘT TRÊN MÀN HÌNH LỚN */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
              <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Tổng Lượt Đánh Giá</span>
                  <div className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{totalReviews}</div>
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-2 inline-flex items-center gap-1">
                  ↑ Tăng 12% so với tháng trước
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Điểm TB Toàn Viện</span>
                  <div className="text-xl sm:text-3xl font-black text-amber-500 mt-1">★ {avgRating} / 5.0</div>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 font-medium mt-2">Đạt chuẩn chất lượng BQP</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Chỉ Số Hài Lòng (CSAT)</span>
                  <div className="text-xl sm:text-3xl font-black text-teal-600 mt-1">{csat}%</div>
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-2">Mục tiêu quý: ≥ 92%</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Chờ Ban Kiểm Duyệt</span>
                  <div className="text-xl sm:text-3xl font-black text-rose-600 mt-1">{pendingReviews.length}</div>
                </div>
                <span className="text-[10px] sm:text-xs text-rose-500 font-bold mt-2">Cần xử lý trong 24h</span>
              </div>
            </div>

            {/* HÀNG BIỂU ĐỒ TRỰC QUAN (CO GIÃN TỐT TRÊN MỌI MÀN HÌNH) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Biểu đồ 1: Xu hướng CSAT */}
              <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Xu Hướng CSAT 6 Tháng Gần Nhất</span>
                  </h3>
                </div>
                <div className="h-60 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                      <YAxis domain={[80, 100]} stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="csat" name="CSAT (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Biểu đồ 2: Cơ cấu số sao */}
              <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Cơ Cấu Điểm Đánh Giá (Phân Bố Số Sao)</span>
                  </h3>
                </div>
                <div className="h-60 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDistributionData} layout="vertical" margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#888888" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" name="Số lượt" radius={[0, 6, 6, 0]}>
                        {ratingDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* BẢNG XẾP HẠNG CHẤT LƯỢNG KHOA PHÒNG */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Bảng Xếp Hạng Chất Lượng Các Khoa Phòng ({deptPerformanceData.length})</span>
                </h3>
                <span className="text-xs text-muted-foreground">Sắp xếp theo dữ liệu khảo sát thực tế</span>
              </div>

              {/* KHỐI CUỘN BẢNG AN TOÀN TRÊN MOBILE */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left text-xs sm:text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Mã</th>
                      <th className="pb-3 font-semibold">Tên Khoa Phòng</th>
                      <th className="pb-3 font-semibold">Khối</th>
                      <th className="pb-3 font-semibold">Điểm TB</th>
                      <th className="pb-3 font-semibold">Số Đánh Giá</th>
                      <th className="pb-3 font-semibold">Xếp Hạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {deptPerformanceData.map((d, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 font-bold text-emerald-800 dark:text-emerald-400 font-mono">{d.name}</td>
                        <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">{d.fullName}</td>
                        <td className="py-3">{getCategoryBadge(d.category)}</td>
                        <td className="py-3 font-bold text-amber-500 whitespace-nowrap">★ {d.rating}</td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">{d.reviews} lượt</td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            d.rating >= 4.8 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : d.rating >= 4.5 
                              ? 'bg-teal-100 text-teal-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.rating >= 4.8 ? 'Xuất sắc' : d.rating >= 4.5 ? 'Tốt' : 'Đạt yêu cầu'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: QUẢN LÝ KHOA PHÒNG (DEPARTMENTS CRUD)
        ========================================================================= */}
        {activeTab === 'departments' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* FORM THÊM KHOA PHÒNG (RESPONSIVE GRID) */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thêm Khoa Phòng / Đơn Vị Mới</span>
              </h3>
              
              <form onSubmit={handleCreateDept} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tên Khoa Phòng *</label>
                  <Input
                    type="text"
                    placeholder="VD: Khoa Tai Mũi Họng"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Mã Viết Tắt *</label>
                  <Input
                    type="text"
                    placeholder="VD: TMH"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phân Thuộc Khối *</label>
                  <Select
                    value={newDeptCategory}
                    onChange={(e) => setNewDeptCategory(e.target.value as any)}
                  >
                    <option value="noi">1. Khối Nội</option>
                    <option value="ngoai">2. Khối Ngoại & Chuyên khoa</option>
                    <option value="canlamsang">3. Khối Cận lâm sàng & Hỗ trợ</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ghi Chú / Chuyên Môn Phụ</label>
                  <Input
                    type="text"
                    placeholder="VD: Liên chuyên khoa, MRI..."
                    value={newDeptNote}
                    onChange={(e) => setNewDeptNote(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-semibold mb-1">Mô Tả Chức Năng</label>
                  <Input
                    type="text"
                    placeholder="Khám và điều trị chuyên sâu..."
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Lưu Khoa Phòng
                  </button>
                </div>
              </form>
            </div>

            {/* BỘ LỌC & TÌM KIẾM THEO KHỐI CHO 21 KHOA PHÒNG */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {[
                      { id: 'all', label: `Tất Cả (${departments.length})` },
                      { id: 'noi', label: `Khối Nội (${departments.filter((d) => getDeptCategory(d) === 'noi').length})` },
                      { id: 'ngoai', label: `Khối Ngoại (${departments.filter((d) => getDeptCategory(d) === 'ngoai').length})` },
                      { id: 'canlamsang', label: `Cận Lâm Sàng (${departments.filter((d) => getDeptCategory(d) === 'canlamsang').length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDeptFilterCategory(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                          deptFilterCategory === tab.id
                            ? 'bg-[#000080] text-white shadow-xs'
                            : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full sm:w-64 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm tên khoa hoặc mã..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* LƯỚI THẺ KHOA PHÒNG CO GIÃN THÔNG MINH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {filteredDepartments.map((dept) => {
                  const cat = getDeptCategory(dept);
                  return (
                    <div
                      key={dept.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-100 text-slate-800">
                              {dept.code}
                            </span>
                            {getCategoryBadge(cat)}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xóa khoa ${dept.name}?`)) deleteDepartment(dept.id);
                            }}
                            className="text-zinc-400 hover:text-rose-600 p-1 transition cursor-pointer"
                            title="Xóa khoa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                          {dept.name}
                        </h4>
                        {dept.note && (
                          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5 block">
                            • {dept.note}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {dept.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex justify-between items-center">
                        <span>{dept.doctorCount || 4} Bác sĩ</span>
                        <span className="font-bold text-amber-500">★ {dept.averageRating || '4.8'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: TÀI KHOẢN & PHÂN QUYỀN (USERS)
        ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
            {/* TỔNG QUAN PHÂN QUYỀN THỰC TẾ */}
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 sm:p-5 rounded-2xl border border-purple-200 dark:border-purple-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                  Phân Quyền Người Dùng Hệ Thống
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                  • <strong>Quản Trị Viên (Admin):</strong> Giám sát toàn diện, thống kê CSAT và duyệt đánh giá.<br />
                  • <strong>Cán bộ y tế & Bác sĩ:</strong> Nhận phản hồi chuyên môn trực tiếp.
                </p>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-700 text-white self-start sm:self-auto shrink-0">
                Tổng: {users.length} tài khoản
              </div>
            </div>

            {/* BẢNG TÀI KHOẢN KÈM BỘ LỌC TÌM KIẾM */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Danh Sách Tài Khoản Quản Trị ({filteredUsers.length})</span>
                </h3>

                <div className="flex items-center gap-2 flex-col sm:flex-row">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <Select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản Trị Viên (Admin)</option>
                    <option value="staff">Bác sĩ / Khoa (Staff)</option>
                    <option value="patient">Bệnh nhân (Patient)</option>
                  </Select>
                </div>
              </div>

              {/* BẢNG CUỘN NGANG AN TOÀN TRÊN MOBILE */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Người Dùng</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Vai Trò</th>
                      <th className="pb-3 font-semibold">Trạng Thái</th>
                      <th className="pb-3 font-semibold text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              width={36}
                              height={36}
                              unoptimized
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-200 shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">{u.name}</span>
                              <span className="text-[11px] text-zinc-400">{u.title || 'Người dùng'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">{u.email}</td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : u.role === 'staff'
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {u.role === 'admin' ? '🛡️ Quản Trị Viên' : u.role === 'staff' ? '🩺 Bác Sĩ / Khoa' : '👤 Bệnh Nhân'}
                          </span>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition ${
                              u.status === 'suspended'
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Tạm Khóa' : 'Đang Hoạt Động'}
                          </button>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Xóa tài khoản của ${u.name}?`)) deleteUserByAdmin(u.id);
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4 ml-auto" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
