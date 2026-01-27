/**
 * 收藏管理器组件
 * 用于管理用户的新闻收藏，提供增删改查功能
 */
import React, { useState, useEffect } from 'react';
import type { NewsArticle } from '@/types/news';
import Button from '@/components/Base/Button';
import Empty from '@/components/Base/Empty';
import Loading from '@/components/Base/Loading';
import styles from '@/styles/Business/CollectionManager.module.css';

interface CollectionManagerProps {
  initialItems?: NewsArticle[];
  onCollectionChange?: (items: NewsArticle[]) => void;
}

const CollectionManager: React.FC<CollectionManagerProps> = ({
  initialItems = [],
  onCollectionChange,
}) => {
  const [items, setItems] = useState<NewsArticle[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟从存储加载收藏
  useEffect(() => {
    const loadCollection = async () => {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        setItems(initialItems);
        setLoading(false);
      }, 500);
    };
    
    if (initialItems.length === 0) {
      loadCollection();
    }
  }, [initialItems]);

  // 过滤收藏项
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 删除收藏
  const handleRemove = (url: string) => {
    const updatedItems = items.filter(item => item.url !== url);
    setItems(updatedItems);
    onCollectionChange?.(updatedItems);
  };

  // 清空所有收藏
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有收藏吗？此操作不可恢复。')) {
      setItems([]);
      onCollectionChange?.([]);
    }
  };

  if (loading) {
    return <Loading text="加载收藏中..." />;
  }

  return (
    <div className={styles.collectionContainer}>
      <div className={styles.collectionHeader}>
        <h3 className={styles.collectionTitle}>📚 我的收藏 ({items.length})</h3>
        {items.length > 0 && (
          <Button type="danger" size="small" onClick={handleClearAll}>
            清空全部
          </Button>
        )}
      </div>
      
      {items.length > 0 ? (
        <>
          <div className={styles.collectionControls}>
            <input
              type="text"
              placeholder="搜索收藏..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.collectionList}>
            {filteredItems.map((item) => (
              <div key={item.url} className={styles.collectionItem}>
                <div className={styles.itemContent}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemSource}>{item.source.name}</span>
                    <span className={styles.itemTime}>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <Button 
                    type="danger" 
                    size="small" 
                    onClick={() => handleRemove(item.url)}
                  >
                    删除
                  </Button>
                  {item.url && (
                    <Button 
                      type="secondary" 
                      size="small" 
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      查看
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Empty 
          title="暂无收藏"
          description="收藏喜欢的新闻，方便随时查看"
          action={
            <Button type="primary">去发现新闻</Button>
          }
        />
      )}
    </div>
  );
};

export default CollectionManager;