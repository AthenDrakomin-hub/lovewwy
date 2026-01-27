import React, { ChangeEvent } from 'react';
import styles from '@/styles/Base/Input.module.css';

interface InputProps {
  type?: 'text' | 'password' | 'search' | 'number';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'medium',
  prefix,
  suffix,
}) => {
  return (
    <div 
      className={`
        ${styles.inputContainer}
        ${styles[`size-${size}`]}
        ${fullWidth ? styles.fullWidth : ''}
        ${disabled ? styles.disabled : ''}
        ${className}
      `}
    >
      {prefix && <div className={styles.prefix}>{prefix}</div>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={styles.input}
      />
      {suffix && <div className={styles.suffix}>{suffix}</div>}
    </div>
  );
};

export default Input;