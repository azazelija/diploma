'use client';

import { useState } from 'react';
import styles from './AuthModal.module.css';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [emailOrLogin, setEmailOrLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrLogin, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Вход в систему</h2>
      <p className={styles.subtitle}>Введите свои данные для входа</p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="emailOrLogin" className={styles.label}>
            Email или Логин
          </label>
          <input
            type="text"
            id="emailOrLogin"
            value={emailOrLogin}
            onChange={(e) => setEmailOrLogin(e.target.value)}
            required
            className={styles.input}
            placeholder="example@mail.com или username"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="Введите пароль"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
