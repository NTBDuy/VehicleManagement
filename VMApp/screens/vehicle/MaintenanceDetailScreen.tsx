import { VehicleService } from '@/services/vehicleService';
import { formatDate, formatDatetime } from '@/utils/datetimeUtils';
import { getMaintenanceBackgroundColor, getMaintenanceLabel } from '@/utils/maintenanceUtils';
import { showToast } from '@/utils/toast';
import { getVehicleTypeIcon } from '@/utils/vehicleUtils';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRoute } from '@react-navigation/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { useQueryClient } from '@tanstack/react-query';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import MyCalendar from '@/components/ui/MyCalendar';
import LoadingData from '@/components/ui/LoadingData';

const MaintenanceDetailScreen = () => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const route = useRoute();
  const { maintenanceId } = route.params as { maintenanceId: number };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(today);
  const [selectedEndDate, setSelectedEndDate] = useState<string>(today);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: maintenance,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['maintenance', maintenanceId],
    queryFn: () => VehicleService.getMaintenanceDetails(maintenanceId),
  });

  useEffect(() => {
    if (!maintenance) return;

    const originalStart = maintenance.scheduledDate;
    const originalEnd = maintenance.estimatedEndDate;
    const isDifferent = selectedStartDate !== originalStart || selectedEndDate !== originalEnd;
    setHasChanges(isDifferent);
  }, [
    selectedStartDate,
    selectedEndDate,
    maintenance?.scheduledDate,
    maintenance?.estimatedEndDate,
  ]);

  if (isLoading) {
    return <LoadingData />;
  }

  if (!maintenance) {
    return <ErrorComponent />;
  }

  const getMarkedDates = () => {
    let marked: { [date: string]: any } = {};
    if (selectedStartDate) {
      marked[selectedStartDate] = {
        startingDay: true,
        color: '#3b82f6',
        textColor: 'white',
      };
    }
    if (selectedEndDate) {
      marked[selectedEndDate] = {
        endingDay: true,
        color: '#3b82f6',
        textColor: 'white',
      };

      let current = new Date(selectedStartDate);
      while (current < new Date(selectedEndDate)) {
        current.setDate(current.getDate() + 1);
        const d = current.toISOString().split('T')[0];
        if (d !== selectedEndDate) {
          marked[d] = { color: '#93c5fd', textColor: 'black' };
        }
      }
    }

    return marked;
  };

  const renderBadgeMaintenanceStatus = (status: number) => {
    const bgColor = getMaintenanceBackgroundColor(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getMaintenanceLabel(status, t)}</Text>
      </View>
    );
  };

  const handleReschedule = () => {
    setSelectedStartDate(maintenance.scheduledDate);
    setSelectedEndDate(maintenance.estimatedEndDate);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleDayPress = (day: DateData) => {
    const date = day.dateString;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate('');
    } else if (selectedStartDate && !selectedEndDate) {
      if (date >= selectedStartDate) {
        setSelectedEndDate(date);
      } else {
        setSelectedStartDate(date);
        setSelectedEndDate(selectedStartDate);
      }
    }
  };

  const handleConfirmReschedule = () => {
    try {
      Alert.alert(
        `${t('common.confirmation.title.reschedule')}`,
        `${t('common.confirmation.message.reschedule')}`,
        [
          { text: `${t('common.button.cancel')}`, style: 'cancel' },
          {
            text: `${t('common.button.yesIAmSure')}`,
            style: 'default',
            onPress: async () => {
              try {
                await VehicleService.rescheduleMaintenance(
                  maintenance.maintenanceId,
                  {
                    startDate: selectedStartDate,
                    endDate: selectedEndDate,
                  }
                );
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: ['maintenance', maintenanceId] }),
                  queryClient.invalidateQueries({ queryKey: ['maintenances'] }),
                ]);
                refetch();
                showToast.success(
                  `${t('common.success.title')}`,
                  `${t('common.success.reschedule')}`
                );
                setIsModalVisible(false);
              } catch (error) {
                console.log('Error rescheduling maintenance:', error);
                Alert.alert(`${t('common.error.title')}`, `${t('common.error.generic')}`);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeStatus = (status: number) => {
    const isBegin = maintenance.status === 0;

    try {
      Alert.alert(
        isBegin
          ? `${t('common.confirmation.title.beginMaintenance')}`
          : `${t('common.confirmation.title.completeMaintenance')}`,
        isBegin
          ? `${t('common.confirmation.message.beginMaintenance')}`
          : `${t('common.confirmation.message.completeMaintenance')}`,
        [
          { text: `${t('common.button.cancel')}`, style: 'cancel' },
          {
            text: `${t('common.button.yesIAmSure')}`,
            style: 'default',
            onPress: async () => {
              try {
                await VehicleService.changeStatusMaintenance(maintenanceId, status);
                showToast.success(
                  `${t('common.success.title')}`,
                  isBegin
                    ? `${t('common.success.beginMaintenance')}`
                    : `${t('common.success.completeMaintenance')}`
                );
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: ['maintenance', maintenanceId] }),
                  queryClient.invalidateQueries({ queryKey: ['maintenances'] }),
                ]);
                refetch();
              } catch (error) {
                console.log('Error toggling status:', error);
                Alert.alert(`${t('common.error.title')}`, `${t('common.error.generic')}`);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title={t('maintenance.detail.title')} />

      <View className="px-6">
        <View className="mb-2 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-blue-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FontAwesomeIcon
                    icon={getVehicleTypeIcon(maintenance.vehicle.type)}
                    size={18}
                    color="#2563eb"
                  />
                </View>
                <View>
                  <Text className="text-sm text-gray-500">
                    {t('maintenance.detail.maintenanceId')} #{maintenance.maintenanceId}
                  </Text>
                  <Text className="text-base font-bold text-gray-800">
                    {formatDate(maintenance.scheduledDate)} -{' '}
                    {formatDate(maintenance.estimatedEndDate)}
                  </Text>
                </View>
              </View>
              {renderBadgeMaintenanceStatus(maintenance.status)}
            </View>
            <View className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
              <View className="flex-row items-start">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                  <Text className="text-xs font-bold text-orange-600">!</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-orange-700">
                    {t('common.fields.description')}
                  </Text>
                  <Text className="text-sm leading-5 text-orange-600">
                    {maintenance.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('vehicle.detail.sectionInfo.title')}
            </Text>
          </View>

          <View className="p-4">
            <InfoRow
              label={t('vehicle.detail.sectionInfo.label.plate')}
              value={maintenance.vehicle.licensePlate || t('common.fields.noInfo')}
            />
            <InfoRow
              label={t('vehicle.detail.sectionInfo.label.type')}
              value={maintenance.vehicle.type || t('common.fields.noInfo')}
            />
            <InfoRow
              label={t('vehicle.detail.sectionInfo.label.brandAndModel')}
              value=""
              valueComponent={
                maintenance.vehicle.brand || maintenance.vehicle.model ? (
                  <Text className="font-semibold text-gray-700">
                    {maintenance.vehicle.brand} {maintenance.vehicle.model}
                  </Text>
                ) : (
                  <Text className="font-semibold text-gray-700">{t('common.fields.noInfo')}</Text>
                )
              }
              isLast
            />
          </View>
        </View>

        {maintenance.status === 0 && (
          <View className="mt-2">
            <View className="mt-4 flex-row justify-between">
              <TouchableOpacity
                className="w-[48%] items-center rounded-xl bg-orange-500 py-4 shadow-sm "
                onPress={handleReschedule}>
                <Text className="font-semibold text-white">{t('common.button.reschedule')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-[48%] items-center rounded-xl ${isLoading ? 'bg-gray-600' : 'bg-green-600'} py-4 shadow-sm `}
                disabled={isLoading}
                onPress={() => handleChangeStatus(1)}>
                <Text className="font-semibold text-white">
                  {isLoading ? `${t('common.button.beginning')}` : `${t('common.button.begin')}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {maintenance.status === 1 && (
          <View className="mt-2">
            <TouchableOpacity
              className={`items-center py-4 ${isLoading ? 'bg-gray-600' : 'bg-blue-600'} rounded-xl shadow-sm `}
              disabled={isLoading}
              onPress={() => handleChangeStatus(2)}>
              <Text className="font-semibold text-white">
                {isLoading ? `${t('common.button.gettingDone')}` : `${t('common.button.done')}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-4">
          <Text className="text-right text-sm font-medium text-gray-500">
            {t('common.lastUpdated')}: {formatDatetime(maintenance.lastUpdateAt)}
          </Text>
        </View>

        <Modal
          transparent
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={handleCloseModal}>
          <TouchableOpacity
            onPress={handleCloseModal}
            className="flex-1 justify-center bg-black/30"
            activeOpacity={1}>
            <TouchableOpacity onPress={(e) => e.stopPropagation()} activeOpacity={1}>
              <View className="mx-6 rounded-2xl bg-white">
                <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
                  <Text className="text-lg font-bold text-gray-800">
                    {t('maintenance.detail.modal.title')}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 ">
                    <FontAwesomeIcon icon={faTimes} size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View className="p-4">
                  <MyCalendar
                    markingType="period"
                    markedDates={getMarkedDates()}
                    onDayPress={(day) => handleDayPress(day)}
                    minDate={today}
                  />
                  <View className="mt-4">
                    <TouchableOpacity
                      className={`${hasChanges ? 'items-center rounded-xl bg-blue-500 py-4 shadow-sm ' : 'items-center rounded-xl bg-gray-300 py-4 shadow-sm'}`}
                      disabled={!hasChanges}
                      onPress={handleConfirmReschedule}>
                      <Text
                        className={`${hasChanges ? 'font-semibold text-white' : 'font-semibold text-gray-500'}`}>
                        {t('common.button.confirm')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default MaintenanceDetailScreen;
