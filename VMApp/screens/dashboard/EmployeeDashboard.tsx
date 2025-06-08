import { faCalendarDays, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserService } from 'services/userService';

import Request from 'types/Request';

import Header from '@/components/layout/HeaderComponent';
import RequestItem from '@/components/request/HistoryRequestItem';
import LoadingData from '@/components/ui/LoadingData';
import NotificationButton from '@/components/ui/NotificationButton';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';

const EmployeeDashboard = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRequest, setUserRequest] = useState<Request[]>([]);

  const stat = useMemo(() => {
    const pending = userRequest.filter((request) => request.status === 0);
    const incoming = userRequest.filter((request) => request.status === 1);
    const inProgress = userRequest.filter((request) => request.status === 4);
    return { pending, incoming, inProgress };
  }, [userRequest]);

  useFocusEffect(
    useCallback(() => {
      fetchRequestData();
      countUnread();
    }, [])
  );

  const countUnread = async () => {
    try {
      const totalNotifications = await UserService.getUserUnreadNotifications();
      setNotificationCount(totalNotifications);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      setNotificationCount(0);
    }
  };

  const fetchRequestData = async () => {
    try {
      setIsLoading(true);
      const data = await UserService.getUserRequests();
      setUserRequest(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequestData();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('dashboard.view.employee')}
        rightElement={<NotificationButton notificationCount={notificationCount} />}
      />

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {user && <WelcomeSection user={user} />}

        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('dashboard.quickAction')}
            </Text>
          </View>

          <View className="flex-row justify-between p-4">
            <TouchableOpacity
              onPress={() => {
                navigation.getParent()?.navigate('NewRequestStack');
              }}
              className="w-[48%] flex-row justify-center rounded-2xl bg-green-500 p-4">
              <FontAwesomeIcon icon={faCalendarPlus} color="#fff" />
              <Text className="ml-2 font-bold text-white">{t('sidebar.newRequest')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.getParent()?.navigate('HistoryStack');
              }}
              className="w-[48%] flex-row justify-center rounded-2xl bg-gray-500 p-4 ">
              <FontAwesomeIcon icon={faCalendarDays} color="#fff" />
              <Text className="ml-2 font-bold text-white">{t('sidebar.history.all')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View>
            <LoadingData />
          </View>
        ) : (
          <View>
            {stat.inProgress.length > 0 && (
              <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
                <View className="bg-gray-50 px-4 py-3">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('common.status.inProgress')}
                  </Text>
                </View>

                <View className="-mb-4 p-4">
                  <View>
                    {stat.inProgress.slice(0, 1).map((item) => (
                      <RequestItem item={item} key={item.requestId} />
                    ))}
                  </View>
                </View>
              </View>
            )}

            {stat.pending.length > 0 && (
              <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <View className="bg-gray-50 px-4 py-3">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('common.status.pending')}{' '}
                  </Text>
                </View>

                <View className="-mb-4 p-4">
                  <View>
                    {stat.pending.slice(0, 3).map((item) => (
                      <RequestItem item={item} key={item.requestId} />
                    ))}
                  </View>
                </View>
              </View>
            )}

            {stat.incoming.length > 0 && (
              <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
                <View className="bg-gray-50 px-4 py-3">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('dashboard.incoming')}
                  </Text>
                </View>

                <View className="-mb-4 p-4">
                  <View>
                    {stat.incoming.slice(0, 3).map((item) => (
                      <RequestItem item={item} key={item.requestId} />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployeeDashboard;
