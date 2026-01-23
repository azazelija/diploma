'use client';

import { useState } from 'react';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status_name: string;
  status_color: string;
  status_id: number;
  due_date: string | null;
  created_by_name: string;
}

interface TaskListProps {
  tasks: Task[];
  statuses: Array<{ id: number; name: string; color: string }>;
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
}

export default function TaskList({ tasks, statuses, onEdit, onDelete, onStatusChange }: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status_name !== filterStatus) {
      return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter" className={styles.filterLabel}>
            Статус:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все</option>
            {statuses.map(status => (
              <option key={status.id} value={status.name}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="priorityFilter" className={styles.filterLabel}>
            Приоритет:
          </label>
          <select
            id="priorityFilter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="urgent">Срочный</option>
          </select>
        </div>

        <div className={styles.taskCount}>
          Найдено задач: <strong>{filteredTasks.length}</strong>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className={styles.empty}>
          <p>Задачи не найдены</p>
          <p className={styles.emptySubtext}>
            {tasks.length === 0 
              ? 'Создайте первую задачу, чтобы начать работу'
              : 'Попробуйте изменить фильтры'
            }
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              statuses={statuses}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
