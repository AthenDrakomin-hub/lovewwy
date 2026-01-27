/**
 * 音乐可视化组件
 * 12根动态柱状条，支持active状态控制动效开关与透明度
 * ES 模块版 - 适配 CSS Modules + Vite + React + TS
 */
import React, { useEffect, useState } from 'react';
// 关键：CSS Modules 赋值导入样式对象，实现组件私有样式
import styles from '@/styles/Business/MusicVisualizer.module.css';

// 保留原有TS接口，active默认值false
interface VisualizerProps {
  active?: boolean;
}

const MusicVisualizer: React.FC<VisualizerProps> = ({ active = false }) => {
  // 12根柱状条高度状态，初始值20%
  const [bars, setBars] = useState<number[]>(Array(12).fill(20));

  // 核心动效逻辑：active控制定时器开关，保留原有150ms刷新频率
  useEffect(() => {
    // 非激活状态：重置所有柱状条高度为5%，清除定时器
    if (!active) {
      setBars(Array(12).fill(5));
      return;
    }
    // 激活状态：定时器随机更新柱状条高度（20% - 100%）
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 20));
    }, 150);
    // 组件卸载/active变化时清除定时器，避免内存泄漏
    return () => clearInterval(interval);
  }, [active]);

  return (
    // 替换原Tailwind类名为CSS Modules容器类，保留原有布局逻辑
    <div className={styles.visualizerContainer}>
      {bars.map((height, idx) => (
        <div 
          key={idx}
          // 绑定模块化基础样式 + 动态激活/非激活样式
          className={`${styles.visualizerBar} ${active ? styles.barActive : styles.barInactive}`}
          // 动态控制柱状条高度，保留原有百分比逻辑
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
};

export default MusicVisualizer;