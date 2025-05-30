import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { getVehicleTypeIcon } from 'utils/vehicleUtils';

import Vehicle from 'types/Vehicle';
import { useMemo, useState } from 'react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

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
    <Pressable
      onPress={() => setSelectedVehicle(item)}
      className={`mb-4 flex-row items-center rounded-2xl ${selectedVehicle == item ? 'bg-blue-100' : 'bg-gray-100'}  px-2 py-4`}>
      <View className="items-center justify-center w-12 h-12 ml-2 mr-4 bg-blue-300 rounded-full">
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
    </Pressable>
  );

  return (
    <View className="px-2">
      <View className="mb-2">
        <View className="px-4 bg-gray-50 ">
          <Text className="text-lg font-semibold text-gray-800">Available Vehicle</Text>
        </View>
      </View>
      <View className="mx-2 mb-6">
        <View className="flex-row items-center px-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm">
          <FontAwesomeIcon icon={faSearch} size={18} color="#6b7280" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-800"
            placeholder="Search plate, type or brand..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <View className="px-2 mb-20">
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
