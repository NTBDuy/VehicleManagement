import {
  faChevronRight,
  faHistory,
  faLocation,
  faLocationCrosshairs,
  faLocationDot,
  faMapLocationDot,
  faPlusCircle,
  faStar,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import InputField from '@/components/ui/InputFieldComponent';
import Header from '@/components/layout/HeaderComponent';

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
  errors: Partial<validateError>;
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

const RequestDestination = ({
  startLocation,
  endLocation,
  setStartLocation,
  setEndLocation,
  errors,
}: LocationComponentProps) => {
  const initialLocation = {
    latitude: 10.7769,
    longitude: 106.7009,
  };

  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>('from');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<MapLocation>();
  const [location, setLocation] = useState<MapLocation>(initialLocation);
  const [result, setResult] = useState<SearchResult[]>([]);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    };

    getLocation();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchAddress(searchQuery);
      } else {
        setResult([]);
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
      setResult(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Search error:', error);
      setResult([]);
    }
  };

  const recentLocations: Location[] = [
    { id: '1', name: 'Nhà', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', type: 'favorite' },
    { id: '2', name: 'Công ty', address: '456 Lê Văn Việt, Quận 9, TP.HCM', type: 'favorite' },
    {
      id: '3',
      name: 'Bitexco Financial Tower',
      address: '2 Hải Triều, Quận 1, TP.HCM',
      type: 'recent',
    },
    {
      id: '4',
      name: 'Landmark 81',
      address: '720A Điện Biên Phủ, Bình Thạnh, TP.HCM',
      type: 'recent',
    },
  ];

  const handlePressSelectLocation = (item: Location) => {
    if (activeInput == 'from') {
      const location = item.address;
      setStartLocation(location);
    } else {
      const location = item.address;
      setEndLocation(location);
    }
  };

  const renderLocationItem = (item: Location) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handlePressSelectLocation(item)}
        className="flex-row items-center border-b border-gray-100 px-4 py-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <FontAwesomeIcon
            icon={item.type === 'favorite' ? faStar : faHistory}
            color={item.type === 'favorite' ? '#FFD700' : '#666'}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">{item.address}</Text>
        </View>
        <FontAwesomeIcon icon={faChevronRight} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="bg-gray-50 px-4 pb-3">
        <Text className="text-lg font-semibold text-gray-800">Chọn điểm đi - điểm đến</Text>
      </View>
      <View className="flex rounded-2xl bg-white px-4 py-6">
        <View className="px-2">
          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faLocationDot} color="#2986cc" size={24} />
            <View className="ml-4 flex-1">
              <InputField
                label="Điểm đi"
                onChangeText={setStartLocation}
                value={startLocation}
                onFocus={() => setActiveInput('from')}
                error={errors.startLocation}
                onPress={() => {
                  setShowLocationModal(true);
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faLocationDot} color="#cc0000" size={24} />
            <View className="ml-4 flex-1">
              <InputField
                label="Điểm đến"
                onChangeText={setEndLocation}
                value={endLocation}
                onFocus={() => setActiveInput('to')}
                error={errors.endLocation}
                onPress={() => {
                  setShowLocationModal(true);
                }}
              />
            </View>
          </View>
        </View>
        <View className="mt-2 flex-row items-center gap-2 px-2">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-100 px-2 py-3">
            <FontAwesomeIcon icon={faLocationCrosshairs} color="#1d4ed8" size={18} />
            <Text className="ml-2 font-medium text-blue-700">Vị trí hiện tại</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-lg bg-green-100 px-2 py-3">
            <FontAwesomeIcon icon={faMapLocationDot} color="#15803d" size={18} />
            <Text className="ml-2 font-medium text-green-700">Chọn trên bản đồ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 bg-gray-50 px-4 pb-3">
        <Text className="text-lg font-semibold text-gray-800">Địa điểm gần đây</Text>
      </View>
      <View className="flex rounded-2xl bg-white px-4 py-6">
        {recentLocations.slice(0, 6).map(renderLocationItem)}
      </View>
      <TouchableOpacity className="mx-4 mt-4 flex-row items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-4">
        <FontAwesomeIcon icon={faPlusCircle} size={24} color="#666" />
        <Text className="ml-2 font-medium text-gray-600">Thêm địa điểm mới</Text>
      </TouchableOpacity>

      <Modal
        visible={showLocationModal}
        transparent={false}
        presentationStyle="fullScreen"
        animationType="slide"
        onRequestClose={() => {
          setShowLocationModal(false);
        }}>
        <SafeAreaView className="relative flex-1 bg-gray-50">
          <View className="-mb-12 mt-2 flex-1">
            <MapView
              style={{ height: '100%', width: '100%' }}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                console.log('Bạn vừa ấn tại toạ độ: ' + latitude + longitude);
                setLocation({ ...location, latitude, longitude });
              }}
            />
          </View>

          {result.length > 0 && (
            <View className="absolute left-0 right-0 top-56 z-50 mx-4">
              <View className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl">
                <TouchableOpacity
                  onPress={() => {
                    const location = {
                      longitude: Number(result[0].lon),
                      latitude: Number(result[0].lat),
                    };
                    console.log(
                      'Bạn vừa ấn tại toạ độ: ' + location.latitude + ',' + location.longitude
                    );
                    setLocation(location);
                  }}
                  className={`flex-row items-center px-4 py-3 active:bg-gray-100`}
                  activeOpacity={0.7}>
                  <View className="mr-3 flex-shrink-0"></View>

                  <View className="min-w-0 flex-1">
                    <Text className="mb-0.5 text-base font-medium leading-tight text-gray-900">
                      {result[0].name}
                    </Text>

                    <Text className="text-sm leading-relaxed text-gray-600" numberOfLines={2}>
                      {result[0].display_name}
                    </Text>

                    <View className="mt-1.5 flex-row items-center">
                      <FontAwesomeIcon icon={faLocation} size={12} color="#9CA3AF" />
                      <Text className="ml-1 font-mono text-xs text-gray-500">
                        {result[0].lat}, {result[0].lon}
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

          <View className="absolute left-0 right-0 top-0 z-10">
            <Header
              isHiddenLeftComponent
              isOverlay={true}
              title={`Chọn điểm ${activeInput == 'from' ? 'xuất phát' : 'kết thúc'}`}
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
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
};

export default RequestDestination;
