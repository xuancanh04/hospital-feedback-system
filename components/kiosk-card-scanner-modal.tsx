'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  CreditCard, 
  Camera, 
  CameraOff, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Keyboard, 
  User, 
  ArrowRight,
  ScanLine
} from 'lucide-react';
import { PatientCardInfo } from '@/types';

interface KioskCardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardScanned: (card: PatientCardInfo) => void;
  onContinueAnonymous: () => void;
}

// Danh sách thẻ mẫu để Kiosk có thể test và mô phỏng thực tế
const SAMPLE_CARDS: PatientCardInfo[] = [
  {
    type: 'cccd',
    fullName: 'NGUYỄN VĂN AN',
    cardNumber: '079094001234',
    dob: '15/08/1988',
    gender: 'Nam',
    address: 'Phường 8, Quận 5, TP. Hồ Chí Minh',
    scannedAt: new Date().toISOString(),
  },
  {
    type: 'bhyt',
    fullName: 'TRẦN THỊ BÍCH NGỌC',
    cardNumber: 'DN4791234567890',
    dob: '22/04/1992',
    gender: 'Nữ',
    address: 'Quận 10, TP. Hồ Chí Minh',
    hospitalInitial: '79-014 (BV Quân Y 7A)',
    scannedAt: new Date().toISOString(),
  },
  {
    type: 'bhyt',
    fullName: 'LÊ HOÀNG NAM',
    cardNumber: 'QN4798889991112',
    dob: '10/11/1990',
    gender: 'Nam',
    address: 'Quân khu 7, TP. Hồ Chí Minh',
    hospitalInitial: '79-014 (BV Quân Y 7A)',
    scannedAt: new Date().toISOString(),
  },
];

export function KioskCardScannerModal({
  isOpen,
  onClose,
  onCardScanned,
  onContinueAnonymous,
}: KioskCardScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'sample' | 'manual'>('scan');
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manual input state
  const [manualType, setManualType] = useState<'cccd' | 'bhyt'>('cccd');
  const [manualNumber, setManualNumber] = useState('');
  const [manualName, setManualName] = useState('');

  // Hardware wedge buffer listener (Kiosk barcode reader)
  const keyBufferRef = useRef<string>('');
  const keyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động phân tích chuỗi quét từ đầu đọc Kiosk (CCCD hoặc BHYT)
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

  // Hardware wedge scanner listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Nếu đang gõ vào input thủ công thì không chặn
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        const fullString = keyBufferRef.current;
        keyBufferRef.current = '';
        if (fullString.length >= 10) {
          const parsed = parseCardString(fullString);
          if (parsed) {
            onCardScanned(parsed);
            onClose();
          }
        }
        return;
      }

      if (e.key.length === 1) {
        keyBufferRef.current += e.key;
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
        // Reset sau 500ms nếu đầu đọc ngừng bắn mã
        keyTimerRef.current = setTimeout(() => {
          keyBufferRef.current = '';
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
    };
  }, [isOpen, onCardScanned, onClose]);

  // Bật camera thật khi ở tab scan
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError('Chưa nhận diện được camera máy Kiosk. Quý khách vui lòng đưa thẻ trước đầu đọc quét hoặc chọn chức năng bên dưới.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Xử lý xác nhận nhập thủ công
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNumber.trim()) return;

    onCardScanned({
      type: manualType,
      cardNumber: manualNumber.trim().toUpperCase(),
      fullName: (manualName.trim() || (manualType === 'cccd' ? 'NGƯỜI BỆNH (CCCD)' : 'NGƯỜI BỆNH (BHYT)')).toUpperCase(),
      scannedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#000080] via-[#01472a] to-[#02633c] p-4 sm:p-5 flex items-center justify-between border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Quét Căn Cước Công Dân & BHYT</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-extrabold px-2 py-0.5 uppercase tracking-wider">
                  Kiosk 7A
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80">
                Đưa thẻ trước camera hoặc đầu đọc thẻ để tự động nhận diện hồ sơ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab điều hướng phương thức quét */}
        <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 text-xs sm:text-sm font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`py-3 px-2 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'scan'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>1. Quét Camera / Đầu đọc</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sample')}
            className={`py-3 px-2 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'sample'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. Thẻ mẫu (Quét nhanh)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-2 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'manual'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>3. Nhập số thẻ</span>
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: Quét Camera / Đầu đọc Kiosk */}
          {activeTab === 'scan' && (
            <div className="space-y-4 text-center">
              {/* Khung quét thẻ công nghệ cao với tia laser */}
              <div className="relative mx-auto w-full max-w-md h-56 sm:h-64 bg-black rounded-xl overflow-hidden border-2 border-emerald-400/60 shadow-inner flex items-center justify-center">
                {isCameraActive ? (
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    playsInline 
                    muted 
                  />
                ) : (
                  <div className="p-4 space-y-3">
                    <ScanLine className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto">
                      {cameraError || 'Đang sẵn sàng kết nối camera và đầu đọc mã vạch Kiosk.'}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Bật Camera Quét Thẻ
                    </button>
                  </div>
                )}

                {/* Khung ngắm định vị và tia quét laser */}
                <div className="absolute inset-4 border-2 border-dashed border-emerald-400/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                    <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                  </div>
                </div>

                {/* Tia quét Laser đỏ/xanh chuyển động lên xuống */}
                <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2.5s_infinite] pointer-events-none" />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                  ⚡ Hướng dẫn: Đưa mã QR trên mặt thẻ CCCD hoặc Thẻ BHYT vào trước camera / đầu quét
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Đầu đọc Kiosk sẽ tự động nhận diện và nạp hồ sơ bệnh nhân trong tích tắc.
                </p>
              </div>

              {/* Nút giả lập quẹt thẻ nhanh ngay trong Tab 1 để tiện thử nghiệm */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">Hoặc thử nghiệm nhanh với 1 chạm:</span>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onCardScanned(SAMPLE_CARDS[0]);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quẹt thử CCCD (Nguyễn Văn An)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onCardScanned(SAMPLE_CARDS[1]);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-500/40 text-blue-300 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quẹt thử BHYT (Trần Thị Bích Ngọc)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Danh sách thẻ mẫu (Chạm là nhận) */}
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-300">
                Chọn một hồ sơ thẻ mẫu bên dưới để kiểm tra quy trình tiếp nhận và đánh giá xác thực:
              </p>
              <div className="space-y-2.5">
                {SAMPLE_CARDS.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onCardScanned(card);
                      onClose();
                    }}
                    className="w-full p-3 sm:p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-emerald-950/40 hover:border-emerald-400 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${
                        card.type === 'cccd' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {card.type.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                          {card.fullName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Số thẻ: <span className="text-white font-mono">{card.cardNumber}</span> • Năm sinh: {card.dob} ({card.gender})
                        </div>
                        {card.hospitalInitial && (
                          <div className="text-[11px] text-emerald-400/90 font-medium">
                            Nơi ĐK KCB: {card.hospitalInitial}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-slate-950 p-2 rounded-lg transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Nhập tay mã số */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-xs sm:text-sm font-bold text-slate-300">Loại giấy tờ:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('cccd')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      manualType === 'cccd'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Căn cước công dân (12 số)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('bhyt')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      manualType === 'bhyt'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Thẻ Bảo hiểm y tế (15 ký tự)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-300">
                  Số thẻ {manualType === 'cccd' ? 'CCCD' : 'BHYT'}: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={manualType === 'cccd' ? 'Ví dụ: 079094001234' : 'Ví dụ: DN4791234567890'}
                  value={manualNumber}
                  onChange={(e) => setManualNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-300">
                  Họ và tên bệnh nhân (tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: NGUYỄN VĂN AN"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-400 focus:outline-none uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-extrabold text-sm uppercase tracking-wider text-white rounded-lg shadow-lg cursor-pointer transition-all"
              >
                Xác nhận nhận diện thẻ
              </button>
            </form>
          )}
        </div>

        {/* Footer Modal: Nút Bỏ qua / Đánh giá ẩn danh không cần quét thẻ */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thông tin thẻ được bảo mật theo quy định an toàn dữ liệu y tế.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onContinueAnonymous();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wide border border-slate-600 rounded-none cursor-pointer transition-all"
          >
            Đánh giá ngay (Không cần quét thẻ) →
          </button>
        </div>
      </div>
    </div>
  );
}
