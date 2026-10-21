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
} from 'lucide-react';

type TagCategory = 'positive' | 'neutral' | 'critical';

interface FlatTagItem {
  id: string;
  text: string;
  category: TagCategory;
}

export function AdminTagsConfigView() {
  const { positiveTags, neutralTags, criticalTags, updateTags } = useFeedback();

  // Local state danh sách thẻ theo 3 tầng sao
  const [posTags, setPosTags] = useState<string[]>(positiveTags);
  const [neuTags, setNeuTags] = useState<string[]>(neutralTags || []);
  const [critTags, setCritTags] = useState<string[]>(criticalTags);

  // Bộ lọc bảng (Tất cả / Khen ngợi 4-5★ / Góp ý 3★ / Phàn nàn 1-2★)
  const [filterCategory, setFilterCategory] = useState<'all' | TagCategory>('all');

  // Drawer thêm thẻ mới từ bên phải
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>('positive');

  // Chỉnh sửa trực tiếp tên thẻ
  const [editingItem, setEditingItem] = useState<{ category: TagCategory; originalText: string } | null>(null);
  const [editingText, setEditingText] = useState('');

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Trạng thái thông báo
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Đồng bộ khi context thay đổi
  React.useEffect(() => {
    setPosTags(positiveTags);
  }, [positiveTags]);

  React.useEffect(() => {
    setNeuTags(neutralTags || []);
  }, [neutralTags]);

  React.useEffect(() => {
    setCritTags(criticalTags);
  }, [criticalTags]);

  // Gom danh sách thẻ thành 1 mảng đồng nhất hiển thị trên 1 bảng duy nhất
  const allTagItems: FlatTagItem[] = [
    ...posTags.map((t, idx) => ({ id: `pos-${idx}-${t}`, text: t, category: 'positive' as TagCategory })),
    ...neuTags.map((t, idx) => ({ id: `neu-${idx}-${t}`, text: t, category: 'neutral' as TagCategory })),
    ...critTags.map((t, idx) => ({ id: `crit-${idx}-${t}`, text: t, category: 'critical' as TagCategory })),
  ];

  // Tự động lưu và phát sóng đồng bộ ngay tức thì sang màn hình Kiosk
  const syncTags = async (pos: string[], neu: string[], crit: string[]) => {
    await updateTags({
      positiveTags: pos,
      neutralTags: neu,
      criticalTags: crit,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Thêm thẻ mới từ Drawer bên phải (Tự động lưu và hiện ngay lên Kiosk)
  const handleAddTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTagText.trim();
    if (!trimmed) return;

    let updatedPos = posTags;
    let updatedNeu = neuTags;
    let updatedCrit = critTags;

    if (newTagCategory === 'positive') {
      if (!posTags.includes(trimmed)) {
        updatedPos = [...posTags, trimmed];
        setPosTags(updatedPos);
      }
    } else if (newTagCategory === 'neutral') {
      if (!neuTags.includes(trimmed)) {
        updatedNeu = [...neuTags, trimmed];
        setNeuTags(updatedNeu);
      }
    } else {
      if (!critTags.includes(trimmed)) {
        updatedCrit = [...critTags, trimmed];
        setCritTags(updatedCrit);
      }
    }

    setNewTagText('');
    setShowAddDrawer(false);
    await syncTags(updatedPos, updatedNeu, updatedCrit);
  };

  // Xóa thẻ (Tự động cập nhật Kiosk)
  const handleRemoveTag = async (item: FlatTagItem) => {
    let updatedPos = posTags;
    let updatedNeu = neuTags;
    let updatedCrit = critTags;

    if (item.category === 'positive') {
      updatedPos = posTags.filter((t) => t !== item.text);
      setPosTags(updatedPos);
    } else if (item.category === 'neutral') {
      updatedNeu = neuTags.filter((t) => t !== item.text);
      setNeuTags(updatedNeu);
    } else {
      updatedCrit = critTags.filter((t) => t !== item.text);
      setCritTags(updatedCrit);
    }

    await syncTags(updatedPos, updatedNeu, updatedCrit);
  };

  // Đổi phân loại nhóm thẻ trực tiếp trên bảng (Tự động cập nhật Kiosk)
  const handleChangeCategory = async (item: FlatTagItem, targetCategory: TagCategory) => {
    if (item.category === targetCategory) return;

    let updatedPos = posTags;
    let updatedNeu = neuTags;
    let updatedCrit = critTags;

    // Xóa khỏi nhóm cũ
    if (item.category === 'positive') {
      updatedPos = posTags.filter((t) => t !== item.text);
    } else if (item.category === 'neutral') {
      updatedNeu = neuTags.filter((t) => t !== item.text);
    } else {
      updatedCrit = critTags.filter((t) => t !== item.text);
    }

    // Thêm vào nhóm mới
    if (targetCategory === 'positive') {
      if (!updatedPos.includes(item.text)) updatedPos = [...updatedPos, item.text];
    } else if (targetCategory === 'neutral') {
      if (!updatedNeu.includes(item.text)) updatedNeu = [...updatedNeu, item.text];
    } else {
      if (!updatedCrit.includes(item.text)) updatedCrit = [...updatedCrit, item.text];
    }

    setPosTags(updatedPos);
    setNeuTags(updatedNeu);
    setCritTags(updatedCrit);

    await syncTags(updatedPos, updatedNeu, updatedCrit);
  };

  // Lưu chỉnh sửa tên thẻ (Tự động cập nhật Kiosk)
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const trimmed = editingText.trim();
    if (trimmed) {
      let updatedPos = posTags;
      let updatedNeu = neuTags;
      let updatedCrit = critTags;

      if (editingItem.category === 'positive') {
        updatedPos = posTags.map((t) => (t === editingItem.originalText ? trimmed : t));
        setPosTags(updatedPos);
      } else if (editingItem.category === 'neutral') {
        updatedNeu = neuTags.map((t) => (t === editingItem.originalText ? trimmed : t));
        setNeuTags(updatedNeu);
      } else {
        updatedCrit = critTags.map((t) => (t === editingItem.originalText ? trimmed : t));
        setCritTags(updatedCrit);
      }

      await syncTags(updatedPos, updatedNeu, updatedCrit);
    }
    setEditingItem(null);
    setEditingText('');
  };

  // Lọc dữ liệu theo tab và ô tìm kiếm
  const filteredTags = allTagItems.filter((item) => {
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Cụm Lọc Phân Loại dạng Dropdown xổ xuống gọn gàng */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Phân loại:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer min-w-[210px]"
          >
            <option value="all">Tất cả tiêu chí ({allTagItems.length})</option>
            <option value="positive">🟢 Thẻ Khen Ngợi 4 - 5★ ({posTags.length})</option>
            <option value="neutral">🟡 Thẻ Góp Ý 3★ ({neuTags.length})</option>
            <option value="critical">🔴 Thẻ Phàn Nàn 1 - 2★ ({critTags.length})</option>
          </select>
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
              // Nếu đang lọc theo nhóm nào thì mặc định chọn phân loại đó luôn
              if (filterCategory !== 'all') {
                setNewTagCategory(filterCategory);
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
                <th className="py-3 px-4 w-60">Phân Loại Mức Sao</th>
                <th className="py-3 px-4 w-28 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">
                    Không tìm thấy tiêu chí nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredTags.map((item, idx) => {
                  const isEditing =
                    editingItem?.category === item.category &&
                    editingItem?.originalText === item.text;

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

                      {/* Cột 3: Phân loại mức sao (Dropdown cho phép đổi nhóm trực tiếp) */}
                      <td className="py-3 px-4">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleChangeCategory(item, e.target.value as TagCategory)
                          }
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border outline-none cursor-pointer transition ${
                            item.category === 'positive'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                              : item.category === 'neutral'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <option value="positive">🟢 Khen ngợi (4 - 5★)</option>
                          <option value="neutral">🟡 Góp ý xây dựng (3★)</option>
                          <option value="critical">🔴 Phàn nàn / Bức xúc (1 - 2★)</option>
                        </select>
                      </td>

                      {/* Cột 4: Thao tác */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isEditing && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem({
                                  category: item.category,
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
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>4-5★: {posTags.length}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>3★: {neuTags.length}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>1-2★: {critTags.length}</span>
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
              
              {/* Nội dung tiêu chí */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Nội dung tiêu chí thẻ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  placeholder="Ví dụ: Bác sĩ tận tình, Cơ sở sạch sẽ, Thời gian chờ đợi quá lâu..."
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
