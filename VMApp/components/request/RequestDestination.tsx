import {
  faArrowsUpDown,
  faChevronRight,
  faCirclePlus,
  faLocation,
  faLocationCrosshairs,
  faLocationDot,
  faPlus,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

interface validateError {
  startLocation: string;
  endLocation: string;
  purpose: string;
}

interface LocationComponentProps {
  startLocation: string;
  endLocation: string;
  setStartLocation: (value: string) => void;
  setEndLocation: (value: string) => void;
  locations: locationType[];
  setLocations: React.Dispatch<React.SetStateAction<locationType[]>>;
  errors: Partial<validateError>;
  estimatedTotalDistance: number;
  setEstimatedTotalDistance: (value: number) => void;
}

interface Location {
  id: string;
  name: string;
  address: string;
  long?: number;
  lat?: number;
  type: 'recent' | 'favorite' | 'search';
}

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

interface locationType {
  name: string;
  address: string;
  note: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface StopPoint {
  id: string;
  value: string;
  order: number;
}

const RequestDestination = ({
  startLocation,
  endLocation,
  setStartLocation,
  setEndLocation,
  setLocations,
  locations,
  errors,
  estimatedTotalDistance,
  setEstimatedTotalDistance,
}: LocationComponentProps) => {
  const initialLocation = {
    latitude: 10.7769,
    longitude: 106.7009,
  };

  const [activeInput, setActiveInput] = useState<'from' | 'to' | string | null>('from');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<MapLocation>();
  const [location, setLocation] = useState<MapLocation>(initialLocation);
  const [result, setResult] = useState<SearchResult>();
  const [notePointLocation, setNotePointLocation] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [stopPoint, setStopPoint] = useState<StopPoint[]>([]);
  // const [estimatedTotalDistance, setEstimatedTotalDistance] = useState(0);

  useEffect(() => {
    setIsShow(false);
  }, [showLocationModal]);

  useEffect(() => {
    if (locations.length > 1) {
      var sum = 0;
      for (var i = 1; i < locations.length; i++) {
        sum += calculateDistance(
          locations[i - 1].latitude,
          locations[i - 1].longitude,
          locations[i].latitude,
          locations[i].longitude
        );
      }
      setEstimatedTotalDistance(sum);
    }
  }, [locations]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchAddress(searchQuery);
      } else {
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
  };

  const fetchAddress = async (text: string) => {
    if (!text.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      console.log('DATA LOCATION 2: ', json);
      setResult(json[0]);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    fetchAddressFromLocation(loc.coords.latitude, loc.coords.longitude);
  };

  const fetchAddressFromLocation = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      console.log('Fetching location: ', json);
      setResult(json);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const updateStopPoint = (stopId: string, value: string) => {
    setStopPoint((prev) => prev.map((stop) => (stop.id === stopId ? { ...stop, value } : stop)));
  };

  const getOrderByActiveInput = () => {
    if (activeInput === 'from') return 0;
    if (activeInput === 'to') {
      return Math.max(stopPoint.length + 1, 1);
    }

    if (typeof activeInput === 'string' && activeInput.startsWith('stop_')) {
      const stop = stopPoint.find((s) => s.id === activeInput);
      if (stop) return stop.order;
      return stopPoint.length + 1;
    }

    return 0;
  };

  const handleConfirmLocation = () => {
    if (result) {
      const selectedLocation = result.display_name || result.name || '';
      const targetOrder = getOrderByActiveInput();

      const fallbackName = result.display_name ? result.display_name.split(',')[0].trim() : '';
      const locationName = result.name || fallbackName;

      setLocations((prev) => {
        const newPoint: locationType = {
          name: locationName,
          address: result.display_name || '',
          note: notePointLocation,
          latitude: Number(result.lat) || 0,
          longitude: Number(result.lon) || 0,
          order: targetOrder,
        };

        const filteredLocations = prev.filter((loc) => loc.order !== targetOrder);
        const updatedLocations = [...filteredLocations, newPoint].sort((a, b) => a.order - b.order);

        return updatedLocations;
      });

      if (activeInput === 'from') {
        setStartLocation(selectedLocation);
      } else if (activeInput === 'to') {
        setEndLocation(selectedLocation);
      } else if (typeof activeInput === 'string' && activeInput.startsWith('stop_')) {
        updateStopPoint(activeInput, selectedLocation);
      }

      setResult(undefined);
      setNotePointLocation('');
      setShowLocationModal(false);
    }
  };

  const addStopPoint = () => {
    const newOrder = stopPoint.length + 1;
    const newStopPoint: StopPoint = {
      id: `stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      value: '',
      order: newOrder,
    };

    setStopPoint((prev) => [...prev, newStopPoint]);

    setLocations((prev) => {
      return prev.map((loc) => {
        const maxOrder = Math.max(...prev.map((l) => l.order));
        if (loc.order === maxOrder && loc.order > 0) {
          return { ...loc, order: newOrder + 1 };
        }
        return loc;
      });
    });
  };

  const removeStopPoint = (stopId: string) => {
    const stopToRemove = stopPoint.find((stop) => stop.id === stopId);
    if (!stopToRemove) return;

    const removedOrder = stopToRemove.order;
    setStopPoint((prev) => {
      const filtered = prev.filter((stop) => stop.id !== stopId);
      return filtered.map((stop) => ({
        ...stop,
        order: stop.order > removedOrder ? stop.order - 1 : stop.order,
      }));
    });

    setLocations((prev) => {
      return prev
        .filter((loc) => loc.order !== removedOrder)
        .map((loc) => {
          if (loc.order > removedOrder) {
            return { ...loc, order: loc.order - 1 };
          }
          return loc;
        });
    });
  };

  const renderItemLocationDetails = (item: locationType) => (
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

  const calculateDistance = (lat0: number, lon0: number, lat1: number, lon1: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat0 - lat1);
    const dLon = toRad(lon0 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat0)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10;
  };

  const handleSwapLocations = () => {
    if (stopPoint.length > 0) return;

    const temp = startLocation;
    setStartLocation(endLocation);
    setEndLocation(temp);

    setLocations((prev) => {
      const startLoc = prev.find((loc) => loc.order === 0);
      const endLoc = prev.find((loc) => loc.order === 1);

      if (!startLoc || !endLoc) return prev;

      return prev.map((location) => {
        if (location.order === 0) {
          return { ...endLoc, order: 0 };
        }
        if (location.order === 1) {
          return { ...startLoc, order: 1 };
        }
        return location;
      });
    });
  };

  const handleInputPress = (inputType: 'from' | 'to' | string) => {
    setActiveInput(inputType);

    let targetLocation: locationType | undefined;

    if (inputType === 'from') {
      targetLocation = locations.find((loc) => loc.order === 0);
    } else if (inputType === 'to') {
      const maxOrder = Math.max(...locations.map((l) => l.order));
      targetLocation = locations.find((loc) => loc.order === maxOrder && loc.order > 0);
    } else if (typeof inputType === 'string' && inputType.startsWith('stop_')) {
      const stop = stopPoint.find((s) => s.id === inputType);
      if (stop) {
        targetLocation = locations.find((loc) => loc.order === stop.order);
      }
    }

    if (targetLocation) {
      setLocation({
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude,
      });
      setResult(undefined);
    } else {
      setLocation(initialLocation);
      setResult(undefined);
    }

    setShowLocationModal(true);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row px-2">
        <View className="flex-1">
          <View className="mb-4 flex-row items-center">
            <FontAwesomeIcon icon={faLocationDot} color="#2986cc" size={24} />

            <View className="mx-2 -mb-4 flex-1">
              <InputField
                onChangeText={setStartLocation}
                placeholder="Nhập điểm xuất phát"
                value={startLocation}
                onFocus={() => setActiveInput('from')}
                error={errors.startLocation}
                onPress={() => {
                  handleInputPress('from');
                }}
              />
            </View>

            {stopPoint.length == 0 ? (
              <TouchableOpacity
                onPress={() => {
                  handleSwapLocations();
                }}
                className="rounded-full border border-gray-200 bg-gray-100 p-2">
                <FontAwesomeIcon icon={faArrowsUpDown} color="#666" size={16} />
              </TouchableOpacity>
            ) : (
              <View className="w-9"></View>
            )}
          </View>

          {stopPoint
            .sort((a, b) => a.order - b.order)
            .map((stop, index) => (
              <View key={stop.id} className="mb-4 flex-row items-center">
                <FontAwesomeIcon icon={faLocationDot} color="#ff9800" size={24} />
                <View className="mx-2 -mb-4 flex-1">
                  <InputField
                    onChangeText={(value) => {
                      updateStopPoint(stop.id, value);
                    }}
                    placeholder={`Nhập điểm dừng ${stop.order}`}
                    value={stop.value}
                    onFocus={() => setActiveInput(stop.id)}
                    onPress={() => {
                      handleInputPress(stop.id);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => removeStopPoint(stop.id)}
                  className="rounded-full border border-red-200 bg-red-100 p-2">
                  <FontAwesomeIcon icon={faTrash} color="#dc2626" size={16} />
                </TouchableOpacity>
              </View>
            ))}

          <View className="mb-4 flex-row items-center">
            <FontAwesomeIcon icon={faLocationDot} color="#cc0000" size={24} />

            <View className="mx-2 -mb-4 flex-1">
              <InputField
                onChangeText={setEndLocation}
                placeholder="Nhập điểm kết thúc"
                value={endLocation}
                onFocus={() => setActiveInput('to')}
                error={errors.endLocation}
                onPress={() => {
                  handleInputPress('to');
                }}
              />
            </View>

            <TouchableOpacity
              onPress={addStopPoint}
              className="rounded-full border border-blue-200 bg-blue-50 p-2">
              <FontAwesomeIcon icon={faPlus} color="#2986cc" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {locations.length > 0 && (
        <View className="mt-6">
          <View className="bg-gray-50 px-4 pb-3">
            <Text className="text-lg font-semibold text-gray-800">Chi tiết địa điểm đã chọn</Text>
            <Text className="text-sm font-normal text-gray-600">
              Dự kiến hơn {estimatedTotalDistance}Km
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              Tổng số điểm: {locations.length} | Điểm dừng: {stopPoint.length}
            </Text>
          </View>
          <View className="flex pl-4 pr-2">
            {[...locations]
              .sort((a, b) => a.order - b.order)
              .map((item) => renderItemLocationDetails(item))}
          </View>
        </View>
      )}

      <View className="my-2 rounded-xl bg-blue-50 p-4">
        <Text className="mb-1 text-sm font-medium text-blue-900">Lưu ý:</Text>
        <Text className="text-sm text-blue-700">
          • Khoảng cách dự kiến được tính bằng tổng khoảng cách đường thẳng giữa các điểm dừng theo
          thứ tự hành trình (ví dụ: A → B → C). Con số này chỉ mang tính tham khảo và có thể khác
          với khoảng cách thực tế di chuyển. Hệ thống sẽ tính lại khoảng cách thực tế sau khi hoàn
          tất chuyến đi.
        </Text>
      </View>

      <Modal
        visible={showLocationModal}
        transparent={false}
        presentationStyle="fullScreen"
        animationType="slide"
        onRequestClose={() => {
          setShowLocationModal(false);
        }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <SafeAreaView className="relative flex-1 bg-gray-50">
              <View className="absolute left-0 right-0 top-0 z-10">
                <Header
                  isHiddenLeftComponent
                  isOverlay={true}
                  title={`Chọn điểm ${
                    activeInput === 'from'
                      ? 'xuất phát'
                      : activeInput === 'to'
                        ? 'kết thúc'
                        : `dừng ${stopPoint.find((s) => s.id === activeInput)?.order || ''}`
                  }`}
                  searchSection
                  searchQuery={searchQuery}
                  handleSearch={handleSearch}
                  placeholder="Tìm theo địa chỉ"
                  handleClearFilters={handleClearFilters}
                  rightElement={
                    <TouchableOpacity
                      className="rounded-full bg-white p-2"
                      onPress={() => {
                        setShowLocationModal(false);
                      }}>
                      <FontAwesomeIcon icon={faTimes} size={16} color="#6b7280" />
                    </TouchableOpacity>
                  }
                />
              </View>

              <View className="flex-1" style={{ marginTop: 120 }}>
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
                    console.log('Bạn vừa ấn tại toạ độ: ' + latitude + longitude);
                    fetchAddressFromLocation(latitude, longitude);
                    setLocation({ ...location, latitude, longitude });
                  }}>
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                  />
                </MapView>

                {result && (
                  <View className="absolute left-0 right-0 top-4 z-50 mx-4">
                    <View className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl">
                      <TouchableOpacity
                        onPress={async () => {
                          const newLocation = {
                            longitude: Number(result.lon),
                            latitude: Number(result.lat),
                          };
                          console.log(
                            'Bạn vừa ấn tại toạ độ: ' +
                              newLocation.latitude +
                              ',' +
                              newLocation.longitude
                          );
                          setLocation(newLocation);
                        }}
                        className="flex-row items-center px-4 py-3 active:bg-gray-100"
                        activeOpacity={0.7}>
                        <View className="mr-3 flex-shrink-0"></View>
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
                {isShow && (
                  <View className="my-1">
                    <InputField
                      label="Ghi chú địa điểm"
                      require={false}
                      value={notePointLocation}
                      onChangeText={setNotePointLocation}
                      placeholder="Ví dụ cụ thể hẻm bao nhiêu..."
                      multiline
                      numberOfLines={4}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setIsShow(false);
                      }}
                      className="items-center justify-center rounded-lg border border-gray-200/50 bg-blue-100 px-2 py-3">
                      <Text className="font-medium text-blue-700">Lưu</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!isShow && (
                  <View className="my-1">
                    <TouchableOpacity
                      onPress={() => {
                        setIsShow(true);
                      }}
                      className="mb-4 flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-blue-800">
                        Thêm chi tiết địa điểm (Ví dụ: chi tiết hẻm bao nhiêu)
                      </Text>
                      <FontAwesomeIcon icon={faCirclePlus} color="#1d4ed8" size={18} />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={fetchCurrentLocation}
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200/50 bg-blue-100 px-2 py-3">
                        <FontAwesomeIcon icon={faLocationCrosshairs} color="#1d4ed8" size={18} />
                        <Text className="ml-2 font-medium text-blue-700">Vị trí hiện tại</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleConfirmLocation}
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200/50 bg-green-100 px-2 py-3">
                        <Text className="font-medium text-green-700">Xác nhận</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

export default RequestDestination;
