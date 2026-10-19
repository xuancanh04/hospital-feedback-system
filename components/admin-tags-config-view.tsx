'use client';

import React, { useState } from 'react';
import { useFeedback } from '@/context/feedback-context';
import {
  Tag,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Info,
  Edit3,
  Check,
  X,
  Search,
  SlidersHorizontal,
  Tablet,
  CheckCircle,
  HelpCircle,
  Eye
} from 'lucide-react';

export function AdminTagsConfigView() {
  const { positiveTags, criticalTags, updateTags, resetTagsToDefault } = useFeedback();

  // Local state danh sách thẻ
  const [posTags, setPosTags] = useState<string[]>(positiveTags);
  const [critTags, setCritTags] = useState<string[]>(criticalTags);

  // Tab chuyển đổi trực quan (Tất cả / Thẻ khen ngợi / Thẻ góp ý)
  const [activeTab, setActiveTab] = useState<'all' | 'positive' | 'critical'>('all');

  // Ô nhập thẻ mới nhanh
  const [newPositiveTag, setNewPositiveTag] = useState('');
  const [newCriticalTag, setNewCriticalTag] = useState('');

  // Chỉnh sửa trực tiếp tên thẻ
  const [editingPosIndex, setEditingPosIndex] = useState<number | null>(null);
  const [editingPosText, setEditingPosText] = useState('');

  const [editingCritIndex, setEditingCritIndex] = useState<number | null>(null);
  const [editingCritText, setEditingCritText] = useState('');

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Trạng thái thông báo
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Đồng bộ khi context thay đổi
  React.useEffect(() => {
    setPosTags(positiveTags);
  }, [positiveTags]);

  React.useEffect(() => {
    setCritTags(criticalTags);
  }, [criticalTags]);

  // Thêm thẻ khen ngợi
  const handleAddPositive = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPositiveTag.trim();
    if (!trimmed) return;
    if (posTags.includes(trimmed)) return;
    setPosTags([...posTags, trimmed]);
    setNewPositiveTag('');
  };

  const handleRemovePositive = (tagToRemove: string) => {
    setPosTags(posTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveEditPositive = (index: number) => {
    const trimmed = editingPosText.trim();
    if (trimmed) {
      const updated = [...posTags];
      updated[index] = trimmed;
      setPosTags(updated);
    }
    setEditingPosIndex(null);
    setEditingPosText('');
  };

  // Thêm thẻ góp ý
  const handleAddCritical = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCriticalTag.trim();
    if (!trimmed) return;
    if (critTags.includes(trimmed)) return;
    setCritTags([...critTags, trimmed]);
    setNewCriticalTag('');
  };

  const handleRemoveCritical = (tagToRemove: string) => {
    setCritTags(critTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveEditCritical = (index: number) => {
    const trimmed = editingCritText.trim();
    if (trimmed) {
      const updated = [...critTags];
      updated[index] = trimmed;
      setCritTags(updated);
    }
    setEditingCritIndex(null);
    setEditingCritText('');
  };

  // Lưu cấu hình
  const handleSave = async () => {
    await updateTags({
      positiveTags: posTags,
      criticalTags: critTags,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Khôi phục mặc định
  const handleReset = async () => {
    if (window.confirm('Khôi phục danh sách thẻ về thiết lập ban đầu của Bệnh viện Quân y 7A?')) {
      await resetTagsToDefault();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const filteredPosTags = posTags.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCritTags = critTags.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 1. Hàng công cụ hành động trực tiếp trên nền trang */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
        {/* Ô tìm kiếm thẻ */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung thẻ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs"
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

        {/* Lọc nhóm thẻ */}
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs w-full sm:w-auto"
        >
          <option value="all">Xem Cả 2 Nhóm ({posTags.length + critTags.length})</option>
          <option value="positive">Khen Ngợi ({posTags.length})</option>
          <option value="critical">Góp Ý ({critTags.length})</option>
        </select>

        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200/80 dark:border-zinc-700 shadow-2xs transition cursor-pointer shrink-0"
          title="Xem trước giao diện Kiosk của người bệnh"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Xem Trước Kiosk</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Lưu</span>
        </button>
      </div>

      {/* Thông báo lưu thành công */}
      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Đã cập nhật bộ thẻ thành công! Màn hình Kiosk cảm ứng và Cổng đánh giá đã nhận dữ liệu mới nhất.</span>
          </div>
          <span className="text-[11px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md font-mono">Đã đồng bộ</span>
        </div>
      )}

      {/* 3. Lưới hiển thị danh sách thẻ dạng Bảng (Table) 2 cột song song */}
      <div className={`grid gap-5 ${activeTab === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
        
        {/* BẢNG 1: THẺ KHEN NGỢI (Dành cho 4 - 5 Sao) */}
        {(activeTab === 'all' || activeTab === 'positive') && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden">
            {/* Header Bảng Khen Ngợi */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-zinc-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Thẻ Khen Ngợi</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {posTags.length} thẻ
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Hiển thị khi bệnh nhân chấm <strong>4 - 5 sao</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Form thêm thẻ nhanh */}
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/20">
              <form onSubmit={handleAddPositive} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPositiveTag}
                  onChange={(e) => setNewPositiveTag(e.target.value)}
                  placeholder="Nhập tiêu chí khen ngợi mới..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!newPositiveTag.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>
            </div>

            {/* Bảng danh sách tiêu chí */}
            <div className="overflow-x-auto max-h-[490px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3">Nội Dung Tiêu Chí</th>
                    <th className="py-2.5 px-3 w-24 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredPosTags.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-xs italic">
                        Không tìm thấy tiêu chí nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredPosTags.map((tag, idx) => {
                      const originalIndex = posTags.indexOf(tag);
                      const isEditing = editingPosIndex === originalIndex;

                      return (
                        <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingPosText}
                                  onChange={(e) => setEditingPosText(e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-emerald-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditPositive(originalIndex);
                                    if (e.key === 'Escape') setEditingPosIndex(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditPositive(originalIndex)}
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shrink-0"
                                  title="Lưu"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPosIndex(null)}
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 cursor-pointer shrink-0"
                                  title="Hủy"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{tag}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {!isEditing && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPosIndex(originalIndex);
                                    setEditingPosText(tag);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  title="Đổi tên tiêu chí"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePositive(tag)}
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
          </div>
        )}

        {/* BẢNG 2: THẺ GÓP Ý / PHÀN NÀN (Dành cho 1 - 3 Sao) */}
        {(activeTab === 'all' || activeTab === 'critical') && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden">
            {/* Header Bảng Góp Ý */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-zinc-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                  <ThumbsDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Thẻ Góp Ý / Cần Cải Thiện</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {critTags.length} thẻ
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Hiển thị khi bệnh nhân chấm <strong>1 - 3 sao</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Form thêm thẻ nhanh */}
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/20">
              <form onSubmit={handleAddCritical} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCriticalTag}
                  onChange={(e) => setNewCriticalTag(e.target.value)}
                  placeholder="Nhập tiêu chí góp ý mới..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!newCriticalTag.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>
            </div>

            {/* Bảng danh sách tiêu chí */}
            <div className="overflow-x-auto max-h-[490px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3">Nội Dung Tiêu Chí</th>
                    <th className="py-2.5 px-3 w-24 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredCritTags.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-xs italic">
                        Không tìm thấy tiêu chí nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredCritTags.map((tag, idx) => {
                      const originalIndex = critTags.indexOf(tag);
                      const isEditing = editingCritIndex === originalIndex;

                      return (
                        <tr key={idx} className="hover:bg-amber-50/30 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingCritText}
                                  onChange={(e) => setEditingCritText(e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-amber-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-amber-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditCritical(originalIndex);
                                    if (e.key === 'Escape') setEditingCritIndex(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCritical(originalIndex)}
                                  className="p-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shrink-0"
                                  title="Lưu"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCritIndex(null)}
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 cursor-pointer shrink-0"
                                  title="Hủy"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{tag}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {!isEditing && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCritIndex(originalIndex);
                                    setEditingCritText(tag);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  title="Đổi tên tiêu chí"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCritical(tag)}
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
          </div>
        )}
      </div>

      {/* 4. Modal xem trước giao diện Kiosk (Preview Modal) */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-teal-800 text-white">
              <div className="flex items-center gap-2.5">
                <Tablet className="w-5 h-5 text-teal-200" />
                <h3 className="font-extrabold text-base">Xem Trước Màn Hình Kiosk Cảm Ứng</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-teal-900 text-white space-y-3">
                <div className="text-xs text-teal-200 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mô phỏng: Khi người bệnh chấm 5 Sao (Khen ngợi)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {posTags.slice(0, 8).map((t, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-center font-bold">
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mô phỏng: Khi người bệnh chấm 1 - 2 - 3 Sao (Góp ý)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {critTags.slice(0, 8).map((t, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-center font-bold">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end bg-slate-50 dark:bg-zinc-800/40">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Đóng Xem Trước
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
