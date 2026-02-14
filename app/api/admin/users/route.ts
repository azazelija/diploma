import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// POST /api/admin/users - Создать нового пользователя (только админ)
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
    const { email, username, password, first_name, last_name, role_id, position_id } = body;

    // Валидация
    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, не существует ли пользователь
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Пользователь с таким email или username уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const result = await query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role_id, position_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, username, first_name, last_name, role_id, position_id, created_at`,
      [email, username, passwordHash, first_name, last_name, role_id || 2, position_id || null]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Пользователь успешно создан',
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания пользователя' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Обновить пользователя (только админ)
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
    const { user_id, email, username, first_name, last_name, role_id, position_id, password } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    // Обновляем данные пользователя
    let updateQuery = `UPDATE users SET 
      email = $1, 
      username = $2, 
      first_name = $3, 
      last_name = $4, 
      role_id = $5,
      position_id = $6,
      updated_at = CURRENT_TIMESTAMP`;
    
    let params = [email, username, first_name, last_name, role_id, position_id || null];

    // Если передан пароль, обновляем его
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery += `, password_hash = $7 WHERE id = $8`;
      params.push(passwordHash, user_id);
    } else {
      updateQuery += ` WHERE id = $7`;
      params.push(user_id);
    }

    updateQuery += ` RETURNING id, email, username, first_name, last_name, role_id, position_id`;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Пользователь успешно обновлен',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users?id=X - Удалить пользователя (только админ)
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
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    // Нельзя удалить самого себя
    if (parseInt(userId) === decoded.id) {
      return NextResponse.json(
        { success: false, error: 'Нельзя удалить собственный аккаунт' },
        { status: 400 }
      );
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно удален',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}
