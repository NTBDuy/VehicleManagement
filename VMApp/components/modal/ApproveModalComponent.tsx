import { formatDate } from '@/utils/datetimeUtils';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { DriverService } from 'services/driverService';
import { showToast } from 'utils/toast';
import { RequestService } from '@/services/requestService';

import Driver from 'types/Driver';

import InputField from '@/components/ui/InputFieldComponent';

const { width } = Dimensions.get('window');

interface ApproveModalProps {
  visible: boolean;
  onClose: () => void;
  isDriverRequired: boolean;
  onSuccess: () => void;
  title?: string;
  approveButtonText?: string;
  startTime: string;
  endTime: string;
  requestId: number;
}

type ItemDropDownPicker = {
  label: string;
  value: number;
};

const ApproveModal = ({
  visible,
  onClose,
  onSuccess,
  requestId,
  isDriverRequired,
  startTime,
  endTime,
}: ApproveModalProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [items, setItems] = useState<ItemDropDownPicker[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const resetForm = useCallback(() => {
    setSelectedDriver(null);
    setNote('');
    setOpen(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
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

  useEffect(() => {
    let isCancelled = false;

    if (visible && isDriverRequired) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const dataDrivers = await DriverService.getAvailableDrivers(startTime, endTime);
          if (!isCancelled) {
            setDrivers(dataDrivers || []);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error('Error fetching drivers:', error);
            setDrivers([]);
            showToast.error(
              t('common.error.title'),
              t('common.error.failed', { action: 'loading', item: 'driver' })
            );
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      };
      fetchData();
    }

    return () => {
      isCancelled = true;
    };
  }, [visible, startTime, endTime, isDriverRequired, t]);

  useEffect(() => {
    if (drivers.length > 0) {
      const dropdownItems = drivers.map((driver) => ({
        label: driver.fullName || `Driver ${driver.driverId}`,
        value: driver.driverId,
      }));
      setItems(dropdownItems);
    } else {
      setItems([]);
    }
  }, [drivers]);

  const validateForm = (): boolean => {
    if (isDriverRequired && !selectedDriver) {
      showToast.error(t('validate.required.driver'));
      return false;
    }
    return true;
  };

  const handleApprove = async () => {
    if (!validateForm()) return;

    setIsApproving(true);
    try {
      if (isDriverRequired && selectedDriver) {
        const assignmentData = { driverId: selectedDriver, note: note.trim() };
        await RequestService.approveRequest(requestId, assignmentData);
      } else {
        await RequestService.approveRequest(requestId);
      }

      showToast.success(t('common.success.title'), t('common.success.approved'));
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error approving request:', error);
      showToast.error(
        t('common.error.title'),
        t('common.error.failed', { action: 'approving', item: 'request' })
      );
    } finally {
      setIsApproving(false);
    }
  };

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
      setTimeout(() => {
        setShowModal(false);
        resetForm();
        onClose();
      }, 0);
    });
  };

  if (loading) {
    return (
      <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
        <View className="flex-1 items-center justify-center bg-black/30">
          <View className="rounded-lg bg-white p-6">
            <Text className="text-center text-gray-800">{t('common.button.loading')}</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={showModal} animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -24 : 0}>
        <Animated.View className="flex-1 justify-end bg-black/30" style={{ opacity: fadeAnim }}>
          <TouchableOpacity onPress={handleClose} className="flex-1" activeOpacity={1} />

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
            }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="rounded-t-2xl bg-gray-50 p-6 pb-12">
                <Text className="mb-4 text-center text-lg font-bold text-gray-800">
                  {t('request.modal.approve.title')}
                </Text>

                {!isDriverRequired ? (
                  <View className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <View className="flex-row items-center">
                      <FontAwesomeIcon icon={faCircleInfo} size={24} color="#1e40af" />
                      <View className="ml-4 flex-1">
                        <Text className="mb-1 font-semibold text-blue-800">
                          {t('notice.approveModal.noDriverRequired')}
                        </Text>
                        <Text className="text-sm text-blue-600">
                          {t('notice.approveModal.noDriverRequiredMention')}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="mb-6 rounded-2xl border border-gray-200 bg-white">
                    <View className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <Text className="text-lg font-semibold text-gray-800">
                        {t('request.modal.approve.driverSection.assign')}
                      </Text>
                      <Text className="mt-1 text-sm text-gray-600">
                        {t('request.modal.approve.driverSection.mention')}
                      </Text>
                    </View>

                    {drivers.length > 0 ? (
                      <View className="p-4">
                        <View style={{ zIndex: open ? 1000 : 0 }}>
                          <Text className="mb-2 text-sm font-medium text-gray-700">
                            {t('request.modal.approve.driverSection.select')} *
                          </Text>
                          <DropDownPicker
                            open={open}
                            value={selectedDriver}
                            items={items}
                            setOpen={setOpen}
                            setValue={setSelectedDriver}
                            setItems={setItems}
                            placeholder={t('request.modal.approve.driverSection.placeholder')}
                            style={{
                              borderColor: selectedDriver ? '#10B981' : '#D1D5DB',
                              borderRadius: 8,
                              minHeight: 50,
                            }}
                            dropDownContainerStyle={{
                              borderColor: '#D1D5DB',
                              maxHeight: 200,
                              zIndex: 1000,
                            }}
                            textStyle={{ fontSize: 16 }}
                            zIndex={1000}
                            zIndexInverse={3000}
                            searchable={drivers.length > 5}
                            disabled={isApproving}
                          />
                        </View>

                        {selectedDriver && (
                          <View className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                            <Text className="text-sm text-green-800">
                              {t('request.modal.approve.driverSection.selected')}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View className="p-4">
                        <View className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <Text className="text-sm text-red-800">
                            {t('request.modal.approve.driverSection.noDriver')}{' '}
                            {formatDate(startTime)} {t('common.fields.to')} {formatDate(endTime)}.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {isDriverRequired && (
                  <View className="mb-6">
                    <InputField
                      label={t('request.modal.approve.note')}
                      value={note}
                      onChangeText={setNote}
                      require={false}
                      multiline
                      numberOfLines={3}
                      placeholder={t('request.modal.approve.placeholder')}
                      editable={!isApproving}
                    />
                  </View>
                )}

                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-4"
                    onPress={handleClose}
                    disabled={isApproving}>
                    <Text className="text-lg font-semibold text-white">
                      {t('common.button.cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`w-[48%] items-center justify-center rounded-lg py-4 ${
                      (!isDriverRequired || selectedDriver !== null) && !isApproving
                        ? 'bg-green-600'
                        : 'bg-gray-400'
                    }`}
                    onPress={handleApprove}
                    disabled={(isDriverRequired && !selectedDriver) || isApproving}>
                    <Text className="text-lg font-semibold text-white">
                      {isApproving ? t('common.button.processing') : t('common.button.approve')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ApproveModal;