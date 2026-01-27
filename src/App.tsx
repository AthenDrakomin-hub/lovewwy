import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
// 导入业务服务 + 类型定义（移除 any，使用强类型）
import { newsService } from '@/services/newsService';
import type { NewsArticle } from '@/types/news';
// 导入子组件（均已适配 CSS Modules）
import NewsList from '@/components/Business/NewsList';
import MusicVisualizer from '@/components/Business/MusicVisualizer';
import MusicPlayer from '@/components/Business/MusicPlayer';
import CollectionManager from '@/components/Business/CollectionManager';
import SystemSetting from '@/components/Business/SystemSetting';
import Plate from '@/components/Business/Plate';
import ApiUsageMonitor from '@/components/Business/ApiUsageMonitor';
import NewsDetail from '@/components/Business/NewsDetail';
import VideoPlayer from '@/components/Business/VideoPlayer';
// 关键修改：CSS Modules 赋值导入 styles 对象（替代全局 CSS）
import styles from '@/styles/App.module.css';

// 主应用组件
function MainApp() {
  console.log('MainApp mounted');
  const navigate = useNavigate();
  
  // 添加视频页面导航功能
  const goToVideo = () => {
    navigate('/video');
  };
  
  const goToNews = () => {
    navigate('/');
  };
  
  // 系统节点状态
  const [nodeStatus, setNodeStatus] = useState('System_IDLE');
  // 信号强度状态
  const [signalStrength, setSignalStrength] = useState<'NO_SIGNAL' | 'WEAK' | 'MODERATE' | 'STRONG'>('NO_SIGNAL');
  // 实时时间
  const [currentTime, setCurrentTime] = useState(new Date());
  // 新闻类型（与 NewsList 联动）
  const [newsType, setNewsType] = useState<'general' | 'trump' | 'bbc' | 'china-us-market'>('general');

  // 定时器：实时更新时间 + 模拟节点状态变化（含清除，避免内存泄漏）
  React.useEffect(() => {
    // 更新时间定时器
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 模拟节点状态变化定时器
    const statusTimer = setInterval(() => {
      setNodeStatus(prev => prev === 'System_IDLE' ? 'Processing' : 'System_IDLE');
    }, 10000);

    // 关键修复2：清除所有定时器，避免组件卸载后内存泄漏
    return () => {
      clearInterval(timeTimer);
      clearInterval(statusTimer);
    };
  }, []);

  // 定时器：模拟信号强度变化（原代码缺失清除，已修复）
  React.useEffect(() => {
    const signalTimer = setInterval(() => {
      const signals: ('NO_SIGNAL' | 'WEAK' | 'MODERATE' | 'STRONG')[] = ['NO_SIGNAL', 'WEAK', 'MODERATE', 'STRONG'];
      setSignalStrength(signals[Math.floor(Math.random() * signals.length)]);
    }, 5000);

    // 关键修复3：清除信号定时器，避免内存泄漏
    return () => clearInterval(signalTimer);
  }, []);

  // 新闻项选择：跳转到详情页
  const handleArticleSelect = (article: NewsArticle) => {
    // 将文章存储在sessionStorage中，以便在路由中访问
    const articleId = encodeURIComponent(btoa(JSON.stringify(article))); // base64编码
    sessionStorage.setItem(`news-article-${articleId}`, JSON.stringify(article));
    navigate(`/news/${articleId}`);
  };

  // 快速切换新闻类型（与左侧终端、NewsList 联动）
  const handleNewsTypeChange = (type: 'general' | 'trump' | 'bbc' | 'china-us-market') => {
    setNewsType(type);
    navigate('/'); // 导航到新闻列表
  };

  return (
    <div className={styles.app}>
      {/* 顶部状态栏：节点/信号/时间 */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>节点:</span>
          {/* 动态拼接模块化状态类，实现样式切换 */}
          <span className={`${styles.statusValue} ${styles[nodeStatus.toLowerCase()]}`}>
            {nodeStatus === 'System_IDLE' ? '系统待机' : '处理中'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>信号:</span>
          {/* 动态拼接信号强度样式类 */}
          <span className={`${styles.statusValue} ${styles[`signal${signalStrength.replace('_', '')}`]}`}>
            {signalStrength === 'NO_SIGNAL' ? '无信号' : 
             signalStrength === 'WEAK' ? '弱信号' : 
             signalStrength === 'MODERATE' ? '中等信号' : '强信号'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>时间:</span>
          <span className={styles.statusValue}>
            {currentTime.toLocaleTimeString('zh-CN')}
          </span>
        </div>
        <div className={styles.statusItem}>
          {/* API使用监控组件 */}
          <ApiUsageMonitor />
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* 侧边栏 - 添加导航链接 */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <h3>系统控制台</h3>
            
            {/* 新增：页面导航菜单 */}
            <div className={styles.sidebarSection}>
              <h4>页面导航</h4>
              <div className={styles.navLinks}>
                <Link to="/" className={styles.navLink}>
                  📰 新闻列表
                </Link>
                <Link to="/collection" className={styles.navLink}>
                  ⭐ 我的收藏
                </Link>
                <Link to="/settings" className={styles.navLink}>
                  ⚙️ 系统设置
                </Link>
              </div>
            </div>
            
            <div className={styles.sidebarSection}>
              <h4>快速访问</h4>
              <div className={styles.quickLinks}>
                <button 
                  className={`${styles.quickLinkBtn} ${newsType === 'trump' ? styles.active : ''}`}
                  onClick={() => handleNewsTypeChange('trump')}
                >
                  特朗普新闻
                </button>
                <button 
                  className={`${styles.quickLinkBtn} ${newsType === 'bbc' ? styles.active : ''}`}
                  onClick={() => handleNewsTypeChange('bbc')}
                >
                  BBC新闻
                </button>
                <button 
                  className={`${styles.quickLinkBtn} ${newsType === 'china-us-market' ? styles.active : ''}`}
                  onClick={() => handleNewsTypeChange('china-us-market')}
                >
                  中美金融
                </button>
              </div>
            </div>
            
            <div className={styles.sidebarSection}>
              <h4>音乐控制</h4>
              <MusicVisualizer />
              <MusicPlayer 
                currentTrack={{ 
                  id: 'demo', 
                  name: '演示音乐', 
                  artist: '艺术家', 
                  album: '演示专辑',
                  duration: 180,
                  url: '#',
                  platform: 'wy',
                  platformName: '网易云音乐'
                }}
                playerState={{ 
                  currentTrack: null,
                  isPlaying: false, 
                  volume: 0.5, 
                  currentTime: 0, 
                  duration: 180,
                  playbackRate: 1.0,
                  isMuted: false,
                  repeatMode: 'off',
                  shuffle: false
                }}
              />
            </div>
            
            <div className={styles.sidebarSection}>
              <h4>系统状态</h4>
              <div className={styles.systemStatus}>
                <div className={styles.statusRow}>
                  <span>节点状态:</span>
                  <span className={`${styles.statusText} ${styles[nodeStatus.toLowerCase()]}`}>
                    {nodeStatus === 'System_IDLE' ? '待机' : '运行'}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span>信号强度:</span>
                  <span className={`${styles.statusText} ${styles[`signal${signalStrength.replace('_', '')}`]}`}>
                    {signalStrength === 'NO_SIGNAL' ? '无' : 
                     signalStrength === 'WEAK' ? '弱' : 
                     signalStrength === 'MODERATE' ? '中' : '强'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区 - 使用 Outlet 渲染路由页面 */}
        <div className={styles.mainContentArea}>
          <div className={styles.contentHeader}>
            <h1>新闻聚合与音乐视频播放系统</h1>
            <div className={styles.viewControls}>
              <button className={styles.navButton} onClick={goToNews}>新闻</button>
              <button className={styles.navButton} onClick={goToVideo}>视频</button>
            </div>
          </div>
          
          <div className={styles.contentArea}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainApp;