import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text, View } from 'react-native';
import { formatDate } from 'utils/datetimeUtils';
import { getRequestBorderColor } from 'utils/requestUtils';
import { getVehicleTypeIcon } from 'utils/vehicleUtils';

import Request from 'types/Request';
import { useTranslation } from 'react-i18next';

interface RequestItemProps {
  item: Request;
}

const RequestItem = ({ item }: RequestItemProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const handleViewDetailInProgress = (item: Request) => {
    navigation.navigate('InProgress', { requestData: item });
  };

  const handleViewDetail = (item: Request) => {
    navigation.navigate('RequestDetail', { requestData: item });
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (item.status == 4) {
          handleViewDetailInProgress(item);
        } else {
          handleViewDetail(item);
        }
      }}
      className={`mb-4 mt-1 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 ${getRequestBorderColor(item.status)}`}>
      <View className="flex-row items-center">
        <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
          <Text className="text-xl font-semibold text-white">
            <FontAwesomeIcon
              icon={getVehicleTypeIcon(item.vehicle?.type || 'Sedan')}
              size={24}
              color="#0d4d87"
            />
          </Text>
        </View>

        <View className="ml-1 flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {item.vehicle?.licensePlate}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.vehicle?.brand} {item.vehicle?.model}
          </Text>
        </View>

        <View className="mr-4">
          {item.startTime !== item.endTime ? (
            <View>
              <Text className="text-xs text-gray-500">
                {t('request.list.label.start')}: {formatDate(item.startTime)}
              </Text>
              <Text className="text-xs text-gray-500">
                {t('request.list.label.end')}: {formatDate(item.endTime)}
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-xs text-gray-500">
                {t('common.fields.date')}: {formatDate(item.startTime)}
              </Text>
            </View>
          )}
        </View>

        <View className="items-end">
          <FontAwesomeIcon icon={faChevronRight} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RequestItem;
