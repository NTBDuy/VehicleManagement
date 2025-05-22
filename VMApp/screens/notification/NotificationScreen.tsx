import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import notificationData from '../../data/notification.json';
import Notification from 'types/Notification';
import { AuthContext } from 'contexts/AuthContext';
import EmptyList from 'components/EmptyListComponent';
import { formatTime } from 'utils/datetimeUtils';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell, faCarSide, faWarning, faTools, faCheck } from '@fortawesome/free-solid-svg-icons';

const notifications: Notification[] = notificationData;

const NotificationScreen = () => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      getNotifcationByUserID(user.UserId);
    }
  }, [user]);

  const getNotifcationByUserID = (userId: number) => {
    const data = notifications.filter((notification) => notification.UserId === userId);
    return setUserNotifications(data);
  };

  const NotificationIcon = ({ type }: { type: string }) => {
    const getIconConfig = () => {
      switch (type) {
        case 'RequestApproved':
          return { bgColor: 'bg-green-500', icon: faCheck };
        case 'MaintenanceScheduled':
          return { bgColor: 'bg-blue-500', icon: faTools };
        case 'AccountDeactivated':
          return { bgColor: 'bg-red-500', icon: faWarning };
        case 'VehicleAssigned':
          return { bgColor: 'bg-purple-500', icon: faCarSide };
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
      case 'RequestApproved':
        return 'border-l-green-500';
      case 'MaintenanceScheduled':
        return 'border-l-blue-500';
      case 'AccountDeactivated':
        return 'border-l-red-500';
      case 'VehicleAssigned':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`mb-3 rounded-xl border-l-4 bg-white p-4 ${getBorderColor(item.Type)} shadow-sm ${
        !item.IsRead ? 'bg-slate-50' : ''
      }`}
      activeOpacity={0.7}>
      <View className="flex-row items-start">
        <NotificationIcon type={item.Type} />

        <View className="ml-3 flex-1">
          <Text className="mb-3 text-base leading-6 text-gray-800">{item.Message}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{formatTime(item.CreatedAt)}</Text>
            {!item.IsRead && (
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
      <Header title="Notifications" backBtn />

      <View className="mx-6 flex-1">
        <FlatList
          data={userNotifications}
          keyExtractor={(item) => item.NotificationId.toString()}
          renderItem={renderNotificationItem}
          ListEmptyComponent={<EmptyList title="User do not have any notification yet!" />}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="py-4"
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;
