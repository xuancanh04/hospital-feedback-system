'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Star, 
  Check, 
  CheckCircle2
} from 'lucide-react';
import { useFeedback } from '@/context/feedback-context';

// Danh sách 6 thẻ phản hồi nhanh chuẩn hóa thành lưới đều nhau, không cần cuộn
const QUICK_TAGS = [
  'Bác sĩ tận tình, chu đáo',
  'Y tá hướng dẫn nhiệt tình',
  'Thủ tục nhanh chóng',
  'Cơ sở vật chất sạch sẽ',
  'Thời gian chờ đợi hợp lý',
  'Giải thích bệnh rõ ràng'
];

export default function TouchMainApp() {
  const { departments, addReview } = useFeedback();

  // 4 Bước: 1. Chào mừng -> 2. Chọn khoa -> 3. Chấm điểm & Thẻ nhanh -> 4. Cảm ơn
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // State đánh giá
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');

  // Danh sách khoa hiển thị thích ứng
  const displayDepartments = departments.length > 0 ? departments : [
    { id: 'dept-1', name: 'Khoa Khám Bệnh', code: 'KKB' },
    { id: 'dept-2', name: 'Khoa Cấp Cứu - HSTC', code: 'CC-HSTC' },
    { id: 'dept-3', name: 'Khoa Ngoại Chấn Thương', code: 'CTCH' },
    { id: 'dept-4', name: 'Khoa Nội Tim Mạch', code: 'NTM' },
    { id: 'dept-5', name: 'Khoa Sản Phụ Khoa', code: 'SPK' },
    { id: 'dept-6', name: 'Khoa Chẩn Đoán Hình Ảnh', code: 'CDHA' },
    { id: 'dept-7', name: 'Khoa Xét Nghiệm', code: 'XN' },
    { id: 'dept-8', name: 'Khoa Dược', code: 'KD' },
  ];

  // Reset form về trạng thái ban đầu
  const handleReset = () => {
    setStep(1);
    setSelectedDept('');
    setRating(0);
    setSelectedTags([]);
    setComment('');
  };

  // Tự động quay về màn hình đầu sau 5 giây khi hoàn tất
  useEffect(() => {
    if (step !== 4) return;
    const timer = setTimeout(() => {
      handleReset();
    }, 5000);

    return () => clearTimeout(timer);
  }, [step]);

  // Toggle chọn thẻ đánh giá nhanh
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Gửi đánh giá trực tiếp vào hệ thống (không cần đăng ký/đăng nhập)
  const handleSubmit = () => {
    if (rating === 0) return;
    const deptObj = displayDepartments.find((d) => d.id === selectedDept);
    const contentText = [
      selectedTags.length > 0 ? `[Đánh giá nhanh]: ${selectedTags.join(', ')}` : '',
      comment.trim() ? `[Ý kiến thêm]: ${comment.trim()}` : ''
    ].filter(Boolean).join('\n') || 'Khảo sát nhanh qua màn hình cảm ứng tại sảnh bệnh viện.';

    addReview({
      userId: `touch-${Date.now()}`,
      userName: 'Người bệnh tại bệnh viện',
      isAnonymous: true,
      departmentId: selectedDept || displayDepartments[0]?.id || 'dept-1',
      departmentName: deptObj ? deptObj.name : 'Khoa Khám Bệnh',
      overallRating: rating,
      criteria: {
        serviceAttitude: rating,
        facilities: rating,
        waitTime: rating,
        costTransparency: rating,
      },
      title: `Khảo sát chất lượng - ${rating} sao`,
      content: contentText,
      visitDate: new Date().toISOString().split('T')[0],
    });

    setStep(4);
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5: return 'Rất Hài Lòng';
      case 4: return 'Hài Lòng';
      case 3: return 'Bình Thường';
      case 2: return 'Chưa Hài Lòng';
      case 1: return 'Rất Thất Vọng';
      default: return 'Chưa đánh giá';
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between select-none overflow-x-hidden font-sans touch-manipulation bg-[#000a24] bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/kiosk-bg.jpg')" }}
    >
      
      {/* =========================================================================
          LỚP MỜ PHỦ ĐỂ ĐẢM BẢO CHỮ & NÚT CẢM ỨNG NỔI BẬT HOÀN HẢO
      ========================================================================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000a24]/90 via-[#000a24]/65 to-transparent pointer-events-none -z-10" />

      {/* =========================================================================
          TOP HEADER: NỀN TRẮNG, LOGO VÀ TÊN BỆNH VIỆN NẰM CHÍNH GIỮA (CENTER)
          Giữ nguyên dải header trắng thanh lịch đúng chuẩn máy Kiosk thực tế
      ========================================================================= */}
      <header className="relative bg-white text-slate-900 px-4 sm:px-8 lg:px-12 py-3 sm:py-4 shadow-md border-b-2 border-slate-200 shrink-0 z-10">
        <div className="relative flex items-center justify-center max-w-7xl mx-auto w-full">
          {/* Logo và Tên Bệnh viện luôn luôn nằm chính giữa màn hình */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5">
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex items-center justify-center shrink-0">
              <Image 
                src="/logo.png" 
                alt="Logo Bệnh viện Quân y 7A" 
                width={64}
                height={64}
                className="h-full w-auto object-contain drop-shadow-xs" 
                priority
              />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none uppercase text-[#000080] whitespace-nowrap">
              BỆNH VIỆN QUÂN Y 7A
            </h1>
          </div>

        </div>
      </header>

      {/* =========================================================================
          VÙNG TƯƠNG TÁC CHÍNH (Canh giữa hoàn hảo trên nền ảnh Kiosk xanh)
      ========================================================================= */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-5 lg:p-8 max-w-5xl xl:max-w-6xl mx-auto w-full overflow-y-auto">
        
        {/* ---------------------------------------------------------------------
            BƯỚC 1: MÀN HÌNH CHÀO MỪNG (WELCOME SCREEN)
            Tối ưu hoàn hảo cho Kiosk trụ đứng dọc (Tầm mắt đọc & Tầm tay chạm)
        --------------------------------------------------------------------- */}
        {step === 1 && (
          <div className="w-full text-center space-y-6 sm:space-y-8 lg:space-y-10 animate-in fade-in zoom-in-95 duration-400 py-4 sm:py-6 my-auto max-w-2xl sm:max-w-4xl lg:max-w-5xl mx-auto">
            
            {/* Khu vực tiêu đề - Ngang tầm mắt nhìn của người bệnh */}
            <div className="space-y-3 sm:space-y-4 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-2xl uppercase">
                <span className="whitespace-nowrap">ĐÁNH GIÁ</span>{' '}
                <span className="whitespace-nowrap">CHẤT LƯỢNG PHỤC VỤ</span>
              </h2>

              <p className="text-blue-100 text-sm sm:text-lg lg:text-xl font-medium leading-relaxed drop-shadow-sm max-w-2xl mx-auto">
                Bệnh viện Quân y 7A luôn lắng nghe để phục vụ người bệnh tốt hơn
              </p>
            </div>

            {/* KHU VỰC CÁC THANH CHẠM CẢM ỨNG - XẾP DỌC, GÓC VUÔNG PHẲNG (KHÔNG BO TRÒN, NỘI DUNG CĂN GIỮA, KHÔNG MŨI TÊN) */}
            <div className="space-y-4 sm:space-y-5 w-full px-4 pt-2 max-w-2xl sm:max-w-3xl mx-auto">
              {/* Thanh 1: Khảo sát chung toàn diện */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[76px] sm:min-h-[84px] lg:min-h-[92px] px-6 sm:px-8 bg-white hover:bg-slate-50 active:scale-[0.99] text-[#000080] shadow-xl shadow-black/40 border-b-4 border-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer rounded-none"
              >
                <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight uppercase">
                  CHẠM ĐỂ BẮT ĐẦU
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                  Khảo sát đánh giá chung toàn diện
                </div>
              </button>

              {/* Thanh 2: Khoa khám bệnh */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('kkb');
                  setStep(3);
                }}
                className="w-full min-h-[76px] sm:min-h-[84px] lg:min-h-[92px] px-6 sm:px-8 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 shadow-xl shadow-black/40 border-b-4 border-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer rounded-none"
              >
                <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight uppercase">
                  KHOA KHÁM BỆNH (NGOẠI TRÚ)
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                  Khu vực khám bệnh ngoại trú
                </div>
              </button>

              {/* Thanh 3: Khoa điều trị khác */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[76px] sm:min-h-[84px] lg:min-h-[92px] px-6 sm:px-8 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 shadow-xl shadow-black/40 border-b-4 border-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer rounded-none"
              >
                <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight uppercase">
                  CÁC KHOA ĐIỀU TRỊ KHÁC
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                  Nội trú, hồi sức & cận lâm sàng
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            BƯỚC 2: CHỌN KHOA PHÒNG - DẠNG CÁC THANH TRẮNG NỔI BẬT TRÊN NỀN XANH
        --------------------------------------------------------------------- */}
        {step === 2 && (
          <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-350 my-auto max-w-3xl mx-auto">
            <div className="text-center space-y-2 sm:space-y-3">
              <div>
                <span className="text-sky-300 text-xs sm:text-sm font-bold tracking-wider uppercase drop-shadow-xs">
                  Bước 1 / 2 • Chọn khoa phòng
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-md tracking-tight">
                Bạn vừa khám tại Khoa / Phòng nào?
              </h2>
              <p className="text-sky-100/90 text-sm sm:text-base lg:text-lg font-normal tracking-wide">
                Vui lòng chọn khoa hoặc phòng điều trị của bạn
              </p>
            </div>

            {/* DANH SÁCH CÁC THANH KHOA PHÒNG (TỐI ƯU CHIỀU CAO CHO MÀN HÌNH DỌC) */}
            <div className="space-y-3 sm:space-y-4 max-h-[55vh] sm:max-h-[64vh] portrait:max-h-[66vh] overflow-y-auto p-1 pr-2">
              {displayDepartments.map((dept) => {
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept.id);
                      setRating(0);
                      setSelectedTags([]);
                      setComment('');
                      setStep(3);
                    }}
                    className="w-full min-h-[72px] sm:min-h-[84px] px-5 sm:px-7 rounded-none border-b-4 border-slate-300 text-center transition-all active:scale-[0.99] flex flex-col items-center justify-center cursor-pointer shadow-xl bg-white hover:bg-slate-50 text-slate-900"
                  >
                    <div className="font-black text-base sm:text-xl lg:text-2xl leading-snug uppercase tracking-tight">
                      {dept.name}
                    </div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider block mt-1 text-slate-500">
                      Mã: {dept.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            BƯỚC 3: CHẤM ĐIỂM SAO & CHỌN THẺ ĐÁNH GIÁ NHANH
        --------------------------------------------------------------------- */}
        {step === 3 && (
          <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-350 my-auto max-w-2xl mx-auto">
            <div className="text-center space-y-2 sm:space-y-3">
              <div>
                <span className="text-sky-300 text-xs sm:text-sm font-bold tracking-wider uppercase drop-shadow-xs">
                  Bước 2 / 2 • Đánh giá trải nghiệm
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl landscape:text-xl landscape:lg:text-3xl font-black text-white drop-shadow-md tracking-tight">
                Mức độ hài lòng của bạn thế nào?
              </h2>
              <p className="text-sky-100/90 text-xs sm:text-base lg:text-lg font-normal tracking-wide">
                Đang đánh giá: <strong className="text-white font-bold underline underline-offset-4">{displayDepartments.find((d) => d.id === selectedDept)?.name}</strong>
              </p>
            </div>

            {/* Khối 5 Sao cảm ứng - Hiển thị trực tiếp, không bọc trong thẻ */}
            <div className="py-2 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 sm:p-2 active:scale-90 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-11 h-11 sm:w-16 sm:h-16 lg:w-20 lg:h-20 landscape:w-10 landscape:h-10 landscape:lg:w-16 landscape:lg:h-16 transition-all duration-300 ${
                        rating > 0 && star <= rating
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_4px_20px_rgba(251,191,36,0.7)] scale-110'
                          : 'text-white/40 fill-white/10 hover:text-white/70 hover:scale-105'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 ? (
                <div className="text-amber-300 font-black text-lg sm:text-2xl drop-shadow-md animate-in zoom-in-95 duration-200">
                  {rating} / 5 Sao • {getRatingLabel(rating)}
                </div>
              ) : (
                <div className="text-sky-200 font-semibold text-sm sm:text-base drop-shadow-xs">
                  Chạm vào số sao để đánh giá mức độ hài lòng
                </div>
              )}
            </div>

            {/* Thẻ đánh giá nhanh - Căn lưới 3 cột đều tăm tắp, thẳng hàng, không cần cuộn */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm lg:text-base font-bold text-white text-center sm:text-left drop-shadow-xs">
                Chạm để chọn cảm nhận nhanh (chọn nhiều mục):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 p-0.5">
                {QUICK_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`w-full min-h-[48px] sm:min-h-[52px] px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md cursor-pointer border-2 text-center ${
                        isChecked
                          ? 'bg-sky-500 text-white border-white shadow-sky-500/40 scale-[1.02]'
                          : 'bg-slate-900/75 backdrop-blur-md text-white border-white/25 hover:border-sky-300 hover:bg-slate-800'
                      }`}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 text-white stroke-[3] shrink-0 animate-in zoom-in-75 duration-200" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                      )}
                      <span className="leading-snug">{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea nhập thêm ý kiến */}
            <div className="space-y-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chạm vào đây nếu bạn muốn gửi thêm ý kiến chi tiết..."
                rows={2}
                className="w-full p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 border-white/25 bg-slate-900/80 backdrop-blur-md text-white placeholder-slate-400 text-sm sm:text-base focus:border-sky-400 focus:outline-none transition-colors shadow-inner resize-none"
              />
            </div>

          </div>
        )}

        {/* ---------------------------------------------------------------------
            BƯỚC 4: MÀN HÌNH CẢM ƠN (TỰ ĐỘNG QUAY VỀ MÀN HÌNH ĐẦU SAU 5 GIÂY)
        --------------------------------------------------------------------- */}
        {step === 4 && (
          <div className="w-full text-center space-y-5 sm:space-y-7 animate-in fade-in zoom-in-95 duration-400 py-4 my-auto max-w-xl mx-auto">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-2xl border-4 border-emerald-400 animate-bounce">
              <CheckCircle2 className="w-14 h-14 sm:w-20 sm:h-20" />
            </div>

            <div className="space-y-3 max-w-2xl mx-auto px-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-lg tracking-tight">
                Xin Cảm Ơn Quý Khách!
              </h2>
              <p className="text-blue-100 text-base sm:text-xl lg:text-2xl font-medium leading-relaxed drop-shadow-sm">
                Đánh giá của bạn đã được ghi nhận. Chúc bạn và gia đình thật nhiều sức khỏe!
              </p>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          THANH ĐIỀU HƯỚNG DƯỚI CÙNG: QUAY LẠI (TRÁI) VÀ GỬI ĐÁNH GIÁ (PHẢI)
          Thiết kế: Kích thước bằng nhau hoàn toàn, góc vuông phẳng (rounded-none), không icon
      ========================================================================= */}
      {step > 1 && step < 4 && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 z-50 flex items-center justify-between pointer-events-none">
          {/* Nút Quay Lại - Cố định ở góc trái */}
          <button
            type="button"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
            }}
            className="pointer-events-auto min-w-[130px] sm:min-w-[150px] py-2.5 sm:py-3 bg-white/95 hover:bg-white active:scale-95 text-[#000080] font-black text-xs sm:text-sm text-center transition-all border border-slate-300 border-b-2 border-b-slate-400 shadow-xl cursor-pointer whitespace-nowrap rounded-none uppercase tracking-wider backdrop-blur-xs flex items-center justify-center"
          >
            QUAY LẠI
          </button>

          {/* Nút Gửi Đánh Giá - Cố định ở góc phải (chỉ hiện khi ở Bước 3) */}
          {step === 3 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`pointer-events-auto min-w-[130px] sm:min-w-[150px] py-2.5 sm:py-3 font-black text-xs sm:text-sm text-center transition-all border-b-2 shadow-2xl whitespace-nowrap rounded-none uppercase tracking-wider flex items-center justify-center ${
                rating === 0
                  ? 'bg-slate-700/80 text-white/40 border border-slate-600/50 border-b-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-[#02854e] hover:bg-[#02633c] active:scale-95 text-white border border-emerald-400/40 border-b-emerald-950 hover:shadow-emerald-500/30 cursor-pointer'
              }`}
            >
              GỬI ĐÁNH GIÁ
            </button>
          )}
        </div>
      )}

    </div>
  );
}
