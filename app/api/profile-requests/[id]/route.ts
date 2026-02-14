import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// PUT /api/profile-requests/[id] - Одобрить или отклонить запрос
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { action, reject_reason } = body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Неверное действие' },
        { status: 400 }
      );
    }

    // Получаем запрос
    const requestResult = await query(
      'SELECT * FROM profile_change_requests WHERE id = $1 AND status = $2',
      [params.id, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Запрос не найден или уже обработан' },
        { status: 404 }
      );
    }

    const changeRequest = requestResult.rows[0];

    if (action === 'approve') {
      // Обновляем данные пользователя
      await query(
        `UPDATE users 
         SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [changeRequest.first_name, changeRequest.last_name, changeRequest.user_id]
      );

      // Обновляем статус запроса
      await query(
        `UPDATE profile_change_requests
         SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1
         WHERE id = $2`,
        [decoded.id, params.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Изменения профиля одобрены',
      });
    } else {
      // Отклоняем запрос
      await query(
        `UPDATE profile_change_requests
         SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1, reject_reason = $2
         WHERE id = $3`,
        [decoded.id, reject_reason || null, params.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Запрос отклонен',
      });
    }
  } catch (error) {
    console.error('Review profile request error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
}
