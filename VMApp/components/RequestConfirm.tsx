import React from 'react';
import { Switch, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { formatDayMonth } from 'utils/datetimeUtils';

import Vehicle from 'types/Vehicle';

import InfoRow from 'components/InfoRowComponent';
import InputField from 'components/InputFieldComponent';

interface ConfirmComponentProps {
  startDate: string;
  endDate: string;
  selectedVehicle: Vehicle | undefined;
  purpose: string;
  setPurpose: React.Dispatch<React.SetStateAction<string>>;
  isAssignDriver: boolean;
  setIsAssignDriver: React.Dispatch<React.SetStateAction<boolean>>;
  errors: string;
  setErrors:React.Dispatch<React.SetStateAction<string>>
}

const RequestConfirm = ({
  startDate,
  endDate,
  selectedVehicle,
  purpose,
  setPurpose,
  isAssignDriver,
  setIsAssignDriver,
  errors,
  setErrors
}: ConfirmComponentProps) => {
  const toggleSwitchDriver = () => setIsAssignDriver((previousState) => !previousState);
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View>
        <View className="bg-white rounded-2xl">
          <View className="px-4 pb-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Request Information</Text>
          </View>

          <View className="p-4">
            <InfoRow
              label="Time"
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {formatDayMonth(startDate)} - {formatDayMonth(endDate)}
                </Text>
              }
            />
            <InfoRow
              label="Vehicle"
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {selectedVehicle?.brand} {selectedVehicle?.model} #{selectedVehicle?.licensePlate}
                </Text>
              }
              isLast
            />
          </View>
        </View>
        <View className="mt-4 bg-white rounded-2xl">
          <View className="px-4 pb-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Purpose</Text>
          </View>
          <View className="p-4">
            <InputField
              label="Detailed Purpose"
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g., Business trip, external meeting, guest pickup/drop-off"
              require={false}
              multiline={true}
              numberOfLines={4}
              error={errors}
            />
          </View>
        </View>
        <View className="mt-4 bg-white rounded-2xl">
          <View className="px-4 pb-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Driver Required?</Text>
          </View>
          <View className="p-4">
            <View className="mb-2">
              <View className="flex-row items-center justify-between">
                <Switch
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={isAssignDriver ? '#fff' : '#f3f4f6'}
                  ios_backgroundColor="#d1d5db"
                  onValueChange={toggleSwitchDriver}
                  value={isAssignDriver}
                  className="-m-2 scale-75"
                />
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {isAssignDriver ? 'Assign a driver' : 'Drive by self'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RequestConfirm;
