import { LocationType } from '@/types/Location';
import { LocationCheckpoint } from '@/types/LocationCheckpoint';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Text, View } from 'react-native';

interface LocationProgressProps {
  currentLocationIndex: number;
  sortedLocations: LocationType[];
  checkpoints: { [key: number]: LocationCheckpoint };
  t: any;
}

const LocationProgress = ({
  currentLocationIndex,
  sortedLocations,
  checkpoints,
  t,
}: LocationProgressProps) => {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <View className="bg-blue-50 px-4 py-3">
        <Text className="text-lg font-bold text-gray-800">{t('request.location.progress')}</Text>
        <Text className="text-sm text-gray-600">
          {t('common.fields.point')} {currentLocationIndex + 1}/{sortedLocations.length}
        </Text>
      </View>

      <View className="p-4">
        {sortedLocations.map((location, index) => {
          const isCurrentLocation = index === currentLocationIndex;
          const isCompletedLocation = checkpoints[index] !== undefined;

          return (
            <View key={`${location.id}-${index}`} className="mb-3 flex-row items-start last:mb-0">
              <View className="mr-3 items-center">
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    isCompletedLocation
                      ? 'bg-green-500'
                      : isCurrentLocation
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                  }`}>
                  {isCompletedLocation ? (
                    <FontAwesomeIcon icon={faCheckCircle} size={16} color="#fff" />
                  ) : (
                    <Text
                      className={`text-sm font-bold ${
                        isCurrentLocation ? 'text-white' : 'text-gray-600'
                      }`}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                {index < sortedLocations.length - 1 && (
                  <View
                    className={`mt-1 h-8 w-0.5 ${
                      isCompletedLocation ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={`font-semibold ${
                    isCurrentLocation
                      ? 'text-blue-600'
                      : isCompletedLocation
                        ? 'text-green-600'
                        : 'text-gray-600'
                  }`}>
                  {location.name}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">{location.address}</Text>
                {location.note && (
                  <Text className="mt-1 text-xs text-gray-400">
                    {t('common.fields.note')}: {location.note}
                  </Text>
                )}
                {isCompletedLocation && (
                  <Text className="mt-1 text-xs text-green-600">
                    ✓ {t('request.location.completedAt')}{' '}
                    {new Date(checkpoints[index].createdAt).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default LocationProgress;
