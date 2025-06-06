import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, TouchableOpacity, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { VehicleService } from 'services/vehicleService';
import { formatDate } from 'utils/datetimeUtils';
import { showToast } from 'utils/toast';

import Assignment from 'types/Assignment';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import InputField from '@/components/ui/InputFieldComponent';
import LoadingData from '@/components/ui/LoadingData';
import MaintenanceSchedule from '@/types/MaintenanceSchedule';
import { useTranslation } from 'react-i18next';

const ScheduleMaintenance = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { vehicleData: initialVehicleData } = route.params as { vehicleData: Vehicle };
  const navigation = useNavigation<any>();

  const [vehicleData, setVehicleData] = useState<Vehicle>(initialVehicleData);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Partial<MaintenanceSchedule>>({});

  const today = new Date().toISOString().split('T')[0];

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#3b82f6',
      selectedTextColor: '#ffffff',
    },
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MaintenanceSchedule> = {};

    if (!estimatedTime.trim()) {
      newErrors.estimatedEndDate = t('maintenance.validate.estimate');
    }

    if (!description.trim()) {
      newErrors.description = t('maintenance.validate.description');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      showToast.error(`${t('maintenance.validate.error.title')}`, `${t('maintenance.validate.error.message')}`);
      return;
    }

    Alert.alert(`${t('maintenance.toast.schedule.confirm.title')}`, `${t('maintenance.toast.schedule.confirm.message')}`, [
      { text: `${t('common.button.cancel')}`, style: 'cancel' },
      {
        text: `${t('common.button.confirm')}`,
        onPress: async () => {
          setIsLoading(true);
          try {
            await VehicleService.scheduleMaintenance(vehicleData.vehicleId, {
              scheduledDate: selectedDate,
              estimatedDurationInDays: estimatedTime,
              description: description.trim(),
            });

            showToast.success(`${t('maintenance.toast.schedule.success.title')}`, `${t('maintenance.toast.schedule.success.title')}`);
            navigation.goBack();
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('maintenance.schedule.title')} backBtn />

      {isLoading ? (
        <LoadingData />
      ) : (
        <ScrollView>
          <View className="px-6">
            <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('vehicle.detail.sectionInfo.title')}
                </Text>
              </View>

              <View className="p-4">
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.plate')}
                  value={vehicleData.licensePlate || 'No information'}
                />
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.type')}
                  value={vehicleData.type || 'No information'}
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
                      <Text className="font-semibold text-gray-700">No information</Text>
                    )
                  }
                />
                <InfoRow
                  label={t('vehicle.detail.sectionInfo.label.lastMaintenance')}
                  value={formatDate(vehicleData.lastMaintenance) || 'No information'}
                  isLast
                />
              </View>
            </View>

            <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('maintenance.schedule.section.title')}
                </Text>
              </View>
              <View className="p-4">
                <Calendar
                  markingType="dot"
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
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

                <View className="mt-4 rounded-lg bg-blue-50 p-3">
                  <Text className="text-sm text-gray-600">
                    {t('maintenance.schedule.section.selectedDate')}:
                  </Text>
                  <Text className="text-lg font-semibold text-blue-600">
                    {formatDate(selectedDate) || selectedDate}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <InputField
                  label={t('maintenance.schedule.estimate')}
                  value={estimatedTime}
                  onChangeText={setEstimatedTime}
                  keyboardType="numeric"
                  error={errors.estimatedEndDate}
                />

                <InputField
                  label={t('maintenance.schedule.description')}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  error={errors.description}
                />
              </View>
            </View>

            <TouchableOpacity className="mb-6 rounded-xl bg-blue-600 p-4" onPress={handleSchedule}>
              <Text className="text-center text-lg font-semibold text-white">
                {t('maintenance.schedule.actions.schedule')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ScheduleMaintenance;
