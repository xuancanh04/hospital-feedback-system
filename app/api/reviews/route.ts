import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { Review } from '@/types';

function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar || undefined,
    isAnonymous: Boolean(row.is_anonymous),
    cardType: row.card_type || undefined,
    cardNumber: row.card_number || undefined,
    patientDob: row.patient_dob || undefined,
    patientGender: row.patient_gender || undefined,
    patientAddress: row.patient_address || undefined,
    hasCardVerified: Boolean(row.has_card_verified),
    departmentId: row.department_id,
    departmentName: row.department_name,
    doctorName: row.doctor_name || undefined,
    overallRating: Number(row.overall_rating),
    criteria: {
      serviceAttitude: Number(row.service_attitude || 5),
      facilities: Number(row.facilities || 5),
      waitTime: Number(row.wait_time || 5),
      costTransparency: Number(row.cost_transparency || 5),
    },
    title: row.title,
    content: row.content,
    images: Array.isArray(row.images) ? row.images : [],
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    likes: Number(row.likes || 0),
    visitDate: row.visit_date ? new Date(row.visit_date).toISOString().split('T')[0] : '',
  };
}

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT * FROM reviews 
      ORDER BY created_at DESC;
    `);

    const reviews = res.rows.map(mapRowToReview);
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Lỗi API GET /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách đánh giá từ CSDL' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      userName,
      userAvatar,
      isAnonymous,
      cardType,
      cardNumber,
      patientDob,
      patientGender,
      patientAddress,
      hasCardVerified,
      departmentId,
      departmentName,
      doctorName,
      overallRating,
      criteria,
      title,
      content,
      images,
      visitDate,
    } = body;

    if (!departmentId || !overallRating || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Thiếu các trường thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const id = `rev-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const effectiveVisitDate = visitDate || createdAt.split('T')[0];

    const isAnon = Boolean(isAnonymous);
    const finalUserName = isAnon ? 'Bệnh nhân ẩn danh' : (userName || 'Bệnh nhân');
    const finalCardVerified = isAnon ? false : Boolean(hasCardVerified);
    const finalCardType = isAnon ? null : (cardType || null);
    const finalCardNumber = isAnon ? null : (cardNumber || null);
    const finalDob = isAnon ? null : (patientDob || null);
    const finalGender = isAnon ? null : (patientGender || null);
    const finalAddress = isAnon ? null : (patientAddress || null);

    const queryText = `
      INSERT INTO reviews (
        id, user_id, user_name, user_avatar, is_anonymous,
        card_type, card_number, patient_dob, patient_gender, patient_address, has_card_verified,
        department_id, department_name, doctor_name,
        overall_rating, title, content,
        service_attitude, facilities, wait_time, cost_transparency,
        images, status, likes, visit_date, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24, $25, $26
      ) RETURNING *;
    `;

    const values = [
      id,
      isAnon ? 'anonymous' : (userId || 'guest'),
      finalUserName,
      isAnon ? null : (userAvatar || null),
      isAnon,
      finalCardType,
      finalCardNumber,
      finalDob,
      finalGender,
      finalAddress,
      finalCardVerified,
      departmentId,
      departmentName || 'Khoa Khám Bệnh',
      doctorName || null,
      Number(overallRating),
      title,
      content,
      Number(criteria?.serviceAttitude || 5),
      Number(criteria?.facilities || 5),
      Number(criteria?.waitTime || 5),
      Number(criteria?.costTransparency || 5),
      JSON.stringify(images || []),
      'approved',
      0,
      effectiveVisitDate,
      createdAt,
    ];

    const result = await pool.query(queryText, values);
    const createdReview = mapRowToReview(result.rows[0]);

    return NextResponse.json({ success: true, data: createdReview }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi API POST /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lưu đánh giá vào cơ sở dữ liệu: ' + error.message },
      { status: 500 }
    );
  }
}
