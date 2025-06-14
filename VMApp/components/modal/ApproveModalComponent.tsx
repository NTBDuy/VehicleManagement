import { formatDate } from '@/utils/datetimeUtils';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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

  const resetForm = useCallback(() => {
    setSelectedDriver(null);
    setNote('');
    setOpen(false);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (visible) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const dataDrivers = await DriverService.getAvailableDrivers(startTime, endTime);
          if (!isCancelled) {
            setDrivers(dataDrivers);
          }
        } catch (error) {
          if (!isCancelled) {
            showToast.error(
              `${t('common.error.title')}`,
              `${t('common.error.failed', { action: 'loading', item: 'driver' })}`
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
  }, [visible, startTime, endTime]);

  useEffect(() => {
    if (drivers.length > 0) {
      const dropdownItems = drivers.map((driver) => ({
        label: driver.fullName,
        value: driver.driverId,
      }));
      setItems(dropdownItems);
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
      const assignmentData = { driverId: selectedDriver, note };

      if (isDriverRequired) {
        await RequestService.approveRequest(requestId, assignmentData);
      } else {
        await RequestService.approveRequest(requestId);
      }
      showToast.success(`${t('common.success.title')}`, `${t('common.success.approved')}`);
      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (loading) {
    return (
      <Modal transparent visible={visible} animationType="slide">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 items-center justify-center bg-black/30">
          <TouchableOpacity onPress={(e) => e.stopPropagation()}>
            <View className="rounded-lg bg-white p-6">
              <Text className="text-center">{t('common.button.loading')}</Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -24 : 0}>
        <TouchableOpacity onPress={onClose} className="flex-1 justify-end bg-black/30">
          <TouchableOpacity onPress={(e) => e.stopPropagation()}>
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
                      <View className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <Text className="text-sm text-red-800">
                          {t('request.modal.approve.driverSection.noDriver')}
                          {formatDate(startTime)} {t('common.fields.to')} {formatDate(endTime)}.
                        </Text>
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
                    />
                  </View>
                )}

                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-4 "
                    onPress={handleClose}
                    disabled={isApproving}>
                    <Text className="text-lg font-semibold text-white">
                      {t('common.button.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`w-[48%] items-center justify-center rounded-lg py-4 ${
                      (!isDriverRequired || selectedDriver !== null) && !isApproving
                        ? 'bg-green-600 '
                        : 'bg-gray-400'
                    }`}
                    onPress={handleApprove}
                    disabled={(isDriverRequired && !selectedDriver) || isApproving}>
                    <Text className="text-lg font-semibold text-white">
                      {isApproving
                        ? `${t('common.button.processing')}`
                        : `${t('common.button.approve')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ApproveModal;
