import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { TouchableOpacity, SafeAreaView, Text, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { formatDate } from 'utils/datetimeUtils';
import { getVehicleTypeIcon } from 'utils/vehicleUtils';

import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import LoadingData from '@/components/ui/LoadingData';

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
          <TouchableOpacity onPress={handleEditVehicle} className="p-2 bg-white rounded-full">
            <FontAwesomeIcon icon={faEdit} size={18} />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <LoadingData />
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

          <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-lg font-semibold text-gray-800">Maintenance</Text>
            </View>

            <View className="p-4">
              <InfoRow
                label="Last time"
                value={formatDate(vehicleData.lastMaintenance) || 'No information'}
              />
              <InfoRow
                label="Next time"
                value={formatDate(vehicleData.nextMaintenance) || 'Not scheduled'}
                isLast
              />

              {(!vehicleData.nextMaintenanceId && vehicleData.status !== 2) && (
                <View className="justify-end mt-4">
                  <TouchableOpacity
                    className="py-3 bg-blue-500 shadow-sm w-px-4 rounded-xl "
                    onPress={() => {
                      navigation.navigate('ScheduleMaintenance', { vehicleData });
                    }}>
                    <Text className="font-semibold text-center text-white">Schedule Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
