import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/Business/VideoPlayer';

const VideoPage: React.FC = () => {
  const navigate = useNavigate();

  // 更新页面标题
  useEffect(() => {
    document.title = '视频中心 - 新闻聚合与音乐视频播放系统';
    return () => {
      // 组件卸载时可选择恢复默认标题
    };
  }, []);

  return (
    <div className="page-container">
      <h2>🎬 视频中心</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>从S3存储加载的视频内容</p>
      </div>
      <VideoPlayer 
        sources={[
          { 
            src: 'https://example.com/sample-video.mp4', 
            type: 'video/mp4', 
            title: '示例视频' 
          }
        ]}
        controls={true}
      />
    </div>
  );
};

export default VideoPage;