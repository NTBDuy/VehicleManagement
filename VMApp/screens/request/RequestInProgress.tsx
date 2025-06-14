import { useAuth } from '@/contexts/AuthContext';
import { RequestService } from '@/services/requestService';
import { showToast } from '@/utils/toast';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { ImageType, LocationCheckpoint } from '@/types/LocationCheckpoint';
import Request from '@/types/Request';

import Header from '@/components/layout/HeaderComponent';
import LocationProgress from '@/components/request/LocationProgress';
import RequestCheckPoint from '@/components/request/RequestCheckPoint';
import RequestHeader from '@/components/request/RequestInProgressHeader';
import WarningNotice from '@/components/request/WarningNoticeComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import LoadingData from '@/components/ui/LoadingData';
import { SettingService } from '@/services/settingService';
import { calculateDistance } from '@/utils/requestUtils';

const RequestInProgress = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { requestData: initialRequestData } = route.params as { requestData: Request };

  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [checkpoints, setCheckpoints] = useState<{ [key: number]: LocationCheckpoint }>({});
  const [currentImages, setCurrentImages] = useState<ImageType[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInRadius, setCheckInRadius] = useState(5);

  const sortedLocations = requestData.locations.sort((a, b) => a.order - b.order);
  const currentLocation = sortedLocations[currentLocationIndex];
  const isLastLocation = currentLocationIndex === sortedLocations.length - 1;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isCompleted) {
        console.log('Hành trình đã hoàn thành → điều hướng về HistoryStack');
        navigation.navigate('HistoryStack');
        return;
      }

      if (isFirstFocus.current) {
        console.log('Lần đầu điều hướng tới màn hình');
        isFirstFocus.current = false;
      } else {
        console.log('Quay trở lại màn hình từ màn hình khác (goBack)');
      }

      return () => {};
    }, [isCompleted])
  );

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    const fetchRadius = async () => {
      try {
        const data = await SettingService.getSettingById('CHECK_IN_RADIUS');
        const radius = parseInt(data.settingValue);
        if (!isNaN(radius)) {
          setCheckInRadius(radius);
        }
      } catch (error) {
        showToast.error(t('setting.loadRadiusError'));
      }
    };

    fetchRadius();
  }, [requestData]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await RequestService.getRequestDetails(requestData.requestId);
      setRequestData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchCheckPointStatus = async () => {
      try {
        const data = await RequestService.checkPointStatus(requestData.requestId);
        setCurrentLocationIndex(data.length);
        setCheckpoints(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (requestData?.requestId) {
      fetchCheckPointStatus();
    }
  }, [requestData]);

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

  const handleCheckpoint = async () => {
    if (currentImages.length === 0) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chụp ít nhất 1 ảnh tại điểm này', [{ text: 'OK' }]);
      return;
    }

    try {
      setIsLoading(true);
      await sleep(500);
      let location = await Location.getCurrentPositionAsync({});

      console.log(
        'Địa điểm cần check-in: ' + currentLocation.latitude + ', ' + currentLocation.longitude
      );

      var distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.coords.latitude,
        location.coords.longitude
      );

      console.log(
        'Bạn vừa check-in tại: ' + location.coords.latitude + ', ' + location.coords.longitude
      );

      console.log('Khoảng cách hai điểm hiện tại là: ' + distance + ' Km');

      if (distance > checkInRadius) {
        console.log('Bạn ở quá xa địa điểm Check-in');
        showToast.error(t('common.error.tooFar', { radius: checkInRadius }));
        return;
      } else {
        const checkpointData: LocationCheckpoint = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          createdAt: new Date().toISOString(),
          images: [...currentImages],
          note: currentNote,
        };

        setCheckpoints((prev) => ({
          ...prev,
          [currentLocationIndex]: checkpointData,
        }));

        const formData = new FormData();
        formData.append('latitude', checkpointData.latitude.toString());
        formData.append('longitude', checkpointData.longitude.toString());
        formData.append('note', currentNote || '');
        formData.append('createdBy', user?.userId.toString() as string);
        formData.append('createdAt', checkpointData.createdAt);

        currentImages.forEach((image, index) => {
          formData.append('photos', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `checkpoint_${currentLocation.id}_${Date.now()}_${index}.jpg`,
          } as any);
        });

        const success = await RequestService.checkPoint(requestData.requestId, formData);
        if (success) {
          showToast.success(`Đã check-in tại ${currentLocation.name}`);

          setCurrentImages([]);
          setCurrentNote('');

          if (isLastLocation) {
            try {
              const response = await RequestService.endUsageVehicle(requestData.requestId);
              setIsCompleted(true);
              showToast.success('Hoàn thành hành trình!');
              setTimeout(() => {
                navigation.navigate('RequestDetail', { requestData: response });
              }, 2000);
            } catch (error) {
              console.log('End usage error:', error);
            }
          } else {
            setCurrentLocationIndex((prev) => prev + 1);
          }
        } else {
          showToast.error('Check-in thất bại');
        }
      }
    } catch (error) {
      console.error('Checkpoint error:', error);
      showToast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <Header title="Hoàn thành" backBtn />
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesomeIcon icon={faCheckCircle} size={80} color="#22c55e" />
          <Text className="mt-4 text-center text-2xl font-bold text-gray-800">
            Hoàn thành hành trình!
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            Bạn đã hoàn thành tất cả {sortedLocations.length} điểm trong lộ trình
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header title={`Checkpoint ${currentLocationIndex + 1}/${sortedLocations.length}`} backBtn />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="px-6 py-4">
          <RequestHeader requestData={requestData} />

          <LocationProgress
            currentLocationIndex={currentLocationIndex}
            sortedLocations={sortedLocations}
            checkpoints={checkpoints}
            t={t}
          />

          {isLoading ? (
            <View className="flex-1 py-12">
              <LoadingData />
            </View>
          ) : (
            <RequestCheckPoint
              currentLocation={currentLocation}
              currentNote={currentNote}
              setCurrentNote={setCurrentNote}
              handleCheckpoint={handleCheckpoint}
              isLastLocation={isLastLocation}
              currentImages={currentImages}
              setCurrentImages={setCurrentImages}
              t={t}
            />
          )}

          <WarningNotice />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestInProgress;
