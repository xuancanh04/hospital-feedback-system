'use client';

import React from 'react';
import { Review } from '@/types';
import { StarRating } from '@/components/star-rating';
import { 
  Building2, 
  UserCheck, 
  ThumbsUp, 
  ShieldCheck, 
  MessageSquare, 
  Calendar, 
  Clock
} from 'lucide-react';
import { useFeedback } from '@/context/feedback-context';

interface ReviewCardProps {
  review: Review;
  onReplyClick?: () => void;
  showAdminActions?: boolean;
}

export function ReviewCard({ review, onReplyClick, showAdminActions = false }: ReviewCardProps) {
  const { likeReview, updateReviewStatus } = useFeedback();

  const statusBadge = {
    approved: { label: 'Đã kiểm duyệt', class: 'bg-emerald-50 text-[#1b4332] border-emerald-200' },
    pending: { label: 'Chờ duyệt', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    rejected: { label: 'Từ chối', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    hidden: { label: 'Đã ẩn', class: 'bg-slate-100 text-slate-600 border-slate-200' },
  }[review.status] || { label: 'Chờ duyệt', class: 'bg-amber-50 text-amber-800 border-amber-200' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs card-hover-effect">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#1b4332] text-emerald-100 font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden border border-emerald-800/30">
            {review.isAnonymous ? (
              <span className="text-emerald-200 text-xs">ẨN</span>
            ) : review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
            ) : (
              review.userName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                {review.isAnonymous ? 'Bệnh nhân (Ẩn danh)' : review.userName}
              </h4>
              {review.status === 'approved' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1b4332] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-[#2d6a4f]" /> Đã xác thực
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Ngày khám: {new Date(review.visitDate).toLocaleDateString('vi-VN')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Đăng: {new Date(review.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Rating and status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <StarRating value={review.overallRating} readOnly size="sm" />
            <span className="text-xs font-bold text-amber-600">
              {review.overallRating}.0 / 5.0
            </span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Department & Doctor Tag */}
      <div className="my-3.5 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-[#1b4332] font-semibold border border-emerald-200/60">
          <Building2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
          {review.departmentName}
        </span>
        {review.doctorName && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            {review.doctorName}
          </span>
        )}
      </div>

      {/* Title & Body */}
      <div className="space-y-2 mb-4">
        <h3 className="font-extrabold text-base text-slate-900">
          {review.title}
        </h3>
        <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line font-normal">
          {review.content}
        </p>
      </div>

      {/* Criteria Breakdown */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
        <div>
          <span className="text-slate-500 block text-[11px]">Thái độ phục vụ</span>
          <span className="font-bold text-slate-800">★ {review.criteria.serviceAttitude}/5</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Cơ sở vật chất</span>
          <span className="font-bold text-slate-800">★ {review.criteria.facilities}/5</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Thời gian chờ</span>
          <span className="font-bold text-slate-800">★ {review.criteria.waitTime}/5</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Minh bạch chi phí</span>
          <span className="font-bold text-slate-800">★ {review.criteria.costTransparency}/5</span>
        </div>
      </div>

      {/* Review Images if any */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Hình ảnh đính kèm"
              className="w-24 h-24 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition"
            />
          ))}
        </div>
      )}

      {/* Official Response */}
      {review.officialReply && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#1b4332] text-white text-[10px] font-bold">
              7A
            </span>
            <span className="font-bold text-xs text-[#1b4332]">
              Phản hồi chính thức từ {review.officialReply.staffName}
            </span>
            <span className="text-[10px] text-slate-500">
              ({new Date(review.officialReply.createdAt).toLocaleDateString('vi-VN')})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pl-7">
            &ldquo;{review.officialReply.content}&rdquo;
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <button
          onClick={() => likeReview(review.id)}
          className="flex items-center gap-1.5 hover:text-[#1b4332] transition font-medium"
        >
          <ThumbsUp className="w-4 h-4 text-slate-400 hover:text-[#1b4332]" />
          <span>Hữu ích ({review.likes})</span>
        </button>

        <div className="flex items-center gap-2">
          {onReplyClick && (
            <button
              onClick={onReplyClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1b4332] font-semibold transition border border-emerald-200"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2d6a4f]" />
              Gửi phản hồi y tế
            </button>
          )}

          {showAdminActions && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateReviewStatus(review.id, 'approved')}
                className="px-2.5 py-1 rounded-md bg-[#1b4332] hover:bg-[#122e22] text-white text-xs font-semibold"
              >
                Duyệt
              </button>
              <button
                onClick={() => updateReviewStatus(review.id, 'hidden')}
                className="px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Ẩn
              </button>
              <button
                onClick={() => updateReviewStatus(review.id, 'rejected')}
                className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
