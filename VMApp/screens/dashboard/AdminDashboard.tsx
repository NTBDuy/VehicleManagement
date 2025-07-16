import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

import User from 'types/User';
import Vehicle from 'types/Vehicle';

import VehicleStatusChart from '@/components/charts/VehicleStatus';
import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import NotificationButton from '@/components/ui/NotificationButton';
import StatItem from '@/components/ui/StatItemComponent';
import StatSection from '@/components/ui/StatSectionComponent';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={`${t('dashboard.view.admin')}`}
        rightElement={<NotificationButton notificationCount={notificationCount} />}
      />

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {user && <WelcomeSection user={user} />}

        {isLoading ? (
          <View className="flex-1 pt-44">
            <LoadingData />
          </View>
        ) : (
          <View>
            <StatSection
              title={t('dashboard.stats.users')}
              chart={
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
              }
            />

            <StatSection
              title={t('dashboard.stats.vehicles')}
              chart={<VehicleStatusChart vehicles={vehicles} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
