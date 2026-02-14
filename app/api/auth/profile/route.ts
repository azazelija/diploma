import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// PUT /api/auth/profile - Обновить профиль пользователя
export async function PUT(request: NextRequest) {
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
    const { first_name, last_name, avatar } = body;

    // Валидация
    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Имя и фамилия обязательны' },
        { status: 400 }
      );
    }

    // Обновление профиля
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, avatar = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, username, first_name, last_name, avatar`,
      [first_name.trim(), last_name.trim(), avatar || null, decoded.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Профиль успешно обновлен',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении профиля' },
      { status: 500 }
    );
  }
}
