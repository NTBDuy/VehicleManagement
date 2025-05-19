import { View, Text, SafeAreaView, Pressable, TextInput } from 'react-native';
import React from 'react';
import Header from 'components/HeaderComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import Vehicle from 'types/Vehicle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCarBurst,
  faEllipsisV,
  faCar,
  faCarSide,
  faTruckPickup,
  faVanShuttle,
  faPlus,
  faInfoCircle,
  faEdit,
  faTrash,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import InfoRow from 'components/InfoRowComponent';

const VehicleDetailScreen = () => {
  const route = useRoute();
  const { vehicleData } = route.params as { vehicleData: Vehicle };
  const navigation = useNavigation<any>();

  const handleEditVehicle = () => {
    navigation.navigate('VehicleEdit', { vehicleData });
  };

  const renderBadgeVehicleStatus = ({ status }: { status: number }) => {
    const getStatusStyle = (status: number) => {
      switch (status) {
        case 0:
          return 'bg-green-500';
        case 1:
          return 'bg-blue-500';
        case 2:
          return 'bg-gray-500';
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

  /** Func: Get icon for each vehicle */
  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'Sedan':
        return faCar;
      case 'SUV':
        return faCarSide;
      case 'Truck':
        return faTruckPickup;
      case 'Van':
        return faVanShuttle;
      default:
        return faCar;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        title="Vehicle Detail"
        rightElement={
          <Pressable onPress={handleEditVehicle} className="rounded-full bg-white p-2">
            <FontAwesomeIcon icon={faEdit} size={18} />
          </Pressable>
        }
      />

      <View className="px-6">
        <View className="mb-6 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-blue-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FontAwesomeIcon
                    icon={getVehicleTypeIcon(vehicleData.Type)}
                    size={18}
                    color="#2563eb"
                  />
                </View>
                <View>
                  <Text className="text-sm text-gray-500">Vehicle ID #{vehicleData.VehicleId}</Text>
                  <Text className="text-lg font-bold text-gray-800">
                    {vehicleData.LicensePlate}
                  </Text>
                </View>
              </View>
              {renderBadgeVehicleStatus({ status: vehicleData.Status })}
            </View>
          </View>
        </View>

        {/** Section - thông tin cơ bản */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
          </View>

          <View className="p-4">
            <InfoRow label="Plate number" value={vehicleData.LicensePlate || 'No information'} />
            <InfoRow label="Type" value={vehicleData.Type || 'No information'} />
            <InfoRow
              label="Brand & Model"
              value=""
              valueComponent={
                vehicleData.Brand || vehicleData.Model ? (
                  <Text className="font-semibold text-gray-700">
                    {vehicleData.Brand} {vehicleData.Model}
                  </Text>
                ) : (
                  <Text className="font-semibold text-gray-700">No information</Text>
                )
              }
              isLast
            />
          </View>
        </View>

        {/** Section - lịch bảo dưỡng  */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Maintenance</Text>
          </View>

          <View className="p-4">
            <InfoRow label="Last time" value={vehicleData.LastMaintenance || 'No information'} />
            <InfoRow label="Next time" value="Not scheduled" isLast />
          </View>
        </View>

        {/** Section - thống kê */}
      </View>
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
