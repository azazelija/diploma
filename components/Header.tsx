'use client';

import { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onCreateTask: () => void;
  user: { 
    username: string; 
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    role_id: number;
  } | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onSearchClick?: () => void;
  onEditProfile?: () => void;
  onAdminClick?: () => void;
}

export default function Header({ onCreateTask, user, onLogout, onLoginClick, onSearchClick, onEditProfile, onAdminClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📋</span>
          <span className={styles.logoText}>Task Manager</span>
        </div>

        {user && onSearchClick && (
          <button className={styles.searchButton} onClick={onSearchClick}>
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchText}>Поиск</span>
          </button>
        )}

        <div className={styles.actions}>
          {user ? (
            <>
              <button className={styles.createButton} onClick={onCreateTask}>
                <span className={styles.buttonIcon}>+</span>
                <span className={styles.buttonText}>Создать</span>
              </button>
              <div className={styles.userMenu}>
                <button
                  className={styles.userButton}
                  title={user.username}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className={styles.userAvatar} />
                  ) : (
                    '👤'
                  )}
                </button>
                {showUserMenu && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username
                        }
                      </div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </div>
                    {user.role_id === 1 && onAdminClick && (
                      <button className={styles.adminButton} onClick={onAdminClick}>
                        ⚙️ Управление
                      </button>
                    )}
                    <button className={styles.editProfileButton} onClick={onEditProfile}>
                      Редактировать профиль
                    </button>
                    <button className={styles.logoutButton} onClick={onLogout}>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className={styles.loginButton} onClick={onLoginClick}>
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
