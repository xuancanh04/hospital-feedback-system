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
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  Table as TableIcon,
  Edit2,
  Shield,
  Stethoscope,
  UserCheck,
  UserX,
  AlertTriangle,
  History
} from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminAnalyticsView } from '@/components/admin-analytics-view';
import { PatientReviewsHistory } from '@/components/patient-reviews-history';

export default function AdminPortalPage() {
  const { users, createUserByAdmin, deleteUserByAdmin, toggleUserStatus } = useAuth();
  const {
    reviews,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    updateReviewStatus,
  } = useFeedback();

  const [activeTab, setActiveTab] = useState<'analytics' | 'reviews' | 'departments' | 'users'>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptFormName, setDeptFormName] = useState('');
  const [deptFormCode, setDeptFormCode] = useState('');
  const [deptFormCategory, setDeptFormCategory] = useState<'noi' | 'ngoai' | 'canlamsang'>('noi');
  const [deptFormDesc, setDeptFormDesc] = useState('');

  const [deptSearch, setDeptSearch] = useState('');
  const [deptFilterCategory, setDeptFilterCategory] = useState<'all' | 'noi' | 'ngoai' | 'canlamsang'>('all');

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTitle, setAdminTitle] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const [deletingDept, setDeletingDept] = useState<(typeof departments)[0] | null>(null);
  const [deletingUser, setDeletingUser] = useState<(typeof users)[0] | null>(null);

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

  const ratingDistributionData = [
    { name: '5 Sao', count: reviews.filter((r) => r.overallRating === 5).length, fill: '#10b981' },
    { name: '4 Sao', count: reviews.filter((r) => r.overallRating === 4).length, fill: '#3b82f6' },
    { name: '3 Sao', count: reviews.filter((r) => r.overallRating === 3).length, fill: '#f59e0b' },
    { name: '2 Sao', count: reviews.filter((r) => r.overallRating === 2).length, fill: '#f97316' },
    { name: '1 Sao', count: reviews.filter((r) => r.overallRating === 1).length, fill: '#ef4444' },
  ];

  const trendData = [
    { month: 'T11/2025', csat: 91, reviews: 45 },
    { month: 'T12/2025', csat: 93, reviews: 52 },
    { month: 'T01/2026', csat: 92, reviews: 60 },
    { month: 'T02/2026', csat: 95, reviews: 48 },
    { month: 'T03/2026', csat: 94, reviews: 68 },
    { month: 'T04/2026', csat: csat, reviews: totalReviews },
  ];

  const deptPerformanceData = useMemo(() => {
    return departments.map((d) => {
      const deptRev = reviews.filter((r) => r.departmentId === d.id);
      const avg = deptRev.length
        ? (deptRev.reduce((acc, c) => acc + c.overallRating, 0) / deptRev.length).toFixed(1)
        : (d.averageRating || 4.8).toString();
      return {
        id: d.id,
        code: d.code,
        name: d.name,
        category: getDeptCategory(d),
        rating: parseFloat(avg),
        reviews: deptRev.length,
        doctorCount: d.doctorCount || 4,
        note: d.note,
        description: d.description,
      };
    }).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  }, [departments, reviews]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchCat = deptFilterCategory === 'all' || getDeptCategory(d) === deptFilterCategory;
      const q = deptSearch.toLowerCase().trim();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [departments, deptFilterCategory, deptSearch]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.role === 'admin')
      .filter((u) => {
        const matchStatus = userStatusFilter === 'all' || (u.status || 'active') === userStatusFilter;
        const q = userSearch.toLowerCase().trim();
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.title && u.title.toLowerCase().includes(q)) || (u.phone && u.phone.includes(q));
        return matchStatus && matchSearch;
      });
  }, [users, userStatusFilter, userSearch]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) return;

    await createUserByAdmin({
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      password: adminPassword.trim(),
      role: 'admin',
      title: adminTitle.trim() || 'Quản Trị Viên Ban Giám Đốc',
      phone: adminPhone.trim() || undefined,
      avatar: '/admin-avatar-3d.jpg',
    });

    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminTitle('');
    setAdminPhone('');
    setShowAddAdminModal(false);
  };

  const openAddDeptModal = () => {
    setEditingDeptId(null);
    setDeptFormName('');
    setDeptFormCode('');
    setDeptFormCategory('noi');
    setDeptFormDesc('');
    setShowAddDeptModal(true);
  };

  const openEditDeptModal = (dept: (typeof departments)[0]) => {
    setEditingDeptId(dept.id);
    setDeptFormName(dept.name);
    setDeptFormCode(dept.code);
    setDeptFormCategory(getDeptCategory(dept));
    setDeptFormDesc(dept.description || '');
    setShowAddDeptModal(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormName.trim() || !deptFormCode.trim()) return;

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        name: deptFormName.trim(),
        code: deptFormCode.trim().toUpperCase(),
        category: deptFormCategory,
        description: deptFormDesc.trim() || 'Khoa chuyên môn trực thuộc bệnh viện.',
      });
    } else {
      addDepartment({
        name: deptFormName.trim(),
        code: deptFormCode.trim().toUpperCase(),
        description: deptFormDesc.trim() || 'Khoa chuyên môn trực thuộc bệnh viện.',
        iconName: 'Building2',
        doctorCount: 4,
        category: deptFormCategory,
      });
    }

    setShowAddDeptModal(false);
  };

  const getCategoryBadge = (cat: 'noi' | 'ngoai' | 'canlamsang') => {
    switch (cat) {
      case 'noi':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
            Khối Nội
          </span>
        );
      case 'ngoai':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
            Khối Ngoại
          </span>
        );
      case 'canlamsang':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            Cận Lâm Sàng
          </span>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row">

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
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center"
            title={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
            aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 lg:hidden animate-in fade-in duration-200"
          />
        )}

        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${
            isCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'
          } fixed inset-y-0 left-0 z-30 lg:static lg:z-20 w-72 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 shrink-0 border-r border-slate-200 dark:border-zinc-800 p-3 sm:p-4 flex flex-col justify-between shadow-xl lg:shadow-xs transition-all duration-300 ease-in-out`}
        >
          <div className="space-y-4">
            
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-zinc-800">
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                  Hạng Mục Quản Lý
                </div>
              )}
              
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

            <div className="space-y-1.5">
              
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

              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                title="Lịch Sử Đánh Giá"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                  activeTab === 'reviews'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <History className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'reviews' ? 'text-white' : 'text-teal-600 dark:text-teal-400 group-hover:text-teal-700'}`} />
                  {!isCollapsed && <span>Lịch Sử Đánh Giá</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${activeTab === 'reviews' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
                    {reviews.length}
                  </span>
                )}
              </button>

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
                    {filteredUsers.length}
                  </span>
                )}
              </button>
            </div>
          </div>

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

        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#000080] dark:text-white tracking-tight uppercase">
                {activeTab === 'analytics' && 'Thống Kê & Báo Cáo Chất Lượng'}
                {activeTab === 'reviews' && 'Lịch Sử Đánh Giá Của Bệnh Nhân'}
                {activeTab === 'departments' && 'Quản Lý Danh Sách Khoa Phòng'}
                {activeTab === 'users' && 'Quản Lý Tài Khoản Quản Trị'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                Cổng giám sát điều hành thời gian thực • Bệnh viện Quân y 7A
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/80">
                CSAT Toàn Viện: <strong className="ml-1 font-bold">{avgRating}</strong>/5.0
              </span>
            </div>
          </div>

        {activeTab === 'analytics' && (
          <AdminAnalyticsView
            reviews={reviews}
            departments={departments}
            getDeptCategory={getDeptCategory}
          />
        )}

                {activeTab === 'reviews' && (
          <PatientReviewsHistory
            reviews={reviews}
            departments={departments}
            onUpdateStatus={updateReviewStatus}
          />
        )}

        {activeTab === 'departments' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Danh Sách Khoa Phòng Bệnh Viện</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {filteredDepartments.length} khoa
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  
                  <button
                    type="button"
                    onClick={openAddDeptModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Khoa Mới</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên khoa hoặc mã khoa..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
              
              <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredDepartments.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs px-4">
                    Không tìm thấy khoa phòng nào phù hợp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  filteredDepartments.map((dept) => {
                    const cat = getDeptCategory(dept);
                    return (
                      <div key={dept.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700">
                              {dept.code}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                              {dept.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditDeptModal(dept)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingDept(dept)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {dept.note && (
                          <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                            {dept.note}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                          <div>
                            {getCategoryBadge(cat)}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60">
                            ★ {dept.averageRating || '4.8'}
                          </div>
                        </div>

                        {dept.description && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {dept.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[720px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                      <th className="py-3 px-3 w-24 text-center">Mã Khoa</th>
                      <th className="py-3 px-4">Tên Khoa Phòng</th>
                      <th className="py-3 px-4">Khối Chuyên Môn</th>
                      <th className="py-3 px-4">Mô Tả Chức Năng</th>
                      <th className="py-3 px-4 text-center">Đánh Giá</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                          Không tìm thấy khoa phòng nào phù hợp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept) => {
                        const cat = getDeptCategory(dept);
                        return (
                          <tr 
                            key={dept.id} 
                            className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-block px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700 min-w-[56px] text-center">
                                {dept.code}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 dark:text-zinc-100 block text-sm">
                                {dept.name}
                              </span>
                              {dept.note && (
                                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                                  • {dept.note}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getCategoryBadge(cat)}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
                              <p className="line-clamp-2 leading-relaxed">
                                {dept.description || 'Chuyên môn điều trị chất lượng cao.'}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap font-bold text-amber-500">
                              ★ {dept.averageRating || '4.8'}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditDeptModal(dept)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  title="Chỉnh sửa thông tin khoa"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingDept(dept)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  title="Xóa khoa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 dark:from-purple-950/20 dark:to-zinc-900 p-4 sm:p-5 rounded-2xl border border-purple-200/80 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-purple-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Danh Sách Tài Khoản Quản Trị Hệ Thống (Admin)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Các tài khoản Quản Trị Viên có toàn quyền giám sát hệ thống, theo dõi thống kê CSAT, quản lý danh mục khoa phòng và phân quyền tài khoản điều hành.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-700 text-white shadow-sm">
                  {filteredUsers.length} Quản Trị Viên
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Admin</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
              
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Ban Quản Trị ({filteredUsers.length})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên, email, chức danh..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                    />
                  </div>

                  <Select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="!h-8 !py-1 text-xs w-full sm:w-auto"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="suspended">Đang tạm khóa</option>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                      <th className="py-3 px-4">Quản Trị Viên</th>
                      <th className="py-3 px-4">Email Đăng Nhập</th>
                      <th className="py-3 px-4">Quyền Hạn</th>
                      <th className="py-3 px-4">Điện Thoại</th>
                      <th className="py-3 px-4 text-center">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                          Không tìm thấy tài khoản quản trị nào phù hợp với tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuspended = u.status === 'suspended';
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={u.avatar || '/admin-avatar-3d.jpg'}
                                  alt={u.name}
                                  width={36}
                                  height={36}
                                  unoptimized
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-900 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-zinc-100 block">{u.name}</span>
                                  <span className="text-[11px] text-slate-400 font-medium">{u.title || 'Quản Trị Viên Hệ Thống'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-zinc-300">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                                <Shield className="w-3 h-3" />
                                Quản Trị Toàn Quyền
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-300 font-medium">
                              {u.phone || '028 3855 5727'}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleUserStatus(u.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition ${
                                  isSuspended
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                                title="Nhấn để đổi trạng thái"
                              >
                                {isSuspended ? (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    <span>Tạm Khóa</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Hoạt Động</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {filteredUsers.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => setDeletingUser(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  title="Xóa tài khoản"
                                >
                                  <Trash2 className="w-4 h-4 ml-auto" />
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Mặc định</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>

      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setShowAddDeptModal(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
            
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {editingDeptId ? 'Chỉnh Sửa Khoa Phòng' : 'Thêm Khoa Phòng Mới'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {editingDeptId ? 'Cập nhật lại thông tin chuyên môn' : 'Đưa khoa phòng mới vào danh mục phục vụ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDeptModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Đóng bảng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Tên Khoa Phòng *
                </label>
                <Input
                  type="text"
                  placeholder="VD: Khoa Khám Bệnh, Khoa Ngoại Tiêu Hóa..."
                  value={deptFormName}
                  onChange={(e) => setDeptFormName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Mã Khoa (Viết tắt) *
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: KB, NTH, TMH..."
                    value={deptFormCode}
                    onChange={(e) => setDeptFormCode(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Khối Chuyên Môn *
                  </label>
                  <Select
                    value={deptFormCategory}
                    onChange={(e) => setDeptFormCategory(e.target.value as any)}
                  >
                    <option value="noi">Khối Nội</option>
                    <option value="ngoai">Khối Ngoại & Chuyên khoa</option>
                    <option value="canlamsang">Khối Cận Lâm Sàng & Hỗ trợ</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Mô Tả Chức Năng
                </label>
                <textarea
                  rows={4}
                  placeholder="Khám chữa bệnh chuyên sâu theo tiêu chuẩn Bộ Y tế..."
                  value={deptFormDesc}
                  onChange={(e) => setDeptFormDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 dark:text-zinc-300 block">Lưu ý quản trị:</span>
                <p>Mã khoa và tên khoa sau khi lưu sẽ lập tức đồng bộ sang Kiosk và trang khảo sát bệnh nhân trực tuyến.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
                >
                  {editingDeptId ? 'Lưu Thay Đổi' : 'Thêm Khoa Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setShowAddAdminModal(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
            
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Thêm Quản Trị Viên
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cấp tài khoản điều hành hệ thống mới
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Đóng bảng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Họ và tên cán bộ quản trị *
                </label>
                <Input
                  type="text"
                  placeholder="VD: Thượng tá Nguyễn Văn A"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Email đăng nhập hệ thống *
                </label>
                <Input
                  type="email"
                  placeholder="VD: admin2@benhvien7a.vn"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Chức danh / Phòng ban
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: Ban Giám Đốc"
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: 028 3855..."
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300 space-y-1">
                <span className="font-bold block">Phân quyền: Quản trị viên</span>
                <p>Tài khoản có quyền giám sát toàn bộ báo cáo phân tích, theo dõi đánh giá của bệnh nhân, và quản lý danh mục phòng ban.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
                >
                  Tạo Tài Khoản Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingDept && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setDeletingDept(null)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-rose-50/70 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
                    Xác Nhận Xóa Khoa Phòng
                  </h3>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400">
                    Thao tác này sẽ gỡ bỏ khoa khỏi hệ thống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingDept(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Mã khoa:</span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200">
                    {deletingDept.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Tên khoa phòng:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {deletingDept.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Khối:</span>
                  {getCategoryBadge(getDeptCategory(deletingDept))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ Khoa phòng này sẽ không còn hiển thị trên các thiết bị Kiosk và danh sách đánh giá của bệnh nhân.
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingDept(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition"
              >
                Giữ Lại
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDepartment(deletingDept.id);
                  setDeletingDept(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setDeletingUser(null)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-rose-50/70 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
                    Xóa Tài Khoản Quản Trị
                  </h3>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400">
                    Hủy quyền truy cập hệ thống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Họ tên:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {deletingUser.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Email:</span>
                  <span className="font-mono text-xs text-slate-700 dark:text-zinc-300">
                    {deletingUser.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Chức danh:</span>
                  <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                    {deletingUser.title || 'Quản trị viên'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                Tài khoản này sẽ bị thu hồi toàn bộ quyền quản trị và không thể đăng nhập vào cổng quản trị viên được nữa.
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUserByAdmin(deletingUser.id);
                  setDeletingUser(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
