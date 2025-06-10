import {
  faChevronRight,
  faHistory,
  faLocationCrosshairs,
  faLocationDot,
  faMapLocationDot,
  faPlusCircle,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import InputField from '@/components/ui/InputFieldComponent';
import { useState } from 'react';

interface validateError {
  startLocation: string;
  endLocation: string;
  purpose: string;
}

interface LocationComponentProps {
  startLocation: string;
  endLocation: string;
  setStartLocation: (value: string) => void;
  setEndLocation: (value: string) => void;
  errors: Partial<validateError>;
}
interface Location {
  id: string;
  name: string;
  address: string;
  long?: number;
  lat?: number;
  type: 'recent' | 'favorite' | 'search';
}

const RequestDestination = ({
  startLocation,
  endLocation,
  setStartLocation,
  setEndLocation,
  errors
}: LocationComponentProps) => {
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);

  const recentLocations: Location[] = [
    { id: '1', name: 'Nhà', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', type: 'favorite' },
    { id: '2', name: 'Công ty', address: '456 Lê Văn Việt, Quận 9, TP.HCM', type: 'favorite' },
    {
      id: '3',
      name: 'Bitexco Financial Tower',
      address: '2 Hải Triều, Quận 1, TP.HCM',
      type: 'recent',
    },
    {
      id: '4',
      name: 'Landmark 81',
      address: '720A Điện Biên Phủ, Bình Thạnh, TP.HCM',
      type: 'recent',
    },
  ];

  const handlePressSelectLocation = (item: Location) => {
    if (activeInput == 'from') {
      const location = item.address;
      setStartLocation(location);
    } else {
      const location = item.address;
      setEndLocation(location);
    }
  };

  const renderLocationItem = (item: Location) => {

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handlePressSelectLocation(item)}
        className="flex-row items-center border-b border-gray-100 px-4 py-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <FontAwesomeIcon
            icon={item.type === 'favorite' ? faStar : faHistory}
            color={item.type === 'favorite' ? '#FFD700' : '#666'}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">{item.address}</Text>
        </View>
        <FontAwesomeIcon icon={faChevronRight} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="bg-gray-50 px-4 pb-3">
        <Text className="text-lg font-semibold text-gray-800">Chọn điểm đi - điểm đến</Text>
      </View>
      <View className="flex rounded-2xl bg-white px-4 py-6">
        <View className="px-2">
          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faLocationDot} color="#2986cc" size={24} />
            <View className="ml-4 flex-1">
              <InputField
                label="Điểm đi"
                onChangeText={setStartLocation}
                value={startLocation}
                onFocus={() => setActiveInput('from')}
                error={errors.startLocation}
              />
            </View>
          </View>
          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faLocationDot} color="#cc0000" size={24} />
            <View className="ml-4 flex-1">
              <InputField
                label="Điểm đến"
                onChangeText={setEndLocation}
                value={endLocation}
                onFocus={() => setActiveInput('to')}
                error={errors.endLocation}
              />
            </View>
          </View>
        </View>
        <View className="mt-2 flex-row items-center gap-2 px-2">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-100 px-2 py-3">
            <FontAwesomeIcon icon={faLocationCrosshairs} color="#1d4ed8" size={18} />
            <Text className="ml-2 font-medium text-blue-700">Vị trí hiện tại</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-lg bg-green-100 px-2 py-3">
            <FontAwesomeIcon icon={faMapLocationDot} color="#15803d" size={18} />
            <Text className="ml-2 font-medium text-green-700">Chọn trên bản đồ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 bg-gray-50 px-4 pb-3">
        <Text className="text-lg font-semibold text-gray-800">Địa điểm gần đây</Text>
      </View>
      <View className="flex rounded-2xl bg-white px-4 py-6">
        {recentLocations.slice(0, 6).map(renderLocationItem)}
      </View>
      <TouchableOpacity className="mx-4 mt-4 flex-row items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-4">
        <FontAwesomeIcon icon={faPlusCircle} size={24} color="#666" />
        <Text className="ml-2 font-medium text-gray-600">Thêm địa điểm mới</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RequestDestination;
