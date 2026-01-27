import React from 'react';
import styles from '@/styles/Base/Empty.module.css';

interface EmptyProps {
  image?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const Empty: React.FC<EmptyProps> = ({
  image = <span className={styles.emptyIcon}>∅</span>,
  title = '暂无数据',
  description = '暂无相关内容，快来添加吧~',
  action,
  className = '',
}) => {
  return (
    <div className={`${styles.emptyContainer} ${className}`}>
      <div className={styles.emptyImage}>{image}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDescription}>{description}</p>
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
};

export default Empty;