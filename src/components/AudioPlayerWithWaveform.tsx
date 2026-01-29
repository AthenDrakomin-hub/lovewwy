import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerWithWaveformProps {
  url: string;
  title?: string;
}

const AudioPlayerWithWaveform: React.FC<AudioPlayerWithWaveformProps> = ({ 
  url, 
  title = '音频文件' 
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (waveformRef.current) {
      // 初始化 WaveSurfer
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#93C5FD', // 浅蓝色波形
        progressColor: '#3B82F6', // 进度颜色
        cursorColor: '#1E40AF', // 游标颜色
        height: 100,
        barWidth: 3,
        barGap: 2,
        url: url,
      });

      // 加载完成后设置持续时间
      wavesurferRef.current.on('ready', () => {
        setIsLoading(false);
        setDuration(wavesurferRef.current.getDuration());
      });

      // 播放状态变化
      wavesurferRef.current.on('play', () => {
        setIsPlaying(true);
      });

      wavesurferRef.current.on('pause', () => {
        setIsPlaying(false);
      });

      // 时间更新
      wavesurferRef.current.on('audioprocess', () => {
        setCurrentTime(wavesurferRef.current.getCurrentTime());
      });

      // 错误处理
      wavesurferRef.current.on('error', (err: any) => {
        setError(err.message || '加载音频时出错');
        setIsLoading(false);
      });

      // 清理函数
      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, [url]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (wavesurferRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const time = percent * duration;
      wavesurferRef.current.seekTo(time / duration);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 truncate max-w-xs" title={title}>
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !!error}
            className={`p-2 rounded-full ${
              isLoading || error
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-red-500 text-sm p-4 text-center">
          <p>音频加载失败: {error}</p>
          <p className="mt-1">请检查音频 URL 是否有效</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div 
            ref={waveformRef} 
            className="w-full h-24 mb-3 cursor-pointer"
            onClick={handleSeek}
          />
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayerWithWaveform;