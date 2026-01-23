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
  };
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
  allStatuses: Array<{ id: number; name: string; color: string }>;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  allStatuses,
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
    <div className={styles.card}>
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
      </div>
    </div>
  );
}
