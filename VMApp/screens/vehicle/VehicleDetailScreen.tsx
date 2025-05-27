import { View, Text, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import Header from 'components/HeaderComponent';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Vehicle from 'types/Vehicle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import InfoRow from 'components/InfoRowComponent';
import { getVehicleTypeIcon } from 'utils/vehicleUntils';
import { useCallback, useState } from 'react';
import { VehicleService } from 'services/vehicleService';
import { formatDate } from 'utils/datetimeUtils';

const VehicleDetailScreen = () => {
  const route = useRoute();
  const { vehicleData: initialVehicleData } = route.params as { vehicleData: Vehicle };
  const navigation = useNavigation<any>();

  const [vehicleData, setVehicleData] = useState<Vehicle>(initialVehicleData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      const updatedData = await VehicleService.getVehicleById(vehicleData.vehicleId);
      setVehicleData(updatedData);
    } catch (error) {
      console.log('Error fetching vehicle data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicleData();
    }, [vehicleData.vehicleId])
  );

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        title="Vehicle Detail"
        rightElement={
          <Pressable onPress={handleEditVehicle} className="p-2 bg-white rounded-full">
            <FontAwesomeIcon icon={faEdit} size={18} />
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading vehicle details...</Text>
        </View>
      ) : (
        <View className="px-6">
          <View className="mt-4 mb-6 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="p-4 bg-blue-50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                    <FontAwesomeIcon
                      icon={getVehicleTypeIcon(vehicleData.type)}
                      size={18}
                      color="#2563eb"
                    />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">
                      Vehicle ID #{vehicleData.vehicleId}
                    </Text>
                    <Text className="text-lg font-bold text-gray-800">
                      {vehicleData.licensePlate}
                    </Text>
                  </View>
                </View>
                {renderBadgeVehicleStatus({ status: vehicleData.status })}
              </View>
            </View>
          </View>

          {/** Section - thông tin cơ bản */}
          <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
            </View>

            <View className="p-4">
              <InfoRow label="Plate number" value={vehicleData.licensePlate || 'No information'} />
              <InfoRow label="Type" value={vehicleData.type || 'No information'} />
              <InfoRow
                label="Brand & Model"
                value=""
                valueComponent={
                  vehicleData.brand || vehicleData.model ? (
                    <Text className="font-semibold text-gray-700">
                      {vehicleData.brand} {vehicleData.model}
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
          <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-lg font-semibold text-gray-800">Maintenance</Text>
            </View>

            <View className="p-4">
              <InfoRow label="Last time" value={formatDate(vehicleData.lastMaintenance) || 'No information'} />
              <InfoRow label="Next time" value="Not scheduled" isLast />
            </View>
          </View>

          {/** Section - thống kê */}
        </View>
      )}
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
