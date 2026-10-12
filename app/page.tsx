'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Star, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { useFeedback } from '@/context/feedback-context';

// Danh sách thẻ phản hồi nhanh tối ưu cho màn hình cảm ứng
const QUICK_TAGS = [
  'Bác sĩ tận tình, chu đáo',
  'Y tá hướng dẫn nhiệt tình',
  'Thủ tục nhanh chóng',
  'Cơ sở vật chất sạch sẽ',
  'Không gian thoáng mát',
  'Giải thích bệnh rõ ràng',
  'Thời gian chờ đợi hợp lý',
  'Trang thiết bị hiện đại',
  'Cần tăng cường ghế chờ',
  'Khu vệ sinh cần sạch hơn'
];

export default function TouchMainApp() {
  const { departments, addReview } = useFeedback();

  // 4 Bước: 1. Chào mừng -> 2. Chọn khoa -> 3. Chấm điểm & Thẻ nhanh -> 4. Cảm ơn
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // State đánh giá
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  
  // Auto-reset đếm ngược 10 giây ở bước 4
  const [countdown, setCountdown] = useState<number>(10);

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

  // Logic đếm ngược và tự động reset về Bước 1 khi hoàn tất
  useEffect(() => {
    if (step !== 4) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleReset();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [step]);

  // Reset form về trạng thái ban đầu
  const handleReset = () => {
    setStep(1);
    setSelectedDept('');
    setRating(5);
    setSelectedTags([]);
    setComment('');
    setCountdown(10);
  };

  // Toggle chọn thẻ đánh giá nhanh
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Gửi đánh giá trực tiếp vào hệ thống (không cần đăng ký/đăng nhập)
  const handleSubmit = () => {
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

    setCountdown(10);
    setStep(4);
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5: return 'Rất Hài Lòng';
      case 4: return 'Hài Lòng';
      case 3: return 'Bình Thường';
      case 2: return 'Chưa Hài Lòng';
      case 1: return 'Rất Thất Vọng';
      default: return 'Đánh Giá';
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
          {/* Nút Quay Lại (Cố định ở góc trái màn hình khi bước > 1) */}
          {step > 1 && step < 4 && (
            <button
              onClick={() => {
                if (step === 3) setStep(2);
                else if (step === 2) setStep(1);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#000080] font-black text-xs sm:text-sm transition-all border border-slate-300 shadow-xs cursor-pointer whitespace-nowrap rounded-none"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Quay Lại</span>
            </button>
          )}

          {/* Logo và Tên Bệnh viện luôn luôn nằm chính giữa màn hình */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5">
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo Bệnh viện Quân y 7A" 
                className="h-full w-auto object-contain drop-shadow-xs" 
              />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none uppercase text-[#000080] whitespace-nowrap">
              BỆNH VIỆN QUÂN Y 7A
            </h1>
          </div>

          {/* Nút Làm Lại (Cố định ở góc phải, không ảnh hưởng đến việc logo căn giữa) */}
          {step > 1 && step < 4 && (
            <button
              onClick={handleReset}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#000080] font-bold text-xs sm:text-sm transition-all border border-slate-300 shadow-xs cursor-pointer whitespace-nowrap rounded-none"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Làm Lại</span>
            </button>
          )}
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

            {/* KHU VỰC CÁC THANH CHẠM CẢM ỨNG - XẾP DỌC, GÓC VUÔNG PHẲNG (KHÔNG BO TRÒN, KHÔNG MÀU ĐẦU THẺ) */}
            <div className="space-y-4 sm:space-y-5 w-full px-4 pt-2 max-w-2xl sm:max-w-3xl mx-auto">
              {/* Thanh 1: Khảo sát chung toàn diện */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[76px] sm:min-h-[84px] lg:min-h-[92px] px-6 sm:px-8 bg-white hover:bg-slate-50 active:scale-[0.99] text-[#000080] shadow-xl shadow-black/40 border-b-4 border-slate-300 transition-all flex items-center justify-between group cursor-pointer rounded-none"
              >
                <div className="flex items-center gap-4 sm:gap-5 text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#000080]" />
                  </div>
                  <div>
                    <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight uppercase">
                      CHẠM ĐỂ BẮT ĐẦU
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                      Khảo sát đánh giá chung toàn diện
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 group-hover:bg-[#000080]/10 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform text-[#000080]" />
                </div>
              </button>

              {/* Thanh 2: Khoa khám bệnh */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('kkb');
                  setStep(3);
                }}
                className="w-full min-h-[76px] sm:min-h-[84px] lg:min-h-[92px] px-6 sm:px-8 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 shadow-xl shadow-black/40 border-b-4 border-slate-300 transition-all flex items-center justify-between group cursor-pointer rounded-none"
              >
                <div className="flex items-center gap-4 sm:gap-5 text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#000080]" />
                  </div>
                  <div>
                    <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight uppercase">
                      KHOA KHÁM BỆNH (NGOẠI TRÚ)
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                      Khu vực khám bệnh ngoại trú
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 group-hover:bg-sky-500/15 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform text-[#000080]" />
                </div>
              </button>

              {/* Thanh 3: Khoa điều trị khác */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[76px] sm:min-h-[84px] lg:min-h-[92px] px-6 sm:px-8 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 shadow-xl shadow-black/40 border-b-4 border-slate-300 transition-all flex items-center justify-between group cursor-pointer rounded-none"
              >
                <div className="flex items-center gap-4 sm:gap-5 text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 flex items-center justify-center shrink-0">
                    <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#000080]" />
                  </div>
                  <div>
                    <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight uppercase">
                      CÁC KHOA ĐIỀU TRỊ KHÁC
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                      Nội trú, hồi sức & cận lâm sàng
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 group-hover:bg-amber-500/15 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform text-[#000080]" />
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
            <div className="text-center space-y-1 sm:space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sky-200 text-xs sm:text-sm font-black tracking-wider uppercase border border-white/30">
                BƯỚC 1 / 2 • CHỌN NƠI KHÁM CHỮA BỆNH
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-md">
                Bạn vừa khám tại Khoa / Phòng nào?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg font-medium">
                Chạm vào thanh khoa phòng tương ứng bên dưới
              </p>
            </div>

            {/* DANH SÁCH CÁC THANH KHOA PHÒNG (TỐI ƯU CHIỀU CAO CHO MÀN HÌNH DỌC) */}
            <div className="space-y-3 sm:space-y-4 max-h-[55vh] sm:max-h-[64vh] portrait:max-h-[66vh] overflow-y-auto p-1 pr-2">
              {displayDepartments.map((dept) => {
                const isSelected = selectedDept === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept.id);
                      setStep(3);
                    }}
                    className={`w-full min-h-[72px] sm:min-h-[84px] px-5 sm:px-7 rounded-2xl sm:rounded-3xl border-2 sm:border-3 text-left transition-all active:scale-[0.98] flex items-center justify-between gap-4 cursor-pointer shadow-lg ${
                      isSelected
                        ? 'bg-[#000080] text-white border-sky-400 shadow-xl shadow-sky-500/30 ring-4 ring-sky-400/30'
                        : 'bg-white/95 backdrop-blur-md text-slate-900 border-white hover:bg-white hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#000080]/10 text-[#000080]'
                      }`}>
                        <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-base sm:text-xl lg:text-2xl leading-snug truncate">
                          {dept.name}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider block mt-0.5 ${
                          isSelected ? 'text-sky-200' : 'text-slate-500'
                        }`}>
                          Mã: {dept.code}
                        </span>
                      </div>
                    </div>
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      isSelected ? 'bg-white/20 text-white translate-x-1' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/70 backdrop-blur-md border-2 border-white/30 text-white font-bold text-base sm:text-lg hover:bg-slate-900 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Quay lại màn hình chính</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            BƯỚC 3: CHẤM ĐIỂM SAO & CHỌN THẺ ĐÁNH GIÁ NHANH
        --------------------------------------------------------------------- */}
        {step === 3 && (
          <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-350 my-auto max-w-2xl mx-auto">
            <div className="text-center space-y-1 sm:space-y-1.5">
              <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-sky-200 text-[11px] sm:text-xs font-black tracking-wider uppercase border border-white/30">
                BƯỚC 2 / 2 • ĐÁNH GIÁ CHẤT LƯỢNG
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl landscape:text-xl landscape:lg:text-3xl font-extrabold text-white drop-shadow-md">
                Mức độ hài lòng của bạn thế nào?
              </h2>
              <p className="text-sky-200 text-xs sm:text-base lg:text-lg font-bold">
                Đang đánh giá: <strong className="text-white underline underline-offset-4">{displayDepartments.find((d) => d.id === selectedDept)?.name}</strong>
              </p>
            </div>

            {/* Khối 5 Sao cảm ứng siêu lớn */}
            <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-white/25 shadow-2xl space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 sm:p-2.5 rounded-2xl active:scale-90 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 landscape:w-10 landscape:h-10 landscape:lg:w-14 landscape:lg:h-14 transition-all duration-300 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_4px_16px_rgba(251,191,36,0.6)] scale-110'
                          : 'text-slate-600 fill-slate-700/50 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="inline-block px-5 py-1.5 rounded-2xl bg-amber-400/20 text-amber-300 font-black text-base sm:text-xl border border-amber-400/40 shadow-xs">
                {rating} / 5 Sao • {getRatingLabel(rating)}
              </div>
            </div>

            {/* Thẻ đánh giá nhanh */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm lg:text-base font-bold text-white text-center sm:text-left drop-shadow-xs">
                Chạm để chọn cảm nhận nhanh (chọn nhiều mục):
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center sm:justify-start max-h-[18vh] sm:max-h-[22vh] overflow-y-auto p-0.5">
                {QUICK_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`min-h-[46px] sm:min-h-[52px] px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition-all active:scale-95 flex items-center gap-2 shadow-md cursor-pointer border-2 ${
                        isChecked
                          ? 'bg-sky-500 text-white border-white shadow-sky-500/40 scale-[1.02]'
                          : 'bg-slate-900/75 backdrop-blur-md text-white border-white/25 hover:border-sky-300 hover:bg-slate-800'
                      }`}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 text-white stroke-[3] animate-in zoom-in-75 duration-200" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      )}
                      <span>{tag}</span>
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

            {/* Nút hành động */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl bg-slate-900/70 backdrop-blur-md border-2 border-white/30 text-white font-bold text-sm sm:text-base hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Chọn Lại Khoa</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-[#000080] hover:from-sky-400 hover:to-blue-700 active:scale-95 text-white font-black text-base sm:text-xl shadow-xl shadow-sky-500/30 border-b-4 border-blue-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>GỬI ĐÁNH GIÁ</span>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            BƯỚC 4: MÀN HÌNH CẢM ƠN & AUTO RESET
        --------------------------------------------------------------------- */}
        {step === 4 && (
          <div className="w-full text-center space-y-5 sm:space-y-7 animate-in fade-in zoom-in-95 duration-400 py-4 my-auto max-w-xl mx-auto">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-2xl border-4 border-emerald-400 animate-bounce">
              <CheckCircle2 className="w-14 h-14 sm:w-20 sm:h-20" />
            </div>

            <div className="space-y-2 max-w-2xl mx-auto px-4">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-lg">
                Xin Cảm Ơn Quý Khách!
              </h2>
              <p className="text-blue-100 text-base sm:text-xl lg:text-2xl font-medium leading-relaxed drop-shadow-sm">
                Đánh giá của bạn đã được ghi nhận. Chúc bạn và gia đình thật nhiều sức khỏe!
              </p>
            </div>

            {/* Thanh tiến trình Auto-reset 10 giây */}
            <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border-2 border-white/20 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300">
                <span>Tự động quay về màn hình đầu sau:</span>
                <span className="text-sky-400 text-base sm:text-lg font-black">{countdown}s</span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full mt-2 h-12 sm:h-14 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Hoàn tất & Về màn hình chờ</span>
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
