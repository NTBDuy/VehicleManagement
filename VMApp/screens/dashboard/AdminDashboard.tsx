import { Text, SafeAreaView, Pressable, ScrollView, View, Dimensions } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

import Header from 'components/HeaderComponent';
import StatItem from 'components/StatItemComponent';

import accountData from 'data/user.json';
import vehicleData from 'data/vehicle.json';

import User from 'types/User';
import Vehicle from 'types/Vehicle';
import WelcomeSection from 'components/WelcomeSectionComponent';
import { useAuth } from 'contexts/AuthContext';

const accounts: User[] = accountData;
const vehicles: Vehicle[] = vehicleData;

type VehicleStat = {
  total: number;
  available: number;
  inUse: number;
  underMaintenance: number;
};

type AccountStat = {
  total: number;
  employee: number;
  manager: number;
  admin: number;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [vehicleStat, setVehicleStat] = useState<VehicleStat>({
    total: 0,
    available: 0,
    inUse: 0,
    underMaintenance: 0,
  });

  const [accountStat, setAccountStat] = useState<AccountStat>({
    total: 0,
    employee: 0,
    manager: 0,
    admin: 0,
  });

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (vehicles) {
      calculateVehicleStatistics(vehicles);
      calculateAccountStatistics();
    }
  }, [vehicles]);

  const calculateVehicleStatistics = (item: Vehicle[]) => {
    const total = item.length;
    const available = item.filter((request) => request.status === 0).length;
    const inUse = item.filter((request) => request.status === 1).length;
    const underMaintenance = item.filter((request) => request.status === 2).length;
    setVehicleStat({ total, available, inUse, underMaintenance });
  };

  const calculateAccountStatistics = () => {
    const total = accounts.length;
    const admin = accounts.filter((account) => account.role === 0).length;
    const employee = accounts.filter((account) => account.role === 1).length;
    const manager = accounts.filter((account) => account.role === 2).length;

    setAccountStat({ total, employee, manager, admin });
  };

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
        title="Admin Dashboard"
        rightElement={
          <Pressable
            className="rounded-full bg-white p-2"
            onPress={() => navigation.navigate('Notification')}>
            <FontAwesomeIcon icon={faBell} size={18} />
          </Pressable>
        }
      />

      {/** BODY */}
      <ScrollView className="px-6">
        {/* Welcome Section */}
        <WelcomeSection user={user} />

        {/** Section: Account Statistics */}
        <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Account Statistics</Text>
          </View>

          <View className="p-4">
            <StatItem label="Total Accounts" value={accountStat.total} />
            <StatItem label="Admin" value={accountStat.admin} status="admin" />
            <StatItem label="Manager" value={accountStat.manager} status="manager" />
            <StatItem label="Employee" value={accountStat.employee} status="employee" />
          </View>
        </View>

        {/** Section: Vehicle Statistics */}
        <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
