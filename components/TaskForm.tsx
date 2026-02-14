'use client';

import { useState } from 'react';
import { TaskPriority } from '@/types/task';
import styles from './TaskForm.module.css';
import { statusLabels } from '@/lib/statusLabels';

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<TaskFormData>;
  statuses: Array<{ id: number; name: string; color: string }>;
  users?: Array<{ id: number; username: string; first_name?: string; last_name?: string; avatar?: string }>;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status_id: number;
  due_date: string;
  assigned_to?: number | null;
}

export default function TaskForm({ onSubmit, onCancel, initialData, statuses, users = [] }: TaskFormProps) {
  // Преобразование даты из ISO формата в YYYY-MM-DD для input[type="date"]
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Формирование полного имени пользователя
  const getUserFullName = (user: { first_name?: string; last_name?: string; username: string }) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username;
  };

  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    status_id: initialData?.status_id || 1,
    due_date: formatDateForInput(initialData?.due_date),
    assigned_to: initialData?.assigned_to || null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Получение выбранного пользователя
  const selectedUser = users.find(u => u.id === formData.assigned_to);

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const firstName = (user.first_name || '').toLowerCase();
    const lastName = (user.last_name || '').toLowerCase();
    const username = user.username.toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    
    return firstName.includes(query) ||
           lastName.includes(query) ||
           username.includes(query) ||
           fullName.includes(query);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status_id' || name === 'assigned_to' 
        ? (value ? parseInt(value) : null) 
        : value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectUser = (userId: number | null) => {
    setFormData(prev => ({ ...prev, assigned_to: userId }));
    if (userId) {
      const user = users.find(u => u.id === userId);
      setSearchQuery(user ? getUserFullName(user) : '');
    } else {
      setSearchQuery('');
    }
    setShowDropdown(false);
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    // Задержка, чтобы клик по элементу списка успел сработать
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Название задачи *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder="Введите название задачи"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={styles.textarea}
          placeholder="Опишите задачу подробнее..."
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="priority" className={styles.label}>
            Приоритет
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="urgent">Срочный</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="status_id" className={styles.label}>
            Статус
          </label>
          <select
            id="status_id"
            name="status_id"
            value={formData.status_id}
            onChange={handleChange}
            className={styles.select}
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {statusLabels[status.name] || status.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="due_date" className={styles.label}>
            Срок выполнения
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      </div>

      {users.length > 0 && (
        <div className={styles.formGroup}>
          <label htmlFor="assigned_to" className={styles.label}>
            Исполнитель
          </label>
          <div className={styles.assigneeSearchContainer}>
            {selectedUser && (
              <div className={styles.assigneeAvatar}>
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={getUserFullName(selectedUser)} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(selectedUser.first_name?.[0] || selectedUser.username[0]).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <div className={styles.searchWrapper}>
              <input
                type="text"
                id="assigned_to"
                value={selectedUser ? getUserFullName(selectedUser) : searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="Поиск по имени, фамилии, логину..."
                className={styles.input}
              />
              {formData.assigned_to && (
                <button
                  type="button"
                  onClick={() => handleSelectUser(null)}
                  className={styles.clearButton}
                  title="Очистить"
                >
                  ✕
                </button>
              )}
              {showDropdown && (
                <div className={styles.dropdown}>
                  {!formData.assigned_to && (
                    <div
                      className={styles.dropdownItem}
                      onClick={() => handleSelectUser(null)}
                    >
                      <span className={styles.dropdownItemText}>Не назначен</span>
                    </div>
                  )}
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={styles.dropdownItem}
                        onClick={() => handleSelectUser(user.id)}
                      >
                        <div className={styles.dropdownAvatar}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={getUserFullName(user)} />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className={styles.dropdownUserInfo}>
                          <div className={styles.dropdownUserName}>{getUserFullName(user)}</div>
                          <div className={styles.dropdownUserDetails}>@{user.username}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.dropdownEmpty}>
                      Пользователи не найдены
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {initialData ? 'Обновить задачу' : 'Создать задачу'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
