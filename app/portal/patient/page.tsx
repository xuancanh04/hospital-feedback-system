'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useFeedback } from '@/context/feedback-context';
import { ReviewCard } from '@/components/review-card';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  MessageSquarePlus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function PatientPortalPage() {
  const { currentUser } = useAuth();
  const { reviews, deleteReview } = useFeedback();

  // All reviews by current user (or fallback to user-patient if simulating)
  const myReviews = reviews.filter(
    (r) => r.userId === currentUser?.id || r.userId === 'user-patient'
  );

  const pendingCount = myReviews.filter((r) => r.status === 'pending').length;
  const approvedCount = myReviews.filter((r) => r.status === 'approved').length;

  return (
    <ProtectedRoute allowedRoles={['patient', 'admin', 'staff']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold">
            CỔNG THÔNG TIN BỆNH NHÂN
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Lịch Sử & Tiến Độ Đánh Giá Của Bạn
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            Chào mừng <strong>{currentUser ? currentUser.name : 'Quý bệnh nhân'}</strong>. Tại đây bạn có thể theo dõi trạng thái bài viết và câu trả lời từ đội ngũ bác sĩ.
          </p>
        </div>

        <Link
          href="/feedback"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition self-start md:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Viết đánh giá mới
        </Link>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{myReviews.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Tổng số phản hồi đã gửi</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{pendingCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Đang trong hàng đợi kiểm duyệt</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{approvedCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Đã duyệt & công khai</div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Danh Sách Đánh Giá Của Tôi
        </h2>

        {myReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myReviews.map((rev) => (
              <div key={rev.id} className="relative group">
                <ReviewCard review={rev} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa bài đánh giá này?')) {
                        deleteReview(rev.id);
                      }
                    }}
                    title="Xóa đánh giá"
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
            <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200 mb-1">
              Bạn chưa có bài đánh giá nào
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Hãy gửi phản hồi về buổi khám của bạn để giúp Bệnh viện 7A nâng cao chất lượng phục vụ.
            </p>
            <Link
              href="/feedback"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
            >
              Gửi đánh giá đầu tiên
            </Link>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
