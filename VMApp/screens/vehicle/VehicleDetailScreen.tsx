import { useAuth } from '@/contexts/AuthContext';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { getVehicleBackground, getVehicleLabel, getVehicleTypeIcon } from 'utils/vehicleUtils';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import LoadingData from '@/components/ui/LoadingData';

const VehicleDetailScreen = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const route = useRoute();
  const { vehicleId } = route.params as { vehicleId: number };
  const navigation = useNavigation<any>();
  const {
    data: vehicleData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => VehicleService.getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  if (isError || !vehicleData) {
    return <ErrorComponent />;
  }

  const handleEditVehicle = () => {
    navigation.navigate('VehicleEdit', { vehicleData });
  };

  const renderBadgeVehicleStatus = ({ status }: { status: number }) => {
    const bgColor = getVehicleBackground(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getVehicleLabel(status, t)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        title={t('vehicle.detail.title')}
        rightElement={
          user?.role == 0 && (
            <TouchableOpacity onPress={handleEditVehicle} className="rounded-full bg-white p-2">
              <FontAwesomeIcon icon={faEdit} size={18} />
            </TouchableOpacity>
          )
        }
      />

      {isLoading ? (
        <LoadingData />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
          <View className="px-6">
            <View className="mb-6 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-blue-50 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <FontAwesomeIcon
                        icon={getVehicleTypeIcon(vehicleData.type)}
                        size={18}
                        color="#2563eb"
                      />
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500">
                        {t('vehicle.detail.vehicleId')}
                        {vehicleData.vehicleId}
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

            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('vehicle.detail.sectionInfo.title')}
                </Text>
              </View>

              <View className="p-4">
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.plate')}
                  value={vehicleData.licensePlate || t('common.fields.noInfo')}
                />
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.type')}
                  value={vehicleData.type || t('common.fields.noInfo')}
                />
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.brandAndModel')}
                  value=""
                  valueComponent={
                    vehicleData.brand || vehicleData.model ? (
                      <Text className="font-semibold text-gray-700">
                        {vehicleData.brand} {vehicleData.model}
                      </Text>
                    ) : (
                      <Text className="font-semibold text-gray-700">
                        {t('common.fields.noInfo')}
                      </Text>
                    )
                  }
                />
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.createAt')}
                  value={formatDatetime(vehicleData.createdAt) || t('common.fields.noInfo')}
                  isLast
                />
              </View>
            </View>

            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('vehicle.detail.sectionMaintenance.title')}
                </Text>
              </View>

              <View className="p-4">
                <InfoRow
                  label={t('vehicle.detail.sectionMaintenance.label.last')}
                  value={formatDate(vehicleData.lastMaintenance) || t('common.fields.noInfo')}
                />
                <InfoRow
                  label={t('vehicle.detail.sectionMaintenance.label.next')}
                  value={formatDate(vehicleData.nextMaintenance) || t('common.fields.notSchedule')}
                  isLast
                />

                {user?.role === 0 && !vehicleData.nextMaintenanceId && vehicleData.status !== 2 && (
                  <View className="mt-4 justify-end">
                    <TouchableOpacity
                      className="w-px-4 rounded-xl bg-blue-500 py-3 shadow-sm"
                      onPress={() => {
                        navigation.navigate('ScheduleMaintenance', { vehicleData });
                      }}>
                      <Text className="text-center font-semibold text-white">
                        {t('common.button.schedule')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-right text-sm font-medium text-gray-500">
                {t('common.lastUpdated')}: {formatDatetime(vehicleData.lastUpdateAt)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
