/**
 * 视频播放器组件
 * 支持多种视频格式播放，集成S3存储
 */
import React, { useState, useRef, useEffect } from 'react';
import styles from '@/styles/Business/VideoPlayer.module.css';

interface VideoSource {
  src: string;
  type: string;
  title: string;
}

interface VideoPlayerProps {
  sources?: VideoSource[];
  videoId?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sources = [],
  videoId,
  autoPlay = false,
  controls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={styles.videoPlayer}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          controls={false}
          className={styles.videoElement}
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          您的浏览器不支持视频播放。
        </video>
        
        {controls && (
          <div className={styles.controls}>
            <div className={styles.transportControls}>
              <button 
                className={styles.controlButton} 
                onClick={togglePlay}
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <div className={styles.progressContainer}>
                <span className={styles.time}>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className={styles.progressBar}
                />
                <span className={styles.time}>{formatTime(duration)}</span>
              </div>
            </div>
            
            <div className={styles.settingsControls}>
              <button 
                className={styles.controlButton} 
                onClick={toggleMute}
                aria-label={isMuted ? '取消静音' : '静音'}
              >
                {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
              
              <select 
                value={playbackRate} 
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className={styles.rateSelector}
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
              
              <button 
                className={styles.controlButton} 
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? '退出全屏' : '全屏'}
              >
                {isFullscreen ? '⛶' : '⛶'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.videoInfo}>
        <h4>视频播放器</h4>
        <p>支持从S3存储加载视频内容</p>
      </div>
    </div>
  );
};

export default VideoPlayer;