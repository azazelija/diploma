import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// PUT /api/auth/avatar - Обновить аватар пользователя
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
    const { avatar } = body;

    // Обновление аватара
    const result = await query(
      `UPDATE users 
       SET avatar = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, username, first_name, last_name, avatar`,
      [avatar || null, decoded.id]
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
      message: 'Аватар успешно обновлен',
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления аватара' },
      { status: 500 }
    );
  }
}
