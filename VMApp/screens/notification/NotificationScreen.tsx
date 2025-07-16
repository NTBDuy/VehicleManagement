import {
  faListCheck
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FlashList } from '@shopify/flash-list';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { NotificationService } from 'services/notificationService';
import { UserService } from 'services/userService';
import { formatTime } from 'utils/datetimeUtils';
import { showToast } from 'utils/toast';

import Notification from 'types/Notification';

import Header from '@/components/layout/HeaderComponent';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';
import {
  getNotificationBackgroundColor,
  getNotificationBorderColor,
  getNotificationIcon,
} from '@/utils/notificationUtils';

const NotificationScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotificationData();
    }
  }, [user]);

  const fetchNotificationData = async () => {
    try {
      setIsLoading(true);
      const data = await UserService.getUserNotifications();
      setUserNotifications(data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  const NotificationIcon = ({ type }: { type: string }) => {
    const bgColor = getNotificationBackgroundColor(type);
    const icon = getNotificationIcon(type);

    return (
      <View className={`h-10 w-10 rounded-full ${bgColor} items-center justify-center`}>
        <FontAwesomeIcon icon={icon} color="#fff" size={20} />
      </View>
    );
  };

  const handleMakeRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await NotificationService.makeRead(notification.notificationId);
      setUserNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
        )
      );
      showToast.success(t('notification.markReadSuccess'));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showToast.error(t('notification.markReadError'));
    }
  };

  const handleMakeAllRead = async () => {
    const unreadNotifications = userNotifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      await NotificationService.makeAllRead();
      setUserNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, isRead: true }))
      );
      showToast.success(t('notification.markAllReadSuccess'));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificationData();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleMakeRead(item)}
      className={`mb-3 rounded-xl border-l-4 bg-white p-4 ${getNotificationBorderColor(item.type)} shadow-sm ${
        !item.isRead ? 'bg-slate-50' : ''
      }`}
      activeOpacity={0.7}>
      <View className="flex-row items-start">
        <NotificationIcon type={item.type} />

        <View className="ml-3 flex-1">
          <Text className="mb-3 text-base leading-6 text-gray-800">{item.message}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{formatTime(item.createdAt)}</Text>
            {!item.isRead && (
              <View className="flex-row items-center">
                <View className="mr-1.5 h-2 w-2 rounded-full bg-blue-500" />
                <Text className="text-xs font-semibold text-blue-600">
                  {t('notification.unread')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('notification.title')}
        backBtn
        rightElement={
          <TouchableOpacity
            onPress={handleMakeAllRead}
            className="rounded-full bg-white p-2 shadow-sm">
            <FontAwesomeIcon icon={faListCheck} size={18} color="#374151" />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <LoadingData />
      ) : (
        <View className="mx-6 flex-1">
          <FlashList
            data={userNotifications}
            keyExtractor={(item) => item.notificationId.toString()}
            renderItem={renderNotificationItem}
            ListEmptyComponent={<EmptyList title={t('notification.empty')} />}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="py-4"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            estimatedItemSize={90}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
