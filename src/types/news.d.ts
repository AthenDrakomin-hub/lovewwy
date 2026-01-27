/**
 * 新闻API响应数据结构
 * 基于NewsAPI的响应格式定义
 */

export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsArticle {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsApiResponse {
  status: 'ok' | 'error';
  totalResults: number;
  articles: NewsArticle[];
  code?: string;
  message?: string;
}

export interface NewsSearchQuery {
  q?: string; // 关键词
  sources?: string; // 新闻源
  domains?: string; // 域名
  excludeDomains?: string; // 排除域名
  from?: string; // 开始日期
  to?: string; // 结束日期
  language?: string; // 语言
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt'; // 排序方式
  pageSize?: number; // 每页数量
  page?: number; // 页码
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
}

export interface NewsSourceInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

export interface NewsSourceResponse {
  status: 'ok' | 'error';
  sources: NewsSourceInfo[];
  code?: string;
  message?: string;
}

export interface NewsCollectionItem {
  id: string;
  article: NewsArticle;
  collectedAt: string;
  tags: string[];
  isRead: boolean;
  isFavorite: boolean;
}

export interface NewsCollectionState {
  items: NewsCollectionItem[];
  total: number;
  lastUpdated: string;
}