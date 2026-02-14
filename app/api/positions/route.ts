import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/positions - Получить все позиции
export async function GET() {
  try {
    const result = await query(
      'SELECT id, name, description, level FROM positions ORDER BY level, name'
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get positions error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения позиций' },
      { status: 500 }
    );
  }
}

// POST /api/positions - Создать новую позицию (только админ)
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

    // Проверяем роль пользователя (только админ)
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

    const body = await request.json();
    const { name, description, level } = body;

    if (!name || !level) {
      return NextResponse.json(
        { success: false, error: 'Название и грейд обязательны' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO positions (name, description, level) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, level]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Позиция создана',
    });
  } catch (error: any) {
    console.error('Create position error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Позиция с таким названием уже существует' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Ошибка создания позиции' },
      { status: 500 }
    );
  }
}

// PUT /api/positions - Обновить позицию (только админ)
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

    // Проверяем роль пользователя (только админ)
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

    const body = await request.json();
    const { position_id, name, description, level } = body;

    if (!position_id || !name || !level) {
      return NextResponse.json(
        { success: false, error: 'ID, название и грейд обязательны' },
        { status: 400 }
      );
    }

    const result = await query(
      'UPDATE positions SET name = $1, description = $2, level = $3 WHERE id = $4 RETURNING *',
      [name, description || null, level, position_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Позиция не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Позиция обновлена',
    });
  } catch (error: any) {
    console.error('Update position error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Позиция с таким названием уже существует' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления позиции' },
      { status: 500 }
    );
  }
}

// DELETE /api/positions?id=X - Удалить позицию (только админ)
export async function DELETE(request: NextRequest) {
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

    // Проверяем роль пользователя (только админ)
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

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('id');

    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'ID позиции обязателен' },
        { status: 400 }
      );
    }

    await query('DELETE FROM positions WHERE id = $1', [positionId]);

    return NextResponse.json({
      success: true,
      message: 'Позиция удалена',
    });
  } catch (error) {
    console.error('Delete position error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления позиции' },
      { status: 500 }
    );
  }
}
