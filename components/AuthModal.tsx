'use client';

import LoginForm from './LoginForm';
import styles from './CreateTaskModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.content}>
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
