import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Pressable, View, Text } from 'react-native';
import { formatDate } from 'utils/datetimeUtils';
import { getColorByStatus } from 'utils/requestUtils';
import { getVehicleTypeIcon } from 'utils/vehicleUntils';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Request from 'types/Request';
import { useNavigation } from '@react-navigation/native';

interface RequestItemProps {
  item: Request;
}

const RequestItem = ({ item }: RequestItemProps) => {
  const navigation = useNavigation<any>();

  const handleViewDetail = (item: Request) => {
    navigation.navigate('RequestDetail', { requestData: item });
  };

  return (
    <Pressable
      onPress={() => handleViewDetail(item)}
      className={`mb-4 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 ${getColorByStatus(item.Status)}`}>
      <View className="flex-row items-center">
        <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
          <Text className="text-xl font-semibold text-white">
            <FontAwesomeIcon
              icon={getVehicleTypeIcon(item.Vehicle?.Type || 'Sedan')}
              size={24}
              color="#0d4d87"
            />
          </Text>
        </View>

        <View className="ml-1 flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {item.Vehicle?.LicensePlate}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.Vehicle?.Brand} {item.Vehicle?.Model}
          </Text>
        </View>

        <View className="mr-4">
          <Text className="text-xs text-gray-500">Start: {formatDate(item.StartTime)}</Text>
          <Text className="text-xs text-gray-500">End: {formatDate(item.EndTime)}</Text>
        </View>

        <View className="items-end">
          <View className="mt-1">
            <FontAwesomeIcon icon={faEllipsisV} size={16} color="#6B7280" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default RequestItem;
