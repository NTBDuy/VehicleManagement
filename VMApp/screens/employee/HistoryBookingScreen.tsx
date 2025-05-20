import { View, Text, SafeAreaView, Pressable, FlatList } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import Request from 'types/Request';
import requestData from 'data/request.json';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from 'utils/datetimeUtils';
import EmptyList from 'components/EmptyListComponent';
import { getVehicleTypeIcon } from 'utils/vehicleUntils';
import { getBorderColorByStatus } from 'utils/requestUtils';

const requests: Request[] = requestData;

const HistoryBookingScreen = () => {
  const [userRequest, setUserRequest] = useState<Request[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      getRequestByUserID(user.UserId);
    }
  }, [user]);

  const getRequestByUserID = (userId: number) => {
    const data = requests.filter((request) => request.UserId === userId);
    return setUserRequest(data);
  };

  const renderRequestItem = ({ item }: { item: Request }) => (
    <Pressable
      onPress={() => {}}
      className={`mb-4 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 ${getBorderColorByStatus(item.Status)}`}>
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

        <View className="ml-4 flex-1">
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="History Booking" />
      <View className="mt-6 px-6">
        <FlatList
          data={userRequest}
          renderItem={renderRequestItem}
          ListEmptyComponent={<EmptyList title="User never requested vehicle" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryBookingScreen;
