import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import AppContent from 'navigation/AppNavigator';
import './global.css';
import '@/i18n';
import { AuthProvider } from 'contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from 'config/toastConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Hàm gửi thông báo
async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'VMS',
    body: 'Chào mừng bạn!',
    data: { someData: 'Dữ liệu tùy chỉnh' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// Hàm đăng ký và lấy token push
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    alert('Phải dùng thiết bị thật để nhận thông báo!');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Không cấp quyền nhận thông báo!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('📲 Expo Push Token:', token);
  return token;
}

export default function App() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Đăng ký thông báo và gửi thử
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        sendPushNotification(token);
      }
    });

    // Lắng nghe khi app đang foreground và nhận thông báo
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Nhận được thông báo:', notification);
    });

    // Lắng nghe khi user nhấn vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Người dùng đã tương tác với thông báo:', response);
    });

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AuthProvider>
        <AppContent />
        <Toast config={toastConfig} />
      </AuthProvider>
    </KeyboardAvoidingView>
  );
}
