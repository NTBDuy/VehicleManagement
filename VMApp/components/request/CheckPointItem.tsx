import CheckPoint from '@/types/CheckPoint';
import { formatDatetime } from '@/utils/datetimeUtils';
import { API_CONFIG } from 'config/apiConfig';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

interface CheckPointItemProps {
  item: CheckPoint;
  index: number;
  size: number;
}

const CheckPointItem = ({ item, index, size }: CheckPointItemProps) => {
  const [checkPoint, setCheckPoint] = useState<CheckPoint[]>([]);
  const [visible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const { t } = useTranslation();

  const handleMapsView = (lat: number, long: number) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    const latLng = `${lat},${long}`;
    const label = 'Destination';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => console.error('Failed to open map:', err));
    }
  };

  const renderPhotos = (item: CheckPoint) => {
    if (!item.photos) return null;
    console.log(`${API_CONFIG.BASE_URL}/request/files/${item.photos[0].name}`);

    return (
      <View className="mb-3" key={item.checkPointId}>
        <Text className="mb-2 text-sm font-semibold text-gray-800">
          {t('common.fields.image')} ({item.photos.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {item.photos.map((photo) => (
            <TouchableOpacity
              key={photo.photoId}
              className="mr-2"
              onPress={() => handlePhotoPress(photo)}>
              <Image
                source={{ uri: `${API_CONFIG.BASE_URL}/request/files/${photo.name}` }}
                className="h-20 w-20 rounded-lg"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handlePhotoPress = (photo: any) => {
    console.log('Photo pressed:', `${API_CONFIG.BASE_URL}/request/files/${photo.name}`);
    setCurrentImage(`${API_CONFIG.BASE_URL}/request/files/${photo.name}`);
    setIsVisible(true);
  };

  return (
    <View
      className={`border-gray-100 ${index == checkPoint.length - 1 ? 'pt-2' : 'border-b py-2 '}`}>
      <View className="mb-3 flex-row items-center justify-between">
        <View
          className={`rounded-full px-3 py-1.5 ${
            index == size - 1 ? 'bg-orange-500' : 'bg-green-500'
          }`}>
          <Text className="text-sm font-semibold text-white">
            {index == size - 1 ? 'Check-out' : 'Check-in'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-semibold text-gray-800">
            {formatDatetime(item.createdAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="mb-3 flex-row items-center rounded-lg bg-gray-50 p-3"
        onPress={() => handleMapsView(item.latitude, item.longitude)}>
        <Text className="mr-2 text-sm text-gray-600">{t('common.fields.location')}:</Text>
        <Text className="flex-1 font-mono text-sm text-gray-800">
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
      </TouchableOpacity>

      {item.photos.length > 0 && renderPhotos(item)}

      {item.note && (
        <View className="mb-3 rounded-lg bg-gray-50 p-3">
          <Text className="mb-2 text-sm font-semibold text-gray-800">
            {t('common.fields.note')}
          </Text>
          <Text className="text-sm leading-5 text-gray-800">{item.note}</Text>
        </View>
      )}
      <ImageViewing
        images={[{ uri: currentImage }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </View>
  );
};

export default CheckPointItem;
