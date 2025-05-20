import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { View, Text, FlatList, Pressable } from 'react-native';
import Vehicle from 'types/Vehicle';
import { getVehicleTypeIcon } from 'utils/vehicleUntils';

interface VehiclePickerComponentProps {
  avaibleVehicle: Vehicle[];
  setSelectedVehicle: React.Dispatch<React.SetStateAction<Vehicle | undefined>>;
  selectedVehicle: Vehicle | undefined;
}

const RequestVehiclePicker = ({
  avaibleVehicle,
  setSelectedVehicle,
  selectedVehicle,
}: VehiclePickerComponentProps) => {
  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <Pressable
      onPress={() => setSelectedVehicle(item)}
      className={`mb-4 flex-row items-center rounded-2xl ${selectedVehicle == item ? 'bg-blue-100' : 'bg-gray-100'}  px-2 py-4`}>
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={getVehicleTypeIcon(item.Type)} size={24} color="#0d4d87" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.LicensePlate}</Text>
        <Text className="text-sm">
          {item.Brand} {item.Model}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="px-2">
      <View className="mb-4">
        <View className="bg-gray-50 px-4 ">
          <Text className="text-lg font-semibold text-gray-800">Availbe Vehicle</Text>
        </View>
      </View>
      <View className="mb-20 px-2">
        <FlatList
          data={avaibleVehicle}
          renderItem={renderVehicleItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default RequestVehiclePicker;
