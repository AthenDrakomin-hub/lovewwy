/**
 * API使用监控组件
 * 显示API使用统计信息，帮助控制使用量
 * ES 模块版 - 适配 CSS Modules + Vite + React + TS 强类型
 */
import React, { useState, useEffect } from 'react';
import { newsService } from '@/services/newsService';
// 关键：CSS Modules 赋值导入样式对象（实现组件私有样式）
import styles from '@/styles/Business/ApiUsageMonitor.module.css';

// 补充 TS 强类型接口：移除所有 any，定义API调用记录结构
interface ApiCallRecord {
  timestamp: number;
  endpoint: string;
  [key: string]: any; // 兼容服务层扩展字段
}

// 补充 TS 强类型接口：API使用统计数据结构
interface ApiUsageStats {
  todayCalls: number;
  dailyLimit: number;
  remaining: number;
  cacheSize: number; // 修正：从 string 改为 number
  recentCalls: ApiCallRecord[];
  [key: string]: any; // 兼容服务层扩展字段
}

const ApiUsageMonitor: React.FC = () => {
  // 强类型状态：替代 any，指定为 ApiUsageStats | null
  const [stats, setStats] = useState<ApiUsageStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 定时更新API统计数据（初始加载 + 每30秒自动刷新）
  useEffect(() => {
    // 更新统计数据方法
    const updateStats = () => {
      const newStats = newsService.getApiUsageStats();
      // 类型转换：先转 unknown 再断言为 ApiUsageStats，消除TS转换警告
      setStats(newStats as unknown as ApiUsageStats);
    };

    // 初始加载统计数据
    updateStats();
    // 30秒定时更新
    const interval = setInterval(updateStats, 30000);

    // 组件卸载时清除定时器，避免内存泄漏
    return () => clearInterval(interval);
  }, []);

  // 未加载统计数据 或 隐藏状态：显示切换按钮
  if (!stats || !isVisible) {
    return (
      <button 
        className={styles.apiMonitorToggle}
        onClick={() => setIsVisible(true)}
        title="点击查看API使用统计"
      >
        📊 API用量
      </button>
    );
  }

  // 计算用量百分比（避免除零错误）
  const usagePercentage = stats.dailyLimit > 0 
    ? Math.round((stats.todayCalls / stats.dailyLimit) * 100) 
    : 0;
  // 80%用量阈值：显示警告样式
  const isNearLimit = usagePercentage >= 80;

  return (
    <div className={styles.apiUsageMonitor}>
      {/* 监控面板头部：标题 + 关闭按钮 */}
      <div className={styles.monitorHeader}>
        <h3>📊 API 使用统计</h3>
        <button 
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
          title="关闭监控面板"
        >
          ×
        </button>
      </div>
      
      {/* 核心用量统计 */}
      <div className={styles.usageStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>今日调用:</span>
          {/* 动态拼接警告样式：基于CSS Modules对象 */}
          <span className={`${styles.statValue} ${isNearLimit ? styles.warning : ''}`}>
            {stats.todayCalls}/{stats.dailyLimit}
          </span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>剩余配额:</span>
          <span className={`${styles.statValue} ${isNearLimit ? styles.warning : ''}`}>
            {stats.remaining}
          </span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>缓存大小:</span>
          <span className={styles.statValue}>
            {stats.cacheSize}
          </span>
        </div>
        
        {/* 用量进度条 */}
        <div className={styles.usageBar}>
          <div 
            className={`${styles.usageFill} ${isNearLimit ? styles.warning : ''}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }} // 限制最大100%
          ></div>
          <span className={styles.usageText}>{usagePercentage}%</span>
        </div>
      </div>
      
      {/* 近期调用记录（折叠面板） */}
      <details className={styles.recentCalls}>
        <summary>近期调用 ({stats.recentCalls.length})</summary>
        <ul className={styles.callList}>
          {stats.recentCalls.slice(0, 5).map((call, index) => (
            <li key={`${call.timestamp}-${index}`} className={styles.callItem}>
              <span className={styles.callTime}>
                {new Date(call.timestamp).toLocaleTimeString('zh-CN')}
              </span>
              <span className={styles.callEndpoint}>{call.endpoint}</span>
            </li>
          ))}
        </ul>
      </details>
      
      {/* 使用贴士 */}
      <div className={styles.usageTips}>
        <h4>💡 节约API使用的小贴士:</h4>
        <ul className={styles.tipsList}>
          <li>充分利用缓存的数据</li>
          <li>减少不必要的重复请求</li>
          <li>批量获取需要的数据</li>
          <li>合理设置搜索频率</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiUsageMonitor;