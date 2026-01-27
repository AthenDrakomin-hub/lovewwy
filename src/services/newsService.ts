/**
 * 新闻聚合服务
 * 集成NewsAPI和其他新闻源，提供统一的新闻获取接口
 * 优化API使用，减少不必要的请求
 */

import type {
  NewsArticle,
  NewsApiResponse,
  NewsSearchQuery,
  NewsCategory,
  NewsSourceInfo,
  NewsSourceResponse,
  NewsCollectionItem,
  NewsCollectionState
} from '@/types/news';

// NewsAPI配置
const NEWS_API_CONFIG = {
  baseUrl: process.env.VITE_NEWS_API_BASE_URL || 'https://newsapi.org/v2',
  apiKey: process.env.VITE_NEWS_API_KEY || 'your-news-api-key'
};

// 本地缓存配置 - 优化缓存策略以减少API调用
const CACHE_CONFIG = {
  topHeadlines: 10 * 60 * 1000, // 10分钟 - 比之前延长5分钟
  searchResults: 15 * 60 * 1000, // 15分钟 - 比之前延长5分钟
  categories: 60 * 60 * 1000, // 1小时 - 分类信息变化较少，可长期缓存
  sources: 2 * 60 * 60 * 1000, // 2小时 - 新闻源列表很少变化
  dailyQuota: 500, // 每日API调用限额
  recentCalls: 100 // 最近调用记录数量
};

// API使用统计和限制
let apiCallCount = 0;
let today = new Date().getDate();
const recentCalls: {timestamp: number, endpoint: string, params: string}[] = [];

// 内存缓存
const memoryCache = new Map<string, { data: any; timestamp: number }>();

// 缓存管理工具
const CacheManager = {
  get: <T>(key: string): T | null => {
    const item = memoryCache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    // 检查是否过期
    if (now - item.timestamp > CACHE_CONFIG.topHeadlines) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  set: <T>(key: string, data: T, customTtl?: number): void => {
    memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // 设置过期定时器
    if (customTtl) {
      setTimeout(() => memoryCache.delete(key), customTtl);
    }
  },
  
  clear: (): void => {
    memoryCache.clear();
  },
  
  size: (): number => memoryCache.size
};

// API调用限制管理
const ApiLimitManager = {
  // 检查是否可以进行API调用
  canMakeCall: (): boolean => {
    // 重置每日计数
    const currentDay = new Date().getDate();
    if (currentDay !== today) {
      today = currentDay;
      apiCallCount = 0;
      recentCalls.length = 0; // 清空历史记录
    }
    
    // 检查是否达到每日限额
    return apiCallCount < CACHE_CONFIG.dailyQuota;
  },
  
  // 记录API调用
  recordCall: (endpoint: string, params: string): void => {
    apiCallCount++;
    recentCalls.unshift({
      timestamp: Date.now(),
      endpoint,
      params
    });
    
    // 保持最近调用记录数量限制
    if (recentCalls.length > CACHE_CONFIG.recentCalls) {
      recentCalls.length = CACHE_CONFIG.recentCalls;
    }
  },
  
  // 获取使用统计
  getStats: () => {
    const currentDay = new Date().getDate();
    if (currentDay !== today) {
      today = currentDay;
      apiCallCount = 0;
    }
    
    return {
      todayCalls: apiCallCount,
      dailyLimit: CACHE_CONFIG.dailyQuota,
      remaining: CACHE_CONFIG.dailyQuota - apiCallCount,
      recentCalls: recentCalls.slice(0, 10), // 最近10次调用
      cacheSize: CacheManager.size()
    };
  }
};

// HTTP请求工具 - 添加API限制检查
const httpClient = {
  async get<T>(url: string, params: Record<string, any> = {}): Promise<T> {
    // 检查API调用限制
    if (!ApiLimitManager.canMakeCall()) {
      throw new Error(`API调用次数已达每日限额 (${CACHE_CONFIG.dailyQuota}次)`);
    }
    
    const searchParams = new URLSearchParams({
      apiKey: NEWS_API_CONFIG.apiKey,
      ...params
    });
    
    const fullUrl = `${url}?${searchParams}`;
    const paramString = JSON.stringify(params);
    
    try {
      // 记录API调用
      ApiLimitManager.recordCall(url, paramString);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      // 如果调用失败，回退计数
      if (apiCallCount > 0) {
        apiCallCount--;
      }
      throw error;
    }
  }
};

class NewsService {
  /**
   * 获取热门头条新闻
   * 优化：合并相同请求，增加缓存时间
   */
  async getTopHeadlines(options: {
    category?: string;
    country?: string;
    pageSize?: number;
    page?: number;
    q?: string;  // 添加q参数支持
  } = {}): Promise<NewsApiResponse> {
    // 创建更具体的缓存键，包含所有参数
    const cacheKey = `topHeadlines:${JSON.stringify({...options, apiKey: null})}`;
    const cached = CacheManager.get<NewsApiResponse>(cacheKey);
    if (cached) {
      console.debug('从缓存返回数据:', cacheKey);
      return cached;
    }
    
    try {
      let apiUrl = `${NEWS_API_CONFIG.baseUrl}/top-headlines`;
      // 如果有q参数，则使用everything端点而不是top-headlines
      if (options.q) {
        apiUrl = `${NEWS_API_CONFIG.baseUrl}/everything`;
      }
      
      const response = await httpClient.get<NewsApiResponse>(
        apiUrl,
        {
          q: options.q,
          country: options.country || 'cn',
          category: options.category,
          pageSize: options.pageSize || 20,
          page: options.page || 1
        }
      );
      
      // 处理文章数据
      response.articles = response.articles.map((article) => ({
        ...article,
        source: article.source || { id: null, name: '未知来源' }
      }));
      
      // 使用更长的缓存时间
      CacheManager.set(cacheKey, response, CACHE_CONFIG.topHeadlines);
      return response;
    } catch (error) {
      console.error('获取热门头条新闻失败:', error);
      // 如果API调用失败，尝试返回部分缓存数据
      const fallbackArticles = this.getFallbackArticles();
      return {
        status: 'ok',
        totalResults: fallbackArticles.length,
        articles: fallbackArticles
      };
    }
  }
  
  /**
   * 搜索新闻
   * 优化：对相同搜索请求进行缓存
   */
  async searchNews(query: NewsSearchQuery): Promise<NewsApiResponse> {
    // 创建缓存键，排除apiKey等敏感参数
    const queryParams = {...query};
    if ('apiKey' in queryParams) {
      delete (queryParams as any).apiKey;
    }
    const cacheKey = `search:${JSON.stringify(queryParams)}`;
    
    const cached = CacheManager.get<NewsApiResponse>(cacheKey);
    if (cached && cached.articles.length > 0) {
      console.debug('从缓存返回搜索结果:', cacheKey);
      return cached;
    }
    
    try {
      const response = await httpClient.get<NewsApiResponse>(
        `${NEWS_API_CONFIG.baseUrl}/everything`,
        {
          ...query,
          sortBy: query.sortBy || 'publishedAt',
          language: query.language || 'zh'
        }
      );
      
      // 处理文章数据
      response.articles = response.articles.map((article) => ({
        ...article,
        source: article.source || { id: null, name: '未知来源' }
      }));
      
      // 缓存搜索结果（如果没有查询关键词，不缓存）
      if (query.q && response.articles.length > 0) {
        CacheManager.set(cacheKey, response, CACHE_CONFIG.searchResults);
      }
      
      return response;
    } catch (error) {
      console.error('搜索新闻失败:', error);
      return {
        status: 'error',
        totalResults: 0,
        articles: []
      };
    }
  }
  
  /**
   * 获取特定来源的新闻（如BBC）
   * 优化：增加缓存时间
   */
  async getNewsBySource(sourceId: string, options: {
    pageSize?: number;
    page?: number;
  } = {}): Promise<NewsApiResponse> {
    const cacheKey = `source:${sourceId}:${JSON.stringify(options)}`;
    const cached = CacheManager.get<NewsApiResponse>(cacheKey);
    if (cached) {
      console.debug('从缓存返回来源新闻:', cacheKey);
      return cached;
    }
    
    try {
      const response = await httpClient.get<NewsApiResponse>(
        `${NEWS_API_CONFIG.baseUrl}/everything`,
        {
          sources: sourceId,
          pageSize: options.pageSize || 20,
          page: options.page || 1
        }
      );
      
      // 处理文章数据
      response.articles = response.articles.map((article) => ({
        ...article,
        source: article.source || { id: null, name: sourceId }
      }));
      
      // 使用搜索结果缓存时间
      CacheManager.set(cacheKey, response, CACHE_CONFIG.searchResults);
      return response;
    } catch (error) {
      console.error(`获取${sourceId}新闻失败:`, error);
      return {
        status: 'error',
        totalResults: 0,
        articles: []
      };
    }
  }
  
  /**
   * 搜索中美金融投资市场相关新闻
   * 优化：使用较长缓存时间
   */
  async searchChinaUSMarketNews(options: {
    pageSize?: number;
    page?: number;
    dateFrom?: string;
  } = {}): Promise<NewsApiResponse> {
    // 构建搜索查询，寻找中美金融市场相关的新闻
    const queryString = "(中国 OR 中国 OR China OR 中美 OR US-China OR 美国) AND (金融 OR finance OR 投资 OR investment OR 市场 OR market OR 股票 OR stock OR 经济 OR economy)";
    
    const cacheKey = `china-us-market:${JSON.stringify({...options, queryString})}`;
    const cached = CacheManager.get<NewsApiResponse>(cacheKey);
    if (cached) {
      console.debug('从缓存返回中美金融新闻:', cacheKey);
      return cached;
    }
    
    try {
      const response = await httpClient.get<NewsApiResponse>(
        `${NEWS_API_CONFIG.baseUrl}/everything`,
        {
          q: queryString,
          sortBy: 'publishedAt',
          language: 'zh',
          pageSize: options.pageSize || 20,
          page: options.page || 1,
          from: options.dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 默认过去一周
        }
      );
      
      // 处理文章数据
      response.articles = response.articles.map((article) => ({
        ...article,
        source: article.source || { id: null, name: '未知来源' }
      }));
      
      // 使用搜索结果缓存时间
      CacheManager.set(cacheKey, response, CACHE_CONFIG.searchResults);
      return response;
    } catch (error) {
      console.error('搜索中美金融市场新闻失败:', error);
      return {
        status: 'error',
        totalResults: 0,
        articles: []
      };
    }
  }
  
  /**
   * 搜索特朗普相关新闻
   * 优化：使用较长缓存时间
   */
  async searchTrumpNews(options: {
    pageSize?: number;
    page?: number;
    dateFrom?: string;
  } = {}): Promise<NewsApiResponse> {
    const cacheKey = `trump:${JSON.stringify(options)}`;
    const cached = CacheManager.get<NewsApiResponse>(cacheKey);
    if (cached) {
      console.debug('从缓存返回特朗普新闻:', cacheKey);
      return cached;
    }
    
    try {
      const response = await httpClient.get<NewsApiResponse>(
        `${NEWS_API_CONFIG.baseUrl}/everything`,
        {
          q: 'Trump OR 特朗普',
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: options.pageSize || 20,
          page: options.page || 1,
          from: options.dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 默认过去一周
        }
      );
      
      // 处理文章数据
      response.articles = response.articles.map((article) => ({
        ...article,
        source: article.source || { id: null, name: '未知来源' }
      }));
      
      // 使用搜索结果缓存时间
      CacheManager.set(cacheKey, response, CACHE_CONFIG.searchResults);
      return response;
    } catch (error) {
      console.error('搜索特朗普新闻失败:', error);
      return {
        status: 'error',
        totalResults: 0,
        articles: []
      };
    }
  }
  
  /**
   * 搜索BBC新闻
   * 优化：使用较长缓存时间
   */
  async searchBBCNews(options: {
    pageSize?: number;
    page?: number;
    dateFrom?: string;
    query?: string; // 额外的查询条件
  } = {}): Promise<NewsApiResponse> {
    const cacheKey = `bbc:${JSON.stringify(options)}`;
    const cached = CacheManager.get<NewsApiResponse>(cacheKey);
    if (cached) {
      console.debug('从缓存返回BBC新闻:', cacheKey);
      return cached;
    }
    
    try {
      const params: any = {
        sources: 'bbc-news,bbc-sport',
        pageSize: options.pageSize || 20,
        page: options.page || 1,
        from: options.dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 默认过去一周
      };
      
      // 如果有额外查询条件，加入到参数中
      if (options.query) {
        params.q = options.query;
      }
      
      const response = await httpClient.get<NewsApiResponse>(
        `${NEWS_API_CONFIG.baseUrl}/everything`,
        params
      );
      
      // 处理文章数据
      response.articles = response.articles.map((article) => ({
        ...article,
        source: article.source || { id: 'bbc-news', name: 'BBC News' }
      }));
      
      // 使用搜索结果缓存时间
      CacheManager.set(cacheKey, response, CACHE_CONFIG.searchResults);
      return response;
    } catch (error) {
      console.error('搜索BBC新闻失败:', error);
      return {
        status: 'error',
        totalResults: 0,
        articles: []
      };
    }
  }
  
  /**
   * 获取新闻分类
   * 优化：使用长时间缓存
   */
  getCategories(): NewsCategory[] {
    // 尝试从缓存获取，如果没有则返回默认值
    const cacheKey = 'categories';
    const cached = CacheManager.get<NewsCategory[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const categories: NewsCategory[] = [
      { id: 'business', name: '商业', description: '商业新闻' },
      { id: 'entertainment', name: '娱乐', description: '娱乐新闻' },
      { id: 'general', name: '综合', description: '综合新闻' },
      { id: 'health', name: '健康', description: '健康新闻' },
      { id: 'science', name: '科学', description: '科技新闻' },
      { id: 'sports', name: '体育', description: '体育新闻' },
      { id: 'technology', name: '科技', description: '技术新闻' }
    ];
    
    // 缓存分类信息
    CacheManager.set(cacheKey, categories, CACHE_CONFIG.categories);
    return categories;
  }
  
  /**
   * 获取新闻源列表
   * 优化：使用长时间缓存
   */
  async getSources(options: {
    category?: string;
    language?: string;
    country?: string;
  } = {}): Promise<NewsSourceResponse> {
    const cacheKey = `sources:${JSON.stringify({...options, apiKey: null})}`;
    const cached = CacheManager.get<NewsSourceResponse>(cacheKey);
    if (cached) {
      console.debug('从缓存返回新闻源:', cacheKey);
      return cached;
    }
    
    try {
      const response = await httpClient.get<NewsSourceResponse>(
        `${NEWS_API_CONFIG.baseUrl}/sources`,
        {
          category: options.category,
          language: options.language || 'zh',
          country: options.country || 'cn'
        }
      );
      
      // 使用长时间缓存
      CacheManager.set(cacheKey, response, CACHE_CONFIG.sources);
      return response;
    } catch (error) {
      console.error('获取新闻源列表失败:', error);
      return {
        status: 'error',
        sources: []
      };
    }
  }
  
  /**
   * 根据ID获取特定新闻
   */
  async getArticleById(articleId: string): Promise<NewsArticle | null> {
    // 这里需要根据实际的API来实现
    // NewsAPI没有根据ID获取文章的接口，所以需要其他方式
    console.warn('根据ID获取新闻功能需要额外实现');
    return null;
  }
  
  /**
   * 收藏新闻
   */
  async collectArticle(article: NewsArticle, tags: string[] = []): Promise<NewsCollectionItem> {
    const collectionItem: NewsCollectionItem = {
      id: `collected_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      article,
      collectedAt: new Date().toISOString(),
      tags,
      isRead: false,
      isFavorite: true
    };
    
    // 这里应该保存到持久化存储
    // 暂时保存到localStorage
    try {
      const collection = this.getCollection();
      collection.items.push(collectionItem);
      collection.total = collection.items.length;
      collection.lastUpdated = new Date().toISOString();
      localStorage.setItem('newsCollection', JSON.stringify(collection));
    } catch (error) {
      console.error('收藏新闻失败:', error);
    }
    
    return collectionItem;
  }
  
  /**
   * 获取收藏的新闻
   */
  getCollection(): NewsCollectionState {
    try {
      const stored = localStorage.getItem('newsCollection');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    }
    
    return {
      items: [],
      total: 0,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * 标记新闻为已读
   */
  async markAsRead(articleId: string): Promise<void> {
    try {
      const collection = this.getCollection();
      const item = collection.items.find(item => item.article.url === articleId);
      if (item) {
        item.isRead = true;
        localStorage.setItem('newsCollection', JSON.stringify(collection));
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    CacheManager.clear();
  }
  
  /**
   * 获取API使用统计
   */
  getApiUsageStats() {
    return ApiLimitManager.getStats();
  }
  
  /**
   * 格式化新闻发布时间
   */
  formatPublishTime(publishedAt: string): string {
    const date = new Date(publishedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }
  
  /**
   * 提取新闻摘要
   */
  extractSummary(content: string | null, maxLength: number = 150): string {
    if (!content) return '';
    
    // 移除HTML标签
    const cleanContent = content.replace(/<[^>]*>/g, '');
    
    // 截取摘要
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    
    return cleanContent.substring(0, maxLength) + '...';
  }
  
  /**
   * 获取备用新闻（当API调用失败时）
   */
  private getFallbackArticles(): NewsArticle[] {
    // 尝试从缓存中获取最近的新闻作为备用
    const allCachedKeys = Array.from(memoryCache.keys());
    for (const key of allCachedKeys) {
      if (key.startsWith('topHeadlines:') || key.startsWith('search:')) {
        const cachedData = memoryCache.get(key);
        if (cachedData && typeof cachedData === 'object' && 'data' in cachedData) {
          const data = cachedData.data as any;
          if (data && data.articles && data.articles.length > 0) {
            console.debug('使用备用新闻数据');
            return data.articles.slice(0, 5); // 返回最近的5篇文章
          }
        }
      }
    }
    
    // 如果没有缓存数据，返回空数组
    return [];
  }
}

// 导出单例实例
export const newsService = new NewsService();

// 导出类型
export type { NewsService };