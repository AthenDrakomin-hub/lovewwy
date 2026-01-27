import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 导入业务服务 + 类型定义
import { newsService } from '@/services/newsService';
import type { NewsArticle } from '@/types/news';

// 导入子组件
import NewsList from '@/components/Business/NewsList';

const NewsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 更新页面标题
  useEffect(() => {
    document.title = '新闻列表 - 新闻聚合与音乐播放系统';
    return () => {
      // 组件卸载时可选择恢复默认标题
    };
  }, []);
  
  const handleArticleSelect = (article: NewsArticle) => {
    // 使用React Router的navigate进行路由跳转
    const articleId = encodeURIComponent(btoa(JSON.stringify(article)));
    sessionStorage.setItem(`news-article-${articleId}`, JSON.stringify(article));
    navigate(`/news/${articleId}`);
  };

  return (
    <div className="page-container">
      <h2>📰 新闻列表</h2>
      <NewsList onArticleSelect={handleArticleSelect} newsType="general" />
    </div>
  );
};

export default NewsListPage;