'use client';

import { useState } from 'react';
import { TaskPriority } from '@/types/task';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<TaskFormData>;
  statuses: Array<{ id: number; name: string; color: string }>;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status_id: number;
  due_date: string;
}

export default function TaskForm({ onSubmit, onCancel, initialData, statuses }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    status_id: initialData?.status_id || 1,
    due_date: initialData?.due_date || '',
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
      [name]: name === 'status_id' ? parseInt(value) : value,
    }));
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
                {status.name}
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
