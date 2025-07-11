import { chartConfig } from '@/config/charConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { RequestService } from 'services/requestService';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

import Request from 'types/Request';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';
import NotificationButton from '@/components/ui/NotificationButton';
import StatItem from '@/components/ui/StatItemComponent';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';
import RequestStatisticChart from '@/components/charts/RequestStatusStatistic';
import VehicleStatus from '@/components/charts/VehicleStatus';

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      fetchStatData();
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

  const fetchStatData = async () => {
    try {
      setIsLoading(true);
      const requestData = await RequestService.getAllRequests();
      const vehicleData = await VehicleService.getAllVehicles();
      setRequests(requestData);
      setVehicles(vehicleData);
    } catch (error) {
      console.error(error);
      setRequests([]);
      setVehicles([]);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatData();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('dashboard.view.manager')}
        rightElement={<NotificationButton notificationCount={notificationCount} />}
      />

      <ScrollView
        className="px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {user && <WelcomeSection user={user} />}

        {isLoading ? (
          <LoadingData />
        ) : (
          <View>
            <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('dashboard.stats.requests')}
                </Text>
              </View>

              <RequestStatisticChart request={requests} showDetails />
            </View>

            <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('dashboard.stats.vehicles')}
                </Text>
              </View>

              <VehicleStatus vehicles={vehicles} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagerDashboard;
