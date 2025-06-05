import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { formatDayMonth } from 'utils/datetimeUtils';

import Vehicle from 'types/Vehicle';

import InfoRow from '@/components/ui/InfoRowComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocation, faLocationDot, faLocationPin } from '@fortawesome/free-solid-svg-icons';

interface ConfirmComponentProps {
  startDate: string;
  endDate: string;
  selectedVehicle: Vehicle | undefined;
  purpose: string;
  setPurpose: React.Dispatch<React.SetStateAction<string>>;
  isAssignDriver: boolean;
  setIsAssignDriver: React.Dispatch<React.SetStateAction<boolean>>;
  errors: string;
}

const RequestDestination = ({
  startDate,
  endDate,
  selectedVehicle,
  purpose,
  setPurpose,
  isAssignDriver,
  setIsAssignDriver,
  errors,
}: ConfirmComponentProps) => {
  const [isMultipleDestination, setIsMultipleDestination] = useState(false);
  const toggleSwitch = () => setIsMultipleDestination((previousState) => !previousState);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View>
        <View className="mt-6">
          <View className="mb-1 flex-row items-center">
            <Switch
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={isMultipleDestination ? '#fff' : '#f3f4f6'}
              ios_backgroundColor="#d1d5db"
              onValueChange={toggleSwitch}
              value={isMultipleDestination}
              className="-m-2 scale-75"
            />
            <Text className="ml-2 text-sm text-gray-600">
              {isMultipleDestination ? 'Multi-des' : 'one-des'}
            </Text>
          </View>
        </View>
        <View className="rounded-2xl bg-white px-6 py-4 mt-4">
          <View className='flex-row'>
            <FontAwesomeIcon icon={faLocationDot} color="#2986cc" size={24}/>
            <Text>Điểm đi</Text>
          </View>
          <View className='flex-row mt-4'>
            <FontAwesomeIcon icon={faLocationDot} color="#cc0000" size={24}/>
            <Text>Điểm đến</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RequestDestination;
