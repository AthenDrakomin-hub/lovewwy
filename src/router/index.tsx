import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import NewsListPage from '../pages/NewsListPage';
import NewsDetailPage from '../pages/NewsDetailPage';
import CollectionPage from '../pages/CollectionPage';
import SystemSettingPage from '../pages/SystemSettingPage';
import VideoPage from '../pages/VideoPage';

// 创建路由实例
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // 首页：新闻列表
      { index: true, element: <NewsListPage /> },
      // 新闻详情页（带动态参数articleId）
      { path: 'news/:articleId', element: <NewsDetailPage /> },
      // 我的收藏页
      { path: 'collection', element: <CollectionPage /> },
      // 系统设置页
      { path: 'settings', element: <SystemSettingPage /> },
      // 视频中心页
      { path: 'video', element: <VideoPage /> },
    ],
  },
], {
  // 启用basename以确保在子路径下也能正确工作
  basename: '',
});