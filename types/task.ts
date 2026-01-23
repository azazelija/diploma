// Task types based on database schema

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  sort_order: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status_id: number;
  priority: TaskPriority;
  assigned_to: number | null;
  created_by: number;
  updated_by: number | null;
  due_date: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Extended task with related data (from tasks_view)
export interface TaskView extends Task {
  status_name: string;
  status_color: string;
  created_by_name: string;
  assigned_to_name: string | null;
  updated_by_name: string | null;
}

// DTO for creating a new task
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status_id?: number;
  priority?: TaskPriority;
  assigned_to?: number;
  created_by: number;
  due_date?: string | Date;
}

// DTO for updating a task
export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status_id?: number;
  priority?: TaskPriority;
  assigned_to?: number;
  due_date?: string | Date | null;
  completed_at?: string | Date | null;
}

// Task comment (for future expansion)
export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}
