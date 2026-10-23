# 🏥 Hospital Feedback & Rating System (HFS)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

*Hệ thống quản lý, thu thập và phân tích phản hồi bệnh nhân toàn diện dành cho bệnh viện & phòng khám hiện đại.*

[Báo cáo lỗi](https://github.com/xuancanh04/hospital-feedback-system/issues) · [Yêu cầu tính năng](https://github.com/xuancanh04/hospital-feedback-system/issues)

</div>

---

## 📌 Giới thiệu dự án

**Hospital Feedback & Rating System** là giải pháp phần mềm hiện đại giúp các cơ sở y tế số hóa quy trình thu thập ý kiến, đánh giá chất lượng dịch vụ từ người bệnh và người nhà. Hệ thống cung cấp giao diện Kiosk thân thiện, cổng đánh giá trực tuyến cho bệnh nhân và bảng điều khiển trực quan (Dashboard) thời gian thực dành cho ban quản lý bệnh viện.

---

## ✨ Tính năng nổi bật

### 🖥️ 1. Kiosk & Khảo sát Người bệnh (Patient Kiosk & Feedback)
- **Đánh giá đa tiêu chí**: Đánh giá thái độ nhân viên, thời gian chờ, cơ sở vật chất, chi phí và hiệu quả điều trị.
- **Giao diện chạm trực quan (Touch-friendly)**: Tối ưu cho màn hình cảm ứng tại sảnh bệnh viện và phòng khám.
- **Hỗ trợ gắn thẻ (Feedback Tags)**: Gắn nhãn nhanh các vấn đề thường gặp (Thân thiện, Vệ sinh sạch sẽ, Chờ đợi lâu...).
- **Bảo mật & Ẩn danh**: Tùy chọn gửi phản hồi nặc danh hoặc cung cấp thông tin liên hệ khi cần giải quyết khiếu nại.

### 📊 2. Bảng điều khiển Quản trị (Admin Analytics Dashboard)
- **Thống kê thời gian thực**: Theo dõi điểm số CSAT trung bình, phân bố sao và lượng đánh giá theo ngày/tuần/tháng.
- **Biểu đồ trực quan**: Tích hợp [Recharts](https://recharts.org/) hiển thị xu hướng hài lòng và xếp hạng theo từng khoa phòng.
- **Phân loại & Bộ lọc nâng cao**: Lọc phản hồi theo trạng thái xử lý, khoa phòng, mức độ đánh giá và mức độ ưu tiên.
- **Quản lý xử lý khiếu nại**: Cập nhật tiến độ xử lý và phản hồi trực tiếp cho người bệnh.

### 🔒 3. Bảo mật & Hiệu năng
- Tối ưu hóa với **Next.js App Router** và **React 19 Server Components**.
- Kết nối cơ sở dữ liệu **PostgreSQL** tối ưu qua connection pooling.
- Hệ thống thiết kế chuẩn UI hiện đại với **Tailwind CSS v4** và **Lucide Icons**.

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Vai trò |
| :--- | :--- |
| **[Next.js](https://nextjs.org/)** (v16.4) | Fullstack React Framework (App Router, API Routes) |
| **[React](https://react.dev/)** (v19) | Thư viện xây dựng giao diện người dùng |
| **[TypeScript](https://www.typescriptlang.org/)** | Ngôn ngữ tĩnh an toàn kiểu dữ liệu |
| **[Tailwind CSS](https://tailwindcss.com/)** (v4) | Utility-first CSS framework |
| **[PostgreSQL](https://www.postgresql.org/)** & `pg` | Hệ quản trị cơ sở dữ liệu quan hệ |
| **[Recharts](https://recharts.org/)** | Thư viện biểu đồ dữ liệu thống kê |
| **[Lucide React](https://lucide.dev/)** | Bộ icon giao diện hiện đại |

---

## 📁 Cấu trúc thư mục

```text
hospital-feedback-system/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── admin/            # Phân hệ quản trị và báo cáo thống kê
│   ├── api/              # API endpoints (feedback, departments, stats)
│   ├── feedback/         # Form gửi đánh giá trực tuyến
│   ├── kiosk/            # Giao diện màn hình cảm ứng Kiosk
│   ├── portal/           # Cổng thông tin cho bệnh nhân & nhân viên
│   └── reviews/          # Trang xem các đánh giá công khai
├── components/           # UI Components tái sử dụng (Button, Modal, Card...)
├── context/              # React Context (Auth, Theme, State management)
├── lib/                  # Database client, tiện ích và hàm dùng chung
├── public/               # Tài nguyên tĩnh (ảnh, logo, icons)
├── scripts/              # Migration SQL và seed database mẫu
└── types/                # Định nghĩa TypeScript interfaces & types
```

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Yêu cầu môi trường
- **Node.js**: >= 18.17.0 (Khuyến nghị Node.js LTS)
- **PostgreSQL**: >= 14.x
- Quản lý gói: `npm`, `yarn`, `pnpm` hoặc `bun`

### 2. Cài đặt dự án

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/xuancanh04/hospital-feedback-system.git
   cd hospital-feedback-system
   ```

2. **Cài đặt các thư viện phụ thuộc**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**:
   Tạo file `.env.local` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Cập nhật chuỗi kết nối PostgreSQL của bạn trong `.env.local`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hospital_rating_system?schema=public"
   ```

4. **Khởi tạo dữ liệu cơ sở dữ liệu**:
   ```bash
   # Chạy schema khởi tạo
   npm run db:setup # hoặc chạy script trong thư mục scripts/
   ```

5. **Chạy máy chủ phát triển (Dev server)**:
   ```bash
   npm run dev
   ```

6. Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Các lệnh Scripts hữu ích

```bash
npm run dev        # Khởi chạy server ở chế độ Development
npm run build      # Build ứng dụng cho môi trường Production
npm run start      # Chạy server ở chế độ Production sau khi build
npm run lint       # Kiểm tra lỗi cú pháp và code style với ESLint
```

---

## 🤝 Đóng góp phát triển (Contributing)

Mọi đóng góp nhằm hoàn thiện dự án đều rất được hoan nghênh! Vui lòng thực hiện theo các bước sau:

1. **Fork** repository
2. Tạo nhánh tính năng mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'feat: Add some AmazingFeature'`)
4. Đẩy nhánh lên repository của bạn (`git push origin feature/AmazingFeature`)
5. Tạo một **Pull Request**

Vui lòng xem thêm hướng dẫn chi tiết tại [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại tệp [LICENSE](LICENSE).

---

<div align="center">
  <sub>Được phát triển với tâm huyết nhằm nâng cao trải nghiệm y tế và chăm sóc sức khỏe cộng đồng.</sub>
</div>
