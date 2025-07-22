import { useAuth } from '@/contexts/AuthContext';
import { RequestService } from '@/services/requestService';
import { SettingService } from '@/services/settingService';
import { calculateDistance } from '@/utils/requestUtils';
import { showToast } from '@/utils/toast';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { ImageType, LocationCheckpoint } from '@/types/LocationCheckpoint';

import Header from '@/components/layout/HeaderComponent';
import LocationProgress from '@/components/request/LocationProgress';
import RequestCheckPoint from '@/components/request/RequestCheckPoint';
import RequestHeader from '@/components/request/RequestInProgressHeader';
import WarningNotice from '@/components/request/WarningNoticeComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import LoadingData from '@/components/ui/LoadingData';

const RequestInProgress = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { requestId } = route.params as { requestId: number };

  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [checkpoints, setCheckpoints] = useState<{ [key: number]: LocationCheckpoint }>({});
  const [currentImages, setCurrentImages] = useState<ImageType[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCheckPointLoading, setIsCheckPointLoading] = useState(false);
  const [checkInRadius, setCheckInRadius] = useState(5);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const isFirstFocus = useRef(true);

  const {
    data: requestData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['history', requestId],
    queryFn: () => RequestService.getRequestDetails(requestId),
  });

  const sortedLocations = useMemo(() => {
    if (!requestData?.locations) return [];
    return requestData.locations.sort((a, b) => a.order - b.order);
  }, [requestData?.locations]);

  const currentLocation = useMemo(() => {
    return sortedLocations[currentLocationIndex];
  }, [sortedLocations, currentLocationIndex]);

  const isLastLocation = useMemo(() => {
    return currentLocationIndex === sortedLocations.length - 1;
  }, [currentLocationIndex, sortedLocations.length]);

  const requestPermissions = useCallback(async () => {
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
  }, []);

  const handleCheckpoint = useCallback(async () => {
    if (!requestData || !currentLocation) return;

    if (currentImages.length === 0) {
      Alert.alert(
        t('request.inProgress.imageNeeded.title'),
        t('request.inProgress.imageNeeded.message'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsCheckPointLoading(true);
      await sleep(500);
      let location = await Location.getCurrentPositionAsync({});

      var distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.coords.latitude,
        location.coords.longitude
      );

      if (distance > checkInRadius) {
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
          showToast.success(
            `${t('common.success.checkedInAt', { location: currentLocation.name })}`
          );

          setCurrentImages([]);
          setCurrentNote('');

          if (isLastLocation) {
            try {
              const response = await RequestService.endUsageVehicle(requestData.requestId);
              setIsCompleted(true);
              showToast.success(t('common.success.tripDone'));
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: ['history'],
                }),
                queryClient.invalidateQueries({ queryKey: ['checkpoints'] }),
              ]);
              setTimeout(() => {
                navigation.navigate('RequestDetail', { requestId: response.requestId });
              }, 2000);
            } catch (error) {
              console.log('End usage error:', error);
            }
          } else {
            setCurrentLocationIndex((prev) => prev + 1);
          }
        } else {
          showToast.error(t('common.error.checkIn'));
        }
      }
    } catch (error) {
      console.error('Checkpoint error:', error);
      showToast.error(t('common.error.generic'));
    } finally {
      setIsCheckPointLoading(false);
    }
  }, [
    currentImages,
    currentLocation,
    currentNote,
    currentLocationIndex,
    checkInRadius,
    requestData?.requestId,
    isLastLocation,
    t,
    user?.userId,
    queryClient,
    navigation,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (isCompleted && !isFirstFocus.current) {
        navigation.navigate('HistoryStack');
        return;
      }

      if (isFirstFocus.current) {
        isFirstFocus.current = false;
      }
    }, [isCompleted, navigation])
  );

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

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
  }, [t]);

  useEffect(() => {
    const fetchCheckPointStatus = async () => {
      if (!requestData?.requestId) return;
      
      try {
        const data = await RequestService.checkPointStatus(requestData.requestId);
        const completedCount = Object.keys(data).length;
        setCurrentLocationIndex(Math.min(completedCount, sortedLocations.length - 1));
        setCheckpoints(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (requestData?.requestId && sortedLocations.length > 0) {
      fetchCheckPointStatus();
    }
  }, [requestData?.requestId, sortedLocations.length]);

  if (isLoading) {
    return <LoadingData />;
  }

  if (!requestData || requestData.vehicle == null || requestData.user == null) {
    return <ErrorComponent />;
  }

  if (isCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <Header title="Hoàn thành" backBtn />
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesomeIcon icon={faCheckCircle} size={80} color="#22c55e" />
          <Text className="mt-4 text-center text-2xl font-bold text-gray-800">
            {t('request.inProgress.tripDone.title')}
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            {t('request.inProgress.tripDone.description', { count: sortedLocations.length })}
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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        <View className="px-6 py-4">
          <RequestHeader requestData={requestData} />

          <LocationProgress
            currentLocationIndex={currentLocationIndex}
            sortedLocations={sortedLocations}
            checkpoints={checkpoints}
            t={t}
          />

          {isCheckPointLoading || isLoading ? (
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
