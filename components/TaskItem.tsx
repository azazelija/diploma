'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    description: string | null;
    priority: string;
    status_name: string;
    status_color: string;
    due_date: string | null;
    created_by_name: string;
  };
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
  statuses: Array<{ id: number; name: string; color: string }>;
}

export default function TaskItem({ task, onEdit, onDelete, onStatusChange, statuses }: TaskItemProps) {
  const priorityLabels: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный',
  };

  const priorityColors: Record<string, string> = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  };

  const currentStatus = statuses.find(s => s.name === task.status_name);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(task.id)}
            className={styles.editButton}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={styles.deleteButton}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Приоритет:</span>
          <span
            className={styles.priority}
            style={{ backgroundColor: priorityColors[task.priority] }}
          >
            {priorityLabels[task.priority]}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Статус:</span>
          <select
            value={currentStatus?.id || 1}
            onChange={(e) => onStatusChange(task.id, parseInt(e.target.value))}
            className={styles.statusSelect}
            style={{ borderColor: task.status_color }}
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        {task.due_date && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Срок:</span>
            <span className={styles.dueDate}>
              {format(new Date(task.due_date), 'dd MMM yyyy', { locale: ru })}
            </span>
          </div>
        )}

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Создал:</span>
          <span>{task.created_by_name}</span>
        </div>
      </div>
    </div>
  );
}
