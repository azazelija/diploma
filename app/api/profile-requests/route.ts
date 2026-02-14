import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/profile-requests - Получить все запросы на изменение профиля
export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    // Проверяем роль пользователя
    const userResult = await query(
      'SELECT role_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role_id !== 1) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    // Получаем все запросы
    const result = await query(
      `SELECT 
        pcr.id,
        pcr.user_id,
        pcr.first_name,
        pcr.last_name,
        pcr.status,
        pcr.created_at,
        pcr.reviewed_at,
        pcr.reject_reason,
        u.username,
        u.email,
        u.first_name as current_first_name,
        u.last_name as current_last_name,
        reviewer.username as reviewed_by_name
       FROM profile_change_requests pcr
       JOIN users u ON pcr.user_id = u.id
       LEFT JOIN users reviewer ON pcr.reviewed_by = reviewer.id
       ORDER BY pcr.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get profile requests error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения запросов' },
      { status: 500 }
    );
  }
}

// POST /api/profile-requests - Создать запрос на изменение профиля
export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name } = body;

    // Валидация
    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Имя и фамилия обязательны' },
        { status: 400 }
      );
    }

    // Создаем запрос на изменение
    const result = await query(
      `INSERT INTO profile_change_requests (user_id, first_name, last_name)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, first_name, last_name, status, created_at`,
      [decoded.id, first_name.trim(), last_name.trim()]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Запрос на изменение профиля отправлен',
    });
  } catch (error) {
    console.error('Create profile request error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания запроса' },
      { status: 500 }
    );
  }
}
