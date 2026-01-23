import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CreateTaskDTO } from '@/types/task';

// GET /api/tasks - Получить все задачи
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    let sql = `
      SELECT 
        t.id, t.title, t.description, t.priority, t.due_date, 
        t.completed_at, t.created_at, t.updated_at,
        s.id as status_id, s.name as status_name, s.color as status_color,
        u_created.username as created_by_name,
        u_assigned.username as assigned_to_name
      FROM tasks t
      LEFT JOIN task_statuses s ON t.status_id = s.id
      LEFT JOIN users u_created ON t.created_by = u_created.id
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND s.name = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      sql += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Создать новую задачу
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskDTO = await request.json();
    
    // Валидация
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Устанавливаем значения по умолчанию
    const createdBy = body.created_by || 1; // В реальном приложении брать из сессии
    const statusId = body.status_id || 1; // По умолчанию 'todo'
    const priority = body.priority || 'medium';
    
    const sql = `
      INSERT INTO tasks (title, description, status_id, priority, created_by, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const params = [
      body.title.trim(),
      body.description || null,
      statusId,
      priority,
      createdBy,
      body.assigned_to || null,
      body.due_date || null,
    ];
    
    const result = await query(sql, params);
    
    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Task created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
