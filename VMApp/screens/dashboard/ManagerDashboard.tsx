import { StatisticService } from '@/services/statisticService';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { RequestService } from 'services/requestService';
import { UserService } from 'services/userService';
import { VehicleService } from 'services/vehicleService';

import RequestStatisticChart from '@/components/charts/RequestStatusStatistic';
import RequestVehicleMostUsageChart from '@/components/charts/RequestVehicleMostUsage';
import VehicleStatusChart from '@/components/charts/VehicleStatus';
import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import NotificationButton from '@/components/ui/NotificationButton';
import StatSection from '@/components/ui/StatSectionComponent';
import WelcomeSection from '@/components/ui/WelcomeSectionComponent';

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const results = useQueries({
    queries: [
      { queryKey: ['vehicles'], queryFn: () => VehicleService.getAllVehicles() },
      { queryKey: ['requests'], queryFn: () => RequestService.getAllRequests() },
      {
        queryKey: ['vehicleMostUsage'],
        queryFn: () => StatisticService.getStatVehicleMostUsageAllTime(),
      },
      {
        queryKey: ['notifications', 'countUnread'],
        queryFn: () => UserService.getUserUnreadNotifications(),
      },
    ],
  });

  const vehicles = results[0].data || [];
  const requests = results[1].data || [];
  const vehicleMostUsage = results[2].data || [];
  const notificationCount = results[3].data || 0;
  const isLoading = results.some((r) => r.isLoading);
  const refetchAll = () => Promise.all(results.map((r) => r.refetch()));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('dashboard.view.manager')}
        rightElement={<NotificationButton notificationCount={notificationCount} />}
      />

      <ScrollView
        className="px-6"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchAll} />}
        showsVerticalScrollIndicator={false}>
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
            {vehicleMostUsage.length > 0 && (
              <StatSection
                title="Phương tiện sử dụng nhiều nhất"
                chart={<RequestVehicleMostUsageChart vehicleData={vehicleMostUsage} t={t} />}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagerDashboard;
