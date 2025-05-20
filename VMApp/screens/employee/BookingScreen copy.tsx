import { View, Text, SafeAreaView, Platform, Pressable, Switch } from 'react-native';
import React, { useState } from 'react';
import Header from 'components/HeaderComponent';
import DateTimePicker from '@react-native-community/datetimepicker';
import InfoRow from 'components/InfoRowComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { formatDayMonth } from 'utils/datetimeUtils';
import InputField from 'components/InputFieldComponent';

const Booking = () => {
  const [startDate, setStartDate] = useState('2025-05-18T14:20:00Z');
  const [endDate, setEndDate] = useState('2025-05-31T14:20:00Z');
  const [purpose, setPurpose] = useState('');

  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const toggleSwitch = () => setIsRoundTrip((previousState) => !previousState);

  return (
    <SafeAreaView className="bg-gray-50">
      <Header title="Booking" />

      <View className="mt-4 px-6">
        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-sm text-gray-500">
              Please complete the form below here to create new request.
            </Text>
          </View>
        </View>

        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Request Information</Text>
          </View>
          <View className="p-4">
            <View className="mb-4">
              <View className="mb-1 flex-row items-center">
                <Switch
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={isRoundTrip ? '#fff' : '#f3f4f6'}
                  ios_backgroundColor="#d1d5db"
                  onValueChange={toggleSwitch}
                  value={isRoundTrip}
                  className="-m-2 scale-75"
                />
                <Text className="ml-2 text-sm text-gray-600">Round trip</Text>
              </View>
            </View>
            {isRoundTrip ? (
              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">
                  Start & End Date <Text className="text-red-500">*</Text>
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  {/* <FontAwesomeIcon icon={faCalendarDays} color="#93c5fd" size={18} /> */}
                  <View className="flex-row">
                    <Text className="">{formatDayMonth(startDate)} - </Text>
                    <Text className="">{formatDayMonth(endDate)}</Text>
                  </View>
                  <Pressable className="rounded-2xl bg-blue-300 px-8 py-2 active:bg-blue-400">
                    <FontAwesomeIcon icon={faCalendarDays} color="#fff" size={18} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">
                  Date <Text className="text-red-500">*</Text>
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="">{formatDayMonth(startDate)}</Text>
                  <Pressable className="rounded-2xl bg-blue-300 px-8 py-2 active:bg-blue-400">
                    <FontAwesomeIcon icon={faCalendarDays} color="#fff" size={18} />
                  </Pressable>
                </View>
              </View>
            )}

            <View className="mb-4">
              <InputField label="Purpose" value={purpose} onChangeText={setPurpose} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Booking;
