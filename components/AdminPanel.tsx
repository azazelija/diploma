'use client';

import { useState, useEffect } from 'react';
import styles from './AdminPanel.module.css';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role_id: number;
  position_id?: number;
  position_name?: string;
  avatar?: string;
  created_at: string;
}

interface Position {
  id: number;
  name: string;
  description?: string;
  level: number;
}

interface ProfileRequest {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  username: string;
  email: string;
  current_first_name: string;
  current_last_name: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  reject_reason?: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'positions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ProfileRequest[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreatePosition, setShowCreatePosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  
  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
    level: 3,
  });
  
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: 2,
    position_id: null as number | null,
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadRequests();
      loadPositions();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/profile-requests');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.data);
      }
    } catch (err) {
      console.error('Error loading positions:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания пользователя');
      }

      setShowCreateUser(false);
      setNewUser({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: 2,
        position_id: null,
      });
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user, newPassword: '' } as any);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: editingUser.id,
          email: editingUser.email,
          username: editingUser.username,
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          role_id: editingUser.role_id,
          position_id: editingUser.position_id,
          password: (editingUser as any).newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления пользователя');
      }

      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления пользователя');
      }

      alert('Пользователь удален');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReviewRequest = async (requestId: number, action: 'approve' | 'reject', rejectReason?: string) => {
    try {
      const response = await fetch(`/api/profile-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reject_reason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обработки запроса');
      }

      alert(data.message);
      loadRequests();
      loadUsers(); // Обновляем список пользователей
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosition),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания должности');
      }

      setShowCreatePosition(false);
      setNewPosition({ name: '', description: '', level: 3 });
      loadPositions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition({ ...position });
  };

  const handleUpdatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/positions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: editingPosition.id,
          name: editingPosition.name,
          description: editingPosition.description,
          level: editingPosition.level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления должности');
      }

      setEditingPosition(null);
      loadPositions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту должность?')) return;

    try {
      const response = await fetch(`/api/positions?id=${positionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления должности');
      }

      alert('Должность удалена');
      loadPositions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Панель управления</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Пользователи ({users.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Запросы на изменения ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'positions' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            Должности ({positions.length})
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'users' && (
            <div className={styles.usersTab}>
              <div className={styles.toolbar}>
                <button
                  className={styles.createButton}
                  onClick={() => setShowCreateUser(!showCreateUser)}
                >
                  + Создать пользователя
                </button>
              </div>

              {showCreateUser && (
                <div className={styles.createForm}>
                  <h3>Новый пользователь</h3>
                  {error && <div className={styles.error}>{error}</div>}
                  <form onSubmit={handleCreateUser}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Email *</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Логин *</label>
                        <input
                          type="text"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Имя *</label>
                        <input
                          type="text"
                          value={newUser.first_name}
                          onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Фамилия *</label>
                        <input
                          type="text"
                          value={newUser.last_name}
                          onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Пароль *</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Роль</label>
                        <select
                          value={newUser.role_id}
                          onChange={(e) => setNewUser({ ...newUser, role_id: parseInt(e.target.value) })}
                        >
                          <option value={2}>Пользователь</option>
                          <option value={3}>Менеджер</option>
                          <option value={1}>Администратор</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Должность</label>
                        <select
                          value={newUser.position_id || ''}
                          onChange={(e) => setNewUser({ ...newUser, position_id: e.target.value ? parseInt(e.target.value) : null })}
                        >
                          <option value="">Не выбрано</option>
                          {positions.map((pos) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? 'Создание...' : 'Создать'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateUser(false)}
                        className={styles.cancelButton}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className={styles.usersList}>
                {users.map((user) => (
                  <div key={user.id} className={styles.userCard}>
                    <div className={styles.userAvatar}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.first_name?.[0] || user.username[0]}
                        </div>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div className={styles.userDetails}>
                        <span>@{user.username}</span> • <span>{user.email}</span>
                      </div>
                      <div className={styles.userRole}>
                        {user.role_id === 1 ? '👑 Администратор' : user.role_id === 3 ? '📊 Менеджер' : '👤 Пользователь'}
                        {user.position_name && <span> • 💼 {user.position_name}</span>}
                      </div>
                    </div>
                    <div className={styles.userActions}>
                      <button
                        onClick={() => handleEditUser(user)}
                        className={styles.editButton}
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={styles.deleteButton}
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className={styles.requestsTab}>
              {requests.filter(r => r.status === 'pending').length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Нет ожидающих запросов</p>
                </div>
              ) : (
                <div className={styles.requestsList}>
                  {requests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className={styles.requestCard}>
                      <div className={styles.requestHeader}>
                        <div>
                          <strong>{request.username}</strong> ({request.email})
                        </div>
                        <div className={styles.requestDate}>
                          {new Date(request.created_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                      <div className={styles.requestChanges}>
                        <div className={styles.changeRow}>
                          <span className={styles.changeLabel}>Имя:</span>
                          <span className={styles.oldValue}>{request.current_first_name}</span>
                          <span className={styles.arrow}>→</span>
                          <span className={styles.newValue}>{request.first_name}</span>
                        </div>
                        <div className={styles.changeRow}>
                          <span className={styles.changeLabel}>Фамилия:</span>
                          <span className={styles.oldValue}>{request.current_last_name}</span>
                          <span className={styles.arrow}>→</span>
                          <span className={styles.newValue}>{request.last_name}</span>
                        </div>
                      </div>
                      <div className={styles.requestActions}>
                        <button
                          onClick={() => handleReviewRequest(request.id, 'approve')}
                          className={styles.approveButton}
                        >
                          ✓ Одобрить
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Причина отклонения (опционально):');
                            handleReviewRequest(request.id, 'reject', reason || undefined);
                          }}
                          className={styles.rejectButton}
                        >
                          ✕ Отклонить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'positions' && (
            <div className={styles.positionsTab}>
              {!showCreatePosition && !editingPosition && (
                <div className={styles.toolbar}>
                  <button 
                    onClick={() => setShowCreatePosition(true)}
                    className={styles.createButton}
                  >
                    + Создать должность
                  </button>
                </div>
              )}

              {showCreatePosition && (
                <div className={styles.createForm}>
                  <h3>Новая должность</h3>
                  {error && <div className={styles.error}>{error}</div>}
                  <form onSubmit={handleCreatePosition}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Название *</label>
                        <input
                          type="text"
                          value={newPosition.name}
                          onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                          placeholder="Например: Senior Developer"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Грейд *</label>
                        <select
                          value={newPosition.level}
                          onChange={(e) => setNewPosition({ ...newPosition, level: Number(e.target.value) })}
                          required
                        >
                          <option value={1}>1 - Стажер</option>
                          <option value={2}>2 - Junior</option>
                          <option value={3}>3 - Middle</option>
                          <option value={4}>4 - Senior</option>
                          <option value={5}>5 - Lead</option>
                          <option value={6}>6 - Principal</option>
                          <option value={7}>7 - Architect</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Описание</label>
                      <textarea
                        value={newPosition.description}
                        onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                        placeholder="Описание должности..."
                        rows={3}
                      />
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? 'Создание...' : 'Создать'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowCreatePosition(false);
                          setNewPosition({ name: '', description: '', level: 1 });
                          setError('');
                        }}
                        className={styles.cancelButton}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!showCreatePosition && !editingPosition && (
                <div className={styles.positionsList}>
                  {positions.map((position) => (
                    <div key={position.id} className={styles.positionCard}>
                      <div className={styles.positionInfo}>
                        <div className={styles.positionName}>
                          {position.name}
                          <span className={styles.positionLevel}>Грейд {position.level}</span>
                        </div>
                        {position.description && (
                          <div className={styles.positionDescription}>{position.description}</div>
                        )}
                      </div>
                      <div className={styles.positionActions}>
                        <button
                          onClick={() => handleEditPosition(position)}
                          className={styles.editButton}
                        >
                          ✏️ Редактировать
                        </button>
                        <button
                          onClick={() => handleDeletePosition(position.id)}
                          className={styles.deleteButton}
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модалка редактирования пользователя */}
      {editingUser && (
        <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.editModalContent}>
            <div className={styles.editModalHeader}>
              <h3>Редактирование пользователя</h3>
              <button onClick={() => setEditingUser(null)} className={styles.closeButton}>✕</button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleUpdateUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Логин *</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Имя *</label>
                  <input
                    type="text"
                    value={editingUser.first_name}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Фамилия *</label>
                  <input
                    type="text"
                    value={editingUser.last_name}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Новый пароль (оставьте пустым, чтобы не менять)</label>
                  <input
                    type="password"
                    value={(editingUser as any).newPassword || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value } as any)}
                    minLength={6}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Роль *</label>
                  <select
                    value={editingUser.role_id}
                    onChange={(e) => setEditingUser({ ...editingUser, role_id: parseInt(e.target.value) })}
                  >
                    <option value={2}>Пользователь</option>
                    <option value={3}>Менеджер</option>
                    <option value={1}>Администратор</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Должность</label>
                  <select
                    value={editingUser.position_id || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, position_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  >
                    <option value="">Не выбрано</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка редактирования должности */}
      {editingPosition && (
        <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.editModalContent}>
            <div className={styles.editModalHeader}>
              <h3>Редактирование должности</h3>
              <button onClick={() => setEditingPosition(null)} className={styles.closeButton}>✕</button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleUpdatePosition}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Название *</label>
                  <input
                    type="text"
                    value={editingPosition.name}
                    onChange={(e) => setEditingPosition({ ...editingPosition, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Грейд *</label>
                  <select
                    value={editingPosition.level}
                    onChange={(e) => setEditingPosition({ ...editingPosition, level: Number(e.target.value) })}
                    required
                  >
                    <option value={1}>1 - Стажер</option>
                    <option value={2}>2 - Junior</option>
                    <option value={3}>3 - Middle</option>
                    <option value={4}>4 - Senior</option>
                    <option value={5}>5 - Lead</option>
                    <option value={6}>6 - Principal</option>
                    <option value={7}>7 - Architect</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Описание</label>
                <textarea
                  value={editingPosition.description || ''}
                  onChange={(e) => setEditingPosition({ ...editingPosition, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
