'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    description: string | null;
    priority: string;
    status_name: string;
    due_date: string | null;
    created_by_name: string;
    assigned_to?: number | null;
    assigned_to_name?: string | null;
  };
  assignedUser?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
  };
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
  allStatuses: Array<{ id: number; name: string; color: string }>;
  onDragStart?: (task: any) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export default function TaskCard({
  task,
  assignedUser,
  onEdit,
  onDelete,
  allStatuses,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskCardProps) {
  const priorityIcons: Record<string, string> = {
    low: '📍',
    medium: '🔶',
    high: '🔴',
    urgent: '🔥',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный',
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div 
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={() => onDragStart?.(task)}
      onDragEnd={onDragEnd}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.cardTitle}>{task.title}</h4>
        <div className={styles.cardMenu}>
          <button
            onClick={() => onEdit(task.id)}
            className={styles.cardButton}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={styles.cardButton}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className={styles.cardDescription}>{task.description}</p>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.priorityBadge} title={priorityLabels[task.priority]}>
          {priorityIcons[task.priority]}
        </div>

        {task.due_date && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
            {format(new Date(task.due_date), 'dd MMM', { locale: ru })}
          </span>
        )}

        {assignedUser && (
          <div className={styles.assignee} title={`${assignedUser.first_name || assignedUser.username} ${assignedUser.last_name || ''}`.trim()}>
            {assignedUser.avatar ? (
              <img src={assignedUser.avatar} alt="Assignee" className={styles.assigneeAvatar} />
            ) : (
              <div className={styles.assigneeAvatarPlaceholder}>
                {(assignedUser.first_name?.[0] || assignedUser.username[0]).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
