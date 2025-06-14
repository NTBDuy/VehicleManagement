import { showToast } from '@/utils/toast';
import { faCamera, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as ImagePicker from 'expo-image-picker';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ImageType } from '@/types/LocationCheckpoint';

import InputField from '@/components/ui/InputFieldComponent';
import { LocationType } from '@/types/Location';
import { Dispatch, SetStateAction } from 'react';

interface RequestCheckPointProps {
  currentLocation: LocationType;
  currentNote: string;
  setCurrentNote: (value: string) => void;
  handleCheckpoint: () => void;
  isLastLocation: boolean;
  currentImages: ImageType[];
  setCurrentImages: Dispatch<SetStateAction<ImageType[]>>;
  t: any;
}

const RequestCheckPoint = ({
  currentLocation,
  currentNote,
  setCurrentNote,
  handleCheckpoint,
  isLastLocation,
  currentImages,
  setCurrentImages,
  t,
}: RequestCheckPointProps) => {
  const showImagePickerOptions = () => {
    if (currentImages.length >= 2) {
      showToast.error(`${t('common.error.maxImage')}`);
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.button.takePhoto'), t('common.button.cancel')],
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera();
          }
        }
      );
    } else {
      Alert.alert(t('common.button.takePhoto'), t('common.confirmation.message.newImage'), [
        { text: t('common.button.takePhoto'), onPress: () => openCamera() },
        { text: t('common.button.cancel'), style: 'cancel' },
      ]);
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
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

        setCurrentImages((prev) => [...prev, newImage]);
        showToast.success(t('common.success.takePhoto'));
      }
    } catch (error) {
      console.log('Camera error:', error);
      showToast.error(t('common.error.takePhoto'));
    }
  };

  const renderImages = (images: ImageType[], isReadOnly: boolean = false) => {
    if (images.length === 0) return null;

    return (
      <View className="mt-2">
        <Text className={`mb-2 text-sm font-medium text-gray-600 ${isReadOnly && 'text-center'}`}>
          {t('common.fields.selectedImage')} ({images.length}/2):
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {images.map((image, index) => (
            <View key={index} className={`relative mb-2 ${index !== images.length - 1 && 'mr-3'}`}>
              <Image
                source={{ uri: image.uri }}
                className="h-20 w-20 rounded-lg"
                resizeMode="cover"
              />
              {!isReadOnly && (
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -bottom-2 -right-2 h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-sm"
                  activeOpacity={0.7}>
                  <FontAwesomeIcon icon={faTrash} size={10} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const removeImage = (index: number) => {
    Alert.alert(
      t('common.confirmation.title.removeImage'),
      t('common.confirmation.message.removeImage'),
      [
        { text: t('common.button.cancel'), style: 'cancel' },
        {
          text: t('common.button.remove'),
          style: 'destructive',
          onPress: () => {
            setCurrentImages((prev) => prev.filter((_, i) => i !== index));
            showToast.success(t('common.success.removeImage'));
          },
        },
      ]
    );
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <View className="bg-green-50 px-4 py-3">
        <Text className="text-lg font-bold text-gray-800">
          {t('common.fields.currentPoint')}: {currentLocation.name}
        </Text>
        <Text className="text-sm text-gray-600">{currentLocation.address}</Text>
      </View>

      <View className="p-4">
        <Text className="mb-3 text-base font-semibold text-gray-800">
          {t('request.inProgress.currentImage')}
        </Text>

        <TouchableOpacity
          onPress={showImagePickerOptions}
          className="mb-2 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 active:border-blue-400 active:bg-blue-50"
          activeOpacity={0.7}>
          <FontAwesomeIcon icon={faCamera} color="#9CA3AF" size={32} />
          <Text className="mt-3 text-base font-medium text-gray-700">
            {t('common.button.takePhoto')}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {t('request.inProgress.maxImage')} ({currentImages.length}/2)
          </Text>
        </TouchableOpacity>

        {renderImages(currentImages)}
      </View>

      <View className="border-t border-gray-100 p-4">
        <Text className="mb-3 text-base font-semibold text-gray-800">
          {t('common.fields.note')}
        </Text>
        <InputField
          value={currentNote}
          onChangeText={setCurrentNote}
          placeholder={t('common.placeholder.note')}
          multiline={true}
          numberOfLines={3}
        />
      </View>

      <View className="p-4 pt-2">
        <TouchableOpacity
          onPress={handleCheckpoint}
          className={`rounded-xl py-4 ${
            isLastLocation ? 'bg-red-500 active:bg-red-600' : 'bg-green-500 active:bg-green-600'
          }`}
          activeOpacity={0.8}>
          <Text className="text-center text-base font-bold text-white">
            {isLastLocation ? t('common.button.completeTrip') : t('common.button.confirmCheckIn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RequestCheckPoint;
