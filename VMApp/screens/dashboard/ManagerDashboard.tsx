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

const ManagerDashboard = () => {
  const navigation = useNavigation<any>();
  const screenWidth = Dimensions.get('window').width;
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
      name: 'Pending',
      count: requestStat.pending,
      color: '#e17100',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Approved',
      count: requestStat.approved,
      color: '#009966',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Rejected',
      count: requestStat.rejected,
      color: '#e7000b',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Cancelled',
      count: requestStat.cancelled,
      color: '#45556c',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'In Progress',
      count: requestStat.inProgress,
      color: '#155dfc',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Done',
      count: requestStat.done,
      color: '#00a63e',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
  ].filter((item) => item.count > 0);

  const vehicleChartData = [
    {
      name: 'Available',
      count: vehicleStat.available,
      color: '#10b981',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'In Use',
      count: vehicleStat.inUse,
      color: '#3b82f6',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Maintenance',
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
        title="Manager Dashboard"
        rightElement={
          <TouchableOpacity
            className="relative p-2 bg-white rounded-full"
            onPress={() => navigation.navigate('Notification')}>
            <FontAwesomeIcon icon={faBell} size={18} />
            {notificationCount > 0 && (
              <View className="absolute -right-2 -top-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500">
                <Text className="text-xs font-bold text-center text-white">
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
            <View className="mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800">Request Statistics</Text>
              </View>

              <View className="p-4">
                <StatItem label="Total Requests" value={requestStat.total} />
                <StatItem label="Pending" value={requestStat.pending} status="pending" />
                <StatItem label="Approved" value={requestStat.approved} status="approved" />
                <StatItem label="Rejected" value={requestStat.rejected} status="rejected" />
                <StatItem label="Cancelled" value={requestStat.cancelled} status="cancelled" />
                <StatItem label="In Progress" value={requestStat.inProgress} status="inProgress" />
                <StatItem label="Done" value={requestStat.done} status="done" />
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
                      paddingLeft="12"
                      center={[24, 0]}
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

            <View className="mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800">Vehicle Statistics</Text>
              </View>

              <View className="p-4">
                <StatItem label="Total Vehicles" value={vehicleStat.total} />
                <StatItem label="Available" value={vehicleStat.available} status="available" />
                <StatItem label="In Use" value={vehicleStat.inUse} status="inUse" />
                <StatItem
                  label="Under Maintenance"
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
                      paddingLeft="12"
                      center={[18, 0]}
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
