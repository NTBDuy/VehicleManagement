import {
  faBan,
  faCircleCheck,
  faEdit,
  faInfoCircle,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import User from 'types/User';

interface OptionUserModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onViewDetail: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
}

const OptionUserModal: React.FC<OptionUserModalProps> = ({
  visible,
  user,
  onClose,
  onViewDetail,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => {
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
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleClose = () => {
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
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    });
  };

  const handleViewDetail = () => {
    onViewDetail();
    handleClose();
  };

  const handleEdit = () => {
    onEdit();
    handleClose();
  };

  const handleResetPassword = () => {
    onResetPassword();
    handleClose();
  };

  const handleToggleStatus = () => {
    onToggleStatus();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}>
      <TouchableOpacity
        onPress={handleClose}
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
                {t('user.management.modal.title')} #{user?.username}
              </Text>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={handleViewDetail}>
                <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.detail')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={handleEdit}>
                <FontAwesomeIcon icon={faEdit} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.update')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={handleResetPassword}>
                <FontAwesomeIcon icon={faKey} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.reset')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={handleToggleStatus}>
                <FontAwesomeIcon
                  icon={user?.status ? faBan : faCircleCheck}
                  size={20}
                  color={user?.status ? '#dc2626' : '#16a34a'}
                />
                <Text
                  className={`text-lg font-semibold ${user?.status ? 'text-red-600' : 'text-green-600'}`}>
                  {user?.status
                    ? `${t('common.button.deactivate')}`
                    : `${t('common.button.activate')}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3"
                onPress={handleClose}>
                <Text className="text-lg font-semibold text-white">
                  {t('common.button.close')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default OptionUserModal;