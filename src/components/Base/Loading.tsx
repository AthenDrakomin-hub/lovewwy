import React from 'react';
import styles from '@/styles/Base/Loading.module.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text = '加载中...',
  fullScreen = false,
  className = '',
}) => {
  return (
    <div 
      className={`
        ${styles.loadingContainer}
        ${styles[`size-${size}`]}
        ${fullScreen ? styles.fullScreen : ''}
        ${className}
      `}
    >
      <div className={`${styles.spinner} ${styles[`size-${size}`]}`}></div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
};

export default Loading;