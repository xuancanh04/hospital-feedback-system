'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFeedback } from '@/context/feedback-context';
import { ReviewCard } from '@/components/review-card';
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
  Award
} from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function AdminPortalPage() {
  const { users, deleteUserByAdmin, toggleUserStatus } = useAuth();
  const {
    reviews,
    departments,
    addDepartment,
    deleteDepartment,
    doctors,
    addDoctor,
    deleteDoctor,
  } = useFeedback();
  const [activeTab, setActiveTab] = useState<'analytics' | 'moderation' | 'departments' | 'doctors' | 'users'>('analytics');

  // Form states for adding department
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  // Form states for adding doctor
  const [newDocName, setNewDocName] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDeptId, setNewDocDeptId] = useState(departments[0]?.id || '');
  const [newDocExp, setNewDocExp] = useState(10);

  // Analytics Computations
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending');

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
      name: d.code,
      fullName: d.name,
      rating: parseFloat(avg),
      reviews: deptRev.length,
    };
  });

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    addDepartment({
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      description: newDeptDesc.trim(),
      iconName: 'Building2',
      doctorCount: 4,
    });
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptDesc('');
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const dept = departments.find((d) => d.id === newDocDeptId);
    addDoctor({
      name: newDocName.trim(),
      title: newDocTitle.trim() || 'Bác sĩ chuyên khoa',
      departmentId: newDocDeptId,
      departmentName: dept ? dept.name : '',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
      experienceYears: Number(newDocExp) || 5,
    });
    setNewDocName('');
    setNewDocTitle('');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800 text-purple-200 text-xs font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            HỆ THỐNG ĐIỀU HÀNH & GIÁM SÁT CHẤT LƯỢNG • BAN GIÁM ĐỐC
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Trung Tâm Quản Trị & Kiểm Duyệt Bệnh Viện Quân Y 7A
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1">
            Theo dõi chỉ số CSAT, xu hướng phản hồi người bệnh và quản lý danh mục toàn viện.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-sm self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'analytics' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
            }`}
          >
            Thống Kê & Báo Cáo
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-2 rounded-xl transition relative ${
              activeTab === 'moderation' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
            }`}
          >
            Kiểm Duyệt ({pendingReviews.length})
            {pendingReviews.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                Mới
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'departments' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
            }`}
          >
            Khoa Phòng ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'doctors' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
            }`}
          >
            Bác Sĩ ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'users' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
            }`}
          >
            Tài Khoản & Phân Quyền ({users.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Top KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Tổng số lượt đánh giá</span>
              <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{totalReviews}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">↑ Tăng 12% so với tháng trước</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Điểm hài lòng trung bình</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">{avgRating} / 5.0</div>
              <span className="text-[11px] text-zinc-500 font-medium mt-1 inline-block">Đạt chuẩn chất lượng BQP</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Chỉ số hài lòng (CSAT)</span>
              <div className="text-2xl sm:text-3xl font-black text-teal-600 mt-1">{csat}%</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Mục tiêu quý: ≥ 92%</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Đang chờ ban kiểm duyệt</span>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{pendingReviews.length}</div>
              <span className="text-[11px] text-rose-500 font-semibold mt-1 inline-block">Cần xử lý trong 24h</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Xu hướng CSAT */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Xu Hướng Chỉ Số Hài Lòng (CSAT) 6 Tháng Gần Nhất
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                    <YAxis domain={[80, 100]} stroke="#888888" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="csat" name="CSAT (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Phân bố số sao */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Cơ Cấu Điểm Đánh Giá (Phân Bố Số Sao)
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistributionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#888888" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} />
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

          {/* Department Rankings Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Bảng Xếp Hạng Chất Lượng Các Khoa Phòng
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold">Mã</th>
                    <th className="pb-3 font-semibold">Tên Khoa Phòng</th>
                    <th className="pb-3 font-semibold">Điểm TB</th>
                    <th className="pb-3 font-semibold">Số Đánh Giá</th>
                    <th className="pb-3 font-semibold">Đánh Giá Xếp Hạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {deptPerformanceData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 font-bold text-emerald-800 dark:text-emerald-400">{d.name}</td>
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">{d.fullName}</td>
                      <td className="py-3 font-bold text-amber-500">★ {d.rating}</td>
                      <td className="py-3 text-muted-foreground">{d.reviews} lượt</td>
                      <td className="py-3">
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

      {/* TAB 2: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Hàng Đợi Kiểm Duyệt Bài Viết
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kiểm duyệt tính xác thực và văn phong trước khi xuất bản ra trang công khai.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="relative">
                <ReviewCard review={rev} showAdminActions />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS CRUD */}
      {activeTab === 'departments' && (
        <div className="space-y-8">
          {/* Add Dept Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Thêm Khoa Phòng Khám Chữa Bệnh Mới
            </h3>
            <form onSubmit={handleCreateDept} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="block text-xs font-semibold mb-1">Mô tả chức năng</label>
                <Input
                  type="text"
                  placeholder="Khám và điều trị..."
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
                >
                  Lưu Khoa Phòng
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {dept.code}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa khoa ${dept.name}?`)) deleteDepartment(dept.id);
                      }}
                      className="text-zinc-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{dept.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{dept.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex justify-between">
                  <span>{dept.doctorCount} Bác sĩ</span>
                  <span className="font-semibold text-emerald-700">★ {dept.averageRating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCTORS CRUD */}
      {activeTab === 'doctors' && (
        <div className="space-y-8">
          {/* Add Doctor Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              Thêm Bác Sĩ / Cán Bộ Y Tế Mới
            </h3>
            <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Họ Tên Bác Sĩ *</label>
                <Input
                  type="text"
                  placeholder="BS.CKI Nguyễn Văn A"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Chức Danh / Cấp Bậc</label>
                <Input
                  type="text"
                  placeholder="Đại úy, Bác sĩ điều trị"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Khoa Phòng</label>
                <Select
                  value={newDocDeptId}
                  onChange={(e) => setNewDocDeptId(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Số Năm Kinh Nghiệm</label>
                <Input
                  type="number"
                  value={newDocExp}
                  onChange={(e) => setNewDocExp(Number(e.target.value))}
                />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
                >
                  Lưu Danh Sách Bác Sĩ
                </button>
              </div>
            </form>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{doc.name}</h4>
                    <p className="text-[11px] text-teal-700 font-medium">{doc.title}</p>
                    <p className="text-[11px] text-muted-foreground">{doc.departmentName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-500">★ {doc.rating}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa bác sĩ ${doc.name}?`)) deleteDoctor(doc.id);
                    }}
                    className="block mt-2 text-zinc-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USER ACCOUNTS & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* Header Info */}
          <div className="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-2xl border border-purple-200 dark:border-purple-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-purple-950 dark:text-purple-200">
                Phân Quyền Người Dùng Hệ Thống Thực Tế
              </h3>
              <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-0.5">
                • <strong>Khách hàng / Bệnh nhân (Patient):</strong> Tự đăng ký qua cổng công khai.<br />
                • <strong>Cán bộ y tế (Staff) & Ban Giám Đốc (Admin):</strong> Được cấp tài khoản định danh qua trang quản trị này.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-700 text-white self-start sm:self-auto">
              Tổng số: {users.length} tài khoản
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Danh Sách Tài Khoản Người Dùng & Phân Quyền
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold">Người Dùng</th>
                    <th className="pb-3 font-semibold">Email Đăng Nhập</th>
                    <th className="pb-3 font-semibold">Mật Khẩu</th>
                    <th className="pb-3 font-semibold">Vai Trò Phân Quyền</th>
                    <th className="pb-3 font-semibold">Trạng Thái</th>
                    <th className="pb-3 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-200"
                          />
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">{u.name}</span>
                            <span className="text-[11px] text-zinc-400">{u.title || 'Người dùng'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-300">{u.email}</td>
                      <td className="py-3.5 font-mono text-xs text-zinc-400">••••••••</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'staff'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {u.role === 'admin' ? '🛡️ Ban Giám Đốc' : u.role === 'staff' ? '🩺 Bác Sĩ / Khoa' : '👤 Bệnh Nhân'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.status === 'suspended'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Tạm Khóa' : 'Đang Hoạt Động'}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Xóa tài khoản của ${u.name}?`)) deleteUserByAdmin(u.id);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </ProtectedRoute>
  );
}
