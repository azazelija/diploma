'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';
import TaskList from '@/components/TaskList';
import CreateTaskModal from '@/components/CreateTaskModal';
import AuthModal from '@/components/AuthModal';
import EditProfileModal, { ProfileData } from '@/components/EditProfileModal';
import AdminPanel from '@/components/AdminPanel';
import TaskForm, { TaskFormData } from '@/components/TaskForm';
import styles from './page.module.css';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status_id: number;
  status_name: string;
  status_color: string;
  due_date: string | null;
  created_by_name: string;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role_id: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Показать toast уведомление
  const showSuccessToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Загрузка пользователя при монтировании
  useEffect(() => {
    checkAuth();
  }, []);

  // Загрузка данных после авторизации (только при логине/логауте)
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statusesRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/statuses'),
        fetch('/api/users'),
      ]);

      if (!tasksRes.ok || !statusesRes.ok) {
        throw new Error('Failed to load data');
      }

      const tasksData = await tasksRes.json();
      const statusesData = await statusesRes.json();
      const usersData = usersRes.ok ? await usersRes.json() : { data: [] };

      setTasks(tasksData.data || []);
      setStatuses(statusesData.data || []);
      setUsers(usersData.data || []);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных. Проверьте подключение к базе данных.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setTasks([]);
      setStatuses([]);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleAuthSuccess = () => {
    checkAuth();
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    if (!user) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      await loadData();
      setShowModal(false);
      setError(null);
      showSuccessToast('✓ Задача успешно создана');
    } catch (err) {
      setError('Ошибка создания задачи');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask || !user) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updated_by: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await loadData();
      setEditingTask(null);
      setShowEditModal(false);
      setError(null);
      showSuccessToast('✓ Задача успешно обновлена');
    } catch (err) {
      setError('Ошибка обновления задачи');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await loadData();
      setError(null);
      showSuccessToast('✓ Задача удалена');
    } catch (err) {
      setError('Ошибка удаления задачи');
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (taskId: number, statusId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_id: statusId,
          updated_by: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await loadData();
      setError(null);
      showSuccessToast('✓ Статус задачи обновлён');
    } catch (err) {
      setError('Ошибка изменения статуса');
      console.error('Error updating status:', err);
    }
  };

  const handleEdit = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setShowEditModal(true);
    }
  };

  const handleUpdateProfile = async (data: ProfileData) => {
    // Запрос уже отправлен в EditProfileModal, здесь только показываем toast
    showSuccessToast('✓ Запрос на изменение профиля отправлен');
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    // Обновляем только аватар пользователя без полной перезагрузки
    if (user) {
      setUser({ ...user, avatar: newAvatar });
    }
    showSuccessToast('✓ Аватар успешно обновлён');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован
  if (!user) {
    return (
      <div className={styles.container}>
        <Header
          onCreateTask={() => {}}
          user={null}
          onLogout={() => {}}
          onLoginClick={() => setShowAuthModal(true)}
        />
        <div className={styles.authPrompt}>
          <h2>Добро пожаловать в Task Manager</h2>
          <p>Войдите или зарегистрируйтесь для работы с задачами</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className={styles.authPromptButton}
          >
            Войти / Регистрация
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header
        onCreateTask={() => setShowModal(true)}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => {}}
        onSearchClick={() => setShowSearch(!showSearch)}
        onEditProfile={() => setShowEditProfile(true)}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.errorClose}>
            ✕
          </button>
        </div>
      )}

      <main className={styles.main}>
        {showSearch ? (
          <div className={styles.searchPanel}>
            <div className={styles.searchHeader}>
              <h3>Поиск и фильтры</h3>
              <button
                className={styles.closeSearchButton}
                onClick={() => setShowSearch(false)}
              >
                ✕ Закрыть
              </button>
            </div>
            <TaskList
              tasks={tasks}
              statuses={statuses}
              users={users}
              onEdit={handleEdit}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            statuses={statuses}
            users={users}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      <CreateTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateTask}
        statuses={statuses}
        users={users}
      />

      {editingTask && (
        <div className={styles.editModalOverlay} onClick={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}>
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <div className={styles.editModalHeader}>
              <h2>Редактирование задачи</h2>
              <button
                className={styles.editModalClose}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className={styles.editModalContent}>
              <TaskForm
                onSubmit={handleUpdateTask}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
                initialData={{
                  title: editingTask.title,
                  description: editingTask.description || '',
                  priority: editingTask.priority as any,
                  status_id: editingTask.status_id,
                  due_date: editingTask.due_date || '',
                  assigned_to: (editingTask as any).assigned_to || null,
                }}
                statuses={statuses}
                users={users}
              />
            </div>
          </div>
        </div>
      )}

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSubmit={handleUpdateProfile}
        onAvatarUpdate={handleAvatarUpdate}
        user={user}
      />

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />

      {successToast && (
        <div className={styles.successToast}>
          {successToast}
        </div>
      )}
    </div>
  );
}
