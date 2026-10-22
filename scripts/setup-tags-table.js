const fs = require('fs');
const { Pool } = require('pg');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/DATABASE_URL="?([^"\r\n]+)"?/);
  if (match) dbUrl = match[1];
}

const pool = new Pool({ connectionString: dbUrl || 'postgresql://postgres:password@localhost:5432/hospital_rating_system?schema=public' });

const POSITIVE_TAGS = [
  'Bác sĩ tận tình, chu đáo',
  'Y tá hướng dẫn nhiệt tình',
  'Thủ tục nhanh chóng',
  'Cơ sở vật chất sạch sẽ',
  'Thời gian chờ đợi hợp lý',
  'Giải thích bệnh rõ ràng',
  'Chi phí công khai, minh bạch',
  'Trang thiết bị hiện đại',
  'An ninh, trật tự chu đáo',
  'Cán bộ tiếp đón ân cần',
  'Phòng bệnh thoáng mát',
  'Cấp cứu xử trí kịp thời',
  'Cơm viện đầy đủ dinh dưỡng',
  'Nhân viên vui vẻ niềm nở',
  'Bảo vệ dắt xe chu đáo',
  'Môi trường bệnh viện xanh sạch đẹp',
  'Hướng dẫn BHYT tận tâm',
  'Lấy máu xét nghiệm nhẹ nhàng',
  'Chụp X-quang/CT nhanh gọn',
  'Bác sĩ chẩn đoán chính xác'
];

const NEUTRAL_TAGS = [
  'Thời gian chờ đợi vừa phải',
  'Thủ tục giấy tờ cần tinh gọn hơn',
  'Bác sĩ tư vấn hơi nhanh',
  'Phòng chờ còn oi bức, ngột ngạt',
  'Bảng chỉ dẫn cần rõ ràng hơn',
  'Hệ thống gọi số cần cải thiện',
  'Nhà xe bệnh viện giờ cao điểm đông',
  'Cần tăng thêm bàn tiếp đón buổi sáng',
  'Không gian cần thêm cây xanh',
  'Âm thanh loa thông báo nên to hơn',
  'Ghế ngồi chờ khám cần bổ sung thêm',
  'Cần có nước uống miễn phí tại sảnh',
  'Cần thêm quầy thanh toán viện phí',
  'Wifi bệnh viện cần mạnh hơn',
  'Bác sĩ nên giải thích kỹ đơn thuốc hơn',
  'Thời gian trả kết quả cận lâm sàng hơi chậm'
];

const CRITICAL_TAGS = [
  'Thời gian chờ đợi quá lâu',
  'Thái độ tiếp đón chưa niềm nở',
  'Điều dưỡng trả lời gắt gỏng',
  'Khu vệ sinh chưa sạch sẽ',
  'Chi phí chưa giải thích rõ ràng',
  'Thủ tục giấy tờ quá rườm rà',
  'Bác sĩ khám qua loa, vội vàng',
  'Hệ thống gọi số hay bị lỗi',
  'Nhà xe thu phí chưa hợp lý',
  'Thái độ phục vụ thiếu nhiệt tình',
  'Bác sĩ đến phòng khám trễ giờ',
  'Nhân viên bảo vệ thiếu hòa nhã',
  'Máy lạnh/quạt phòng chờ bị hỏng',
  'Thủ tục xuất viện kéo dài nhiều giờ',
  'Chen lấn xô đẩy khi lấy số thứ tự',
  'Thang máy bệnh viện quá tải',
  'Khoa dược phát thuốc chậm',
  'Phòng bệnh ồn ào vào ban đêm'
];

async function setupFeedbackTagsTable() {
  try {
    console.log('1. Tạo bảng feedback_tags trong PostgreSQL nếu chưa có...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_tags (
        id VARCHAR(100) PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL, -- 'positive', 'neutral', 'critical'
        department_id VARCHAR(100) DEFAULT 'all', -- 'all' hoặc id khoa phòng
        enabled BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_tag_text_dept UNIQUE(text, department_id)
      );
      CREATE INDEX IF NOT EXISTS idx_feedback_tags_dept ON feedback_tags(department_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_tags_cat ON feedback_tags(category);
    `);
    console.log('✓ Bảng feedback_tags đã sẵn sàng.');

    console.log('2. Kiểm tra và nạp danh sách thẻ chung chuẩn vào cơ sở dữ liệu...');
    let inserted = 0;

    for (let i = 0; i < POSITIVE_TAGS.length; i++) {
      const tag = POSITIVE_TAGS[i];
      const res = await pool.query(`
        INSERT INTO feedback_tags (id, text, category, department_id, display_order)
        VALUES ($1, $2, 'positive', 'all', $3)
        ON CONFLICT (text, department_id) DO NOTHING
      `, [`tag-pos-${i + 1}`, tag, i + 1]);
      if (res.rowCount > 0) inserted++;
    }

    for (let i = 0; i < NEUTRAL_TAGS.length; i++) {
      const tag = NEUTRAL_TAGS[i];
      const res = await pool.query(`
        INSERT INTO feedback_tags (id, text, category, department_id, display_order)
        VALUES ($1, $2, 'neutral', 'all', $3)
        ON CONFLICT (text, department_id) DO NOTHING
      `, [`tag-neu-${i + 1}`, tag, i + 1]);
      if (res.rowCount > 0) inserted++;
    }

    for (let i = 0; i < CRITICAL_TAGS.length; i++) {
      const tag = CRITICAL_TAGS[i];
      const res = await pool.query(`
        INSERT INTO feedback_tags (id, text, category, department_id, display_order)
        VALUES ($1, $2, 'critical', 'all', $3)
        ON CONFLICT (text, department_id) DO NOTHING
      `, [`tag-crit-${i + 1}`, tag, i + 1]);
      if (res.rowCount > 0) inserted++;
    }

    console.log(`✓ Đã nạp thành công ${inserted} thẻ chung vào PostgreSQL.`);

    const countRes = await pool.query('SELECT COUNT(*) FROM feedback_tags');
    console.log('Tổng số thẻ hiện có trong database:', countRes.rows[0].count);
  } catch (err) {
    console.error('Lỗi thiết lập bảng feedback_tags:', err);
  } finally {
    await pool.end();
  }
}

setupFeedbackTagsTable();
