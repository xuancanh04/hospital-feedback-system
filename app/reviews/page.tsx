'use client';

import React, { useState } from 'react';
import { useFeedback } from '@/context/feedback-context';
import { ReviewCard } from '@/components/review-card';
import { Input, Select } from '@/components/ui/form-controls';
import { 
  Search, 
  Filter, 
  Star, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function ReviewsPage() {
  const { reviews, departments } = useFeedback();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Filter approved reviews only
  const filteredReviews = reviews
    .filter((r) => r.status === 'approved')
    .filter((r) => {
      if (selectedDept !== 'all' && r.departmentId !== selectedDept) return false;
      if (selectedRating !== 'all' && r.overallRating !== Number(selectedRating)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchContent = r.content.toLowerCase().includes(query);
        const matchDoctor = r.doctorName?.toLowerCase().includes(query) ?? false;
        const matchDept = r.departmentName.toLowerCase().includes(query);
        return matchTitle || matchContent || matchDoctor || matchDept;
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (selectedSort === 'highest') return b.overallRating - a.overallRating;
      if (selectedSort === 'lowest') return a.overallRating - b.overallRating;
      if (selectedSort === 'most_liked') return b.likes - a.likes;
      return 0;
    });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedRating('all');
    setSelectedSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Minh Bạch Thông Tin & Dân Chủ Quân Y
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Đánh Giá Công Khai Từ Bệnh Nhân & Thân Nhân
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Tất cả nhận xét đã được kiểm duyệt nghiêm túc về mặt nội dung, đảm bảo trung thực, khách quan và có phản hồi chính thức từ các khoa chuyên môn.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-8 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo từ khóa, bác sĩ, khoa phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Department Select */}
          <div className="md:col-span-3">
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">Tất cả Khoa phòng</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </Select>
          </div>

          {/* Rating Select */}
          <div className="md:col-span-2">
            <Select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="all">Mọi số sao</option>
              <option value="5">5 Sao (Rất tốt)</option>
              <option value="4">4 Sao (Hài lòng)</option>
              <option value="3">3 Sao (Bình thường)</option>
              <option value="2">2 Sao (Chưa tốt)</option>
              <option value="1">1 Sao (Cần cải thiện)</option>
            </Select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-2">
            <Select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Sao cao nhất</option>
              <option value="lowest">Sao thấp nhất</option>
              <option value="most_liked">Được quan tâm nhất</option>
            </Select>
          </div>
        </div>

        {/* Quick star chips & count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground mr-1">Bộ lọc nhanh:</span>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(selectedRating === String(star) ? 'all' : String(star))}
                className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 transition ${
                  selectedRating === String(star)
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                {star} sao
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Tìm thấy <strong className="text-emerald-700 dark:text-emerald-400">{filteredReviews.length}</strong> bài đánh giá
            </span>
            {(searchQuery || selectedDept !== 'all' || selectedRating !== 'all' || selectedSort !== 'newest') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 mb-1">
            Không tìm thấy đánh giá phù hợp
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm đặt lại bộ lọc.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
