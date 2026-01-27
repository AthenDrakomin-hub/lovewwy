/**
 * 系统设置组件
 * 提供应用的各种配置选项，如主题、通知、隐私设置等
 */
import React, { useState } from 'react';
import Button from '@/components/Base/Button';
import Input from '@/components/Base/Input';
import styles from '@/styles/Business/SystemSetting.module.css';

interface SettingOption {
  key: string;
  label: string;
  type: 'toggle' | 'select' | 'input' | 'slider';
  value: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

interface SystemSettingProps {
  initialSettings?: Record<string, any>;
  onSave?: (settings: Record<string, any>) => void;
}

const SystemSetting: React.FC<SystemSettingProps> = ({
  initialSettings = {},
  onSave,
}) => {
  const [settings, setSettings] = useState<Record<string, any>>({
    theme: initialSettings.theme || 'dark',
    notifications: initialSettings.notifications ?? true,
    autoRefresh: initialSettings.autoRefresh ?? true,
    refreshInterval: initialSettings.refreshInterval || 30,
    language: initialSettings.language || 'zh-CN',
    fontSize: initialSettings.fontSize || 14,
    ...initialSettings,
  });

  const settingOptions: SettingOption[] = [
    {
      key: 'theme',
      label: '主题模式',
      type: 'select',
      value: settings.theme,
      options: [
        { label: '深色', value: 'dark' },
        { label: '浅色', value: 'light' },
        { label: '自动', value: 'auto' },
      ],
    },
    {
      key: 'notifications',
      label: '接收通知',
      type: 'toggle',
      value: settings.notifications,
    },
    {
      key: 'autoRefresh',
      label: '自动刷新新闻',
      type: 'toggle',
      value: settings.autoRefresh,
    },
    {
      key: 'refreshInterval',
      label: '刷新间隔（秒）',
      type: 'slider',
      value: settings.refreshInterval,
      min: 10,
      max: 300,
      step: 10,
    },
    {
      key: 'language',
      label: '语言',
      type: 'select',
      value: settings.language,
      options: [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
      ],
    },
    {
      key: 'fontSize',
      label: '字体大小',
      type: 'slider',
      value: settings.fontSize,
      min: 12,
      max: 20,
      step: 1,
    },
  ];

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave?.(settings);
    alert('设置已保存！');
  };

  const renderControl = (option: SettingOption) => {
    switch (option.type) {
      case 'toggle':
        return (
          <Button
            type={option.value ? 'primary' : 'default'}
            size="small"
            onClick={() => handleChange(option.key, !option.value)}
          >
            {option.value ? '开启' : '关闭'}
          </Button>
        );
        
      case 'select':
        return (
          <select
            className={styles.selectInput}
            value={option.value}
            onChange={(e) => handleChange(option.key, e.target.value)}
          >
            {option.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
        
      case 'slider':
        return (
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min={option.min}
              max={option.max}
              step={option.step}
              value={option.value}
              onChange={(e) => handleChange(option.key, Number(e.target.value))}
              className={styles.sliderInput}
            />
            <span className={styles.sliderValue}>{option.value}</span>
          </div>
        );
        
      case 'input':
        return (
          <Input
            value={option.value}
            onChange={(e) => handleChange(option.key, e.target.value)}
            size="small"
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={styles.settingContainer}>
      <h3 className={styles.settingTitle}>⚙️ 系统设置</h3>
      
      <div className={styles.settingList}>
        {settingOptions.map((option) => (
          <div key={option.key} className={styles.settingItem}>
            <div className={styles.settingLabel}>{option.label}</div>
            <div className={styles.settingControl}>
              {renderControl(option)}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.settingActions}>
        <Button type="secondary" size="medium" onClick={() => setSettings(initialSettings)}>
          重置
        </Button>
        <Button type="primary" size="medium" onClick={handleSave}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default SystemSetting;