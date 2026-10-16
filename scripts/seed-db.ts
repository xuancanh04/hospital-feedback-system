import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { INITIAL_DEPARTMENTS, MOCK_USERS, INITIAL_REVIEWS } from '../lib/mock-data';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/);

if (!match) {
  console.error('Không tìm thấy DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString: match[1] });

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('1. Bắt đầu tạo bảng cơ sở dữ liệu...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'scripts', 'init-schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✓ Đã tạo thành công các bảng: departments, users, reviews.');

    console.log(`2. Đang nạp ${INITIAL_DEPARTMENTS.length} khoa phòng...`);
    for (const d of INITIAL_DEPARTMENTS) {
      await client.query(`
        INSERT INTO departments (id, name, code, category, description, icon_name, doctor_count, average_rating, total_reviews, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          code = EXCLUDED.code,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          average_rating = EXCLUDED.average_rating,
          total_reviews = EXCLUDED.total_reviews,
          note = EXCLUDED.note;
      `, [
        d.id,
        d.name,
        d.code,
        d.category || 'noi',
        d.description || '',
        d.iconName || 'Activity',
        d.doctorCount || 0,
        d.averageRating || 5.0,
        d.totalReviews || 0,
        d.note || null
      ]);
    }

    console.log(`3. Đang nạp ${MOCK_USERS.length} tài khoản người dùng...`);
    for (const u of MOCK_USERS) {
      await client.query(`
        INSERT INTO users (id, name, email, password, role, avatar, department_id, title, phone, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          avatar = EXCLUDED.avatar,
          title = EXCLUDED.title,
          phone = EXCLUDED.phone;
      `, [
        u.id,
        u.name,
        u.email,
        u.password || '123',
        u.role,
        u.avatar || null,
        u.departmentId || null,
        u.title || null,
        u.phone || null,
        u.status || 'active'
      ]);
    }

    console.log(`4. Đang nạp ${INITIAL_REVIEWS.length} phiếu đánh giá khảo sát & phản hồi...`);
    for (const r of INITIAL_REVIEWS) {
      await client.query(`
        INSERT INTO reviews (
          id, user_id, user_name, user_avatar, is_anonymous,
          card_type, card_number, patient_dob, patient_gender, patient_address, has_card_verified,
          department_id, department_name, doctor_name,
          overall_rating, title, content,
          service_attitude, facilities, wait_time, cost_transparency,
          status, likes, visit_date, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14,
          $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23, $24, $25
        )
        ON CONFLICT (id) DO NOTHING;
      `, [
        r.id,
        r.userId,
        r.userName,
        r.userAvatar || null,
        r.isAnonymous,
        // Giả lập thông tin thẻ đã quét (nếu không ẩn danh)
        r.isAnonymous ? null : 'cccd',
        r.isAnonymous ? null : '07909400****',
        r.isAnonymous ? null : '1988-05-12',
        r.isAnonymous ? null : 'Nam',
        r.isAnonymous ? null : 'TP. Hồ Chí Minh',
        !r.isAnonymous,
        r.departmentId,
        r.departmentName,
        r.doctorName || null,
        r.overallRating,
        r.title,
        r.content,
        r.criteria.serviceAttitude,
        r.criteria.facilities,
        r.criteria.waitTime,
        r.criteria.costTransparency,
        r.status,
        r.likes,
        r.visitDate,
        r.createdAt
      ]);
    }

    console.log('====================================================');
    console.log('✓ HOÀN TẤT SEED TOÀN BỘ DỮ LIỆU VÀO POSTGRESQL THÀNH CÔNG!');
    console.log('====================================================');
  } catch (err) {
    console.error('LỖI KHI NẠP DỮ LIỆU:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
