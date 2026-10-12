'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFeedback } from '@/context/feedback-context';
import { ReviewCard } from '@/components/review-card';
import { Textarea } from '@/components/ui/form-controls';
import { 
  Stethoscope, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  X
} from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function StaffPortalPage() {
  const { currentUser } = useAuth();
  const { reviews, replyReview, departments } = useFeedback();

  // Active reply modal state
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Reviews directed to current staff's department or doctor
  const staffDeptId = currentUser?.departmentId || 'dept-1';
  const staffDept = departments.find((d) => d.id === staffDeptId);

  const relevantReviews = reviews.filter(
    (r) => r.departmentId === staffDeptId || r.doctorId === 'doc-1'
  );

  const answeredCount = relevantReviews.filter((r) => !!r.officialReply).length;
  const unansweredCount = relevantReviews.filter((r) => !r.officialReply).length;

  const handleOpenReplyModal = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReplyText('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewId || !replyText.trim()) return;

    replyReview(selectedReviewId, {
      staffId: currentUser?.id || 'staff-1',
      staffName: currentUser?.name || 'BS.CKII Nguyễn Văn Dũng',
      staffTitle: currentUser?.title || 'Trưởng khoa Khám Bệnh',
      content: replyText.trim(),
    });

    setSelectedReviewId(null);
    setReplyText('');
  };

  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'Bác sĩ'}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-400"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5" />
              CỔNG PHẢN HỒI Y TẾ • KHOA PHÒNG & BÁC SĨ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {currentUser?.name || 'BS.CKII Nguyễn Văn Dũng'}
            </h1>
            <p className="text-teal-200 text-xs sm:text-sm">
              {currentUser?.title || 'Thượng tá, Trưởng khoa Khám Bệnh'} • {staffDept?.name}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <div className="text-xl font-bold text-amber-300">4.9 / 5.0</div>
            <div className="text-[11px] text-teal-100">Điểm uy tín khoa</div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{relevantReviews.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Nhận xét gửi tới khoa / cá nhân</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{unansweredCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Cần đại diện chuyên khoa phản hồi</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{answeredCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Đã trả lời & tư vấn công khai</div>
          </div>
        </div>
      </div>

      {/* Review Feed for Staff */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Hộp Thư Nhận Xét Từ Bệnh Nhân Của {staffDept?.name}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Hiển thị {relevantReviews.length} nhận xét
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relevantReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onReplyClick={() => handleOpenReplyModal(rev.id)}
            />
          ))}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReviewId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Gửi Phản Hồi Y Tế Chính Thức
                </h3>
              </div>
              <button
                onClick={() => setSelectedReviewId(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Câu trả lời sẽ được ký danh dưới tên <strong>{currentUser?.name || 'BS.CKII Nguyễn Văn Dũng'}</strong> ({currentUser?.title || 'Đại diện Khoa'}) và hiển thị trực tiếp bên dưới nhận xét của người bệnh.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nội dung phản hồi & Lời dặn y tế *
                </label>
                <Textarea
                  rows={4}
                  placeholder="Kính chào người bệnh/thân nhân, Khoa chân thành cảm ơn ý kiến đóng góp..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReviewId(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Đăng Phản Hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
