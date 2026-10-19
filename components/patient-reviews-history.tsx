'use client';

import React, { useState, useMemo } from 'react';
import { Review, Department } from '@/types';
import {
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  Calendar,
  Building2,
  Star,
  ShieldCheck,
  User,
  CreditCard,
  MapPin,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  History,
  Plus,
} from 'lucide-react';
import { AdminAddReviewModal } from './admin-add-review-modal';

interface PatientReviewsHistoryProps {
  reviews: Review[];
  departments: Department[];
  onUpdateStatus?: (reviewId: string, status: any) => void;
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt' | 'status' | 'likes'>) => Promise<void>;
}

export function PatientReviewsHistory({
  reviews,
  departments,
  onUpdateStatus,
  onAddReview,
}: PatientReviewsHistoryProps) {
  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [authFilter, setAuthFilter] = useState<'all' | 'verified' | 'anonymous'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal xem chi tiết bệnh nhân & đánh giá
  const [selectedPatientReview, setSelectedPatientReview] = useState<Review | null>(null);

  // Modal thêm đánh giá / khảo sát mới cho bệnh nhân
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);

  // Tách nội dung thẻ và lời nhắn
  const parseContent = (content: string) => {
    let tags: string[] = [];
    let comment = '';

    const tagMatch = content.match(/\[Đánh giá nhanh\]:\s*([^\n]+)/);
    if (tagMatch && tagMatch[1]) {
      tags = tagMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
    }

    const commentMatch = content.match(/\[Ý kiến thêm\]:\s*([\s\S]+)/);
    if (commentMatch && commentMatch[1]) {
      comment = commentMatch[1].trim();
    } else if (!tagMatch) {
      comment = content.trim();
    }

    return { tags, comment };
  };

  // Lọc và sắp xếp danh sách
  const filteredReviews = useMemo(() => {
    const now = new Date();

    return reviews
      .filter((r) => {
        // 1. Khoa phòng
        if (deptFilter !== 'all' && r.departmentId !== deptFilter) return false;

        // 2. Số sao
        if (ratingFilter !== 'all' && r.overallRating !== ratingFilter) return false;

        // 3. Nguồn xác thực thẻ
        if (authFilter === 'verified' && !r.hasCardVerified && r.isAnonymous) return false;
        if (authFilter === 'anonymous' && (r.hasCardVerified || !r.isAnonymous)) return false;

        // 4. Thời gian
        if (timeFilter !== 'all') {
          const revDate = new Date(r.createdAt || r.visitDate || now);
          const diffHours = (now.getTime() - revDate.getTime()) / (1000 * 3600);
          if (timeFilter === 'today' && diffHours > 24) return false;
          if (timeFilter === '7days' && diffHours > 24 * 7) return false;
          if (timeFilter === '30days' && diffHours > 24 * 30) return false;
        }

        // 5. Từ khóa tìm kiếm
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = r.userName?.toLowerCase().includes(q);
          const matchDept = r.departmentName?.toLowerCase().includes(q);
          const matchCard = r.cardNumber?.toLowerCase().includes(q);
          const matchContent = r.content?.toLowerCase().includes(q);
          const matchAddress = r.patientAddress?.toLowerCase().includes(q);
          if (!matchName && !matchDept && !matchCard && !matchContent && !matchAddress) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || b.visitDate).getTime() - new Date(a.createdAt || a.visitDate).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || a.visitDate).getTime() - new Date(b.createdAt || b.visitDate).getTime();
        }
        if (sortBy === 'highest') {
          return b.overallRating - a.overallRating;
        }
        if (sortBy === 'lowest') {
          return a.overallRating - b.overallRating;
        }
        return 0;
      });
  }, [reviews, deptFilter, ratingFilter, authFilter, timeFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedReviews = filteredReviews.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Xuất file CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã Đánh Giá',
      'Họ Tên Người Bệnh',
      'Xác Thực',
      'Loại Thẻ',
      'Số Thẻ',
      'Ngày Sinh',
      'Giới Tính',
      'Địa Chỉ',
      'Khoa Phòng',
      'Số Sao',
      'Thái Độ',
      'Cơ Sở',
      'Thời Gian Chờ',
      'Viện Phí',
      'Tiêu Chí Đã Chọn',
      'Góp Ý Thêm',
      'Ngày Khảo Sát'
    ];

    const rows = filteredReviews.map((r) => {
      const parsed = parseContent(r.content || '');
      const isVer = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
      return [
        `"${r.id}"`,
        `"${r.userName}"`,
        `"${isVer ? 'Đã xác thực' : 'Ẩn danh'}"`,
        `"${r.cardType || ''}"`,
        `"${r.cardNumber || ''}"`,
        `"${r.patientDob || ''}"`,
        `"${r.patientGender || ''}"`,
        `"${r.patientAddress || ''}"`,
        `"${r.departmentName}"`,
        r.overallRating,
        r.criteria?.serviceAttitude || r.overallRating,
        r.criteria?.facilities || r.overallRating,
        r.criteria?.waitTime || r.overallRating,
        r.criteria?.costTransparency || r.overallRating,
        `"${parsed.tags.join('; ')}"`,
        `"${parsed.comment.replace(/"/g, '""')}"`,
        `"${new Date(r.createdAt || r.visitDate).toLocaleString('vi-VN')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lich_Su_Danh_Gia_Benh_Nhan_BV7A_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hàm in CHỈ RIÊNG BẢNG DANH SÁCH (Không dính màn hình trang web, không dính sidebar/header)
  const handlePrintTable = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup để in danh sách.');
      return;
    }

    const tableRowsHtml = filteredReviews.map((r, idx) => {
      const parsed = parseContent(r.content || '');
      const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
      
      // Định dạng thẻ tiêu chí ngắn gọn trên 1 dòng
      let criteriaDisplay = '';
      if (parsed.tags.length > 0) {
        criteriaDisplay += `<span style="display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 10px; font-weight: 600; padding: 1px 5px; border-radius: 4px; margin-right: 4px;">✓ ${parsed.tags[0]}</span>`;
        if (parsed.tags.length > 1) {
          criteriaDisplay += `<span style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; margin-right: 4px;">+${parsed.tags.length - 1} tiêu chí</span>`;
        }
      }
      if (parsed.comment) {
        criteriaDisplay += `<span style="font-size: 10px; font-style: italic; color: #334155;">"${parsed.comment}"</span>`;
      }
      if (!criteriaDisplay) {
        criteriaDisplay = '<span style="color: #94a3b8; font-size: 10px; font-style: italic;">-</span>';
      }

      return `
        <tr>
          <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
          <td>
            <strong style="color: #0f172a;">${r.userName || 'Bệnh nhân'}</strong>
            <div style="font-size: 9px; color: #64748b; font-family: monospace;">${r.id}</div>
          </td>
          <td style="white-space: nowrap;">
            ${isVerified 
              ? `<span style="font-weight: bold; color: #047857; font-size: 10px;">[${(r.cardType || 'CCCD').toUpperCase()}]</span> <span style="font-family: monospace; font-size: 10px;">${r.cardNumber || ''}</span>` 
              : '<span style="color: #64748b; font-size: 10px;">Ẩn danh</span>'
            }
          </td>
          <td><strong style="color: #1e293b;">${r.departmentName}</strong></td>
          <td style="text-align: center; font-weight: 900; color: #047857; white-space: nowrap;">★ ${r.overallRating}.0</td>
          <td style="text-align: center; font-weight: bold; color: #059669;">★ ${r.criteria?.serviceAttitude || r.overallRating}</td>
          <td style="text-align: center; font-weight: bold; color: #2563eb;">★ ${r.criteria?.facilities || r.overallRating}</td>
          <td style="text-align: center; font-weight: bold; color: #d97706;">★ ${r.criteria?.waitTime || r.overallRating}</td>
          <td style="text-align: center; font-weight: bold; color: #7c3aed;">★ ${r.criteria?.costTransparency || r.overallRating}</td>
          <td style="line-height: 1.3;">${criteriaDisplay}</td>
          <td style="text-align: center; white-space: nowrap; font-size: 10px; color: #475569;">
            ${new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')}
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bảng Tổng Hợp Lịch Sử Đánh Giá Bệnh Nhân - BV Quân Y 7A</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm 8mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 5px;
              font-size: 10.5px;
              line-height: 1.35;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 6px;
              margin-bottom: 10px;
            }
            .header-left .unit-sub {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              color: #475569;
            }
            .header-left .unit-main {
              font-size: 14px;
              font-weight: 900;
              text-transform: uppercase;
              color: #047857;
            }
            .header-right {
              text-align: right;
              font-size: 11px;
              color: #475569;
            }
            .title {
              text-align: center;
              font-size: 15px;
              font-weight: 900;
              text-transform: uppercase;
              color: #0f172a;
              margin: 8px 0 12px 0;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 5px 6px;
              vertical-align: middle;
              word-wrap: break-word;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.3px;
              color: #1e293b;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .footer {
              margin-top: 12px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              font-style: italic;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <div class="unit-sub">CỤC HẬU CẦN QUÂN KHU 7</div>
              <div class="unit-main">BỆNH VIỆN QUÂN Y 7A</div>
            </div>
            <div class="header-right">
              <div>Thời gian in: <strong>${new Date().toLocaleString('vi-VN')}</strong></div>
              <div>Số lượng bản ghi: <strong>${filteredReviews.length} lượt</strong></div>
            </div>
          </div>

          <div class="title">BẢNG TỔNG HỢP LỊCH SỬ ĐÁNH GIÁ & KHẢO SÁT HÀI LÒNG BỆNH NHÂN</div>

          <table>
            <thead>
              <tr>
                <th style="width: 32px;">STT</th>
                <th style="width: 115px; text-align: left;">Người Bệnh</th>
                <th style="width: 120px; text-align: left;">Định Danh / Thẻ</th>
                <th style="width: 140px; text-align: left;">Khoa Phòng</th>
                <th style="width: 60px;">Tổng</th>
                <th style="width: 48px;">T.Độ</th>
                <th style="width: 48px;">C.Sở</th>
                <th style="width: 48px;">Chờ</th>
                <th style="width: 48px;">V.Phí</th>
                <th style="text-align: left;">Tiêu Chí & Lời Nhắn</th>
                <th style="width: 75px;">Ngày</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>Hệ thống Kiosk & Khảo sát sự hài lòng người bệnh - Bệnh viện Quân y 7A</div>
            <div>Trang 1 / 1</div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Hàm in CHỈ RIÊNG 1 PHIẾU BỆNH NHÂN ĐANG XEM
  const handlePrintSingleReview = (r: Review) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup để in phiếu.');
      return;
    }

    const parsed = parseContent(r.content || '');
    const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Phiếu Đánh Giá Bệnh Nhân - ${r.id}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 10px;
              font-size: 13px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .title {
              text-align: center;
              font-size: 17px;
              font-weight: 900;
              text-transform: uppercase;
              color: #047857;
              margin: 15px 0;
            }
            .card {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 14px;
            }
            .card-title {
              font-weight: bold;
              text-transform: uppercase;
              font-size: 12px;
              color: #0f766e;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 10px;
            }
            .row {
              display: flex;
              margin-bottom: 6px;
            }
            .col-label {
              width: 180px;
              color: #64748b;
              font-size: 12px;
            }
            .col-value {
              font-weight: 600;
              color: #0f172a;
            }
            .grid-criteria {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-top: 8px;
            }
            .criteria-item {
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-weight: bold; font-size: 12px;">CỤC HẬU CẦN QUÂN KHU 7</div>
              <div style="font-weight: 900; font-size: 15px; color: #047857;">BỆNH VIỆN QUÂN Y 7A</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <div>Mã phiếu: <strong>${r.id}</strong></div>
              <div>Ngày: ${new Date(r.createdAt || r.visitDate).toLocaleString('vi-VN')}</div>
            </div>
          </div>

          <div class="title">PHIẾU KHẢO SÁT Ý KIẾN BỆNH NHÂN</div>

          <div class="card">
            <div class="card-title">1. Thông Tin Người Bệnh</div>
            <div class="row"><div class="col-label">Họ và tên:</div><div class="col-value">${r.userName || 'Bệnh nhân ẩn danh'}</div></div>
            <div class="row"><div class="col-label">Định danh thẻ:</div><div class="col-value">${isVerified ? `[${(r.cardType || 'CCCD').toUpperCase()}] ${r.cardNumber || ''}` : 'Khảo sát ẩn danh'}</div></div>
            ${r.patientDob ? `<div class="row"><div class="col-label">Ngày sinh:</div><div class="col-value">${r.patientDob}</div></div>` : ''}
            ${r.patientGender ? `<div class="row"><div class="col-label">Giới tính:</div><div class="col-value">${r.patientGender}</div></div>` : ''}
            ${r.patientAddress ? `<div class="row"><div class="col-label">Địa chỉ:</div><div class="col-value">${r.patientAddress}</div></div>` : ''}
          </div>

          <div class="card">
            <div class="card-title">2. Đánh Giá Khoa Phòng & 4 Trụ Cột (Bộ Y Tế)</div>
            <div class="row"><div class="col-label">Khoa phòng tiếp nhận:</div><div class="col-value" style="font-size: 14px; color: #047857;">${r.departmentName}</div></div>
            <div class="row"><div class="col-label">Điểm đánh giá tổng thể:</div><div class="col-value" style="font-size: 16px; color: #d97706;">★ ${r.overallRating}.0 / 5.0</div></div>

            <div class="grid-criteria">
              <div class="criteria-item"><span>1. Thái độ phục vụ:</span><strong style="color: #059669;">★ ${r.criteria?.serviceAttitude || r.overallRating}</strong></div>
              <div class="criteria-item"><span>2. Cơ sở vật chất:</span><strong style="color: #2563eb;">★ ${r.criteria?.facilities || r.overallRating}</strong></div>
              <div class="criteria-item"><span>3. Thời gian chờ đợi:</span><strong style="color: #d97706;">★ ${r.criteria?.waitTime || r.overallRating}</strong></div>
              <div class="criteria-item"><span>4. Minh bạch viện phí:</span><strong style="color: #7c3aed;">★ ${r.criteria?.costTransparency || r.overallRating}</strong></div>
            </div>

            ${parsed.tags.length > 0 ? `
              <div style="margin-top: 12px;">
                <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px;">Tiêu chí nhanh đã chọn:</div>
                <div>${parsed.tags.map(t => `<span style="display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px;">✓ ${t}</span>`).join('')}</div>
              </div>
            ` : ''}

            ${parsed.comment ? `
              <div style="margin-top: 12px;">
                <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px;">Ý kiến góp ý thêm:</div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-style: italic;">
                  "${parsed.comment}"
                </div>
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 30px; display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-weight: bold;">NGƯỜI LẬP PHIẾU</div>
              <div style="font-size: 11px; color: #64748b; font-style: italic;">(Ký, ghi rõ họ tên)</div>
            </div>
            <div>
              <div style="font-weight: bold;">XÁC NHẬN BAN GIÁM ĐỐC</div>
              <div style="font-size: 11px; color: #64748b; font-style: italic;">(Ký, đóng dấu)</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ---------------------------------------------------------------------
          THANH TÌM KIẾM, BỘ LỌC & NÚT XUẤT DỮ LIỆU (Ẩn khi in ấn)
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                <History className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">
                Bảng Lịch Sử Đánh Giá Của Bệnh Nhân
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Ghi nhận toàn bộ lượt phản hồi, hồ sơ thẻ CCCD/BHYT và mức độ hài lòng theo thời gian thực
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {onAddReview && (
              <button
                type="button"
                onClick={() => setShowAddReviewModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Đánh Giá / Khảo Sát</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel / CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintTable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 cursor-pointer transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Danh Sách</span>
            </button>
          </div>
        </div>

        {/* Thanh công cụ tìm kiếm và lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Ô tìm kiếm */}
          <div className="sm:col-span-2 relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Tìm kiếm:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tên người bệnh, số thẻ CCCD, khoa phòng, nội dung..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lọc theo khoa phòng */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Khoa Phòng:
            </label>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none truncate"
            >
              <option value="all">Tất cả khoa phòng ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo số sao */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Mức Đánh Giá:
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Tất cả mức sao</option>
              <option value="5">★ 5 Sao (Rất tốt)</option>
              <option value="4">★ 4 Sao (Hài lòng)</option>
              <option value="3">★ 3 Sao (Bình thường)</option>
              <option value="2">★ 2 Sao (Chưa hài lòng)</option>
              <option value="1">★ 1 Sao (Thất vọng)</option>
            </select>
          </div>

          {/* Lọc nguồn xác thực */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Loại Đối Tượng:
            </label>
            <select
              value={authFilter}
              onChange={(e) => {
                setAuthFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">Tất cả đối tượng</option>
              <option value="verified">Đã quét CCCD / BHYT</option>
              <option value="anonymous">Đánh giá ẩn danh</option>
            </select>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------------------
          BẢNG LỊCH SỬ ĐÁNH GIÁ (DESKTOP & MOBILE RESPONSIVE)
      --------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        
        {/* Header bảng */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">
              Tổng số lượt đánh giá:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-xs">
              {filteredReviews.length} lượt
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold outline-none"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="highest">Sao cao nhất</option>
              <option value="lowest">Sao thấp nhất</option>
            </select>
          </div>
        </div>

        {/* Tiêu đề trang trọng khi in ra giấy A4 */}
        <div className="hidden print:block p-4 border-b border-slate-300 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-slate-700">CỤC HẬU CẦN QUÂN KHU 7</div>
              <div className="text-[14px] font-black uppercase text-slate-900">BỆNH VIỆN QUÂN Y 7A</div>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <div>Ngày in báo cáo: {new Date().toLocaleDateString('vi-VN')}</div>
              <div className="font-bold text-slate-900">Tổng số lượt: {filteredReviews.length} lượt</div>
            </div>
          </div>
          <h2 className="text-center text-lg font-black uppercase text-slate-900 mt-3 tracking-wide">
            BẢNG TỔNG HỢP LỊCH SỬ ĐÁNH GIÁ & KHẢO SÁT HÀI LÒNG BỆNH NHÂN
          </h2>
        </div>

        {/* Chế độ xem Mobile (Card view) - ẨN KHI IN ĐỂ KHÔNG IN THẺ MOBILE */}
        <div className="lg:hidden print:hidden p-3.5 space-y-3 bg-slate-50/60 dark:bg-zinc-950/40">
          {pagedReviews.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <History className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
              <p className="font-bold text-slate-600 dark:text-zinc-400 text-sm">Không tìm thấy lượt đánh giá nào</p>
              <p className="text-xs text-slate-400 mt-0.5">Vui lòng thử đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            pagedReviews.map((r, idx) => {
              const parsed = parseContent(r.content || '');
              const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
              const seq = (safeCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedPatientReview(r)}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer space-y-3"
                >
                  {/* Hàng 1: Thứ tự, Người bệnh, Điểm số */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                          {r.userName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-300 px-1 rounded-full border border-slate-200 dark:border-zinc-700">
                          #{seq}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate flex items-center gap-1.5">
                          <span>{r.userName || 'Bệnh nhân'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')} • Mã: {r.id}
                        </div>
                      </div>
                    </div>

                    {/* Điểm tổng sao */}
                    <div className="shrink-0 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs shadow-xs ${
                        r.overallRating >= 4
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : r.overallRating === 3
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{r.overallRating}.0</span>
                      </span>
                    </div>
                  </div>

                  {/* Hàng 2: Khoa tiếp nhận & Thẻ định danh */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                      <span className="truncate">{r.departmentName}</span>
                    </div>

                    <div>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/60">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{r.cardType?.toUpperCase() || 'CCCD'}: {r.cardNumber || 'Đã xác thực'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300 text-[10px] font-medium">
                          Ẩn danh
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags & Lời nhắn: Rút gọn chỉ 1 dòng, xem chi tiết để xem toàn bộ */}
                  {(parsed.tags.length > 0 || parsed.comment) && (
                    <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis pt-0.5 text-xs">
                      {parsed.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-[10px] text-teal-800 dark:text-teal-300 font-medium border border-teal-100 dark:border-teal-900/40 shrink-0 max-w-[140px] truncate">
                          ✓ {parsed.tags[0]}
                        </span>
                      )}
                      {parsed.tags.length > 1 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-600 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700 shrink-0">
                          +{parsed.tags.length - 1}
                        </span>
                      )}
                      {parsed.comment && (
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 italic truncate">
                          &ldquo;{parsed.comment}&rdquo;
                        </span>
                      )}
                    </div>
                  )}

                  {/* Nút bấm xem */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Nhấn vào để xem đầy đủ
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem chi tiết</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chế độ xem Desktop & BẢNG IN (Bắt buộc hiện khi in window.print()) */}
        <div className="hidden lg:block print:block overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse print:text-[11px] print:w-full">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-zinc-800/90 print:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-700">
                <th className="py-3.5 px-3 w-12 text-center font-bold">STT</th>
                <th className="py-3.5 px-4 min-w-[170px]">Người Bệnh</th>
                <th className="py-3.5 px-3 min-w-[130px]">Định Danh / Thẻ</th>
                <th className="py-3.5 px-4 min-w-[190px]">Khoa Phòng Tiếp Nhận</th>
                <th className="py-3.5 px-3 text-center w-28">Tổng Điểm</th>
                <th className="py-3.5 px-4 min-w-[240px]">Tiêu Chí & Góp Ý</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap w-28">Thời Gian</th>
                <th className="py-3.5 px-4 text-center w-28 print:hidden">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900">
              {pagedReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                    <p className="font-semibold text-slate-600 dark:text-zinc-400">Không tìm thấy lượt đánh giá nào phù hợp với bộ lọc</p>
                  </td>
                </tr>
              ) : (
                pagedReviews.map((r, idx) => {
                  const parsed = parseContent(r.content || '');
                  const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);
                  const seq = (safeCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedPatientReview(r)}
                      className="hover:bg-teal-50/50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
                    >
                      {/* STT */}
                      <td className="py-3.5 px-3.5 text-center font-bold text-slate-400 text-xs">
                        {seq}
                      </td>

                      {/* Người bệnh */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {r.userName?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-slate-900 dark:text-zinc-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors block font-bold text-xs truncate max-w-[150px]">
                              {r.userName || 'Bệnh nhân'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {r.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Thẻ / Định danh */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isVerified ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/60">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{(r.cardType || 'CCCD').toUpperCase()}</span>
                            </span>
                            {r.cardNumber && (
                              <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 block font-semibold">
                                {r.cardNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-medium border border-slate-200 dark:border-zinc-700">
                            Ẩn danh
                          </span>
                        )}
                      </td>

                      {/* Khoa phòng */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 dark:text-zinc-200 font-bold block text-xs leading-snug">
                          {r.departmentName}
                        </span>
                      </td>

                      {/* Đánh giá tổng */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-xs shadow-xs ${
                          r.overallRating >= 4
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : r.overallRating === 3
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{r.overallRating}.0</span>
                        </span>
                      </td>

                      {/* Tiêu chí & Lời nhắn */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          {parsed.tags.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-[10px] font-medium border border-slate-200/60 dark:border-zinc-700 shrink-0 max-w-[140px] truncate">
                              ✓ {parsed.tags[0]}
                            </span>
                          )}
                          {parsed.tags.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200/60 shrink-0">
                              +{parsed.tags.length - 1}
                            </span>
                          )}
                          {parsed.comment ? (
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate italic">
                              &ldquo;{parsed.comment}&rdquo;
                            </span>
                          ) : parsed.tags.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">Không có góp ý thêm</span>
                          ) : null}
                        </div>
                      </td>

                      {/* Thời gian */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
                        {new Date(r.createdAt || r.visitDate).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Nút Xem chi tiết - Ẩn khi in */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap print:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientReview(r);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang - Ẩn khi in */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/40 dark:bg-zinc-900/40 print:hidden">
            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
              Hiển thị <strong className="text-slate-700 dark:text-zinc-200">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong className="text-slate-700 dark:text-zinc-200">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredReviews.length)}</strong> trong tổng số <strong className="text-teal-700 dark:text-teal-400">{filteredReviews.length}</strong> lượt đánh giá
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold text-slate-700 dark:text-zinc-200 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-extrabold text-xs">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold text-slate-700 dark:text-zinc-200 transition"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ---------------------------------------------------------------------
          MODAL XEM CHI TIẾT HỒ SƠ BỆNH NHÂN & PHIẾU ĐÁNH GIÁ TOÀN DIỆN
      --------------------------------------------------------------------- */}
      {selectedPatientReview && (() => {
        const r = selectedPatientReview;
        const parsed = parseContent(r.content || '');
        const isVerified = r.hasCardVerified || (!r.isAnonymous && r.cardNumber);

        // Đếm tổng số lần bệnh nhân này từng gửi đánh giá trong toàn hệ thống
        const patientReviewsHistory = reviews.filter((rev) => {
          if (r.cardNumber && rev.cardNumber === r.cardNumber) return true;
          if (r.userId && rev.userId === r.userId) return true;
          return false;
        });

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-300"
            onClick={() => setSelectedPatientReview(null)}
          >
            <div 
              className="bg-white dark:bg-zinc-900 w-full max-w-xl sm:max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header Drawer */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-teal-800 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                    <User className="w-5 h-5 text-white" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                      Hồ Sơ Chi Tiết & Phiếu Đánh Giá
                    </h3>
                    <span className="text-xs text-teal-100 font-mono">
                      Mã phiếu: {r.id} • {new Date(r.createdAt || r.visitDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientReview(null)}
                  className="p-2 rounded-xl hover:bg-white/20 transition cursor-pointer text-white flex items-center gap-1 text-xs font-semibold"
                  title="Đóng (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal (Cuộn được) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* THẺ 1: HỒ SƠ ĐỊNH DANH NGƯỜI BỆNH */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-600" />
                      <span>Thông Tin Định Danh & Thẻ Bảo Hiểm / CCCD:</span>
                    </span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ĐÃ QUÉT THẺ {(r.cardType || 'CHIP').toUpperCase()}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-[11px]">
                        Khảo sát ẩn danh tại Kiosk
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Họ và tên người bệnh:</span>
                      <strong className="text-slate-900 dark:text-zinc-100 text-sm font-extrabold">
                        {r.userName || 'Bệnh nhân ẩn danh'}
                      </strong>
                    </div>

                    {r.cardNumber && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Số thẻ {r.cardType?.toUpperCase()}:</span>
                        <strong className="font-mono text-sm text-teal-700 dark:text-teal-400 font-bold">
                          {r.cardNumber}
                        </strong>
                      </div>
                    )}

                    {r.patientDob && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ngày sinh:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{r.patientDob}</span>
                      </div>
                    )}

                    {r.patientGender && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Giới tính:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{r.patientGender}</span>
                      </div>
                    )}

                    {r.patientAddress && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Địa chỉ cư trú / Quê quán:</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{r.patientAddress}</span>
                      </div>
                    )}

                    <div className="sm:col-span-2 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Lịch sử đóng góp ý kiến:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        Đã thực hiện {patientReviewsHistory.length} lượt khảo sát tại BV
                      </span>
                    </div>
                  </div>
                </div>

                {/* THẺ 2: CHI TIẾT KHÁM & ĐÁNH GIÁ CHẤT LƯỢNG */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Khoa phòng tiếp nhận đánh giá:</span>
                      <strong className="text-base text-slate-900 dark:text-zinc-100 font-black">
                        {r.departmentName}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Điểm tổng thể:</span>
                      <span className="inline-flex items-center gap-1 text-amber-500 font-black text-lg">
                        <Star className="w-5 h-5 fill-current" />
                        <span>{r.overallRating}.0 / 5.0</span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Tiêu chí cốt lõi: Thiết kế thẻ trung tính, thanh lịch, chuẩn bệnh viện */}
                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider block">
                      Chi Tiết 4 Trụ Cột Đánh Giá (Bộ Y Tế):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      
                      {/* 1. Thái độ */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">1. Thái độ phục vụ & Y đức</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                            {r.criteria?.serviceAttitude >= 4 ? 'Tận tình, chu đáo' : r.criteria?.serviceAttitude === 3 ? 'Bình thường' : 'Chưa niềm nở'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          <span>{r.criteria?.serviceAttitude || r.overallRating}</span>
                        </span>
                      </div>

                      {/* 2. Cơ sở vật chất */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">2. Cơ sở vật chất & Thiết bị</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                            {r.criteria?.facilities >= 4 ? 'Sạch sẽ, tiện nghi' : r.criteria?.facilities === 3 ? 'Tương đối đầy đủ' : 'Cần bảo trì'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          <span>{r.criteria?.facilities || r.overallRating}</span>
                        </span>
                      </div>

                      {/* 3. Thời gian chờ */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">3. Thời gian tiếp nhận & chờ đợi</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                            {r.criteria?.waitTime >= 4 ? 'Nhanh chóng, kịp thời' : r.criteria?.waitTime === 3 ? 'Chờ vừa phải' : 'Chờ đợi lâu'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          <span>{r.criteria?.waitTime || r.overallRating}</span>
                        </span>
                      </div>

                      {/* 4. Viện phí & BHYT */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 dark:text-zinc-400 text-[11px] block font-medium">4. Minh bạch viện phí & BHYT</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                            {r.criteria?.costTransparency >= 4 ? 'Minh bạch, rõ ràng' : r.criteria?.costTransparency === 3 ? 'Đầy đủ phiếu thu' : 'Chưa rõ ràng'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-2xs">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          <span>{r.criteria?.costTransparency || r.overallRating}</span>
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Danh sách thẻ tiêu chí đã chọn */}
                  {parsed.tags.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-slate-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider block mb-1.5">
                        Các Tiêu Chí Chọn Nhanh ({parsed.tags.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {parsed.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium text-xs shadow-2xs"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lời nhắn / ý kiến góp ý thêm */}
                  {parsed.comment && (
                    <div className="pt-2">
                      <span className="font-bold text-slate-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider block mb-1.5">
                        Ý Kiến Góp Ý Thêm Của Người Bệnh:
                      </span>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap text-xs shadow-2xs">
                        &ldquo;{parsed.comment}&rdquo;
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/30">
                <span className="text-[11px] text-slate-400">
                  Dữ liệu trích xuất từ CSDL Bệnh viện Quân y 7A
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintSingleReview(r)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Phiếu Này</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPatientReview(null)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Đóng Lại
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal Thêm Đánh Giá / Khảo Sát Mới */}
      {onAddReview && (
        <AdminAddReviewModal
          isOpen={showAddReviewModal}
          onClose={() => setShowAddReviewModal(false)}
          departments={departments}
          onSubmitReview={onAddReview}
        />
      )}

    </div>
  );
}
