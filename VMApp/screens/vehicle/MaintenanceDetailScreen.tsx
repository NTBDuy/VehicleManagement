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

const MaintenanceDetailScreen = () => {
  const route = useRoute();
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
        'Reschedule Maintenance',
        `Are you sure you want to reschedule maintenance ID#${maintenance.maintenanceId} - ${maintenance.vehicle.licensePlate}?`,
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
                  'Reschedule successfully',
                  'Your maintenance schedule was rescheduled successfully!'
                );
                setIsModalVisible(false);
              } catch (error) {
                console.log('Error rescheduling maintenance:', error);
                Alert.alert('Error', 'Failed to reschedule maintenance');
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
    const action = maintenance.status === 0 ? 'begin' : 'complete';
    const actionText = maintenance.status === 0 ? 'Begin' : 'Complete';

    try {
      Alert.alert(
        `${actionText} Maintenance`,
        `Are you sure you want to ${action} maintenance ID#${maintenance.maintenanceId} - ${maintenance.vehicle.licensePlate}?`,
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
                showToast.success('Success', `Maintenance has been ${action}d`);
                setMaintenance(res);
              } catch (error) {
                console.log('Error toggling status:', error);
                Alert.alert('Error', `Failed to ${action} user`);
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
      <Header backBtn title="Maintenance Details" />

      <View className="px-6">
        <View className="mt-4 mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="p-4 bg-blue-50">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                  <FontAwesomeIcon
                    icon={getVehicleTypeIcon(maintenance.vehicle.type)}
                    size={18}
                    color="#2563eb"
                  />
                </View>
                <View>
                  <Text className="text-sm text-gray-500">
                    Maintenance ID #{maintenance.maintenanceId}
                  </Text>
                  <Text className="text-base font-bold text-gray-800">
                    {formatDate(maintenance.scheduledDate)} -{' '}
                    {formatDate(maintenance.estimatedEndDate)}
                  </Text>
                </View>
              </View>
              {renderBadgeMaintenanceStatus(maintenance.status)}
            </View>
            <View className="p-3 mt-4 border border-orange-200 rounded-xl bg-orange-50">
              <View className="flex-row items-start">
                <View className="items-center justify-center w-6 h-6 mr-3 bg-orange-100 rounded-full">
                  <Text className="text-xs font-bold text-orange-600">!</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-orange-700">Description</Text>
                  <Text className="text-sm leading-5 text-orange-600">
                    {maintenance.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
          </View>

          <View className="p-4">
            <InfoRow
              label="Plate number"
              value={maintenance.vehicle.licensePlate || 'No information'}
            />
            <InfoRow label="Type" value={maintenance.vehicle.type || 'No information'} />
            <InfoRow
              label="Brand & Model"
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
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="w-[48%] items-center rounded-xl bg-orange-500 py-4 shadow-sm "
                onPress={handleReschedule}>
                <Text className="font-semibold text-white">Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-[48%] items-center rounded-xl ${isLoading ? 'bg-gray-600' : 'bg-green-600'} py-4 shadow-sm `}
                disabled={isLoading}
                onPress={() => handleChangeStatus(1)}>
                <Text className="font-semibold text-white">
                  {isLoading ? 'Beginning....' : 'Begin'}
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
                {isLoading ? 'Getting done...' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-4">
          <Text className="text-sm font-medium text-right text-gray-500">
            Last updated: {formatDatetime(maintenance.lastUpdateAt)}
          </Text>
        </View>

        <Modal
          transparent
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={handleCloseModal}>
          <TouchableOpacity onPress={handleCloseModal} className="justify-center flex-1 bg-black/30">
            <TouchableOpacity onPress={(e) => e.stopPropagation()}>
              <View className="mx-6 bg-white rounded-2xl">
                <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                  <Text className="text-lg font-bold text-gray-800">Reschedule Maintenance</Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    className="items-center justify-center w-8 h-8 bg-gray-100 rounded-full ">
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
                        Confirm
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
