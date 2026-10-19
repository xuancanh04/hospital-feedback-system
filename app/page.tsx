'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Star, 
  Check, 
  CheckCircle2,
  QrCode,
  CreditCard,
  ScanLine,
  ShieldCheck,
  UserCheck,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MousePointerClick,
  Building2,
  HeartHandshake
} from 'lucide-react';
import { useFeedback } from '@/context/feedback-context';
import { INITIAL_DEPARTMENTS } from '@/lib/mock-data';
import { PatientCardInfo } from '@/types';

const TAGS_PER_PAGE = 8;

export default function TouchMainApp() {
  const { departments, addReview, positiveTags, criticalTags } = useFeedback();

  // 4 Bước: 1. Chào mừng -> 2. Chọn khoa -> 3. Chấm điểm & Thẻ nhanh -> 4. Cảm ơn
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'noi' | 'ngoai' | 'canlamsang'>('all');
  
  // State định danh thẻ CCCD / BHYT (Quét từ bộ phận quét máy Kiosk hoặc tùy chọn không quét)
  const [patientCard, setPatientCard] = useState<PatientCardInfo | null>(null);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // State đánh giá
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPage, setTagPage] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  // Danh sách khoa hiển thị: lấy danh sách đầy đủ đảm bảo đủ các khoa thuộc 3 khối
  const displayDepartments = departments.length >= INITIAL_DEPARTMENTS.length ? departments : INITIAL_DEPARTMENTS;

  // Hàm xác định nhóm khoa phòng (Nội / Ngoại / Cận lâm sàng)
  const getDepartmentCategory = (dept: { id: string; name: string; code?: string; category?: 'noi' | 'ngoai' | 'canlamsang' }): 'noi' | 'ngoai' | 'canlamsang' => {
    if (dept.category) return dept.category;

    const name = (dept.name || '').toLowerCase();
    const code = (dept.code || '').toLowerCase();

    if (
      name.includes('hình ảnh') ||
      name.includes('xét nghiệm') ||
      name.includes('giải phẫu') ||
      name.includes('dược') ||
      name.includes('trang bị') ||
      name.includes('nhiễm khuẩn') ||
      name.includes('vật lý trị liệu') ||
      name.includes('phục hồi chức năng') ||
      name.includes('cận lâm sàng') ||
      code === 'cdha' || code === 'xn' || code === 'gpbl' || code === 'd-tb' || code === 'ksnk' || code === 'vltl-phcn'
    ) {
      return 'canlamsang';
    }

    if (
      name.includes('ngoại') ||
      name.includes('chấn thương') ||
      name.includes('chỉnh hình') ||
      name.includes('phụ sản') ||
      name.includes('sản') ||
      name.includes('mắt') ||
      name.includes('tai') ||
      name.includes('mũi') ||
      name.includes('họng') ||
      name.includes('răng') ||
      name.includes('hàm') ||
      name.includes('mặt') ||
      name.includes('thẩm mỹ') ||
      name.includes('phẫu thuật') ||
      name.includes('gây mê') ||
      code === 'ctch' || code === 'nc-tq' || code === 'gmhs' || code === 'psn' || code === 'km' || code === 'tmh' || code === 'rhm' || code === 'thtm'
    ) {
      return 'ngoai';
    }

    return 'noi';
  };

  // Chỉ hiển thị các khoa nhỏ trực thuộc khối người dùng đã chọn
  const departmentsToRender = selectedCategory === 'all'
    ? displayDepartments
    : displayDepartments.filter((d) => getDepartmentCategory(d) === selectedCategory);

  // Âm thanh Beep báo hiệu đã quét thành công trên Kiosk
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  };

  // Ẩn bớt số thẻ để bảo mật thông tin người bệnh trên màn hình công cộng
  const maskCard = (num: string) => {
    if (!num || num.length < 6) return num;
    return `${num.slice(0, 3)}***${num.slice(-3)}`;
  };

  // Phân tích chuỗi quét từ đầu đọc phần cứng Kiosk (CCCD hoặc Thẻ BHYT)
  const parseCardString = (raw: string): PatientCardInfo | null => {
    const text = raw.trim();
    if (!text) return null;

    // Định dạng QR CCCD chuẩn: 079094001234|341756890|NGUYEN VAN AN|15081988|Nam|Phuong 8, Quan 5, TP HCM|20022021
    if (text.includes('|')) {
      const parts = text.split('|');
      if (parts.length >= 5) {
        const rawDob = parts[3] || '';
        const formattedDob = rawDob.length === 8 
          ? `${rawDob.substring(0,2)}/${rawDob.substring(2,4)}/${rawDob.substring(4,8)}`
          : rawDob;
        return {
          type: 'cccd',
          cardNumber: parts[0] || '079***',
          fullName: (parts[2] || 'NGƯỜI BỆNH').toUpperCase(),
          dob: formattedDob,
          gender: parts[4] || 'Nam',
          address: parts[5] || '',
          scannedAt: new Date().toISOString(),
        };
      }
    }

    // Định dạng QR BHYT chuẩn: DN4791234567890$Nguyễn Văn An$15/08/1988$1$...
    if (text.includes('$')) {
      const parts = text.split('$');
      return {
        type: 'bhyt',
        cardNumber: parts[0] || 'BHYT-***',
        fullName: (parts[1] || 'NGƯỜI BỆNH').toUpperCase(),
        dob: parts[2] || '',
        gender: parts[3] === '1' ? 'Nam' : 'Nữ',
        address: parts[4] || '',
        hospitalInitial: parts[5] || '79-014 (BV Quân Y 7A)',
        scannedAt: new Date().toISOString(),
      };
    }

    // Nếu chỉ có mã số 12 số (CCCD) hoặc 15 ký tự (BHYT)
    if (/^\d{12}$/.test(text)) {
      return {
        type: 'cccd',
        cardNumber: text,
        fullName: 'BỆNH NHÂN CCCD',
        scannedAt: new Date().toISOString(),
      };
    }

    if (/^[A-Z]{2}\d{13}$/i.test(text)) {
      return {
        type: 'bhyt',
        cardNumber: text.toUpperCase(),
        fullName: 'BỆNH NHÂN BHYT',
        hospitalInitial: '79-014 (BV Quân Y 7A)',
        scannedAt: new Date().toISOString(),
      };
    }

    return null;
  };

  // Tự động nhận diện tín hiệu từ BỘ PHẬN QUÉT PHẦN CỨNG CỦA MÁY KIOSK
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Nếu đang gõ ô nhập ý kiến thêm thì không bắt
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTime = Date.now();

      // Đầu đọc phần cứng Kiosk bắn phím siêu nhanh (< 60ms)
      if (currentTime - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 8) {
          const parsed = parseCardString(buffer);
          if (parsed) {
            playScanBeep();
            setPatientCard(parsed);
            setScanNotification(`Đã nhận diện thành công: ${parsed.fullName} (${parsed.type.toUpperCase()})`);
            setTimeout(() => setScanNotification(null), 4500);
          }
        }
        buffer = '';
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset form về trạng thái ban đầu
  const handleReset = () => {
    setStep(1);
    setSelectedCategory('all');
    setSelectedDept('');
    setRating(0);
    setSelectedTags([]);
    setTagPage(0);
    setComment('');
    setPatientCard(null);
    setScanNotification(null);
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

    // Nếu người bệnh có quét CCCD hoặc BHYT thì lưu tên & mã thẻ xác thực, nếu không quét thì lưu ẩn danh
    const authorName = patientCard 
      ? `${patientCard.fullName} (${patientCard.type.toUpperCase()}: ${maskCard(patientCard.cardNumber)})`
      : 'Người bệnh tại bệnh viện (Ẩn danh)';

    addReview({
      userId: patientCard ? `card-${patientCard.cardNumber}` : `touch-${Date.now()}`,
      userName: authorName,
      isAnonymous: !patientCard,
      hasCardVerified: Boolean(patientCard),
      cardType: patientCard?.type,
      cardNumber: patientCard?.cardNumber,
      patientDob: patientCard?.dob,
      patientGender: patientCard?.gender,
      patientAddress: patientCard?.address,
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

      {/* Thông báo nổi khi bộ phận quét Kiosk nhận diện thẻ */}
      {scanNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 sm:px-7 py-3 shadow-2xl border-2 border-emerald-300 font-bold text-sm sm:text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{scanNotification}</span>
        </div>
      )}

      {/* =========================================================================
          TOP HEADER: NỀN TRẮNG, LOGO VÀ TÊN BỆNH VIỆN NẰM CHÍNH GIỮA (CENTER)
          Giữ nguyên dải header trắng thanh lịch đúng chuẩn máy Kiosk thực tế
      ========================================================================= */}
      <header className="relative bg-white text-slate-900 px-4 sm:px-8 lg:px-12 py-3 sm:py-4 shadow-md border-b-2 border-slate-200 shrink-0 z-10">
        <div className="relative flex items-center justify-center max-w-7xl mx-auto w-full">
          {/* Logo và Tên Bệnh viện - Luôn nằm CHÍNH GIỮA màn hình */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 mx-auto">
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex items-center justify-center shrink-0">
              <Image 
                src="/logo.png" 
                alt="Logo Bệnh viện Quân y 7A" 
                width={430}
                height={148}
                unoptimized
                className="h-full w-auto object-contain drop-shadow-xs" 
                priority
              />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-normal leading-none uppercase text-[#000080] whitespace-nowrap">
              BỆNH VIỆN QUÂN Y 7A
            </h1>
          </div>

          {/* Thẻ bệnh nhân đã quét - Nằm cố định góc phải (absolute) để KHÔNG làm lệch tâm Logo ở giữa */}
          {patientCard && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-400 px-3 py-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm font-semibold">
                <span>{patientCard.fullName}</span>
                <span className="text-emerald-700 font-mono text-[11px] ml-1.5 hidden sm:inline">
                  ({patientCard.type.toUpperCase()}: {maskCard(patientCard.cardNumber)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPatientCard(null);
                  setScanNotification('Đã hủy thông tin thẻ.');
                  setTimeout(() => setScanNotification(null), 2500);
                }}
                className="ml-1 p-0.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Bỏ thẻ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          VÙNG TƯƠNG TÁC CHÍNH (Canh giữa hoàn hảo trên nền ảnh Kiosk xanh)
      ========================================================================= */}
      <main className={`flex-1 flex items-center justify-center p-3 sm:p-5 lg:p-8 max-w-5xl xl:max-w-6xl mx-auto w-full overflow-y-auto ${
        step > 1 && step < 4 ? 'pb-20 sm:pb-24' : ''
      }`}>
        
        {/* ---------------------------------------------------------------------
            BƯỚC 1: MÀN HÌNH CHÀO MỪNG (WELCOME SCREEN)
            Tối ưu hoàn hảo cho Kiosk trụ đứng dọc (Tầm mắt đọc & Tầm tay chạm)
        --------------------------------------------------------------------- */}
        {step === 1 && (
          <div className="w-full text-center space-y-5 sm:space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-400 py-3 sm:py-5 my-auto max-w-2xl sm:max-w-4xl lg:max-w-5xl mx-auto">
            
            {/* Khu vực tiêu đề - Ngang tầm mắt nhìn của người bệnh */}
            <div className="space-y-2.5 sm:space-y-3 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-normal leading-tight drop-shadow-sm uppercase">
                <span className="whitespace-nowrap">ĐÁNH GIÁ</span>{' '}
                <span className="whitespace-nowrap">CHẤT LƯỢNG PHỤC VỤ</span>
              </h2>

              <p className="text-blue-100 text-sm sm:text-base lg:text-lg font-normal leading-relaxed drop-shadow-sm max-w-2xl mx-auto">
                Bệnh viện Quân y 7A luôn lắng nghe để phục vụ người bệnh tốt hơn
              </p>
            </div>

            {/* Thông tin thẻ bệnh nhân đã quét (hiện tinh tế, gọn gàng khi người bệnh vừa quẹt thẻ vào máy Kiosk) */}
            {patientCard && (
              <div className="w-full px-4 max-w-xl mx-auto -mt-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-400/80 px-4 py-2 text-left shadow-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                    <div className="truncate">
                      <div className="text-sm font-black text-white uppercase tracking-tight truncate">
                        {patientCard.fullName}
                      </div>
                      <div className="text-[11px] text-emerald-200/90 font-mono">
                        {patientCard.type.toUpperCase()}: {maskCard(patientCard.cardNumber)}
                        {patientCard.dob && ` • ${patientCard.dob}`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientCard(null);
                      setScanNotification('Đã hủy thông tin thẻ.');
                      setTimeout(() => setScanNotification(null), 2500);
                    }}
                    className="px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer border border-red-400/60 transition-colors shrink-0"
                  >
                    Bỏ thẻ
                  </button>
                </div>
              </div>
            )}

            {/* KHU VỰC CÁC THANH CHẠM CẢM ỨNG - TỐI ƯU MÀN HÌNH DỌC: TĂNG KHOẢNG CÁCH GIỮA CÁC THẺ VÀ NỘI DUNG */}
            <div className="space-y-5 sm:space-y-6 w-full px-4 pt-2 max-w-lg sm:max-w-xl mx-auto" suppressHydrationWarning>
              {/* Thẻ 1: Khối Nội */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setSelectedCategory('noi');
                  setStep(2);
                }}
                className="w-full min-h-[72px] sm:min-h-[78px] lg:min-h-[84px] px-5 sm:px-7 py-4 sm:py-4.5 bg-white hover:bg-slate-50 active:scale-[0.99] text-[#000080] shadow-lg shadow-black/30 border border-slate-200 border-b-3 border-b-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer rounded-xl sm:rounded-2xl"
              >
                <div className="font-bold text-base sm:text-lg lg:text-xl tracking-tight leading-none uppercase">
                  KHỐI NỘI
                </div>
                <div className="text-xs sm:text-[13px] font-medium text-slate-500 mt-2 leading-snug">
                  Điều trị bằng thuốc và thủ thuật can thiệp
                </div>
              </button>

              {/* Thẻ 2: Khối Ngoại & Chuyên khoa */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setSelectedCategory('ngoai');
                  setStep(2);
                }}
                className="w-full min-h-[72px] sm:min-h-[78px] lg:min-h-[84px] px-5 sm:px-7 py-4 sm:py-4.5 bg-white hover:bg-slate-50 active:scale-[0.99] text-[#000080] shadow-lg shadow-black/30 border border-slate-200 border-b-3 border-b-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer rounded-xl sm:rounded-2xl"
              >
                <div className="font-bold text-base sm:text-lg lg:text-xl tracking-tight leading-none uppercase">
                  KHỐI NGOẠI & CHUYÊN KHOA
                </div>
                <div className="text-xs sm:text-[13px] font-medium text-slate-500 mt-2 leading-snug">
                  Điều trị bằng phẫu thuật, thủ thuật xâm lấn
                </div>
              </button>

              {/* Thẻ 3: Khối Cận lâm sàng & Hỗ trợ */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setSelectedCategory('canlamsang');
                  setStep(2);
                }}
                className="w-full min-h-[72px] sm:min-h-[78px] lg:min-h-[84px] px-5 sm:px-7 py-4 sm:py-4.5 bg-white hover:bg-slate-50 active:scale-[0.99] text-[#000080] shadow-lg shadow-black/30 border border-slate-200 border-b-3 border-b-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer rounded-xl sm:rounded-2xl"
              >
                <div className="font-bold text-base sm:text-lg lg:text-xl tracking-tight leading-none uppercase">
                  KHỐI CẬN LÂM SÀNG & HỖ TRỢ
                </div>
                <div className="text-xs sm:text-[13px] font-medium text-slate-500 mt-2 leading-snug">
                  Xét nghiệm, Chẩn đoán hình ảnh, Dược & Trang bị
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            BƯỚC 2: CHỌN KHOA PHÒNG - DẠNG CÁC THANH TRẮNG NỔI BẬT TRÊN NỀN XANH
            Tối ưu lưới 2 cột nhỏ gọn, vừa vặn tất cả các màn hình không cần cuộn lướt
        --------------------------------------------------------------------- */}
        {step === 2 && (
          <div className="w-full space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-350 my-auto max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-4 pb-12 sm:pb-16">
            {/* THANH TIẾN TRÌNH VÒNG TRÒN NỐI DÂY (CIRCULAR STEPPER) CAO CẤP */}
            <div className="flex flex-col items-center space-y-2.5 max-w-lg mx-auto w-full">
              {/* Cụm 2 Vòng tròn kết nối đường line phát sáng */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                {/* Node Vòng tròn 1: Đang thực hiện */}
                <div className="flex items-center gap-2.5 bg-gradient-to-r from-sky-600/30 to-blue-600/30 border border-sky-400/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg shadow-sky-500/10">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -inset-1 rounded-full bg-sky-400/30 animate-ping" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      1
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                    Chọn khoa phòng
                  </span>
                </div>

                {/* Đường nối giữa 2 vòng tròn */}
                <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-sky-400/60 to-white/20 rounded-full" />

                {/* Node Vòng tròn 2: Bước tiếp theo */}
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full opacity-60">
                  <div className="w-6 h-6 rounded-full bg-white/15 text-white/70 flex items-center justify-center font-medium text-xs">
                    2
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
                    Chấm điểm sao
                  </span>
                </div>
              </div>

              {/* Tiêu đề Khối & Lời chỉ dẫn */}
              <div className="text-center space-y-1 pt-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md tracking-tight uppercase">
                  {selectedCategory === 'noi' && 'KHỐI NỘI'}
                  {selectedCategory === 'ngoai' && 'KHỐI NGOẠI & CHUYÊN KHOA'}
                  {selectedCategory === 'canlamsang' && 'KHỐI CẬN LÂM SÀNG & HỖ TRỢ'}
                  {selectedCategory === 'all' && 'CHỌN KHOA PHÒNG'}
                </h2>
                <p className="text-sky-100/90 text-xs sm:text-sm font-normal tracking-wide max-w-2xl mx-auto">
                  {selectedCategory === 'canlamsang' 
                    ? 'Chạm chọn khoa xét nghiệm, chẩn đoán hoặc hậu cần bạn vừa sử dụng'
                    : selectedCategory === 'ngoai'
                    ? 'Chạm chọn khoa phẫu thuật hoặc liên chuyên khoa bạn vừa đến'
                    : selectedCategory === 'noi'
                    ? 'Chạm chọn khoa điều trị nội khoa bạn vừa đến khám hoặc điều trị'
                    : 'Chạm chọn khoa phòng tương ứng để tiếp tục đánh giá'}
                </p>
              </div>
            </div>

            {/* DANH SÁCH CÁC THẺ KHOA: LƯỚI 2 CỘT NHỎ GỌN, KHOẢNG CÁCH THOÁNG ĐẸP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 w-full">
              {departmentsToRender.map((dept) => {
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
                    className="w-full min-h-[52px] sm:min-h-[58px] lg:min-h-[62px] py-3.5 sm:py-4 px-4 sm:px-5 rounded-xl border border-slate-200 border-b-2 sm:border-b-3 border-b-slate-300 text-center transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer shadow-md bg-white hover:bg-slate-50 text-slate-800"
                  >
                    <div className="font-medium sm:font-semibold text-xs sm:text-sm lg:text-base leading-snug uppercase tracking-normal text-center">
                      {dept.name}
                    </div>
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
            {/* THANH TIẾN TRÌNH VÒNG TRÒN NỐI DÂY (CIRCULAR STEPPER) CAO CẤP */}
            <div className="flex flex-col items-center space-y-2.5 max-w-lg mx-auto w-full">
              {/* Cụm 2 Vòng tròn kết nối đường line phát sáng */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                {/* Node Vòng tròn 1: Đã hoàn thành (chạm vào để đổi khoa) */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-400/50 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/10 hover:bg-emerald-600/40 cursor-pointer transition-all"
                  title="Chạm vào để chọn lại khoa khác"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white tracking-wide max-w-[140px] sm:max-w-[200px] truncate">
                    {displayDepartments.find((d) => d.id === selectedDept)?.name || 'Khoa phòng'}
                  </span>
                </button>

                {/* Đường nối giữa 2 vòng tròn (đã hoàn thành nối sang bước 2) */}
                <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-emerald-400/80 to-sky-400 rounded-full" />

                {/* Node Vòng tròn 2: Đang thực hiện */}
                <div className="flex items-center gap-2.5 bg-gradient-to-r from-sky-600/30 to-blue-600/30 border border-sky-400/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg shadow-sky-500/10">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -inset-1 rounded-full bg-sky-400/30 animate-ping" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      2
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                    Chấm điểm sao
                  </span>
                </div>
              </div>

              {/* Tiêu đề & Lời chỉ dẫn */}
              <div className="text-center space-y-1 pt-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md tracking-normal">
                  Mức độ hài lòng của bạn thế nào?
                </h2>
                <p className="text-sky-100/90 text-xs sm:text-sm font-normal tracking-wide">
                  Chạm vào số sao (1 đến 5 sao) để chấm điểm dịch vụ
                </p>
              </div>
              {patientCard && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-xs sm:text-sm font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Người bệnh: {patientCard.fullName} (Thẻ {patientCard.type.toUpperCase()})</span>
                  </span>
                </div>
              )}
            </div>

            {/* Khối 5 Sao cảm ứng - Hiển thị trực tiếp, không bọc trong thẻ */}
            <div className="py-2 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      if (rating !== star) {
                        setRating(star);
                        setTagPage(0);
                        setSelectedTags([]);
                      }
                    }}
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
                <div className="text-amber-300 font-bold text-base sm:text-xl drop-shadow-md animate-in zoom-in-95 duration-200">
                  {rating} / 5 Sao • {getRatingLabel(rating)}
                </div>
              ) : (
                <div className="text-sky-200 font-medium text-xs sm:text-sm drop-shadow-xs">
                  Chạm vào số sao để đánh giá mức độ hài lòng
                </div>
              )}
            </div>

            {/* Khối Thẻ Đánh Giá Động Theo Số Sao (Khen Ngợi hoặc Góp Ý / Chê) có Phân Trang */}
            {(() => {
              // Nếu 4 - 5 sao: Hiện thẻ khen ngợi. Nếu 1 - 3 sao: Hiện thẻ góp ý / phàn nàn. Mặc định là khen.
              const isPositive = rating === 0 || rating >= 4;
              const currentTagList = isPositive ? positiveTags : criticalTags;
              const totalPages = Math.ceil((currentTagList.length || 1) / TAGS_PER_PAGE);
              const safePage = Math.min(tagPage, Math.max(0, totalPages - 1));
              const startIdx = safePage * TAGS_PER_PAGE;
              const displayedTags = currentTagList.slice(startIdx, startIdx + TAGS_PER_PAGE);

              return (
                <div className={`space-y-2.5 max-w-xl mx-auto w-full transition-all duration-300 ${
                  rating === 0 
                    ? 'opacity-35 pointer-events-none select-none filter blur-[0.4px]' 
                    : 'opacity-100 pointer-events-auto animate-in fade-in duration-300'
                }`}>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white drop-shadow-xs">
                      {rating === 0 ? (
                        <span className="text-sky-200/80 font-normal italic">
                          (Chọn số sao ở trên để mở khóa các tiêu chí đánh giá nhanh)
                        </span>
                      ) : isPositive ? (
                        <span>Điểm bạn hài lòng nhất (chọn nhanh):</span>
                      ) : (
                        <span>Vấn đề bệnh viện cần cải thiện (chọn nhanh):</span>
                      )}
                    </div>

                    {/* Phân trang (Trang 1/2) nếu danh sách nhiều mục */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5 text-xs text-sky-200 font-medium bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
                        <span>Trang {safePage + 1}/{totalPages}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            type="button"
                            disabled={safePage === 0}
                            onClick={() => setTagPage(Math.max(0, safePage - 1))}
                            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Trang trước"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={safePage >= totalPages - 1}
                            onClick={() => setTagPage(Math.min(totalPages - 1, safePage + 1))}
                            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Trang sau"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lưới các thẻ phản hồi theo trang */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {displayedTags.map((tag) => {
                      const isChecked = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`w-full min-h-[44px] sm:min-h-[48px] px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs cursor-pointer border text-center select-none ${
                            isChecked
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/30 font-semibold'
                              : 'bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200/90'
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-4 h-4 text-white stroke-[2.5] shrink-0 animate-in zoom-in-75 duration-200" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                          )}
                          <span className="leading-snug truncate">{tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Đã bỏ 2 nút lớn phía dưới theo yêu cầu */}
                </div>
              );
            })()}

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
                {patientCard ? `Cảm Ơn ${patientCard.fullName}!` : 'Xin Cảm Ơn Quý Khách!'}
              </h2>
              <p className="text-blue-100 text-base sm:text-xl lg:text-2xl font-medium leading-relaxed drop-shadow-sm">
                Đánh giá của bạn đã được ghi nhận. Chúc bạn và gia đình thật nhiều sức khỏe!
              </p>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          THANH ĐIỀU HƯỚNG DƯỚI CÙNG: SÁT ĐÁY MÀN HÌNH (DÍNH LIỀN MÀN HÌNH), LUÔN CHIA ĐÔI 50/50
          Thiết kế chuẩn Kiosk hiện đại: Glassmorphism nhẹ, Gradient sang trọng, icon trực quan
      ========================================================================= */}
      {step > 1 && step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch h-14 sm:h-16 lg:h-18 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t border-white/20 bg-slate-900/95 backdrop-blur-md">
          {/* Nút Quay Lại - 50% bên trái: Nền sáng cao cấp, chữ Navy tương phản cao, icon mũi tên */}
          <button
            type="button"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
            }}
            className="w-1/2 h-full bg-linear-to-b from-white to-slate-100 hover:from-slate-50 hover:to-slate-200 active:from-slate-200 active:to-slate-300 text-[#000080] font-black text-sm sm:text-base lg:text-lg text-center transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border-r border-slate-300/80 group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            <span>QUAY LẠI</span>
          </button>

          {/* Nút Gửi Đánh Giá - 50% bên phải:
              - Bước 2 hoặc chưa chọn sao: Nền xám mờ hiện đại đồng bộ, chữ chìm thanh lịch
              - Bước 3 khi đã chọn sao: Gradient ngọc lục bảo rực rỡ, hiệu ứng ánh sáng sang trọng */}
          <button
            type="button"
            disabled={step !== 3 || rating === 0}
            onClick={step === 3 ? handleSubmit : undefined}
            className={`w-1/2 h-full font-black text-sm sm:text-base lg:text-lg text-center transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
              step === 3 && rating > 0
                ? 'bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:from-emerald-700 active:to-teal-800 text-white cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
                : 'bg-slate-800/90 text-slate-400 cursor-not-allowed select-none opacity-80'
            }`}
          >
            <span>GỬI ĐÁNH GIÁ</span>
            {step === 3 && rating > 0 && (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 animate-in zoom-in-50 duration-200" strokeWidth={3} />
            )}
          </button>
        </div>
      )}

    </div>
  );
}
