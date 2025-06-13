import { formatDate } from '@/utils/datetimeUtils';
import { getVehicleTypeIcon } from '@/utils/vehicleUtils';
import { faClock, faRoute, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { View, Text } from 'react-native';

import Request from '@/types/Request';

import ErrorComponent from '@/components/ui/ErrorComponent';

interface RequestHeaderProps {
  requestData: Request;
}

const RequestHeader = ({ requestData }: RequestHeaderProps) => {
  if (requestData.vehicle == undefined || requestData.user == undefined) {
    return <ErrorComponent />;
  }

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <View className="flex-row items-center justify-between bg-blue-50 px-4 py-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">
            {requestData.vehicle.brand} {requestData.vehicle.model}
          </Text>
          <Text className="mt-1 text-sm text-gray-600">{requestData.vehicle.licensePlate}</Text>
        </View>
        <View className="ml-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <FontAwesomeIcon
            icon={getVehicleTypeIcon(requestData.vehicle?.type)}
            size={20}
            color="#fff"
          />
        </View>
      </View>

      <View className="p-4">
        <View className="space-y-3">
          <View className="mb-2 flex-row items-center">
            <View className="w-8 items-center">
              <FontAwesomeIcon icon={faUser} size={16} color="#6B7280" />
            </View>
            <Text className="ml-2 flex-1 text-base text-slate-700">
              {requestData.user.fullName}
            </Text>
          </View>

          <View className="mb-2 flex-row items-center">
            <View className="w-8 items-center">
              <FontAwesomeIcon icon={faClock} size={16} color="#6B7280" />
            </View>
            <Text className="ml-2 flex-1 text-base text-slate-700">
              {formatDate(requestData.startTime)} - {formatDate(requestData.endTime)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 items-center">
              <FontAwesomeIcon icon={faRoute} size={16} color="#6B7280" />
            </View>
            <Text className="ml-2 flex-1 text-base text-slate-700">{requestData.purpose}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RequestHeader;
