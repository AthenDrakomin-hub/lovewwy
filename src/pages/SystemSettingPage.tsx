import React, { useEffect } from 'react';

// 导入子组件
import SystemSetting from '@/components/Business/SystemSetting';

const SystemSettingPage: React.FC = () => {
  // 更新页面标题
  useEffect(() => {
    document.title = '系统设置 - 新闻聚合与音乐播放系统';
    return () => {
      // 组件卸载时可选择恢复默认标题
    };
  }, []);
  
  return (
    <div className="page-container">
      <h2>⚙️ 系统设置</h2>
      <SystemSetting />
    </div>
  );
};

export default SystemSettingPage;