import { formatDate } from '@/utils/datetimeUtils';
import { getVehicleTypeIcon } from '@/utils/vehicleUtils';
import {
  faCamera,
  faCheckCircle,
  faClock,
  faLocationDot,
  faUser,
  faWarning,
  faTrash,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Alert, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Image,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { showToast } from '@/utils/toast';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import Request from 'types/Request';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InputField from '@/components/ui/InputFieldComponent';

interface LocationType {
  latitude: number;
  longitude: number;
}

interface ImageType {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

const RequestInProgress = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { requestData: initialRequestData } = route.params as { requestData: Request };
  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [isASameDate] = useState(initialRequestData.startTime == initialRequestData.endTime);
  const [note, setNote] = useState('');
  const [checkInLocation, setCheckInLocation] = useState<LocationType>();
  const [checkOutLocation, setCheckOutLocation] = useState<LocationType>();
  const [beforeImages, setBeforeImages] = useState<ImageType[]>([]);
  const [afterImages, setAfterImages] = useState<ImageType[]>([]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      showToast.error('Permission to access location was denied.');
    }

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      showToast.error('Permission to access camera was denied.');
    }

    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== 'granted') {
      showToast.error('Permission to access media library was denied.');
    }
  };

  if (requestData == null || requestData.vehicle == null || requestData.user == null) {
    return <ErrorComponent />;
  }

  const showImagePickerOptions = (isBefore: boolean) => {
    const currentImages = isBefore ? beforeImages : afterImages;
    
    if (currentImages.length >= 2) {
      showToast.error('Tối đa 2 ảnh cho mỗi phần');
      return;
    }

    const options = [
      'Chụp ảnh',
      'Chọn từ thư viện',
      'Hủy'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera(isBefore);
          } else if (buttonIndex === 1) {
            openImageLibrary(isBefore);
          }
        }
      );
    } else {
      Alert.alert(
        'Chọn ảnh',
        'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
        [
          { text: 'Chụp ảnh', onPress: () => openCamera(isBefore) },
          { text: 'Chọn từ thư viện', onPress: () => openImageLibrary(isBefore) },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
    }
  };

  const openCamera = async (isBefore: boolean) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: ImageType = {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: result.assets[0].type,
        };

        if (isBefore) {
          setBeforeImages(prev => [...prev, newImage]);
        } else {
          setAfterImages(prev => [...prev, newImage]);
        }

        showToast.success('Đã thêm ảnh thành công!');
      }
    } catch (error) {
      console.error('Camera error:', error);
      showToast.error('Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const openImageLibrary = async (isBefore: boolean) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: ImageType = {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: result.assets[0].type,
        };

        if (isBefore) {
          setBeforeImages(prev => [...prev, newImage]);
        } else {
          setAfterImages(prev => [...prev, newImage]);
        }

        showToast.success('Đã thêm ảnh thành công!');
      }
    } catch (error) {
      console.error('Image library error:', error);
      showToast.error('Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const removeImage = (index: number, isBefore: boolean) => {
    Alert.alert(
      'Xóa ảnh',
      'Bạn có chắc chắn muốn xóa ảnh này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (isBefore) {
              setBeforeImages(prev => prev.filter((_, i) => i !== index));
            } else {
              setAfterImages(prev => prev.filter((_, i) => i !== index));
            }
            showToast.success('Đã xóa ảnh');
          }
        }
      ]
    );
  };

  const renderImages = (images: ImageType[], isBefore: boolean) => { 
    if (images.length === 0) return null;

    return (
      <View className="mt-4">
        <Text className="mb-2 text-sm font-medium text-gray-600">
          Ảnh đã chọn ({images.length}/2):
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {images.map((image, index) => (
            <View key={index} className="mr-3 relative mb-2">
              <Image
                source={{ uri: image.uri }}
                className="h-20 w-20 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeImage(index, isBefore)}
                className="absolute -right-2 -bottom-2 h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-sm"
                activeOpacity={0.7}>
                <FontAwesomeIcon icon={faTrash} size={10} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleCheckIn = async () => {
    if (beforeImages.length === 0) {
      Alert.alert(
        'Thiếu ảnh',
        'Vui lòng chụp ít nhất 1 ảnh xe trước khi check-in',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const newCheckInLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCheckInLocation(newCheckInLocation);

      console.log(
        'Your location is: ' + newCheckInLocation.latitude + ' ' + newCheckInLocation.longitude
      );

      showToast.success('Check-in thành công!');
    } catch (error) {
      console.error('Check-in error:', error);
      showToast.error('Không thể lấy vị trí. Vui lòng thử lại.');
    }
  };

  const handleCheckOut = async () => {
    if (afterImages.length === 0) {
      Alert.alert(
        'Thiếu ảnh',
        'Vui lòng chụp ít nhất 1 ảnh xe trước khi check-out',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const newCheckOutLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCheckOutLocation(newCheckOutLocation);

      console.log(
        'Your location is: ' + newCheckOutLocation.latitude + ' ' + newCheckOutLocation.longitude
      );

      Alert.alert(
        'Check-out thành công',
        `Bạn đã Check-in tại ${checkInLocation?.latitude}, ${checkInLocation?.longitude} và Check-out tại ${newCheckOutLocation.latitude}, ${newCheckOutLocation.longitude}`
      );

      showToast.success('Check-out thành công!');
    } catch (error) {
      console.error('Check-out error:', error);
      showToast.error('Không thể lấy vị trí. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header title="Check-in" backBtn />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <View className="flex-row items-center justify-between bg-blue-50 px-4 py-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">
                  {requestData.vehicle.brand} {requestData.vehicle.model}
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  {requestData.vehicle.licensePlate}
                </Text>
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
                    {!isASameDate
                      ? `${formatDate(requestData.startTime)} - ${formatDate(requestData.endTime)}`
                      : `${formatDate(requestData.startTime)}`}
                  </Text>
                </View>

                <View className="mb-2 flex-row items-start">
                  <View className="w-8 items-center pt-0.5">
                    <FontAwesomeIcon icon={faLocationDot} color="#6B7280" size={16} />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-medium text-gray-500">Điểm đi:</Text>
                    <Text className="text-base text-slate-700">{requestData.startLocation}</Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="w-8 items-center pt-0.5">
                    <FontAwesomeIcon icon={faLocationDot} color="#6B7280" size={16} />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-medium text-gray-500">Điểm đến:</Text>
                    <Text className="text-base text-slate-700">{requestData.endLocation}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {checkInLocation == undefined ? (
              <View>
                <View className="p-4">
                  <Text className="mb-3 text-base font-semibold text-gray-800">
                    Hình ảnh xe (trước khi sử dụng)
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => showImagePickerOptions(true)}
                    className="items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 active:border-blue-400 active:bg-blue-50"
                    activeOpacity={0.7}>
                    <FontAwesomeIcon icon={faCamera} color="#9CA3AF" size={32} />
                    <Text className="mt-3 text-base font-medium text-gray-700">
                      Chụp hoặc tải ảnh lên
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">Tối đa 2 ảnh ({beforeImages.length}/2)</Text>
                  </TouchableOpacity>
                  
                  {renderImages(beforeImages, true)}
                </View>

                <View className="border-t border-gray-100 p-4">
                  <Text className="mb-3 text-base font-semibold text-gray-800">Ghi chú</Text>
                  <InputField
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ghi chú về tình trạng xe trước khi sử dụng"
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </View>
            ) : (
              <View>
                <View className="m-4 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                  <FontAwesomeIcon icon={faCheckCircle} color="#22c55e" size={32} />
                  <Text className="mt-3 text-base font-medium text-gray-700">
                    Check-in thành công
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    {checkInLocation.latitude}, {checkInLocation.longitude}
                  </Text>
                </View>

                <View className="p-4">
                  <Text className="mb-3 text-base font-semibold text-gray-800">
                    Hình ảnh xe (sau khi sử dụng)
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => showImagePickerOptions(false)}
                    className="items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 active:border-blue-400 active:bg-blue-50"
                    activeOpacity={0.7}>
                    <FontAwesomeIcon icon={faCamera} color="#9CA3AF" size={32} />
                    <Text className="mt-3 text-base font-medium text-gray-700">
                      Chụp hoặc tải ảnh lên
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">Tối đa 2 ảnh ({afterImages.length}/2)</Text>
                  </TouchableOpacity>
                  
                  {renderImages(afterImages, false)}
                </View>

                <View className="border-t border-gray-100 p-4">
                  <Text className="mb-3 text-base font-semibold text-gray-800">Ghi chú</Text>
                  <InputField
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ghi chú về tình trạng xe sau khi sử dụng"
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}

            {checkInLocation == undefined ? (
              <View className="p-4 pt-2">
                <TouchableOpacity
                  onPress={handleCheckIn}
                  className="rounded-xl bg-green-500 py-4 active:bg-green-600"
                  activeOpacity={0.8}>
                  <Text className="text-center text-base font-bold text-white">
                    Xác nhận Check-in
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="p-4 pt-2">
                <TouchableOpacity
                  onPress={handleCheckOut}
                  className="rounded-xl bg-red-500 py-4 active:bg-red-600"
                  activeOpacity={0.8}>
                  <Text className="text-center text-base font-bold text-white">
                    Xác nhận Check-out
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-0.5">
                <FontAwesomeIcon icon={faWarning} size={18} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-semibold text-amber-800">Lưu ý quan trọng:</Text>
                <View className="space-y-1">
                  <Text className="text-sm text-amber-700">
                    • Kiểm tra kỹ tình trạng xe trước khi nhận và trả xe
                  </Text>
                  <Text className="text-sm text-amber-700">
                    • Chụp ảnh rõ nét các góc độ của xe
                  </Text>
                  <Text className="text-sm text-amber-700">
                    • Báo cáo ngay nếu phát hiện hư hỏng
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestInProgress;