import { LocationType } from '@/types/Location';
import { Text, View } from 'react-native';

interface LocationDetailsProps {
  locations: LocationType[];
  estimatedTotalDistance: number;
  stopPointsCount: number;
}

export const LocationDetails = ({
  locations,
  estimatedTotalDistance,
  stopPointsCount,
}: LocationDetailsProps) => {
  const renderLocationItem = (item: LocationType) => (
    <View
      key={`${item.order}-${item.name}`}
      className="mb-3 rounded-lg border-l-4 border-blue-500 bg-slate-100 p-3">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-bold text-gray-800">{item.name}</Text>
        <Text className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-500">
          #{item.order + 1}
        </Text>
      </View>
      <View className="mb-1 flex-row items-center">
        <Text className="mr-2 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          {item.order === 0
            ? 'Điểm xuất phát'
            : item.order === Math.max(...locations.map((l) => l.order))
              ? 'Điểm kết thúc'
              : `Điểm dừng ${item.order}`}
        </Text>
      </View>
      <Text className="mb-1 text-sm text-gray-600">{item.address}</Text>
      {item.note && <Text className="mb-1 text-xs italic text-gray-500">{item.note}</Text>}
      <Text className="font-mono text-xs text-gray-400">
        {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
      </Text>
    </View>
  );

  if (locations.length === 0) return null;

  return (
    <View className="mt-6">
      <View className="bg-gray-50 px-4 pb-3">
        <Text className="text-lg font-semibold text-gray-800">Chi tiết địa điểm đã chọn</Text>
        <Text className="text-sm font-normal text-gray-600">
          Dự kiến hơn {estimatedTotalDistance}Km
        </Text>
        <Text className="mt-1 text-xs text-gray-500">
          Tổng số điểm: {locations.length} | Điểm dừng: {stopPointsCount}
        </Text>
      </View>
      <View className="flex pl-4 pr-2">
        {[...locations].sort((a, b) => a.order - b.order).map((item) => renderLocationItem(item))}
      </View>
    </View>
  );
};
