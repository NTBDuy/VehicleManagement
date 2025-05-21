import { View, Text, Switch } from 'react-native';
import React, { useState } from 'react';
import InfoRow from 'components/InfoRowComponent';
import { formatDayMonth } from 'utils/datetimeUtils';
import InputField from 'components/InputFieldComponent';
import Vehicle from 'types/Vehicle';
import DropDownPicker from 'react-native-dropdown-picker';

interface ConfirmComponentProps {
  startDate: string;
  endDate: string;
  selectedVehicle: Vehicle | undefined;
  selectedPurpose: string | null;
  setSelectedPurpose: React.Dispatch<React.SetStateAction<string | null>>;
  purpose: string;
  setPurpose: React.Dispatch<React.SetStateAction<string>>;
  isAssignDriver: boolean;
  setIsAssignDriver: React.Dispatch<React.SetStateAction<boolean>>;
}

const RequestConfirm = ({
  startDate,
  endDate,
  selectedVehicle,
  selectedPurpose,
  setSelectedPurpose,
  purpose,
  setPurpose,
  isAssignDriver,
  setIsAssignDriver,
}: ConfirmComponentProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Business trip', value: 'BusinessTrip' },
    { label: 'External meeting', value: 'ExternalMeeting' },
    { label: 'Pick up/drop off guests', value: 'Guests' },
    { label: 'Other', value: 'Other' },
  ]);
  const toggleSwitchDriver = () => setIsAssignDriver((previousState) => !previousState);

  return (
    <View>
      <View className="rounded-2xl bg-white">
        <View className="bg-gray-50 px-4 pb-3">
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
                {selectedVehicle?.Brand} {selectedVehicle?.Model} #{selectedVehicle?.LicensePlate}
              </Text>
            }
            isLast
          />
        </View>
      </View>
      <View className="mt-4 rounded-2xl bg-white">
        <View className="bg-gray-50 px-4 pb-3">
          <Text className="text-lg font-semibold text-gray-800">Purpose</Text>
        </View>
        <View className="p-4">
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Select a purpose</Text>
            <View className="z-10 rounded-lg border border-gray-300 bg-white">
              <DropDownPicker
                open={open}
                value={selectedPurpose}
                items={items}
                setOpen={setOpen}
                setValue={setSelectedPurpose}
                setItems={setItems}
                placeholder="Choose a Purpose..."
                style={{ borderColor: '#D1D5DB', borderRadius: 8 }}
                dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
              />
            </View>
          </View>
          {selectedPurpose === 'Other' && (
            <InputField
              label="Detail Purpose"
              value={purpose}
              onChangeText={setPurpose}
              require={false}
            />
          )}
        </View>
      </View>
      <View className="mt-4 rounded-2xl bg-white">
        <View className="bg-gray-50 px-4 pb-3">
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
  );
};

export default RequestConfirm;
