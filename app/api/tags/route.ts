import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(
      `SELECT id, text, category, department_id, enabled, display_order 
       FROM feedback_tags 
       WHERE enabled = TRUE 
       ORDER BY display_order ASC, id ASC`
    );

    const rows = res.rows || [];

    const positiveTags: string[] = [];
    const neutralTags: string[] = [];
    const criticalTags: string[] = [];
    const departmentTags: Record<string, { positiveTags: string[]; neutralTags: string[]; criticalTags: string[] }> = {};

    rows.forEach((row: any) => {
      const dept = row.department_id || 'all';
      if (dept === 'all') {
        if (row.category === 'positive') positiveTags.push(row.text);
        else if (row.category === 'neutral') neutralTags.push(row.text);
        else if (row.category === 'critical') criticalTags.push(row.text);
      } else {
        if (!departmentTags[dept]) {
          departmentTags[dept] = { positiveTags: [], neutralTags: [], criticalTags: [] };
        }
        if (row.category === 'positive') departmentTags[dept].positiveTags.push(row.text);
        else if (row.category === 'neutral') departmentTags[dept].neutralTags.push(row.text);
        else if (row.category === 'critical') departmentTags[dept].criticalTags.push(row.text);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        positiveTags,
        neutralTags,
        criticalTags,
        departmentTags
      }
    });
  } catch (error: any) {
    console.error('Error fetching feedback tags:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Add a single tag
    if (action === 'add') {
      const { text, category, departmentId = 'all' } = body;
      if (!text || !category) {
        return NextResponse.json({ success: false, error: 'Thiếu thông tin thẻ' }, { status: 400 });
      }

      const id = `${departmentId}-${category}-${Date.now()}`;
      await query(
        `INSERT INTO feedback_tags (id, text, category, department_id, enabled, display_order)
         VALUES ($1, $2, $3, $4, TRUE, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM feedback_tags WHERE department_id = $4 AND category = $3))
         ON CONFLICT (id) DO NOTHING`,
        [id, text.trim(), category, departmentId]
      );

      return NextResponse.json({ success: true, id });
    }

    // Action 2: Delete a single tag
    if (action === 'delete') {
      const { text, category, departmentId = 'all' } = body;
      if (!text) {
        return NextResponse.json({ success: false, error: 'Thiếu thông tin thẻ cần xóa' }, { status: 400 });
      }

      await query(
        `DELETE FROM feedback_tags WHERE text = $1 AND department_id = $2 AND (category = $3 OR $3 IS NULL)`,
        [text.trim(), departmentId, category || null]
      );

      return NextResponse.json({ success: true });
    }

    // Action 3: Sync full department tags or common tags
    if (action === 'sync') {
      const { departmentId = 'all', positiveTags = [], neutralTags = [], criticalTags = [] } = body;

      // Xóa các thẻ cũ của khoa (hoặc thẻ chung)
      await query(`DELETE FROM feedback_tags WHERE department_id = $1`, [departmentId]);

      // Nạp lại
      let order = 0;
      const insertPromises = [];

      for (const t of positiveTags) {
        order++;
        const id = `${departmentId}-pos-${order}-${Date.now()}`;
        insertPromises.push(
          query(
            `INSERT INTO feedback_tags (id, text, category, department_id, display_order) VALUES ($1, $2, 'positive', $3, $4)`,
            [id, t, departmentId, order]
          )
        );
      }

      for (const t of neutralTags) {
        order++;
        const id = `${departmentId}-neu-${order}-${Date.now()}`;
        insertPromises.push(
          query(
            `INSERT INTO feedback_tags (id, text, category, department_id, display_order) VALUES ($1, $2, 'neutral', $3, $4)`,
            [id, t, departmentId, order]
          )
        );
      }

      for (const t of criticalTags) {
        order++;
        const id = `${departmentId}-crit-${order}-${Date.now()}`;
        insertPromises.push(
          query(
            `INSERT INTO feedback_tags (id, text, category, department_id, display_order) VALUES ($1, $2, 'critical', $3, $4)`,
            [id, t, departmentId, order]
          )
        );
      }

      await Promise.all(insertPromises);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error modifying feedback tags:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
