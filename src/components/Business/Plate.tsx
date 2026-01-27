/**
 * 终端风格面板组件
 * 带渐变背景、科技蓝装饰角、头部标题/副标题、hover动效，支持自定义内容与事件
 * ES 模块版 - 适配 CSS Modules + Vite + React + TS
 */
import React from 'react';
// 关键：CSS Modules 赋值导入样式对象，实现组件私有样式
import styles from '@/styles/Business/Plate.module.css';

// 保留原有所有TS接口，Props默认值与类型约束不变
interface PlateProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Plate: React.FC<PlateProps> = ({ 
  title, 
  subtitle, 
  className = '', 
  children, 
  onClick 
}) => {
  return (
    <section 
      onClick={onClick}
      // 拼接：模块化基础样式 + 点击态样式（有onClick时生效） + 用户自定义类名
      className={`
        ${styles.plateContainer} 
        ${onClick ? styles.clickable : ''} 
        ${className}
      `}
    >
      {/* 面板头部：标题 + 副标题 */}
      <div className={styles.plateHeader}>
        <div className={styles.titleText}>{title}</div>
        {subtitle && <div className={styles.subtitleText}>{subtitle}</div>}
      </div>
      
      {/* 面板内容区：渲染子组件 */}
      <div className={styles.plateContent}>{children}</div>
      
      {/* 静态装饰角：保留原四角边框，防止抖动 */}
      <div className={styles.cornerTopLeft}></div>
      <div className={styles.cornerTopRight}></div>
      <div className={styles.cornerBottomLeft}></div>
      <div className={styles.cornerBottomRight}></div>
    </section>
  );
};

export default Plate;