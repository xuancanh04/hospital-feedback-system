'use client';

import React, { useState } from 'react';
import { useFeedback } from '@/context/feedback-context';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Edit3,
  Check,
  X,
  Search,
  Tablet,
  ExternalLink,
  Filter,
  Building2,
} from 'lucide-react';

type TagCategory = 'positive' | 'neutral' | 'critical';

interface FlatTagItem {
  id: string;
  text: string;
  category: TagCategory;
  departmentId: string; // 'all' hoặc id khoa cụ thể (vd: 'dept-noi-1')
}

export function AdminTagsConfigView() {
  const { 
    departments, 
    positiveTags, 
    neutralTags, 
    criticalTags, 
    departmentTags, 
    updateTags, 
    updateDepartmentTags 
  } = useFeedback();

  // Bộ lọc bảng
  const [filterCategory, setFilterCategory] = useState<'all' | TagCategory>('all');
  const [filterDept, setFilterDept] = useState<string>('all'); // 'all' | 'general' | departmentId

  // Drawer thêm thẻ mới từ bên phải
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>('positive');
  const [newTagDept, setNewTagDept] = useState<string>('all'); // 'all' hoặc departmentId

  // Chỉnh sửa trực tiếp tên thẻ
  const [editingItem, setEditingItem] = useState<{ id: string; originalText: string } | null>(null);
  const [editingText, setEditingText] = useState('');

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Trạng thái thông báo
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Gom toàn bộ thẻ (thẻ chung + thẻ riêng của từng khoa) thành 1 danh sách phẳng để quản lý tập trung
  const allTagItems: FlatTagItem[] = React.useMemo(() => {
    const items: FlatTagItem[] = [];

    // 1. Thẻ chung toàn viện
    positiveTags.forEach((t, idx) => {
      items.push({ id: `gen-pos-${idx}-${t}`, text: t, category: 'positive', departmentId: 'all' });
    });
    (neutralTags || []).forEach((t, idx) => {
      items.push({ id: `gen-neu-${idx}-${t}`, text: t, category: 'neutral', departmentId: 'all' });
    });
    criticalTags.forEach((t, idx) => {
      items.push({ id: `gen-crit-${idx}-${t}`, text: t, category: 'critical', departmentId: 'all' });
    });

    // 2. Thẻ riêng của từng khoa phòng
    Object.entries(departmentTags || {}).forEach(([deptId, deptTagObj]) => {
      (deptTagObj.positiveTags || []).forEach((t, idx) => {
        items.push({ id: `dept-${deptId}-pos-${idx}-${t}`, text: t, category: 'positive', departmentId: deptId });
      });
      (deptTagObj.neutralTags || []).forEach((t, idx) => {
        items.push({ id: `dept-${deptId}-neu-${idx}-${t}`, text: t, category: 'neutral', departmentId: deptId });
      });
      (deptTagObj.criticalTags || []).forEach((t, idx) => {
        items.push({ id: `dept-${deptId}-crit-${idx}-${t}`, text: t, category: 'critical', departmentId: deptId });
      });
    });

    return items;
  }, [positiveTags, neutralTags, criticalTags, departmentTags]);

  // Thông báo toast
  const triggerToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Thêm thẻ mới từ Drawer bên phải
  const handleAddTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTagText.trim();
    if (!trimmed) return;

    if (newTagDept === 'all') {
      // Thêm vào thẻ chung toàn viện
      let updatedPos = positiveTags;
      let updatedNeu = neutralTags || [];
      let updatedCrit = criticalTags;

      if (newTagCategory === 'positive') {
        if (!updatedPos.includes(trimmed)) updatedPos = [...updatedPos, trimmed];
      } else if (newTagCategory === 'neutral') {
        if (!updatedNeu.includes(trimmed)) updatedNeu = [...updatedNeu, trimmed];
      } else {
        if (!updatedCrit.includes(trimmed)) updatedCrit = [...updatedCrit, trimmed];
      }

      await updateTags({
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    } else {
      // Thêm vào thẻ riêng của khoa cụ thể
      const currentDeptObj = departmentTags[newTagDept] || { positiveTags: [], neutralTags: [], criticalTags: [] };
      let updatedPos = currentDeptObj.positiveTags || [];
      let updatedNeu = currentDeptObj.neutralTags || [];
      let updatedCrit = currentDeptObj.criticalTags || [];

      if (newTagCategory === 'positive') {
        if (!updatedPos.includes(trimmed)) updatedPos = [...updatedPos, trimmed];
      } else if (newTagCategory === 'neutral') {
        if (!updatedNeu.includes(trimmed)) updatedNeu = [...updatedNeu, trimmed];
      } else {
        if (!updatedCrit.includes(trimmed)) updatedCrit = [...updatedCrit, trimmed];
      }

      await updateDepartmentTags(newTagDept, {
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    }

    setNewTagText('');
    setShowAddDrawer(false);
    triggerToast();
  };

  // Xóa thẻ
  const handleRemoveTag = async (item: FlatTagItem) => {
    if (item.departmentId === 'all') {
      let updatedPos = positiveTags;
      let updatedNeu = neutralTags || [];
      let updatedCrit = criticalTags;

      if (item.category === 'positive') {
        updatedPos = positiveTags.filter((t) => t !== item.text);
      } else if (item.category === 'neutral') {
        updatedNeu = (neutralTags || []).filter((t) => t !== item.text);
      } else {
        updatedCrit = criticalTags.filter((t) => t !== item.text);
      }

      await updateTags({
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    } else {
      const currentDeptObj = departmentTags[item.departmentId] || {};
      let updatedPos = (currentDeptObj.positiveTags || []).filter((t) => item.category !== 'positive' || t !== item.text);
      let updatedNeu = (currentDeptObj.neutralTags || []).filter((t) => item.category !== 'neutral' || t !== item.text);
      let updatedCrit = (currentDeptObj.criticalTags || []).filter((t) => item.category !== 'critical' || t !== item.text);

      await updateDepartmentTags(item.departmentId, {
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    }

    triggerToast();
  };

  // Đổi phân loại mức sao (positive / neutral / critical)
  const handleChangeCategory = async (item: FlatTagItem, targetCategory: TagCategory) => {
    if (item.category === targetCategory) return;

    if (item.departmentId === 'all') {
      let updatedPos = positiveTags.filter((t) => item.category !== 'positive' || t !== item.text);
      let updatedNeu = (neutralTags || []).filter((t) => item.category !== 'neutral' || t !== item.text);
      let updatedCrit = criticalTags.filter((t) => item.category !== 'critical' || t !== item.text);

      if (targetCategory === 'positive') updatedPos = [...updatedPos, item.text];
      else if (targetCategory === 'neutral') updatedNeu = [...updatedNeu, item.text];
      else updatedCrit = [...updatedCrit, item.text];

      await updateTags({
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    } else {
      const currentDeptObj = departmentTags[item.departmentId] || {};
      let updatedPos = (currentDeptObj.positiveTags || []).filter((t) => item.category !== 'positive' || t !== item.text);
      let updatedNeu = (currentDeptObj.neutralTags || []).filter((t) => item.category !== 'neutral' || t !== item.text);
      let updatedCrit = (currentDeptObj.criticalTags || []).filter((t) => item.category !== 'critical' || t !== item.text);

      if (targetCategory === 'positive') updatedPos = [...updatedPos, item.text];
      else if (targetCategory === 'neutral') updatedNeu = [...updatedNeu, item.text];
      else updatedCrit = [...updatedCrit, item.text];

      await updateDepartmentTags(item.departmentId, {
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    }

    triggerToast();
  };

  // Đổi khoa phòng áp dụng cho thẻ (hoặc chuyển sang Thẻ chung toàn viện)
  const handleChangeDepartment = async (item: FlatTagItem, targetDeptId: string) => {
    if (item.departmentId === targetDeptId) return;

    // 1. Xóa khỏi nguồn cũ
    if (item.departmentId === 'all') {
      const updatedPos = positiveTags.filter((t) => item.category !== 'positive' || t !== item.text);
      const updatedNeu = (neutralTags || []).filter((t) => item.category !== 'neutral' || t !== item.text);
      const updatedCrit = criticalTags.filter((t) => item.category !== 'critical' || t !== item.text);
      await updateTags({
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    } else {
      const currentDeptObj = departmentTags[item.departmentId] || {};
      const updatedPos = (currentDeptObj.positiveTags || []).filter((t) => item.category !== 'positive' || t !== item.text);
      const updatedNeu = (currentDeptObj.neutralTags || []).filter((t) => item.category !== 'neutral' || t !== item.text);
      const updatedCrit = (currentDeptObj.criticalTags || []).filter((t) => item.category !== 'critical' || t !== item.text);
      await updateDepartmentTags(item.departmentId, {
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    }

    // 2. Thêm vào đích mới
    if (targetDeptId === 'all') {
      let updatedPos = positiveTags;
      let updatedNeu = neutralTags || [];
      let updatedCrit = criticalTags;
      if (item.category === 'positive') updatedPos = [...updatedPos, item.text];
      else if (item.category === 'neutral') updatedNeu = [...updatedNeu, item.text];
      else updatedCrit = [...updatedCrit, item.text];
      await updateTags({
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    } else {
      const targetDeptObj = departmentTags[targetDeptId] || {};
      let updatedPos = targetDeptObj.positiveTags || [];
      let updatedNeu = targetDeptObj.neutralTags || [];
      let updatedCrit = targetDeptObj.criticalTags || [];
      if (item.category === 'positive') updatedPos = [...updatedPos, item.text];
      else if (item.category === 'neutral') updatedNeu = [...updatedNeu, item.text];
      else updatedCrit = [...updatedCrit, item.text];
      await updateDepartmentTags(targetDeptId, {
        positiveTags: updatedPos,
        neutralTags: updatedNeu,
        criticalTags: updatedCrit,
      });
    }

    triggerToast();
  };

  // Lưu chỉnh sửa tên thẻ
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const targetItem = allTagItems.find((i) => i.id === editingItem.id);
    if (!targetItem) return;

    const trimmed = editingText.trim();
    if (trimmed && trimmed !== targetItem.text) {
      if (targetItem.departmentId === 'all') {
        const updatedPos = positiveTags.map((t) => (targetItem.category === 'positive' && t === targetItem.text ? trimmed : t));
        const updatedNeu = (neutralTags || []).map((t) => (targetItem.category === 'neutral' && t === targetItem.text ? trimmed : t));
        const updatedCrit = criticalTags.map((t) => (targetItem.category === 'critical' && t === targetItem.text ? trimmed : t));

        await updateTags({
          positiveTags: updatedPos,
          neutralTags: updatedNeu,
          criticalTags: updatedCrit,
        });
      } else {
        const currentDeptObj = departmentTags[targetItem.departmentId] || {};
        const updatedPos = (currentDeptObj.positiveTags || []).map((t) => (targetItem.category === 'positive' && t === targetItem.text ? trimmed : t));
        const updatedNeu = (currentDeptObj.neutralTags || []).map((t) => (targetItem.category === 'neutral' && t === targetItem.text ? trimmed : t));
        const updatedCrit = (currentDeptObj.criticalTags || []).map((t) => (targetItem.category === 'critical' && t === targetItem.text ? trimmed : t));

        await updateDepartmentTags(targetItem.departmentId, {
          positiveTags: updatedPos,
          neutralTags: updatedNeu,
          criticalTags: updatedCrit,
        });
      }

      triggerToast();
    }
    setEditingItem(null);
    setEditingText('');
  };

  // Lọc dữ liệu theo phân loại, khoa phòng và từ khóa
  const filteredTags = allTagItems.filter((item) => {
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    
    let matchDept = true;
    if (filterDept === 'general') {
      matchDept = item.departmentId === 'all';
    } else if (filterDept !== 'all') {
      matchDept = item.departmentId === filterDept;
    }

    const matchSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchDept && matchSearch;
  });

  // Tên khoa phòng helper
  const getDeptName = (deptId: string) => {
    if (deptId === 'all') return 'Thẻ chung toàn viện';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">

      {/* Thông báo dạng Toast nổi góc trên bên phải trượt xuống */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-5 duration-300 ring-1 ring-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Đồng bộ thành công!
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Danh sách thẻ đã được cập nhật sang màn hình Kiosk.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. THANH CÔNG CỤ ĐIỀU KHIỂN & BỘ LỌC GỌN GÀNG */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        
        {/* Cụm Bộ Lọc: Khoa Phòng + Mức Sao */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc theo Khoa phòng */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Khoa:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer min-w-[200px]"
            >
              <option value="all">Tất cả khoa phòng</option>
              <option value="general">🏛️ Thẻ chung toàn viện</option>
              <optgroup label="Từng khoa phòng cụ thể">
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Lọc theo Mức sao */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Mức sao:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer min-w-[190px]"
            >
              <option value="all">Tất cả mức sao</option>
              <option value="positive">🟢 Khen Ngợi 4 - 5★</option>
              <option value="neutral">🟡 Góp Ý 3★</option>
              <option value="critical">🔴 Phàn Nàn 1 - 2★</option>
            </select>
          </div>
        </div>

        {/* Cụm Tìm Kiếm & Các Nút Hành Động */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ô tìm kiếm thẻ */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nội dung thẻ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <a
            href="/kiosk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200/80 dark:border-zinc-700 shadow-2xs transition cursor-pointer shrink-0"
            title="Mở màn hình Kiosk cảm ứng thực tế trong tab mới để kiểm tra ngay"
          >
            <Tablet className="w-3.5 h-3.5 text-teal-600" />
            <span>Xem Kiosk</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* NÚT THÊM THẺ MỞ DRAWER BÊN PHẢI */}
          <button
            type="button"
            onClick={() => {
              setNewTagText('');
              if (filterCategory !== 'all') {
                setNewTagCategory(filterCategory);
              }
              if (filterDept !== 'all' && filterDept !== 'general') {
                setNewTagDept(filterDept);
              } else {
                setNewTagDept('all');
              }
              setShowAddDrawer(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thẻ Mới</span>
          </button>
        </div>

      </div>

      {/* 2. BẢNG DUY NHẤT TẬP TRUNG TOÀN BỘ CÁC THẺ */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-300 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-bold z-10 backdrop-blur-xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-4">Nội Dung Tiêu Chí Thẻ</th>
                <th className="py-3 px-4 w-56">Khoa Phòng Áp Dụng</th>
                <th className="py-3 px-4 w-52">Phân Loại Mức Sao</th>
                <th className="py-3 px-4 w-24 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic">
                    Không tìm thấy tiêu chí nào phù hợp với điều kiện lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredTags.map((item, idx) => {
                  const isEditing = editingItem?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Cột 1: STT */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* Cột 2: Nội dung thẻ */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full px-3 py-1 text-xs rounded-lg border border-teal-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-teal-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') setEditingItem(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 cursor-pointer shrink-0"
                              title="Lưu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItem(null)}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 cursor-pointer shrink-0"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                item.category === 'positive'
                                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                                  : item.category === 'neutral'
                                  ? 'bg-amber-500 ring-2 ring-amber-200'
                                  : 'bg-rose-500 ring-2 ring-rose-200'
                              }`}
                            />
                            <span className="font-semibold text-slate-800 dark:text-zinc-100 text-xs sm:text-sm">
                              {item.text}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cột 3: Khoa phòng áp dụng (Dropdown đổi trực tiếp) */}
                      <td className="py-3 px-4">
                        <select
                          value={item.departmentId}
                          onChange={(e) => handleChangeDepartment(item, e.target.value)}
                          className={`w-full px-2.5 py-1 text-xs font-semibold rounded-lg border outline-none cursor-pointer transition truncate ${
                            item.departmentId === 'all'
                              ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                              : 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                          }`}
                        >
                          <option value="all">🏛️ Thẻ chung toàn viện</option>
                          <optgroup label="Thẻ riêng của khoa">
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </td>

                      {/* Cột 4: Phân loại mức sao (Dropdown cho phép đổi nhóm trực tiếp) */}
                      <td className="py-3 px-4">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleChangeCategory(item, e.target.value as TagCategory)
                          }
                          className={`w-full px-2.5 py-1 text-xs font-bold rounded-lg border outline-none cursor-pointer transition ${
                            item.category === 'positive'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                              : item.category === 'neutral'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <option value="positive">🟢 Khen ngợi (4 - 5★)</option>
                          <option value="neutral">🟡 Góp ý xây dựng (3★)</option>
                          <option value="critical">🔴 Phàn nàn (1 - 2★)</option>
                        </select>
                      </td>

                      {/* Cột 5: Thao tác */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isEditing && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem({
                                  id: item.id,
                                  originalText: item.text,
                                });
                                setEditingText(item.text);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Sửa tên tiêu chí"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Xóa tiêu chí"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tổng kết số lượng */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div>
            Hiển thị <strong>{filteredTags.length}</strong> / {allTagItems.length} tiêu chí
            {filterDept !== 'all' && (
              <span className="ml-2 font-medium text-teal-700 dark:text-teal-400">
                ({getDeptName(filterDept)})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>4-5★ ({allTagItems.filter((t) => t.category === 'positive').length})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>3★ ({allTagItems.filter((t) => t.category === 'neutral').length})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>1-2★ ({allTagItems.filter((t) => t.category === 'critical').length})</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. DRAWER XỔ TỪ BÊN PHẢI ĐỂ THÊM THẺ MỚI */}
      {showAddDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Lớp nền mờ */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300 cursor-pointer"
            onClick={() => setShowAddDrawer(false)}
          />

          {/* Khung Drawer trượt từ bên phải */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
            
            {/* Header Drawer */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Thêm Tiêu Chí Đánh Giá
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Tự động đồng bộ ngay lên Kiosk khách hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDrawer(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form nội dung */}
            <form onSubmit={handleAddTag} className="flex-1 p-6 space-y-5 overflow-y-auto">
              
              {/* Chọn Khoa phòng áp dụng */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Áp dụng cho Khoa / Toàn viện <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={newTagDept}
                  onChange={(e) => setNewTagDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs cursor-pointer"
                >
                  <option value="all">🏛️ Thẻ chung toàn viện</option>
                  <optgroup label="Gán riêng cho từng khoa phòng">
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-slate-400">
                  Nếu chọn khoa phòng, chỉ bệnh nhân tại khoa đó mới nhìn thấy thẻ này trên Kiosk.
                </p>
              </div>

              {/* Nội dung tiêu chí */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Nội dung tiêu chí thẻ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  placeholder="Ví dụ: Bác sĩ phẫu thuật tay nghề cao, Khử khuẩn buồng bệnh sạch sẽ..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs resize-none"
                  autoFocus
                />
              </div>

              {/* Chọn phân loại mức sao */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Chọn phân loại mức sao áp dụng <span className="text-rose-500">*</span>
                </label>
                
                <div className="space-y-2">
                  {/* Option 1: Khen ngợi 4-5 sao */}
                  <label
                    onClick={() => setNewTagCategory('positive')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      newTagCategory === 'positive'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tagCategory"
                      value="positive"
                      checked={newTagCategory === 'positive'}
                      onChange={() => setNewTagCategory('positive')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Thẻ Khen Ngợi (4 - 5 Sao)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Hiển thị khi khách hàng chọn rất hài lòng hoặc hài lòng
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Góp ý 3 sao */}
                  <label
                    onClick={() => setNewTagCategory('neutral')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      newTagCategory === 'neutral'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tagCategory"
                      value="neutral"
                      checked={newTagCategory === 'neutral'}
                      onChange={() => setNewTagCategory('neutral')}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Thẻ Góp Ý Xây Dựng (3 Sao)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Dành cho ý kiến đóng góp bình thường, tinh chỉnh quy trình nhẹ
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Phàn nàn 1-2 sao */}
                  <label
                    onClick={() => setNewTagCategory('critical')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      newTagCategory === 'critical'
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tagCategory"
                      value="critical"
                      checked={newTagCategory === 'critical'}
                      onChange={() => setNewTagCategory('critical')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Thẻ Phàn Nàn / Bức Xúc (1 - 2 Sao)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Dành cho các sự cố, tiêu cực cần bệnh viện chấn chỉnh gấp
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </form>

            {/* Footer Drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 flex items-center justify-end">
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTagText.trim()}
                className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
