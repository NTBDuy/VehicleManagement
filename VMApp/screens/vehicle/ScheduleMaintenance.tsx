import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { VehicleService } from 'services/vehicleService';
import { formatDate } from 'utils/datetimeUtils';
import { showToast } from 'utils/toast';

import Assignment from 'types/Assignment';
import Vehicle from 'types/Vehicle';

import Header from 'components/HeaderComponent';
import InfoRow from 'components/InfoRowComponent';
import InputField from 'components/InputFieldComponent';
import LoadingData from 'components/LoadingData';
import MaintenanceSchedule from '@/types/MaintenanceSchedule';

const ScheduleMaintenance = () => {
  const route = useRoute();
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
      newErrors.estimatedEndDate = 'Estimated time is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      showToast.error('Validation Error', 'Please fix the errors above');
      return;
    }

    Alert.alert('Confirm Schedule', 'Are you sure you want to schedule this maintenance?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setIsLoading(true);
          try {
            await VehicleService.scheduleMaintenance(vehicleData.vehicleId, {
              scheduledDate: selectedDate,
              estimatedDurationInDays: estimatedTime,
              description: description.trim(),
            });

            showToast.success('Scheduled', 'Maintenance scheduled successfully!');
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
      <Header title="Schedule Maintenance" backBtn />

      {isLoading ? (
        <LoadingData />
      ) : (
        <ScrollView>
          <View className="px-6">
            <View className="mt-4 mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
              </View>

              <View className="p-4">
                <InfoRow
                  label="Plate number"
                  value={vehicleData.licensePlate || 'No information'}
                />
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
                />
                <InfoRow
                  label="Last maintenance"
                  value={formatDate(vehicleData.lastMaintenance) || 'No information'}
                  isLast
                />
              </View>
            </View>

            <View className="overflow-hidden bg-white shadow-sm rounded-2xl">
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800">
                  Schedule next maintenance
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

                <View className="p-3 mt-4 rounded-lg bg-blue-50">
                  <Text className="text-sm text-gray-600">Selected maintenance date:</Text>
                  <Text className="text-lg font-semibold text-blue-600">
                    {formatDate(selectedDate) || selectedDate}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
              <View className="px-4 py-3 bg-gray-50">
                <InputField
                  label="Estimated Time (days)"
                  value={estimatedTime}
                  onChangeText={setEstimatedTime}
                  keyboardType="numeric"
                  error={errors.estimatedEndDate}
                />

                <InputField
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  error={errors.description}
                />
              </View>
            </View>

            <Pressable className="p-4 mb-6 bg-blue-600 rounded-xl" onPress={handleSchedule}>
              <Text className="text-lg font-semibold text-center text-white">
                Schedule Maintenance
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ScheduleMaintenance;
