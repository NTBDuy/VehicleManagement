import { SafeAreaView, View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRoute } from '@react-navigation/core';
import { useEffect, useState } from 'react';
import { getVehicleTypeIcon } from '@/utils/vehicleUtils';

import Header from '@/components/layout/HeaderComponent';
import MaintenanceSchedule from '@/types/MaintenanceSchedule';
import InfoRow from '@/components/ui/InfoRowComponent';
import { getBgColorByStatus, getStatusLabel } from '@/utils/maintenanceUtils';
import { formatDate, formatDatetime } from '@/utils/datetimeUtils';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { VehicleService } from '@/services/vehicleService';
import { showToast } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

const MaintenanceDetailScreen = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { maintenanceData: initialMaintenanceData } = route.params as {
    maintenanceData: MaintenanceSchedule;
  };
  const [maintenance, setMaintenance] = useState<MaintenanceSchedule>(initialMaintenanceData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [selectedStartDate, setSelectedStartDate] = useState<string>(today);
  const [selectedEndDate, setSelectedEndDate] = useState<string>(today);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const originalStart = maintenance.scheduledDate;
    const originalEnd = maintenance.estimatedEndDate;
    const isDifferent = selectedStartDate !== originalStart || selectedEndDate !== originalEnd;
    setHasChanges(isDifferent);
  }, [selectedStartDate, selectedEndDate, maintenance.scheduledDate, maintenance.estimatedEndDate]);

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
    const bgColor = getBgColorByStatus(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getStatusLabel(status)}</Text>
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
      // Bắt đầu chọn range mới
      setSelectedStartDate(date);
      setSelectedEndDate('');
    } else if (selectedStartDate && !selectedEndDate) {
      // Đã có start date, đang chọn end date
      if (date >= selectedStartDate) {
        setSelectedEndDate(date);
      } else {
        // Nếu chọn ngày trước start date, thay đổi start date
        setSelectedStartDate(date);
        setSelectedEndDate('');
      }
    }
  };

  const handleConfirmReschedule = () => {
    try {
      Alert.alert(
        `${t('maintenance.toast.reschedule.confirm.title')}`,
        `${t('maintenance.toast.reschedule.confirm.message')}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, I am sure',
            style: 'default',
            onPress: async () => {
              try {
                const response = await VehicleService.rescheduleMaintenance(
                  maintenance.maintenanceId,
                  {
                    startDate: selectedStartDate,
                    endDate: selectedEndDate,
                  }
                );
                setMaintenance(response);
                showToast.success(
                  `${t('maintenance.toast.reschedule.success.title')}`,
                  `${t('maintenance.toast.reschedule.success.message')}`
                );
                setIsModalVisible(false);
              } catch (error) {
                console.log('Error rescheduling maintenance:', error);
                Alert.alert(
                  `${t('maintenance.toast.reschedule.error.title')}`,
                  `${t('maintenance.toast.reschedule.error.message')}`
                );
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
          ? `${t('maintenance.toast.changeStatus.begin.confirm.title')}`
          : `${t('maintenance.toast.changeStatus.complete.confirm.title')}`,
        isBegin
          ? `${t('maintenance.toast.changeStatus.begin.confirm.message')}`
          : `${t('maintenance.toast.changeStatus.complete.confirm.message')}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, I am sure',
            style: 'default',
            onPress: async () => {
              setIsLoading(true);
              try {
                const res = await VehicleService.changeStatusMaintenance(
                  maintenance?.maintenanceId,
                  status
                );
                showToast.success(
                  isBegin
                    ? `${t('maintenance.toast.changeStatus.begin.success.title')}`
                    : `${t('maintenance.toast.changeStatus.complete.success.title')}`,
                  isBegin
                    ? `${t('maintenance.toast.changeStatus.begin.success.message')}`
                    : `${t('maintenance.toast.changeStatus.complete.success.message')}`
                );
                setMaintenance(res);
              } catch (error) {
                console.log('Error toggling status:', error);
                Alert.alert(
                  isBegin
                    ? `${t('maintenance.toast.changeStatus.begin.error.title')}`
                    : `${t('maintenance.toast.changeStatus.complete.error.title')}`,
                  isBegin
                    ? `${t('maintenance.toast.changeStatus.begin.error.message')}`
                    : `${t('maintenance.toast.changeStatus.complete.error.message')}`
                );
              } finally {
                setIsLoading(false);
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
                    {t('maintenance.detail.description')}
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
              value={maintenance.vehicle.licensePlate || 'No information'}
            />
            <InfoRow
              label={t('vehicle.detail.sectionInfo.label.type')}
              value={maintenance.vehicle.type || 'No information'}
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
                  <Text className="font-semibold text-gray-700">No information</Text>
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
                <Text className="font-semibold text-white">
                  {t('maintenance.detail.actions.reschedule')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-[48%] items-center rounded-xl ${isLoading ? 'bg-gray-600' : 'bg-green-600'} py-4 shadow-sm `}
                disabled={isLoading}
                onPress={() => handleChangeStatus(1)}>
                <Text className="font-semibold text-white">
                  {isLoading
                    ? `${t('maintenance.detail.actions.beginning')}`
                    : `${t('maintenance.detail.actions.begin')}`}
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
                {isLoading
                  ? `${t('maintenance.detail.actions.gettingDone')}`
                  : `${t('maintenance.detail.actions.done')}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-4">
          <Text className="text-right text-sm font-medium text-gray-500">
            {t('maintenance.detail.lastUpdated')}: {formatDatetime(maintenance.lastUpdateAt)}
          </Text>
        </View>

        <Modal
          transparent
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={handleCloseModal}>
          <TouchableOpacity
            onPress={handleCloseModal}
            className="flex-1 justify-center bg-black/30">
            <TouchableOpacity onPress={(e) => e.stopPropagation()}>
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
                  <Calendar
                    markingType="period"
                    markedDates={getMarkedDates()}
                    onDayPress={(day) => handleDayPress(day)}
                    theme={{
                      textSectionTitleColor: '#94a3b8',
                      selectedDayBackgroundColor: '#3b82f6',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#3b82f6',
                      arrowColor: '#3b82f6',
                      selectedDotColor: '#fff',
                    }}
                    minDate={today}
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
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
