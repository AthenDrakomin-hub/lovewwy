import React from 'react';
import styles from '@/styles/Base/Button.module.css';

interface ButtonProps {
  type?: 'primary' | 'secondary' | 'default' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  onClick,
  disabled = false,
  className = '',
  children,
  fullWidth = false,
  loading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${styles.button}
        ${styles[`type-${type}`]}
        ${styles[`size-${size}`]}
        ${fullWidth ? styles.fullWidth : ''}
        ${loading ? styles.loading : ''}
        ${className}
      `}
    >
      {loading && <span className={styles.loadingIcon}>●</span>}
      {children}
    </button>
  );
};

export default Button;