import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FlatList, TouchableOpacity, Text, TextInput, View } from 'react-native';
import { getVehicleTypeIcon } from 'utils/vehicleUtils';

import Vehicle from 'types/Vehicle';
import { useMemo, useState } from 'react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface VehiclePickerComponentProps {
  availableVehicle: Vehicle[];
  setSelectedVehicle: React.Dispatch<React.SetStateAction<Vehicle | undefined>>;
  selectedVehicle: Vehicle | undefined;
}

const RequestVehiclePicker = ({
  availableVehicle,
  setSelectedVehicle,
  selectedVehicle,
}: VehiclePickerComponentProps) => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicle = useMemo(() => {
    let filtered = [...availableVehicle];
    const q = searchQuery.toLowerCase();

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.licensePlate.toLowerCase().includes(q) ||
          item.type.toLocaleLowerCase().toLowerCase().includes(q) ||
          item.brand.toLocaleLowerCase().toLowerCase().includes(q) ||
          item.model.toLocaleLowerCase().toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [availableVehicle, searchQuery]);

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      onPress={() => setSelectedVehicle(item)}
      className={`mb-4 flex-row items-center rounded-2xl ${selectedVehicle == item ? 'bg-blue-100' : 'bg-gray-100'}  px-2 py-4`}>
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={getVehicleTypeIcon(item.type)} size={24} color="#0d4d87" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.licensePlate}</Text>
        <Text className="text-sm">
          {item.brand} {item.model}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-2">
      <View className="mb-2">
        <View className="bg-gray-50 px-4 ">
          <Text className="text-lg font-semibold text-gray-800">{t('request.create.vehiclePicker.title')}</Text>
        </View>
      </View>
      <View className="mx-2 mb-6">
        <View className="flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <FontAwesomeIcon icon={faSearch} size={18} color="#6b7280" />
          <TextInput
            className="ml-3 flex-1 text-base text-gray-800"
            placeholder={t('request.create.vehiclePicker.searchPlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <View className="mb-20 px-2">
        <FlatList
          data={filteredVehicle}
          renderItem={renderVehicleItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default RequestVehiclePicker;
