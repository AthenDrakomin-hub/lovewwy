/**
 * 音乐播放器核心骨架
 * 已绑定项目Music相关类型，后续填充播放/暂停/切歌等逻辑
 */
import React from 'react';
import type { MusicTrack, MusicPlayerState } from '@/types/music';
import Button from '@/components/Base/Button';
import styles from '@/styles/Business/MusicPlayer.module.css';

interface MusicPlayerProps {
  currentTrack: MusicTrack | null; // 当前播放歌曲
  playerState: MusicPlayerState; // 播放器状态（播放/暂停/音量等）
  onPlay?: (track: MusicTrack) => void; // 播放回调
  onPause?: () => void; // 暂停回调
  onNext?: () => void; // 下一曲回调
  onPrev?: () => void; // 上一曲回调
  onVolumeChange?: (volume: number) => void; // 音量调整回调
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack = null,
  playerState,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onVolumeChange,
}) => {
  // 后续填充播放/暂停逻辑
  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      onPause?.();
    } else if (currentTrack) {
      onPlay?.(currentTrack);
    }
  };

  if (!currentTrack) {
    return (
      <div className={styles.playerContainer}>
        <p className={styles.noTrackText}>暂无播放歌曲，快去选择吧~</p>
      </div>
    );
  }

  return (
    <div className={styles.playerContainer}>
      {/* 歌曲信息 */}
      <div className={styles.trackInfo}>
        <h4 className={styles.trackTitle}>{currentTrack.name}</h4>
        <p className={styles.trackArtist}>{currentTrack.artist}</p>
      </div>
      {/* 播放控制 */}
      <div className={styles.playControls}>
        <Button size="small" onClick={onPrev} disabled={!currentTrack}>
          ←
        </Button>
        <Button type="primary" size="medium" onClick={handlePlayPause}>
          {playerState.isPlaying ? '暂停' : '播放'}
        </Button>
        <Button size="small" onClick={onNext} disabled={!currentTrack}>
          →
        </Button>
      </div>
      {/* 进度条+音量（后续填充） */}
      <div className={styles.progressVolume}>
        <div className={styles.progressBar}></div>
        <Button size="small" onClick={() => onVolumeChange?.(playerState.volume + 10)}>
          🔊
        </Button>
      </div>
    </div>
  );
};

export default MusicPlayer;