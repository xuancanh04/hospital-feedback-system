'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFeedback } from '@/context/feedback-context';
import { StarRating } from '@/components/star-rating';
import { Input, Textarea, Select } from '@/components/ui/form-controls';
import { 
  Building2, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

export default function FeedbackPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { departments, doctors, addReview } = useFeedback();

  // Form State
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [doctorId, setDoctorId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      setVisitDate(today);
      setMaxDate(today);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [overallRating, setOverallRating] = useState(5);
  const [serviceAttitude, setServiceAttitude] = useState(5);
  const [facilities, setFacilities] = useState(5);
  const [waitTime, setWaitTime] = useState(4);
  const [costTransparency, setCostTransparency] = useState(5);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Doctors filtered by department
  const filteredDoctors = doctors.filter((doc) => doc.departmentId === departmentId);

  const handleAddImage = () => {
    const trimmed = imageUrl.trim();
    if (trimmed && (trimmed.startsWith('https://') || trimmed.startsWith('http://'))) {
      setImages([...images, trimmed]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const currentDept = departments.find((d) => d.id === departmentId);
    const currentDoc = doctors.find((d) => d.id === doctorId);

    // Xử lý bảo mật: Nếu người dùng chọn ẩn danh, tuyệt đối không lưu id, tên thật hoặc avatar
    const effectiveUserId = isAnonymous ? 'anonymous-user' : (currentUser?.id || `guest-${Date.now()}`);
    const effectiveUserName = isAnonymous ? 'Bệnh nhân ẩn danh' : (currentUser?.name || 'Bệnh nhân');
    const effectiveUserAvatar = isAnonymous ? undefined : currentUser?.avatar;

    addReview({
      userId: effectiveUserId,
      userName: effectiveUserName,
      userAvatar: effectiveUserAvatar,
      isAnonymous,
      departmentId,
      departmentName: currentDept ? currentDept.name : 'Khoa Khám Bệnh',
      doctorId: currentDoc ? currentDoc.id : undefined,
      doctorName: currentDoc ? currentDoc.name : undefined,
      overallRating,
      criteria: {
        serviceAttitude,
        facilities,
        waitTime,
        costTransparency,
      },
      title,
      content,
      images: images.length > 0 ? images : undefined,
      visitDate,
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-8 sm:p-12 shadow-xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Gửi Đánh Giá Thành Công!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed max-w-lg mx-auto">
            Chân thành cảm ơn Quý bệnh nhân đã dành thời gian đóng góp ý kiến quý báu cho Bệnh viện Quân y 7A. 
            Bài viết của bạn đã được chuyển vào hàng đợi kiểm duyệt và sẽ sớm được công bố.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => router.push('/portal/patient')}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition"
            >
              Theo dõi lịch sử đánh giá của tôi
            </button>
            <button
              onClick={() => router.push('/reviews')}
              className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Xem các đánh giá khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Phiếu Khảo Sát Ý Kiến Bệnh Nhân & Thân Nhân
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Gửi Đánh Giá Chất Lượng Khám Chữa Bệnh
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ý kiến của bạn là cơ sở để Bệnh viện Quân y 7A không ngừng hoàn thiện tác phong, quy trình và chất lượng điều trị.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Section 1: Thông tin khoa khám & Bác sĩ */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b pb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            1. Địa Điểm & Thời Gian Khám Chữa Bệnh
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Khoa phòng tiếp nhận *
              </label>
              <Select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setDoctorId('');
                }}
                required
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Bác sĩ trực tiếp thăm khám (Tùy chọn)
              </label>
              <Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">-- Chọn bác sĩ (nếu nhớ) --</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Ngày đến khám / điều trị *
              </label>
              <Input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                max={maxDate}
                required
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="relative flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 w-full transition">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-zinc-500" />
                    Đánh giá ẩn danh
                  </span>
                  <p className="text-[11px] text-muted-foreground">Tên và ảnh cá nhân của bạn sẽ không hiển thị công khai</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Chấm điểm tiêu chí */}
        <div className="space-y-5">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            2. Chấm Điểm Đánh Giá
          </h3>

          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                Đánh giá tổng quan chuyến khám *
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">Mức độ hài lòng chung đối với Bệnh viện 7A</p>
            </div>
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              size="lg"
              showLabel
            />
          </div>

          {/* Detailed Criteria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block">Thái độ phục vụ & Y đức</span>
                <span className="text-[11px] text-muted-foreground">Ân cần, nhiệt tình, tôn trọng bệnh nhân</span>
              </div>
              <StarRating value={serviceAttitude} onChange={setServiceAttitude} size="md" />
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block">Cơ sở vật chất & Vệ sinh</span>
                <span className="text-[11px] text-muted-foreground">Phòng bệnh, máy móc, phòng chờ sạch sẽ</span>
              </div>
              <StarRating value={facilities} onChange={setFacilities} size="md" />
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block">Thời gian chờ đợi</span>
                <span className="text-[11px] text-muted-foreground">Quy trình xếp hàng, gọi số nhanh chóng</span>
              </div>
              <StarRating value={waitTime} onChange={setWaitTime} size="md" />
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block">Chi phí & Viện phí</span>
                <span className="text-[11px] text-muted-foreground">Minh bạch theo hóa đơn & quyền lợi BHYT</span>
              </div>
              <StarRating value={costTransparency} onChange={setCostTransparency} size="md" />
            </div>
          </div>
        </div>

        {/* Section 3: Nội dung chi tiết & Đính kèm */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b pb-2 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            3. Nội Dung Nhận Xét & Hình Ảnh
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Tiêu đề bài viết tóm tắt *
            </label>
            <Input
              type="text"
              placeholder="VD: Bác sĩ khoa Tim mạch giải thích rất tận tâm, phòng bệnh sạch sẽ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nội dung nhận xét chi tiết *
            </label>
            <Textarea
              rows={5}
              placeholder="Hãy chia sẻ trải nghiệm thực tế của bạn hoặc người nhà: điều bạn ấn tượng nhất và điều bệnh viện nên cải thiện..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Image upload / URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Đính kèm hình ảnh minh chứng (Tùy chọn)
            </label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Dán link ảnh (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 shrink-0"
              >
                Thêm ảnh
              </button>
            </div>

            {images.length > 0 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <Image
                      src={img}
                      alt="Ảnh đính kèm"
                      width={80}
                      height={80}
                      unoptimized
                      className="w-20 h-20 object-cover rounded-xl border border-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Nội dung đánh giá tuân thủ quy định chuẩn mực y tế, không xúc phạm danh dự cá nhân.
          </p>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
          >
            Gửi Đánh Giá Cho Bệnh Viện
          </button>
        </div>
      </form>
    </div>
  );
}
