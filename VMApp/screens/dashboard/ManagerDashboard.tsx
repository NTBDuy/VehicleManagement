import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { RequestService } from 'services/requestService';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';
import { StatisticService } from '@/services/statisticService';

import { VehicleUsageData } from '@/types/Statistic';
import Request from 'types/Request';
import Vehicle from 'types/Vehicle';

import RequestStatisticChart from '@/components/charts/RequestStatusStatistic';
import RequestVehicleMostUsageChart from '@/components/charts/RequestVehicleMostUsage';
import VehicleStatusChart from '@/components/charts/VehicleStatus';
import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import NotificationButton from '@/components/ui/NotificationButton';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';
import StatSection from '@/components/ui/StatSectionComponent';

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [vehicleMostUsage, setVehicleMostUsage] = useState<VehicleUsageData[]>([]);
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
      const mostUsage = await StatisticService.getStatVehicleMostUsageAllTime();
      setRequests(requestData);
      setVehicles(vehicleData);
      setVehicleMostUsage(mostUsage);
    } catch (error) {
      console.error(error);
      setRequests([]);
      setVehicles([]);
      setVehicleMostUsage([]);
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
            <StatSection
              title={t('dashboard.stats.requests')}
              chart={<RequestStatisticChart request={requests} showDetails />}
            />
            <StatSection
              title={t('dashboard.stats.vehicles')}
              chart={<VehicleStatusChart vehicles={vehicles} />}
            />
            <StatSection
              title="Phương tiện sử dụng nhiều nhất"
              chart={<RequestVehicleMostUsageChart vehicleData={vehicleMostUsage} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagerDashboard;
