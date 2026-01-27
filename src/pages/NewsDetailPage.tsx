import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 导入子组件
import NewsDetail from '@/components/Business/NewsDetail';

const NewsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  
  // 更新页面标题
  useEffect(() => {
    document.title = '新闻详情 - 新闻聚合与音乐播放系统';
    return () => {
      // 组件卸载时可选择恢复默认标题
    };
  }, []);
  
  const handleBackToList = () => {
    navigate('/');
  };

  return (
    <div className="page-container">
      <NewsDetail onBack={handleBackToList} />
    </div>
  );
};

export default NewsDetailPage;