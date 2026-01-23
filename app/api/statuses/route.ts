import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/statuses - Получить все статусы задач
export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM task_statuses ORDER BY sort_order ASC'
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statuses' },
      { status: 500 }
    );
  }
}
