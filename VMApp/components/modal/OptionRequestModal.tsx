import { faCircleCheck, faCircleXmark, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';

import Request from 'types/Request';

interface RequestOptionModalProps {
  visible: boolean;
  selected: Request | null;
  onClose: () => void;
  onViewDetail: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
}

const RequestOptionModal = ({
  visible,
  selected,
  onClose,
  onViewDetail,
  onApprove,
  onReject,
  onCancel,
}: RequestOptionModalProps) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleCloseWithAnimation = (callback?: () => void) => {
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
      if (callback) callback();
    });
  };

  const handleViewDetail = () => {
    onViewDetail();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => handleCloseWithAnimation()}>
      <TouchableOpacity
        onPress={() => handleCloseWithAnimation()}
        className="flex-1 justify-end bg-black/30"
        activeOpacity={1}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}>
          <TouchableOpacity onPress={(e) => e.stopPropagation()} activeOpacity={1}>
            <View className="rounded-t-2xl bg-white p-6 pb-12">
              <Text className="mb-6 text-center text-lg font-bold">
                {t('request.management.modal.title')} {selected?.requestId}
              </Text>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={handleViewDetail}>
                <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.detail')}
                </Text>
              </TouchableOpacity>

              {selected?.status === 0 && (
                <>
                  <TouchableOpacity
                    className="mb-6 flex-row items-center gap-3"
                    onPress={() => onApprove()}>
                    <FontAwesomeIcon icon={faCircleCheck} size={20} color="#16a34a" />
                    <Text className="text-lg font-semibold text-green-600">
                      {selected.isDriverRequired
                        ? t('common.button.approveWithAssign')
                        : t('common.button.approve')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mb-6 flex-row items-center gap-3"
                    onPress={() => onReject()}>
                    <FontAwesomeIcon icon={faCircleXmark} size={20} color="#dc2626" />
                    <Text className="text-lg font-semibold text-red-600">
                      {t('common.button.reject')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {selected?.status === 1 && (
                <TouchableOpacity
                  className="mb-6 flex-row items-center gap-3"
                  onPress={() => onCancel()}>
                  <FontAwesomeIcon icon={faCircleXmark} size={20} color="#4b5563" />
                  <Text className="text-lg font-semibold text-gray-600">
                    {t('common.button.cancel')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3"
                onPress={() => handleCloseWithAnimation()}>
                <Text className="text-lg font-semibold text-white">{t('common.button.close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default RequestOptionModal;
