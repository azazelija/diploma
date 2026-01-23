'use client';

import { useState } from 'react';
import styles from './CreateTaskModal.module.css';
import TaskForm from './TaskForm';
import { TaskFormData } from './TaskForm';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
  statuses: Array<{ id: number; name: string; color: string }>;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  statuses,
}: CreateTaskModalProps) {
  const handleSubmit = (formData: TaskFormData) => {
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Создать задачу</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.content}>
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            statuses={statuses}
          />
        </div>
      </div>
    </div>
  );
}
