# 组件使用说明

## 项目概述
本项目是一个新闻聚合与音乐播放系统的仪表盘应用，采用 React 19 + Vite 6 + TypeScript 5.6 技术栈，并使用 CSS Modules 进行样式管理。

## 组件结构

### 公共基础组件 (src/components/Base/)
- **Button** - 通用按钮组件，支持多种类型、尺寸和状态
  - Props: type, size, disabled, loading, fullWidth
  - 样式: 科技蓝主题设计
- **Input** - 输入框组件，支持前缀、后缀和多种输入类型
  - Props: type, placeholder, value, onChange, size
  - 样式: 深色主题输入框
- **Loading** - 加载指示器组件，支持全屏和多种尺寸
  - Props: size, text, fullScreen
  - 样式: 带旋转动画效果
- **Empty** - 空状态占位组件，用于无数据场景
  - Props: image, title, description, action
  - 样式: 简洁的空状态展示

### 核心业务组件 (src/components/Business/)
- **MusicPlayer** - 音乐播放器组件，已绑定 Music 相关类型定义
  - Props: currentTrack, playerState, onPlay, onPause, onNext, onPrev
  - 功能: 播放控制、进度显示、音量调节
- **CollectionManager** - 新闻收藏管理组件，支持搜索和增删改查
  - Props: initialItems, onCollectionChange
  - 功能: 收藏管理、搜索筛选、批量操作
- **SystemSetting** - 系统设置面板组件，包含主题、通知等配置
  - Props: initialSettings, onSave
  - 功能: 主题切换、通知设置、语言配置

### 业务功能组件 (src/components/)
- **NewsList** - 新闻列表展示组件
  - 功能: 新闻分类、搜索、分页展示
- **NewsDetail** - 新闻详情页组件
  - 功能: 新闻内容展示、收藏功能
- **MusicVisualizer** - 音乐可视化组件
  - 功能: 音乐频谱可视化展示
- **Plate** - 仪表盘面板装饰组件
  - 功能: 提供统一的面板外观
- **ApiUsageMonitor** - API使用量监控组件
  - 功能: 实时监控API调用情况

## 使用示例

### 基础组件使用
```jsx
import Button from './src/components/Base/Button';
import Input from './src/components/Base/Input';

// 按钮组件
<Button type="primary" size="medium" onClick={handleClick}>
  确认
</Button>

// 输入框组件
<Input 
  type="text" 
  placeholder="请输入内容" 
  value={inputValue} 
  onChange={handleChange} 
/>
```

### 业务组件使用
```jsx
import MusicPlayer from './src/components/Business/MusicPlayer';
import CollectionManager from './src/components/Business/CollectionManager';

// 音乐播放器
<MusicPlayer 
  currentTrack={currentTrack}
  playerState={playerState}
  onPlay={handlePlay}
  onPause={handlePause}
/>

// 收藏管理器
<CollectionManager 
  initialItems={collectionItems}
  onCollectionChange={handleCollectionChange}
/>
```

## 样式规范
- 所有组件使用 CSS Modules 进行样式隔离
- 遵循深色主题设计，主色调为科技蓝(#00f2ff)
- 组件样式文件统一存放在 styles/ 目录下
- 按组件类型分类存放(Base/Business/等)

## 类型定义
- 所有组件使用 TypeScript 严格类型定义
- 类型定义文件存放在 types/ 目录
- 主要类型定义在 types/index.ts 中导出