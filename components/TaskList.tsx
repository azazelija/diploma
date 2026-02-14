'use client';

import { useState } from 'react';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';
import { statusLabels } from '@/lib/statusLabels';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status_name: string;
  status_color: string;
  status_id: number;
  due_date: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
}

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface TaskListProps {
  tasks: Task[];
  statuses: Array<{ id: number; name: string; color: string }>;
  users?: User[];
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
}

export default function TaskList({ tasks, statuses, users = [], onEdit, onDelete, onStatusChange }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [assigneeSearch, setAssigneeSearch] = useState<string>('');

  const filteredTasks = tasks.filter(task => {
    // Поиск по названию
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && task.status_name !== filterStatus) {
      return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    // Фильтр по исполнителю
    if (assigneeSearch.trim()) {
      const query = assigneeSearch.toLowerCase();
      const assignee = users.find(u => u.id === task.assigned_to);
      if (!assignee) {
        // Если исполнитель не назначен, проверяем на совпадение с запросом
        if (task.assigned_to_name) {
          return task.assigned_to_name.toLowerCase().includes(query);
        }
        return false;
      }
      const firstName = (assignee.first_name || '').toLowerCase();
      const lastName = (assignee.last_name || '').toLowerCase();
      const username = assignee.username.toLowerCase();
      const email = (assignee.email || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      
      const matches = firstName.includes(query) ||
                     lastName.includes(query) ||
                     username.includes(query) ||
                     email.includes(query) ||
                     fullName.includes(query);
      
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="searchQuery" className={styles.filterLabel}>
            Поиск:
          </label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className={styles.filterSelect}
          />
        </div>

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
                {statusLabels[status.name] || status.name}
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

        <div className={styles.filterGroup}>
          <label htmlFor="assigneeSearch" className={styles.filterLabel}>
            Исполнитель:
          </label>
          <input
            type="text"
            id="assigneeSearch"
            value={assigneeSearch}
            onChange={(e) => setAssigneeSearch(e.target.value)}
            placeholder="Поиск по имени, логину..."
            className={styles.filterSelect}
          />
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
          {filteredTasks.map(task => {
            const assignedUser = users.find(u => u.id === task.assigned_to);
            const createdUser = users.find(u => u.id === task.created_by);
            return (
              <TaskItem
                key={task.id}
                task={task}
                createdUser={createdUser}
                assignedUser={assignedUser}
                statuses={statuses}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
