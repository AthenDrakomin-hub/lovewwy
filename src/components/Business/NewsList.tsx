/**
 * 新闻列表组件
 * 展示新闻列表，支持分类、搜索和收藏功能
 * ES 模块版 - 适配 Vite + React + CSS Modules
 */
import React, { useState, useEffect } from 'react';
import { newsService } from '@/services/newsService';
import type { NewsArticle, NewsCategory, NewsCollectionItem } from '@/types/news';
// 已正确导入 CSS Modules 样式对象（原代码此步正确，后续类名绑定修正）
import styles from '@/styles/Business/NewsList.module.css';

interface NewsListProps {
  category?: string;
  searchQuery?: string;
  newsType?: 'general' | 'trump' | 'bbc' | 'china-us-market';
  onArticleSelect?: (article: NewsArticle) => void;
}

const NewsList: React.FC<NewsListProps> = ({ 
  category, 
  searchQuery, 
  newsType = 'general',
  onArticleSelect 
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories] = useState<NewsCategory[]>(newsService.getCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchText, setSearchText] = useState<string>(searchQuery || '');
  const [collection, setCollection] = useState<NewsCollectionItem[]>([]);
  const [showCollection, setShowCollection] = useState(false);

  // 加载新闻/收藏数据，依赖项完整
  useEffect(() => {
    if (showCollection) {
      loadCollection();
    } else {
      loadNews();
    }
    loadAllCollections();
  }, [selectedCategory, searchText, newsType, showCollection]);

  // 加载不同类型新闻核心逻辑（保留原有所有分支）
  const loadNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (searchText) {
        // 搜索新闻
        response = await newsService.searchNews({
          q: searchText,
          language: 'zh',
          sortBy: 'publishedAt',
          pageSize: 20
        });
      } else if (newsType === 'trump') {
        // 特朗普相关新闻
        response = await newsService.searchTrumpNews({ pageSize: 20 });
      } else if (newsType === 'bbc') {
        // BBC新闻
        response = await newsService.searchBBCNews({ pageSize: 20 });
      } else if (newsType === 'china-us-market') {
        // 中美金融市场新闻
        response = await newsService.searchChinaUSMarketNews({ pageSize: 20 });
      } else {
        // 综合新闻兜底
        if (!searchText) {
          response = await newsService.searchChinaUSMarketNews({ pageSize: 20 });
        } else {
          response = await newsService.getTopHeadlines({ pageSize: 20 });
        }
      }
      
      if (response.status === 'ok') {
        setArticles(response.articles);
      } else {
        setError(response.message || '获取新闻失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('加载新闻失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载收藏列表
  const loadCollection = () => {
    const collectionState = newsService.getCollection();
    setArticles(collectionState.items.map(item => item.article));
  };

  // 加载所有收藏项（用于收藏数展示和状态判断）
  const loadAllCollections = () => {
    const collectionState = newsService.getCollection();
    setCollection(collectionState.items);
  };

  // 分类切换（重置筛选条件）
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchText('');
    setShowCollection(false);
  };

  // 新闻类型切换（重置所有筛选）
  const handleNewsTypeChange = (type: 'general' | 'trump' | 'bbc' | 'china-us-market') => {
    setSelectedCategory('');
    setSearchText('');
    setShowCollection(false);
  };

  // 搜索提交（阻止默认行为，重置分类）
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      setSelectedCategory('');
      setShowCollection(false);
    }
  };

  // 收藏新闻逻辑
  const handleCollect = async (article: NewsArticle) => {
    try {
      const collectionItem = await newsService.collectArticle(article, ['手动收藏']);
      setCollection(prev => [...prev, collectionItem]);
      if (showCollection) loadCollection(); // 实时刷新收藏列表
      console.log('收藏成功:', article.title);
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  // 从收藏中移除逻辑
  const handleRemoveFromCollection = (articleUrl: string) => {
    setCollection(prev => prev.filter(item => item.article.url !== articleUrl));
    if (showCollection) loadCollection();
  };

  // 新闻项点击（回调到父组件，标记已读）
  const handleArticleClick = (article: NewsArticle) => {
    onArticleSelect?.(article); // 优化：可选链调用，避免未传回调报错
  };

  // 判断新闻是否已收藏
  const isArticleCollected = (article: NewsArticle) => {
    return collection.some(item => item.article.url === article.url);
  };

  // 渲染加载状态
  const renderLoading = () => (
    <div className={styles.newsLoading}>
      <div className={styles.loadingSpinner}></div>
      <p>加载中...</p>
    </div>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className={styles.newsError}>
      <p>❌ {error}</p>
      <button onClick={loadNews} className={styles.retryButton}>重试</button>
    </div>
  );

  // 渲染分类/类型切换按钮
  const renderCategories = () => (
    <div className={styles.newsCategories}>
      <button
        className={`${styles.categoryButton} ${showCollection ? styles.active : ''}`}
        onClick={() => setShowCollection(true)}
      >
        收藏 ({collection.length})
      </button>
      
      <button
        className={`${styles.categoryButton} ${newsType === 'trump' ? styles.active : ''}`}
        onClick={() => handleNewsTypeChange('trump')}
      >
        特朗普新闻
      </button>
      
      <button
        className={`${styles.categoryButton} ${newsType === 'bbc' ? styles.active : ''}`}
        onClick={() => handleNewsTypeChange('bbc')}
      >
        BBC新闻
      </button>
      
      <button
        className={`${styles.categoryButton} ${newsType === 'china-us-market' ? styles.active : ''}`}
        onClick={() => handleNewsTypeChange('china-us-market')}
      >
        中美金融
      </button>
    </div>
  );

  // 渲染搜索框
  const renderSearch = () => (
    <form onSubmit={handleSearch} className={styles.newsSearch}>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="搜索新闻..."
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchButton}>搜索</button>
    </form>
  );

  // 渲染单条新闻项（核心节点，修正所有类名）
  const renderArticle = (article: NewsArticle) => {
    const isCollected = isArticleCollected(article);
    const publishTime = newsService.formatPublishTime(article.publishedAt);
    const summary = newsService.extractSummary(article.description || article.content);

    return (
      <div 
        key={article.url} 
        className={styles.newsItem}
        onClick={() => handleArticleClick(article)}
      >
        <div className={styles.newsItemContent}>
          {article.urlToImage && (
            <img 
              src={article.urlToImage} 
              alt={article.title}
              className={styles.newsImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          
          <div className={styles.newsInfo}>
            <h3 className={styles.newsTitle}>{article.title}</h3>
            
            {summary && (
              <p className={styles.newsSummary}>{summary}</p>
            )}
            
            <div className={styles.newsMeta}>
              <span className={styles.newsSource}>{article.source.name}</span>
              <span className={styles.newsTime}>{publishTime}</span>
              {article.author && (
                <span className={styles.newsAuthor}>by {article.author}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.newsActions}>
          <button
            className={`${styles.collectButton} ${isCollected ? styles.collected : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // 阻止冒泡到新闻项点击
              if (isCollected && showCollection) {
                handleRemoveFromCollection(article.url);
              } else {
                handleCollect(article);
              }
            }}
            title={isCollected && showCollection ? '从收藏中移除' : isCollected ? '已收藏' : '收藏'}
          >
            {isCollected ? (showCollection ? '🗑️' : '★') : '☆'}
          </button>
          
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.readMoreLink}
            onClick={(e) => e.stopPropagation()}
          >
            阅读原文
          </a>
        </div>
      </div>
    );
  };

  // 渲染空状态（收藏空/搜索结果空）
  const renderEmpty = () => (
    <div className={styles.newsEmpty}>
      <p>{showCollection ? '暂无收藏的新闻' : '暂无相关新闻'}</p>
    </div>
  );

  // 根节点：修正所有外层类名绑定
  return (
    <div className={styles.newsListContainer}>
      <div className={styles.newsHeader}>
        <h2>新闻聚合</h2>
        {renderSearch()}
      </div>
      
      {renderCategories()}
      
      <div className={styles.newsContent}>
        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && articles.length === 0 && renderEmpty()}
        {!loading && !error && articles.length > 0 && (
          <div className={styles.newsList}>
            {articles.map(renderArticle)}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;