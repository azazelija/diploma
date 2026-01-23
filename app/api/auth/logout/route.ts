import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Удаление cookie с токеном
    cookies().delete('token');

    return NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при выходе' },
      { status: 500 }
    );
  }
}
