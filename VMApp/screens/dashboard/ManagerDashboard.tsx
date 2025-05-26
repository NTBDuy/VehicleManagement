import {
  Text,
  SafeAreaView,
  Pressable,
  View,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

import Header from 'components/HeaderComponent';
import StatItem from 'components/StatItemComponent';

import Request from 'types/Request';
import Vehicle from 'types/Vehicle';
import WelcomeSection from 'components/WelcomeSectionComponent';
import { useAuth } from 'contexts/AuthContext';
import { RequestService } from 'services/requestService';
import { VehicleService } from 'services/vehicleService';

type RequestStat = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

type VehicleStat = {
  total: number;
  available: number;
  inUse: number;
  underMaintenance: number;
};

const ManagerDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [requestStat, setRequestStat] = useState<RequestStat>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  });

  const [vehicleStat, setVehicleStat] = useState<VehicleStat>({
    total: 0,
    available: 0,
    inUse: 0,
    underMaintenance: 0,
  });

  const screenWidth = Dimensions.get('window').width;
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getStatData();
  }, []);

  useEffect(() => {
    if (requests) calculateRequestStatistics(requests);
    if (vehicles) calculateVehicleStatistics(vehicles);
  }, [requests, vehicles]);

  useFocusEffect(
    useCallback(() => {
      getStatData();
    }, [])
  );

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
  
  /** Func: Statistics  */
  const calculateRequestStatistics = (item: Request[]) => {
    const total = item.length;
    const pending = item.filter((request) => request.status === 0).length;
    const approved = item.filter((request) => request.status === 1).length;
    const rejected = item.filter((request) => request.status === 2).length;
    const cancelled = item.filter((request) => request.status === 3).length;
    setRequestStat({ total, pending, approved, rejected, cancelled });
  };

  const calculateVehicleStatistics = (item: Vehicle[]) => {
    const total = item.length;
    const available = item.filter((request) => request.status === 0).length;
    const inUse = item.filter((request) => request.status === 1).length;
    const underMaintenance = item.filter((request) => request.status === 2).length;
    setVehicleStat({ total, available, inUse, underMaintenance });
  };

  const requestChartData = [
    {
      name: 'Pending',
      count: requestStat.pending,
      color: '#f97316',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Approved',
      count: requestStat.approved,
      color: '#22c55e',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Rejected',
      count: requestStat.rejected,
      color: '#ef4444',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: 'Cancelled',
      count: requestStat.cancelled,
      color: '#6b7280',
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
      {/** HEADER */}
      <Header
        // customTitle={<Text className="text-2xl font-bold">Hi {user?.FullName}</Text>}
        title="Manager Dashboard"
        rightElement={
          <Pressable
            className="p-2 bg-white rounded-full"
            onPress={() => navigation.navigate('Notification')}>
            <FontAwesomeIcon icon={faBell} size={18} />
          </Pressable>
        }
      />

      {/** BODY */}
      <ScrollView
        className="px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Welcome Section */}
        <WelcomeSection user={user} />
        {/** Section: Request Statistics */}

        {isLoading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-2 text-gray-500">Loading data...</Text>
          </View>
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
                    <Text className="text-center text-gray-500">No vehicle data available</Text>
                  </View>
                )}
              </View>
            </View>

            {/** Section: Vehicle Statistics */}
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
