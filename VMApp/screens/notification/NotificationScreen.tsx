import {
  faBell,
  faCarSide,
  faCheck,
  faListCheck,
  faTools,
  faWarning,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NotificationService } from 'services/notificationService';
import { UserService } from 'services/userService';
import { formatTime } from 'utils/datetimeUtils';
import { showToast } from 'utils/toast';

import Notification from 'types/Notification';

import EmptyList from '@/components/ui/EmptyListComponent';
import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';

const NotificationScreen = () => {
  const { user } = useAuth();
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      getNotificationsByUser();
    }
  }, [user]);

  const getNotificationsByUser = async () => {
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
    const getIconConfig = () => {
      switch (type) {
        case 'SendRequestSuccess':
          return { bgColor: 'bg-purple-500', icon: faCarSide };
        case 'RequestApproved':
          return { bgColor: 'bg-green-500', icon: faCheck };
        case 'VehicleReturned':
          return { bgColor: 'bg-green-500', icon: faCarSide };
        case 'RequestRejected':
          return { bgColor: 'bg-red-500', icon: faXmark };
        case 'RequestCancelled':
          return { bgColor: 'bg-orange-500', icon: faXmark };
        case 'NewRequestSubmitted':
          return { bgColor: 'bg-orange-500', icon: faCarSide };
        case 'VehicleInUse':
          return { bgColor: 'bg-orange-500', icon: faCarSide };
        case 'MaintenanceScheduled':
          return { bgColor: 'bg-blue-500', icon: faTools };
        case 'UserDeactivated':
          return { bgColor: 'bg-red-500', icon: faWarning };
        case 'RemindReturn':
          return { bgColor: 'bg-orange-500', icon: faWarning };
        case 'System':
          return { bgColor: 'bg-gray-500', icon: faBell };
        default:
          return { bgColor: 'bg-gray-500', icon: faBell };
      }
    };

    const iconConfig = getIconConfig();

    return (
      <View className={`h-10 w-10 rounded-full ${iconConfig.bgColor} items-center justify-center`}>
        <Text className="text-base font-bold text-white">
          <FontAwesomeIcon icon={iconConfig.icon} color="#fff" size={24} />
        </Text>
      </View>
    );
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'SendRequestSuccess':
        return 'border-l-purple-500';
      case 'RequestApproved':
        return 'border-l-green-500';
      case 'VehicleReturned':
        return 'border-l-green-500';
      case 'RequestRejected':
        return 'border-l-red-500';
      case 'RequestCancelled':
        return 'border-l-orange-500';
      case 'NewRequestSubmitted':
        return 'border-l-orange-500';
      case 'VehicleInUse':
        return 'border-l-orange-500';
      case 'MaintenanceScheduled':
        return 'border-l-blue-500';
      case 'UserDeactivated':
        return 'border-l-red-500';
      case 'RemindReturn':
        return 'border-l-orange-500';
      case 'System':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
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
      showToast.success('Success', 'Notification marked as read.');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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

      showToast.success('Success', 'All notifications marked as read.');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showToast.error('Error', 'Failed to mark all as read.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getNotificationsByUser();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleMakeRead(item)}
      className={`mb-3 rounded-xl border-l-4 bg-white p-4 ${getBorderColor(item.type)} shadow-sm ${
        !item.isRead ? 'bg-slate-50' : ''
      }`}
      activeOpacity={0.7}>
      <View className="flex-row items-start">
        <NotificationIcon type={item.type} />

        <View className="flex-1 ml-3">
          <Text className="mb-3 text-base leading-6 text-gray-800">{item.message}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{formatTime(item.createdAt)}</Text>
            {!item.isRead && (
              <View className="flex-row items-center">
                <View className="mr-1.5 h-2 w-2 rounded-full bg-blue-500" />
                <Text className="text-xs font-semibold text-blue-600">Unread</Text>
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
        title="Notifications"
        backBtn
        rightElement={
          <Pressable onPress={handleMakeAllRead} className="p-2 bg-white rounded-full shadow-sm">
            <FontAwesomeIcon icon={faListCheck} size={18} color="#374151" />
          </Pressable>
        }
      />

      {isLoading ? (
        <LoadingData />
      ) : (
        <View className="flex-1 mx-6">
          <FlatList
            data={userNotifications}
            keyExtractor={(item) => item.notificationId.toString()}
            renderItem={renderNotificationItem}
            ListEmptyComponent={<EmptyList title="User do not have any notification yet!" />}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="py-4"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
