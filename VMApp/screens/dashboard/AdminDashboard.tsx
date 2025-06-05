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
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

import User from 'types/User';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import StatItem from '@/components/ui/StatItemComponent';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
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

  const screenWidth = Dimensions.get('window').width;

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
    getStatData();
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
        title={`${t('dashboard.view.admin')}`}
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
                <Text className="text-lg font-semibold text-gray-800">{t('dashboard.user.stat')}</Text>
              </View>

              <View className="p-4">
                <StatItem label={t('dashboard.user.total')} value={userStat.total} />
                <StatItem label={t('common.role.admin')} value={userStat.admin} status="admin" />
                <StatItem label={t('common.role.manager')} value={userStat.manager} status="manager" />
                <StatItem label={t('common.role.employee')} value={userStat.employee} status="employee" />
              </View>
            </View>

            <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">{t('dashboard.vehicle.stat')}</Text>
              </View>

              <View className="p-4">
                <StatItem label={t('dashboard.vehicle.total')} value={vehicleStat.total} />
                <StatItem label={t('common.status.available')} value={vehicleStat.available} status="available" />
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

export default AdminDashboard;
