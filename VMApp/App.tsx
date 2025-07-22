/** @jsxImportSource nativewind */
import '@/i18n';
import './global.css';

import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { toastConfig } from 'config/toastConfig';
import { AuthProvider } from 'contexts/AuthContext';
import { KeyboardAvoidingView, Platform, SafeAreaView, Text, Button } from 'react-native';
import { usePreloadAssets } from '@/hooks/usePreloadAssets';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AppContent from 'navigation/AppNavigator';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { showToast } from './utils/toast';
import LoadingData from './components/ui/LoadingData';
import ConnectionErrorScreen from './components/ui/ConnectionErrorScreen';

/**
 * Khởi tạo QueryClient với các cấu hình mặc định để tối ưu hiệu năng và trải nghiệm người dùng.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Thời gian dữ liệu được xem là "mới" (không cần refetch).
       * Trong vòng 2 phút kể từ lần fetch gần nhất, dữ liệu sẽ không được refetch.
       */
      staleTime: 1000 * 60 * 2,

      /**
       * Thời gian dữ liệu được lưu trong cache sau khi không còn được dùng.
       * Sau 10 phút không được sử dụng, dữ liệu sẽ bị loại bỏ khỏi cache.
       */
      cacheTime: 1000 * 60 * 10,

      /**
       * Số lần thử lại khi request thất bại (do lỗi mạng/server).
       */
      retry: 2,

      /**
       * Hàm tính delay giữa các lần retry.
       * Áp dụng exponential backoff, giới hạn tối đa 10 giây.
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

      /**
       * Tự động refetch khi kết nối internet bị mất rồi được khôi phục.
       */
      refetchOnReconnect: true,

      /**
       * Không tự động refetch mỗi khi component mount.
       */
      refetchOnMount: false,
    },
    mutations: {
      /**
       * Số lần retry cho mutation khi gặp lỗi.
       */
      retry: 1,
    },
  },
} as QueryClientConfig);

/**
 * Kiểm tra kết nối tới server (Back-end API) có thành công hay không.
 */
const isConnected = async (): Promise<boolean> => {
  try {
    let gateway = await AsyncStorage.getItem('gateway');

    if (!gateway) {
      gateway = '192.168.2.103:8018';
      await AsyncStorage.setItem('gateway', gateway);
      console.warn('Dùng gateway mặc định:', gateway);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`http://${gateway}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('API (health check): ', response.status);
    return response.ok;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Kết nối tới server bị timeout');
    } else {
      console.error('Lỗi kết nối tới server:', error);
    }
    return false;
  }
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  usePreloadAssets();

  useEffect(() => {
    const checkConnection = async () => {
      const ok = await isConnected();
      if (!ok) {
        showToast.error('Không thể kết nối tới server');
        setHasError(true);
      } else {
        setIsReady(true);
      }
    };

    checkConnection();
  }, []);

  const handleRetry = async () => {
    setHasError(false);
    setIsReady(false);
    const ok = await isConnected();
    if (ok) {
      setIsReady(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return <ConnectionErrorScreen onRetry={handleRetry} />;
  }

  if (!isReady) {
    return <LoadingData />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <AuthProvider>
          <AppContent />
          <Toast config={toastConfig} />
        </AuthProvider>
      </KeyboardAvoidingView>
    </QueryClientProvider>
  );
}
