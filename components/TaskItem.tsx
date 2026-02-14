'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './TaskItem.module.css';
import { statusLabels } from '@/lib/statusLabels';

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    description: string | null;
    priority: string;
    status_name: string;
    status_color: string;
    due_date: string | null;
    created_by?: number | null;
    created_by_name?: string | null;
    assigned_to?: number | null;
    assigned_to_name?: string | null;
  };
  createdUser?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
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
  statuses: Array<{ id: number; name: string; color: string }>;
}

export default function TaskItem({ task, createdUser, assignedUser, onEdit, onDelete, onStatusChange, statuses }: TaskItemProps) {
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
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Приоритет:</span>
            <span className={styles.priority} title={priorityLabels[task.priority]}>
              {priorityIcons[task.priority]}
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
                  {statusLabels[status.name] || status.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Срок:</span>
            <span className={styles.dueDate}>
              {task.due_date 
                ? format(new Date(task.due_date), 'dd MMM yyyy', { locale: ru })
                : '—'
              }
            </span>
          </div>
        </div>

        <div className={styles.metaColumn}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Создал:</span>
            {createdUser ? (
              <div className={styles.assignee}>
                {createdUser.avatar ? (
                  <img src={createdUser.avatar} alt="Creator" className={styles.assigneeAvatar} />
                ) : (
                  <div className={styles.assigneeAvatarPlaceholder}>
                    {(createdUser.first_name?.[0] || createdUser.username[0]).toUpperCase()}
                  </div>
                )}
                <span className={styles.assigneeName}>
                  {createdUser.first_name || createdUser.username} {createdUser.last_name || ''}
                </span>
              </div>
            ) : (
              <span>—</span>
            )}
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Исполнитель:</span>
            {assignedUser ? (
              <div className={styles.assignee}>
                {assignedUser.avatar ? (
                  <img src={assignedUser.avatar} alt="Assignee" className={styles.assigneeAvatar} />
                ) : (
                  <div className={styles.assigneeAvatarPlaceholder}>
                    {(assignedUser.first_name?.[0] || assignedUser.username[0]).toUpperCase()}
                  </div>
                )}
                <span className={styles.assigneeName}>
                  {assignedUser.first_name || assignedUser.username} {assignedUser.last_name || ''}
                </span>
              </div>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
