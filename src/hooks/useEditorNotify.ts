import { App } from 'antd';
import type { ArgsProps } from 'antd/es/notification';

const NOTIFY_DEFAULTS: Partial<ArgsProps> = {
  placement: 'bottomRight',
  duration: 3.5,
  showProgress: true,
};

export type EditorNotifyApi = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

/** 右下角 Notification（需在 AntApp 内使用） */
export function useEditorNotify(): EditorNotifyApi {
  const { notification } = App.useApp();

  const open = (type: NonNullable<ArgsProps['type']>, title: string, description?: string) => {
    notification[type]({
      ...NOTIFY_DEFAULTS,
      message: title,
      ...(description ? { description } : {}),
    });
  };

  return {
    success: (title, description) => open('success', title, description),
    error: (title, description) => open('error', title, description),
    warning: (title, description) => open('warning', title, description),
    info: (title, description) => open('info', title, description),
  };
}
