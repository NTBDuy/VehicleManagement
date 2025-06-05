import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { RequestService } from 'services/requestService';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

import Request from 'types/Request';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import StatItem from '@/components/ui/StatItemComponent';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';
import { useTranslation } from 'react-i18next';

const ManagerDashboard = () => {
  const navigation = useNavigation<any>();
  const screenWidth = Dimensions.get('window').width;
  const { t } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const requestStat = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((request) => request.status === 0).length;
    const approved = requests.filter((request) => request.status === 1).length;
    const rejected = requests.filter((request) => request.status === 2).length;
    const cancelled = requests.filter((request) => request.status === 3).length;
    const inProgress = requests.filter((request) => request.status === 4).length;
    const done = requests.filter((request) => request.status === 5).length;
    return { total, pending, approved, rejected, cancelled, inProgress, done };
  }, [requests]);

  const vehicleStat = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((request) => request.status === 0).length;
    const inUse = vehicles.filter((request) => request.status === 1).length;
    const underMaintenance = vehicles.filter((request) => request.status === 2).length;
    return { total, available, inUse, underMaintenance };
  }, [vehicles]);

  useFocusEffect(
    useCallback(() => {
      getStatData();
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

  const getStatData = async () => {
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
    getStatData();
  };

  const requestChartData = [
    {
      name: t('common.status.pending'),
      count: requestStat.pending,
      color: '#e17100',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.approved'),
      count: requestStat.approved,
      color: '#009966',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.rejected'),
      count: requestStat.rejected,
      color: '#e7000b',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.cancelled'),
      count: requestStat.cancelled,
      color: '#45556c',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.inProgress'),
      count: requestStat.inProgress,
      color: '#155dfc',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.done'),
      count: requestStat.done,
      color: '#00a63e',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
  ].filter((item) => item.count > 0);

  const vehicleChartData = [
    {
      name: t('common.status.available'),
      count: vehicleStat.available,
      color: '#10b981',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.inUse'),
      count: vehicleStat.inUse,
      color: '#3b82f6',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.maintenance'),
      count: vehicleStat.underMaintenance,
      color: '#ff7a04',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
  ].filter((item) => item.count > 0);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('dashboard.view.manager')}
        rightElement={
          <TouchableOpacity
            className="relative rounded-full bg-white p-2"
            onPress={() => navigation.navigate('Notification')}>
            <FontAwesomeIcon icon={faBell} size={18} />
            {notificationCount > 0 && (
              <View className="absolute -right-2 -top-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500">
                <Text className="text-center text-xs font-bold text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
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
                  {t('dashboard.request.stat')}
                </Text>
              </View>

              <View className="p-4">
                <StatItem label={t('dashboard.request.total')} value={requestStat.total} />
                <StatItem
                  label={t('common.status.pending')}
                  value={requestStat.pending}
                  status="pending"
                />
                <StatItem
                  label={t('common.status.approved')}
                  value={requestStat.approved}
                  status="approved"
                />
                <StatItem
                  label={t('common.status.rejected')}
                  value={requestStat.rejected}
                  status="rejected"
                />
                <StatItem
                  label={t('common.status.cancelled')}
                  value={requestStat.cancelled}
                  status="cancelled"
                />
                <StatItem
                  label={t('common.status.inProgress')}
                  value={requestStat.inProgress}
                  status="inProgress"
                />
                <StatItem label={t('common.status.done')} value={requestStat.done} status="done" />
                <View className="my-4 border-t border-gray-200"></View>

                {requestStat.total > 0 && requestChartData.length > 0 ? (
                  <View className="items-center">
                    <PieChart
                      data={requestChartData}
                      width={screenWidth - 24}
                      height={200}
                      chartConfig={chartConfig}
                      accessor="count"
                      backgroundColor="transparent"
                      paddingLeft="2"
                      center={[32, 0]}
                      absolute={false}
                      hasLegend={true}
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        paddingRight: '124%',
                      }}
                    />
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-center text-gray-500">No request data available</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800"> {t('dashboard.vehicle.stat')}</Text>
              </View>

              <View className="p-4">
                <StatItem label={t('dashboard.vehicle.total')} value={vehicleStat.total} />
                <StatItem
                  label={t('common.status.available')}
                  value={vehicleStat.available}
                  status="available"
                />
                <StatItem label={t('common.status.inUse')} value={vehicleStat.inUse} status="inUse" />
                <StatItem
                  label={t('common.status.maintenance')}
                  value={vehicleStat.underMaintenance}
                  status="underMaintenance"
                />
                <View className="my-4 border-t border-gray-200"></View>
                {vehicleStat.total > 0 && vehicleChartData.length > 0 ? (
                  <View className="items-center">
                    <PieChart
                      data={vehicleChartData}
                      width={screenWidth - 24}
                      height={200}
                      chartConfig={chartConfig}
                      accessor="count"
                      backgroundColor="transparent"
                      paddingLeft="2"
                      center={[32, 0]}
                      absolute={false}
                      hasLegend={true}
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        paddingRight: '124%',
                      }}
                    />
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-center text-gray-500">No vehicle data available</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagerDashboard;
