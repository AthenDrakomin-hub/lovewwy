import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { NewsArticle } from '@/types/news';
import styles from '@/styles/NewsDetail.module.css';

interface NewsDetailProps {
  onBack?: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ onBack }) => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const navigate = useNavigate();

  // 这里需要根据文章ID获取文章详情
  // 由于我们没有后端API来根据ID获取文章，我们将使用sessionStorage来临时存储文章
  React.useEffect(() => {
    if (articleId) {
      try {
        const storedArticle = sessionStorage.getItem(`news-article-${articleId}`);
        if (storedArticle) {
          setArticle(JSON.parse(storedArticle));
        }
      } catch (e) {
        console.error('无法解析文章数据:', e);
        // 如果解析失败，尝试解码可能的base64编码
        try {
          const decodedId = atob(decodeURIComponent(articleId));
          const storedArticle = sessionStorage.getItem(`news-article-${decodedId}`);
          if (storedArticle) {
            setArticle(JSON.parse(storedArticle));
          }
        } catch (decodeError) {
          console.error('解码文章ID失败:', decodeError);
        }
      }
    }
  }, [articleId]);

  const handleNewsCollect = (article: NewsArticle) => {
    console.log('新闻收藏成功：', article.title);
    // 可扩展：收藏成功提示、更新收藏数等
  };

  if (!article) {
    return (
      <div className={styles.newsDetailContainer}>
        <div className={styles.loading}>文章加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.newsDetailContainer}>
      <div className={styles.newsDetailHeader}>
        <button className={styles.backButton} onClick={() => onBack ? onBack() : navigate(-1)}>
          ← 返回列表
        </button>
        <button 
          className={styles.collectButton}
          onClick={() => handleNewsCollect(article)}
        >
          收藏
        </button>
      </div>
      
      <div className={styles.newsDetailContent}>
        <h1 className={styles.newsTitle}>{article.title}</h1>
        
        <div className={styles.newsMeta}>
          <span className={styles.author}>作者: {article.author || '未知'}</span>
          <span className={styles.sourceName}>来源: {article.source?.name || '未知来源'}</span>
          <span className={styles.date}>发布时间: {new Date(article.publishedAt).toLocaleString('zh-CN')}</span>
        </div>
        
        {article.urlToImage && (
          <div className={styles.newsImageContainer}>
            <img 
              src={article.urlToImage} 
              alt={article.title} 
              className={styles.newsDetailImage}
            />
          </div>
        )}
        
        <div className={styles.newsDescription}>
          <h3>摘要</h3>
          <p>{article.description}</p>
        </div>
        
        <div className={styles.newsBody}>
          <h3>正文</h3>
          <p>{article.content || '暂无详细内容'}</p>
        </div>
        
        <div className={styles.relatedActions}>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.originalLink}
          >
            阅读原文
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;