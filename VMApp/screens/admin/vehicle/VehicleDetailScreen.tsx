import { View, Text, SafeAreaView, Pressable, TextInput } from 'react-native';
import React from 'react';
import Header from 'components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import Vihicle from 'types/Vehicle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const VehicleDetailScreen = () => {
  const route = useRoute();
  const { vehicleData } = route.params as { vehicleData: Vihicle };
  const navigation = useNavigation<any>();

  const onEdit = () => {
    navigation.navigate('VehicleEdit', { vehicleData });
  };

  const renderBadgeVehicleStatus = ({ status }: { status: number }) => {
    const getStatusStyle = (status: number) => {
      switch (status) {
        case 0:
          return 'bg-green-500';
        case 1:
          return 'bg-blue-500';
        case 3:
          return 'bg-orange-500';
        default:
          return 'bg-gray-500';
      }
    };

    const getStatusLabel = (status: number) => {
      switch (status) {
        case 0:
          return 'Available';
        case 1:
          return 'InUse';
        case 2:
          return 'UnderMaintenance';
        default:
          return 'Unknown';
      }
    };

    const bgColor = getStatusStyle(status);

    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getStatusLabel(status)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <Header
        backBtn
        title="Vehicle Detail"
        rightElement={
          <Pressable onPress={onEdit} className="rounded-full bg-white p-2">
            <FontAwesomeIcon icon={faEdit} size={18} />
          </Pressable>
        }
      />

      <View className="px-6">
        <View className="mb-6 mt-4 flex-row items-center justify-between rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="text-lg font-bold">Vehicle ID #{vehicleData.VehicleId}</Text>
          <View>{renderBadgeVehicleStatus({ status: vehicleData.Status })}</View>
        </View>

        {/** Section - thông tin cơ bản */}
        <View className="mb-6 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-lg font-bold">Vehicle information</Text>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Plate number</Text>
            <Text className="font-semibold text-gray-700">
              {vehicleData.LicensePlate || 'No information'}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Type</Text>
            <Text className="font-semibold text-gray-700">
              {vehicleData.Type || 'No information'}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Brand & Model</Text>
            {vehicleData.Brand || vehicleData.Model ? (
              <Text className="font-semibold text-gray-700">
                {vehicleData.Brand} {vehicleData.Model}
              </Text>
            ) : (
              <Text className="font-semibold text-gray-700">No information</Text>
            )}
          </View>
        </View>

        {/** Section - lịch bảo dưỡng  */}
        <View className="mb-6 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-lg font-bold">Maintenance</Text>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Last time</Text>
            <Text className="font-semibold text-gray-700">
              {vehicleData.LastMaintenance || 'No information'}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Next time</Text>
            <Text className="font-semibold text-gray-700">Not scheduled</Text>
          </View>
        </View>

        {/** Section - thống kê */}
      </View>
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
