'use client';

import { useState, useEffect } from 'react';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileData) => void;
  onAvatarUpdate?: (newAvatar: string) => void;
  user: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
  } | null;
}

export interface ProfileData {
  first_name: string;
  last_name: string;
  avatar?: string;
}

export default function EditProfileModal({ isOpen, onClose, onSubmit, onAvatarUpdate, user }: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    avatar: user?.avatar || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Имя и фамилия обязательны');
      return;
    }

    setLoading(true);
    try {
      // Отправляем запрос на изменение профиля
      const response = await fetch('/api/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка отправки запроса');
      }

      // Уведомляем родительский компонент об успешной отправке
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки запроса');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Проверка, есть ли изменения в имени или фамилии
  const hasChanges = 
    formData.first_name.trim() !== (user?.first_name || '').trim() ||
    formData.last_name.trim() !== (user?.last_name || '').trim();

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setLoading(true);
      const compressed = await compressImage(file);
      setAvatarPreview(compressed);
      
      // Сразу отправляем аватар на сервер
      const response = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: compressed }),
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления аватара');
      }

      setError('');
      // Обновляем данные пользователя
      if (onAvatarUpdate) {
        onAvatarUpdate(compressed);
      }
    } catch (err) {
      setError('Ошибка обработки изображения');
      setAvatarPreview(user?.avatar || '');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Редактирование профиля</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(formData.first_name?.[0] || user?.username[0] || '?').toUpperCase()}
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className={styles.uploadButton}>
                📷 Загрузить фото
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="first_name" className={styles.label}>
                Имя *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Введите имя"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="last_name" className={styles.label}>
                Фамилия *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Введите фамилию"
              />
            </div>

            <div className={styles.readOnlyInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Логин:</span>
                <span className={styles.infoValue}>{user?.username}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{user?.email}</span>
              </div>
            </div>

            <div className={styles.formActions}>
              <button 
                type="submit" 
                disabled={loading || !hasChanges} 
                className={styles.submitButton}
              >
                {loading ? 'Отправка...' : 'Отправить запрос на изменение'}
              </button>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
