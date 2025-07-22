import { useQueries } from '@tanstack/react-query';
import { useAuth } from 'contexts/AuthContext';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

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

  const results = useQueries({
    queries: [
      { queryKey: ['vehicles'], queryFn: () => VehicleService.getAllVehicles() },
      { queryKey: ['users'], queryFn: () => UserService.getAllUsers() },
      {
        queryKey: ['notifications', 'countUnread'],
        queryFn: () => UserService.getUserUnreadNotifications(),
      },
    ],
  });

  const vehicles = results[0].data || [];
  const users = results[1].data || [];
  const notificationCount = results[2].data || 0;
  const isLoading = results.some((r) => r.isLoading);

  const refetchAll = () => Promise.all(results.map((r) => r.refetch()));

  const userStat = useMemo(() => {
    const total = users.length;
    const admin = users.filter((user) => user.role === 0).length;
    const employee = users.filter((user) => user.role === 1).length;
    const manager = users.filter((user) => user.role === 2).length;
    return { total, employee, manager, admin };
  }, [users]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={`${t('dashboard.view.admin')}`}
        rightElement={<NotificationButton notificationCount={notificationCount} />}
      />

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchAll} />}
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
