import { getUserInitials } from '@/utils/userUtils';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View, Text } from 'react-native';
import { formatDate } from '@/utils/datetimeUtils';
import { getRequestBackgroundColor, getRequestLabel } from '@/utils/requestUtils';

import Request from '@/types/Request';

interface RequestStatisticItemProps {
  item: Request;
}

const RequestStatisticItem = ({ item }: RequestStatisticItemProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const renderBadgeRequestStatus = ({ status }: { status: number }) => {
    const bgColor = getRequestBackgroundColor(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getRequestLabel(status, t)}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('RequestDetail', { requestData: item });
      }}
      key={item.requestId}
      className="mx-4 mb-3 rounded-2xl bg-white p-4 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
      activeOpacity={0.8}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Text className="text-lg font-bold text-blue-600">
                {getUserInitials(item.user?.fullName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {item.user?.fullName || 'Không xác định'}
              </Text>
              <Text className="text-sm text-gray-600">{formatDate(item.startTime)}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center">
          {renderBadgeRequestStatus({ status: item.status })}
        </View>
        <TouchableOpacity className="ml-3 h-8 w-8 items-center justify-center">
          <FontAwesomeIcon icon={faChevronRight} size={14} color="#D1D5DB" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default RequestStatisticItem;
