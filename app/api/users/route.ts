import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/users - Получить всех пользователей
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.avatar, 
        u.role_id,
        u.position_id,
        p.name as position_name
      FROM users u
      LEFT JOIN positions p ON u.position_id = p.id
      ORDER BY u.role_id ASC, u.first_name ASC, u.last_name ASC, u.username ASC`
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
