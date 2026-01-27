import React, { useEffect } from 'react';

// 导入子组件
import CollectionManager from '@/components/Business/CollectionManager';

const CollectionPage: React.FC = () => {
  // 更新页面标题
  useEffect(() => {
    document.title = '我的收藏 - 新闻聚合与音乐播放系统';
    return () => {
      // 组件卸载时可选择恢复默认标题
    };
  }, []);
  
  return (
    <div className="page-container">
      <h2>⭐ 我的收藏</h2>
      <CollectionManager />
    </div>
  );
};

export default CollectionPage;