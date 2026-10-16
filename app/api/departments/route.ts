import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { Department } from '@/types';

function mapRowToDept(row: any): Department {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    category: row.category,
    description: row.description || '',
    iconName: row.icon_name || 'Activity',
    doctorCount: Number(row.doctor_count || 0),
    averageRating: Number(row.average_rating || 5.0),
    totalReviews: Number(row.total_reviews || 0),
    note: row.note || undefined,
  };
}

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM departments ORDER BY code ASC');
    return NextResponse.json({ success: true, data: res.rows.map(mapRowToDept) });
  } catch (error: any) {
    console.error('Lỗi GET /api/departments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, category, description, note } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Tên khoa và Mã khoa là bắt buộc' }, { status: 400 });
    }

    const id = `dept-${Date.now()}`;
    const res = await pool.query(
      `INSERT INTO departments (id, name, code, category, description, note, icon_name, doctor_count, average_rating, total_reviews)
       VALUES ($1, $2, $3, $4, $5, $6, 'Activity', 0, 5.0, 0)
       RETURNING *`,
      [id, name, code, category || 'noi', description || '', note || null]
    );

    return NextResponse.json({ success: true, data: mapRowToDept(res.rows[0]) }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi POST /api/departments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, code, category, description, note } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID khoa phòng' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE departments
       SET name = COALESCE($2, name),
           code = COALESCE($3, code),
           category = COALESCE($4, category),
           description = COALESCE($5, description),
           note = COALESCE($6, note),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, code, category, description, note]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khoa phòng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: mapRowToDept(res.rows[0]) });
  } catch (error: any) {
    console.error('Lỗi PUT /api/departments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID khoa phòng' }, { status: 400 });
    }

    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lỗi DELETE /api/departments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
