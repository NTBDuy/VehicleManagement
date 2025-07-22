import { showToast } from '@/utils/toast';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';

import LoadingData from '@/components/ui/LoadingData';
import { SettingService } from '@/services/settingService';
import { formatDatetime } from '@/utils/datetimeUtils';
import { useTranslation } from 'react-i18next';

Dimensions.get('window');

interface CheckInRadiusModalProps {
  visible: boolean;
  onClose: () => void;
}

const CheckInRadiusModal = ({ visible, onClose }: CheckInRadiusModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { t } = useTranslation();
  const [checkInRadius, setCheckInRadius] = useState<number>(5);
  const [lastUpdated, setLastUpdated] = useState('');
  const radiusOptions = [1, 3, 5, 10, 20];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['check-in-radius'],
    queryFn: () => SettingService.getSettingById('CHECK_IN_RADIUS'),
    enabled: visible,
  });

  useEffect(() => {
    if (data) {
      const radius = parseInt(data.settingValue);
      setLastUpdated(data.updatedAt);
      if (!isNaN(radius)) {
        setCheckInRadius(radius);
      }
    }
  }, [data]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleChangeRadius = async (radius: number) => {
    try {
      await SettingService.updateSetting('CHECK_IN_RADIUS', {
        settingValue: radius.toString(),
      });
      setCheckInRadius(radius);
      refetch();
      closeModal();
      showToast.success(t('setting.radiusChanged', { radius }));
    } catch (error) {
      showToast.error(t('setting.updateRadiusError'));
    }
  };

  const renderedRadiusOptions = useMemo(() => {
    return radiusOptions.map((radius, index) => (
      <TouchableOpacity
        key={radius}
        onPress={() => handleChangeRadius(radius)}
        className={`mx-2 flex-row items-center rounded-xl p-4 ${
          checkInRadius === radius
            ? 'border-2 border-blue-500 bg-blue-50'
            : 'bg-transparent hover:bg-gray-50'
        } ${index !== radiusOptions.length - 1 ? 'mb-2' : ''}`}
        activeOpacity={0.7}>
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              checkInRadius === radius ? 'text-blue-700' : 'text-gray-800'
            }`}>
            {radius} Km
          </Text>
        </View>
        {checkInRadius === radius && (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-500">
            <View className="h-2 w-2 rounded-full bg-white" />
          </View>
        )}
      </TouchableOpacity>
    ));
  }, [checkInRadius]);

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={closeModal}>
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 items-center justify-center bg-black/50 px-4">
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
          <View className="flex-row items-center justify-between border-b border-gray-100 p-6">
            <Text className="text-xl font-bold text-gray-800">
              {t('setting.selectCheckInRadius')}
            </Text>
            <TouchableOpacity
              onPress={closeModal}
              className="rounded-full bg-gray-100 p-2"
              activeOpacity={0.7}>
              <FontAwesomeIcon icon={faTimes} size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="px-2 py-4">{isLoading ? <LoadingData /> : renderedRadiusOptions}</View>

          <View className="items-end border-t border-gray-100 p-3">
            <Text>
              {t('common.lastUpdated')}: {formatDatetime(lastUpdated)}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CheckInRadiusModal;
