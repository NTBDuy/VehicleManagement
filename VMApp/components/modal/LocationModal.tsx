import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import {
  faChevronRight,
  faCirclePlus,
  faLocation,
  faLocationCrosshairs,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapLocation {
  longitude: number;
  latitude: number;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
}

interface LocationModalProps {
  visible: boolean;
  activeInput: 'from' | 'to' | string | null;
  location: MapLocation;
  searchQuery: string;
  result?: SearchResult;
  notePointLocation: string;
  isShowNote: boolean;
  stopPoints: Array<{ id: string; order: number }>;
  onClose: () => void;
  onSearch: (text: string) => void;
  onClearFilters: () => void;
  onMapPress: (latitude: number, longitude: number) => void;
  onResultPress: (result: SearchResult) => void;
  onCurrentLocation: () => void;
  onConfirmLocation: () => void;
  onNoteChange: (note: string) => void;
  onToggleNote: () => void;
  t: any;
}

export const LocationModal = ({
  visible,
  activeInput,
  location,
  searchQuery,
  result,
  notePointLocation,
  isShowNote,
  stopPoints,
  onClose,
  onSearch,
  onClearFilters,
  onMapPress,
  onResultPress,
  onCurrentLocation,
  onConfirmLocation,
  onNoteChange,
  onToggleNote,
  t,
}: LocationModalProps) => {
  useEffect(() => {
    onClearFilters();
  }, [visible]);

  const getModalTitle = () => {
    if (activeInput === 'from') return t('common.placeholder.startPoint');
    if (activeInput === 'to') return t('common.placeholder.endPoint');
    if (typeof activeInput === 'string' && activeInput.startsWith('stop_')) {
      const stop = stopPoints.find((s) => s.id === activeInput);
      return `${t('common.placeholder.stopPoint')} ${stop?.order || ''}`;
    }
    return '';
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      presentationStyle="fullScreen"
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView className="relative flex-1 bg-gray-50">
            <View className="absolute left-0 right-0 top-0 z-10">
              <Header
                isHiddenLeftComponent
                isOverlay={true}
                title={getModalTitle()}
                searchSection
                searchQuery={searchQuery}
                handleSearch={onSearch}
                placeholder={t('common.searchPlaceholder.location')}
                handleClearFilters={onClearFilters}
                rightElement={
                  <TouchableOpacity className="rounded-full bg-white p-2" onPress={onClose}>
                    <FontAwesomeIcon icon={faTimes} size={16} color="#6b7280" />
                  </TouchableOpacity>
                }
              />
            </View>

            <View className="flex-1" style={{ marginTop: 100 }}>
              <MapView
                style={{ flex: 1 }}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.001,
                  longitudeDelta: 0.001,
                }}
                onPress={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  onMapPress(latitude, longitude);
                }}>
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                />
              </MapView>

              {result && (
                <View className="absolute left-0 right-0 top-8 z-50 mx-4">
                  <View className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl">
                    <TouchableOpacity
                      onPress={() => onResultPress(result)}
                      className="flex-row items-center px-4 py-3 active:bg-gray-100"
                      activeOpacity={0.7}>
                      <View className="mr-3 flex-shrink-0" />
                      <View className="min-w-0 flex-1">
                        <Text className="mb-0.5 text-base font-medium leading-tight text-gray-900">
                          {result.name}
                        </Text>
                        <Text className="text-sm leading-relaxed text-gray-600" numberOfLines={2}>
                          {result.display_name}
                        </Text>
                        <View className="mt-1.5 flex-row items-center">
                          <FontAwesomeIcon icon={faLocation} size={12} color="#9CA3AF" />
                          <Text className="ml-1 font-mono text-xs text-gray-500">
                            {result.lat}, {result.lon}
                          </Text>
                        </View>
                      </View>
                      <View className="ml-3 flex-shrink-0">
                        <View className="h-6 w-6 items-center justify-center">
                          <FontAwesomeIcon icon={faChevronRight} color="#9ca3af" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View className="rounded rounded-t-3xl bg-gray-50 px-6 py-4">
              {isShowNote ? (
                <View className="my-1">
                  <InputField
                    label={t('common.fields.noteAddress')}
                    require={false}
                    value={notePointLocation}
                    onChangeText={onNoteChange}
                    placeholder={t('common.placeholder.noteAddress')}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity
                    onPress={onToggleNote}
                    className="items-center justify-center rounded-lg border border-gray-200/50 bg-blue-100 px-2 py-3">
                    <Text className="font-medium text-blue-700">Lưu</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="my-1">
                  <TouchableOpacity
                    onPress={onToggleNote}
                    className="mb-4 flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-blue-800">
                      {t('request.location.addDetail')}
                    </Text>
                    <FontAwesomeIcon icon={faCirclePlus} color="#1d4ed8" size={18} />
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={onCurrentLocation}
                      className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200/50 bg-blue-100 px-2 py-3">
                      <FontAwesomeIcon icon={faLocationCrosshairs} color="#1d4ed8" size={18} />
                      <Text className="ml-2 font-medium text-blue-700">
                        {t('common.button.currenLocation')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onConfirmLocation}
                      className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200/50 bg-green-100 px-2 py-3">
                      <Text className="font-medium text-green-700">
                        {t('common.button.confirm')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
