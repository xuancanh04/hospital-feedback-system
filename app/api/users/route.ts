import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { User } from '@/types';

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar || undefined,
    departmentId: row.department_id || undefined,
    title: row.title || undefined,
    phone: row.phone || undefined,
    status: row.status,
    password: row.password,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM users ORDER BY created_at ASC');
    return NextResponse.json({ success: true, data: res.rows.map(mapRowToUser) });
  } catch (error: any) {
    console.error('Lỗi GET /api/users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, avatar, departmentId, title, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Tên và Email là bắt buộc' }, { status: 400 });
    }

    const id = `usr-${Date.now()}`;
    const res = await pool.query(
      `INSERT INTO users (id, name, email, password, role, avatar, department_id, title, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [
        id,
        name,
        email.trim().toLowerCase(),
        password || '123456',
        role || 'staff',
        avatar || null,
        departmentId || null,
        title || null,
        phone || null,
      ]
    );

    return NextResponse.json({ success: true, data: mapRowToUser(res.rows[0]) }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi POST /api/users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, title, phone, status, password, departmentId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID người dùng' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           title = COALESCE($3, title),
           phone = COALESCE($4, phone),
           status = COALESCE($5, status),
           password = COALESCE($6, password),
           department_id = COALESCE($7, department_id)
       WHERE id = $1
       RETURNING *`,
      [id, name, title, phone, status, password, departmentId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: mapRowToUser(res.rows[0]) });
  } catch (error: any) {
    console.error('Lỗi PUT /api/users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID người dùng' }, { status: 400 });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lỗi DELETE /api/users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
