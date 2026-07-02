import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

/** 编辑器暗色主题（含 Notification 等全局反馈组件） */
export const editorAntdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: '#161922',
    colorBgElevated: '#1e2129',
    colorBorder: '#343848',
    colorText: '#e5e7eb',
    colorTextSecondary: '#9ca3af',
    colorTextPlaceholder: '#6b7280',
    borderRadius: 8,
    fontSize: 12,
    colorSuccess: '#22c55e',
    colorError: '#ef4444',
    colorWarning: '#f59e0b',
    colorInfo: '#3b82f6',
  },
  components: {
    Notification: {
      colorBgElevated: '#1e2129',
      colorText: '#e5e7eb',
      colorTextHeading: '#f9fafb',
      colorIcon: '#93c5fd',
      colorIconHover: '#bfdbfe',
      paddingMD: 12,
      paddingContentHorizontalLG: 16,
    },
    Select: {
      selectorBg: '#161922',
      colorBgElevated: '#1e2129',
      optionSelectedBg: '#343b4d',
      optionActiveBg: '#2a3040',
      controlHeight: 28,
      fontSize: 12,
    },
    Input: {
      colorBgContainer: '#161922',
      controlHeight: 28,
      fontSize: 12,
    },
    InputNumber: {
      colorBgContainer: '#161922',
      controlHeight: 28,
      fontSize: 12,
    },
    Button: {
      controlHeight: 32,
      fontSize: 12,
    },
    Slider: {
      trackBg: '#4b5563',
      trackHoverBg: '#6b7280',
      railBg: '#2a3040',
      handleColor: '#93c5fd',
    },
    Switch: {
      colorPrimary: '#22c55e',
    },
    Modal: {
      contentBg: '#1c1f28',
      headerBg: '#1c1f28',
      titleColor: '#f3f4f6',
    },
  },
};
