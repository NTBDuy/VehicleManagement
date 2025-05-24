import Toast, { ToastType } from 'react-native-toast-message';

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom';
}

export interface SimpleToastOptions {
  message: string;
  duration?: number;
  type?: ToastType;
}

export const showToast = {
  success: (title: string, message?: string, duration: number = 3000) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration,
      topOffset: 168
    });
  },

  error: (title: string, message?: string, duration: number = 4000) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      topOffset: 72
    });
  },

  info: (title: string, message?: string, duration: number = 3000) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      topOffset: 168
    });
  },

  warning: (title: string, message?: string, duration: number = 3000) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      topOffset: 168
    });
  },

  simple: (message: string, duration: number = 2000, type: ToastType = 'success') => {
    Toast.show({
      type,
      text1: message,
      visibilityTime: duration,
      topOffset: 168
    });
  },

  show: (options: ToastOptions & { type: ToastType }) => {
    Toast.show({
      type: options.type,
      text1: options.title,
      text2: options.message,
      visibilityTime: options.duration || 3000,
      position: options.position || 'top',
      topOffset: 168
    });
  },

  hide: () => {
    Toast.hide();
  }
};

export type { ToastType } from 'react-native-toast-message';