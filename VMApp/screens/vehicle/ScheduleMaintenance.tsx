import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { VehicleService } from 'services/vehicleService';
import { formatDate } from 'utils/datetimeUtils';
import { showToast } from 'utils/toast';

import MaintenanceSchedule from '@/types/MaintenanceSchedule';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import InputField from '@/components/ui/InputFieldComponent';
import LoadingData from '@/components/ui/LoadingData';
import MyCalendar from '@/components/ui/MyCalendar';
import { maintenanceSchema } from '@/validations/maintenanceSchema';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface ScheduleFormData {
  estimatedEndDate: number;
  description: string;
}

const ScheduleMaintenance = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { vehicleData } = route.params as { vehicleData: Vehicle };
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];

  const makeScheduleSchema = maintenanceSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormData>({
    resolver: yupResolver(makeScheduleSchema),
    defaultValues: {
      estimatedEndDate: 0,
      description: '',
    },
    mode: 'onChange',
  });

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

  const onSubmit = async (data: ScheduleFormData) => {
    Alert.alert(
      `${t('common.confirmation.title.schedule')}`,
      `${t('common.confirmation.message.schedule')}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.confirm')}`,
          onPress: async () => {
            try {
              await VehicleService.scheduleMaintenance(vehicleData.vehicleId, {
                scheduledDate: selectedDate,
                ...data,
              });

              showToast.success(`${t('common.success.title')}`, `${t('common.success.schedule')}`);
              navigation.goBack();
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleSchedule = async () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('maintenance.schedule.title')} backBtn />

      {isSubmitting ? (
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
                  label={t('vehicle.detail.sectionInfo.label.lastMaintenance')}
                  value={formatDate(vehicleData.lastMaintenance) || t('common.fields.noInfo')}
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
                <MyCalendar
                  markingType="dot"
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  minDate={today}
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
                <Controller
                  control={control}
                  name="estimatedEndDate"
                  render={({ field: { onChange, value } }) => (
                    <InputField
                      label={t('maintenance.schedule.estimate')}
                      value={value}
                      onChangeText={(val) => onChange(Number(val))}
                      keyboardType="numeric"
                      error={errors.estimatedEndDate?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <InputField
                      label={t('common.fields.description')}
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      error={errors.description?.message}
                    />
                  )}
                />
              </View>
            </View>

            <TouchableOpacity className="mb-6 rounded-xl bg-blue-600 p-4" onPress={handleSchedule}>
              <Text className="text-center text-lg font-semibold text-white">
                {t('common.button.schedule')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ScheduleMaintenance;
