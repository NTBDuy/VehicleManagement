import { chartConfig } from '@/config/charConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

import User from 'types/User';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';
import NotificationButton from '@/components/ui/NotificationButton';
import StatItem from '@/components/ui/StatItemComponent';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const vehicleStat = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((request) => request.status === 0).length;
    const inUse = vehicles.filter((request) => request.status === 1).length;
    const underMaintenance = vehicles.filter((request) => request.status === 2).length;
    return { total, available, inUse, underMaintenance };
  }, [vehicles]);

  const userStat = useMemo(() => {
    const total = users.length;
    const admin = users.filter((user) => user.role === 0).length;
    const employee = users.filter((user) => user.role === 1).length;
    const manager = users.filter((user) => user.role === 2).length;
    return { total, employee, manager, admin };
  }, [users]);

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
      const vehiclesData = await VehicleService.getAllVehicles();
      const usersData = await UserService.getAllUsers();
      setVehicles(vehiclesData);
      setUsers(usersData);
    } catch (error) {
      console.error(error);
      setVehicles([]);
      setUsers([]);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatData();
  };

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={`${t('dashboard.view.admin')}`}
        rightElement={<NotificationButton notificationCount={notificationCount} />}
      />

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {user && <WelcomeSection user={user} />}

        {isLoading ? (
          <View className="flex-1 pt-44">
            <LoadingData />
          </View>
        ) : (
          <View>
            <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('dashboard.stats.users')}
                </Text>
              </View>

              <View className="p-4">
                <StatItem label={t('common.status.total')} value={userStat.total} />
                <StatItem label={t('common.role.admin')} value={userStat.admin} status="admin" />
                <StatItem
                  label={t('common.role.manager')}
                  value={userStat.manager}
                  status="manager"
                />
                <StatItem
                  label={t('common.role.employee')}
                  value={userStat.employee}
                  status="employee"
                />
              </View>
            </View>

            <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('dashboard.stats.vehicles')}
                </Text>
              </View>

              <View className="p-4">
                <StatItem label={t('common.status.total')} value={vehicleStat.total} />
                <StatItem
                  label={t('common.status.available')}
                  value={vehicleStat.available}
                  status="available"
                />
                <StatItem
                  label={t('common.status.inUse')}
                  value={vehicleStat.inUse}
                  status="inUse"
                />
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
                      center={[36, 0]}
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
                  <EmptyList />
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
