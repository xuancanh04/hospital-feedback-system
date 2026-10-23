# Hướng dẫn đóng góp (Contributing Guidelines)

Cảm ơn bạn đã quan tâm đóng góp cho **Hospital Feedback & Rating System**! Dưới đây là các hướng dẫn giúp quy trình đóng góp diễn ra thuận lợi và nhất quán.

## 📜 Quy tắc ứng xử (Code of Conduct)
- Tôn trọng mọi thành viên tham gia thảo luận và đóng góp.
- Sử dụng ngôn từ mang tính xây dựng, chuyên nghiệp.

## 🛠️ Quy trình làm việc (Workflow)

1. **Fork** dự án về tài khoản cá nhân.
2. Clone về máy cục bộ:
   ```bash
   git clone https://github.com/<your-username>/hospital-feedback-system.git
   cd hospital-feedback-system
   ```
3. Tạo nhánh (branch) mới cho tính năng hoặc sửa lỗi:
   ```bash
   git checkout -b feature/ten-tinh-nang
   # hoặc
   git checkout -b fix/ten-loi
   ```
4. Thực hiện các chỉnh sửa, kiểm tra lint và format mã nguồn:
   ```bash
   npm run lint
   ```
5. Commit thay đổi tuân thủ chuẩn [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: thêm chức năng lọc theo khoa`
   - `fix: sửa lỗi crash khi không chọn rating`
   - `docs: cập nhật hướng dẫn cài đặt`
   - `refactor: tái cấu trúc database query`
6. Đẩy nhánh lên fork của bạn và gửi **Pull Request (PR)** vào nhánh `main` của repository gốc.

## 💬 Báo lỗi hoặc đề xuất tính năng
- Hãy kiểm tra danh sách **Issues** trước để tránh trùng lặp.
- Sử dụng Issue Templates khi mở issue mới.
