'use client';

import { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onCreateTask: () => void;
  user: { username: string; email: string } | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function Header({ onCreateTask, user, onLogout, onLoginClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📋</span>
          <span className={styles.logoText}>Task Manager</span>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Найти задачу..."
            className={styles.searchInput}
          />
        </div>

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
                  👤
                </button>
                {showUserMenu && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{user.username}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </div>
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
