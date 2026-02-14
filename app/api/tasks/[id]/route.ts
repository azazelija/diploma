import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { UpdateTaskDTO } from '@/types/task';

// GET /api/tasks/[id] - Получить задачу по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const sql = `
      SELECT 
        t.id, t.title, t.description, t.priority, t.due_date, 
        t.completed_at, t.created_at, t.updated_at,
        s.id as status_id, s.name as status_name, s.color as status_color,
        u_created.id as created_by_id, u_created.username as created_by_name,
        u_assigned.id as assigned_to_id, u_assigned.username as assigned_to_name
      FROM tasks t
      LEFT JOIN task_statuses s ON t.status_id = s.id
      LEFT JOIN users u_created ON t.created_by = u_created.id
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      WHERE t.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Обновить задачу
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateTaskDTO & { updated_by?: number } = await request.json();
    
    // Проверяем существование задачи
    const checkResult = await query('SELECT id FROM tasks WHERE id = $1', [id]);
    if (checkResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Формируем SQL запрос динамически на основе переданных полей
    const updates: string[] = [];
    const sqlParams: any[] = [];
    let paramIndex = 1;
    
    // Добавляем updated_by если передан
    if (body.updated_by) {
      updates.push(`updated_by = $${paramIndex}`);
      sqlParams.push(body.updated_by);
      paramIndex++;
    }
    
    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      sqlParams.push(body.title.trim());
      paramIndex++;
    }
    
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      sqlParams.push(body.description);
      paramIndex++;
    }
    
    if (body.status_id !== undefined) {
      updates.push(`status_id = $${paramIndex}`);
      sqlParams.push(body.status_id);
      paramIndex++;
    }
    
    if (body.priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      sqlParams.push(body.priority);
      paramIndex++;
    }
    
    if (body.assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex}`);
      sqlParams.push(body.assigned_to);
      paramIndex++;
    }
    
    if (body.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      sqlParams.push(body.due_date === '' ? null : body.due_date);
      paramIndex++;
    }
    
    if (body.completed_at !== undefined) {
      updates.push(`completed_at = $${paramIndex}`);
      sqlParams.push(body.completed_at === '' ? null : body.completed_at);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Добавляем ID задачи в конец параметров
    sqlParams.push(id);
    
    const sql = `
      UPDATE tasks 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await query(sql, sqlParams);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Удалить задачу
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
