'use client';

import { useState } from 'react';
import TaskCard from './TaskCard';
import styles from './KanbanBoard.module.css';
import { statusLabels } from '@/lib/statusLabels';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status_id: number;
  status_name: string;
  status_color: string;
  due_date: string | null;
  created_by_name: string;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  statuses: Status[];
  users?: User[];
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
}

export default function KanbanBoard({
  tasks,
  statuses,
  users = [],
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  const getTasksByStatus = (statusId: number) => {
    return tasks.filter(task => task.status_id === statusId);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, statusId: number) => {
    e.preventDefault();
    setDragOverColumn(statusId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, statusId: number) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status_id !== statusId) {
      onStatusChange(draggedTask.id, statusId);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className={styles.board}>
      {statuses.map(status => {
        const statusTasks = getTasksByStatus(status.id);
        const isColumnDragOver = dragOverColumn === status.id;
        return (
          <div 
            key={status.id} 
            className={`${styles.column} ${isColumnDragOver ? styles.columnDragOver : ''}`}
            onDragOver={(e) => handleDragOver(e, status.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <span className={styles.columnDot} style={{ backgroundColor: status.color }} />
                <span className={styles.columnName}>{statusLabels[status.name] || status.name}</span>
              </div>
              <span className={styles.taskCount}>{statusTasks.length}</span>
            </div>

            <div className={styles.tasks}>
              {statusTasks.length === 0 ? (
                <div className={styles.emptyColumn}>
                  <p>Нет задач</p>
                </div>
              ) : (
                statusTasks.map(task => {
                  const assignedUser = users.find(u => u.id === task.assigned_to);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignedUser={assignedUser}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      allStatuses={statuses}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedTask?.id === task.id}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
