import InputField from '@/components/ui/InputFieldComponent';
import { faArrowsUpDown, faLocationDot, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { TouchableOpacity, View } from 'react-native';

interface StopPoint {
  id: string;
  value: string;
  order: number;
}

interface LocationInputProps {
  startLocation: string;
  endLocation: string;
  stopPoints: StopPoint[];
  errors: { startLocation?: string; endLocation?: string };
  onStartLocationChange: (value: string) => void;
  onEndLocationChange: (value: string) => void;
  onStopPointChange: (stopId: string, value: string) => void;
  onInputPress: (inputType: 'from' | 'to' | string) => void;
  onSwapLocations: () => void;
  onAddStopPoint: () => void;
  onRemoveStopPoint: (stopId: string) => void;
  t: any;
}

export const LocationInput = ({
  startLocation,
  endLocation,
  stopPoints,
  errors,
  onStartLocationChange,
  onEndLocationChange,
  onStopPointChange,
  onInputPress,
  onSwapLocations,
  onAddStopPoint,
  onRemoveStopPoint,
  t,
}: LocationInputProps) => {
  return (
    <View className="flex-row px-2">
      <View className="flex-1">
        <View className="mb-4 flex-row items-center">
          <FontAwesomeIcon icon={faLocationDot} color="#2986cc" size={24} />
          <View className="mx-2 -mb-4 flex-1">
            <InputField
              onChangeText={onStartLocationChange}
              placeholder={t('common.placeholder.startPoint')}
              value={startLocation}
              onFocus={() => onInputPress('from')}
              error={errors.startLocation}
              onPress={() => onInputPress('from')}
            />
          </View>
          {stopPoints.length === 0 ? (
            <TouchableOpacity
              onPress={onSwapLocations}
              className="rounded-full border border-gray-200 bg-gray-100 p-2">
              <FontAwesomeIcon icon={faArrowsUpDown} color="#666" size={16} />
            </TouchableOpacity>
          ) : (
            <View className="w-9" />
          )}
        </View>

        {stopPoints
          .sort((a, b) => a.order - b.order)
          .map((stop) => (
            <View key={stop.id} className="mb-4 flex-row items-center">
              <FontAwesomeIcon icon={faLocationDot} color="#ff9800" size={24} />
              <View className="mx-2 -mb-4 flex-1">
                <InputField
                  onChangeText={(value) => onStopPointChange(stop.id, value)}
                  placeholder={`${t('common.placeholder.stopPoint')} ${stop.order}`}
                  value={stop.value}
                  onFocus={() => onInputPress(stop.id)}
                  onPress={() => onInputPress(stop.id)}
                />
              </View>
              <TouchableOpacity
                onPress={() => onRemoveStopPoint(stop.id)}
                className="rounded-full border border-red-200 bg-red-100 p-2">
                <FontAwesomeIcon icon={faTrash} color="#dc2626" size={16} />
              </TouchableOpacity>
            </View>
          ))}

        <View className="mb-4 flex-row items-center">
          <FontAwesomeIcon icon={faLocationDot} color="#cc0000" size={24} />
          <View className="mx-2 -mb-4 flex-1">
            <InputField
              onChangeText={onEndLocationChange}
              placeholder={t('common.placeholder.endPoint')}
              value={endLocation}
              onFocus={() => onInputPress('to')}
              error={errors.endLocation}
              onPress={() => onInputPress('to')}
            />
          </View>
          <TouchableOpacity
            onPress={onAddStopPoint}
            className="rounded-full border border-blue-200 bg-blue-50 p-2">
            <FontAwesomeIcon icon={faPlus} color="#2986cc" size={16} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
