import React, { useState } from 'react';
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
import { showToast } from 'utils/toast';

import InputField from '@/components/ui/InputFieldComponent';

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
}
interface ReasonProps {
  reason: string;
}

const RejectModal = ({ visible, onClose, onReject }: RejectModalProps) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [isReject, setIsReject] = useState(false);
  const [errors, setErrors] = useState<Partial<ReasonProps>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ReasonProps> = {};

    if (!reason || reason.trim().length <= 5) {
      newErrors.reason = t('validate.required.reasonReject');
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleReject = async () => {
    if (!validateForm()) return;
    setIsReject(true);
    try {
      await onReject(reason.trim());
      showToast.success(`${t('common.success.title')}`, 'Request reject successfully');
      setReason('');
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsReject(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <TouchableOpacity onPress={onClose} className="flex-1 justify-end bg-black/30">
            <TouchableOpacity onPress={(e) => e.stopPropagation()}>
              <View className="rounded-t-2xl bg-gray-50 p-6 pb-12">
                <Text className="mb-6 text-center text-lg font-bold">
                  {t('common.confirmation.title.reject')}
                </Text>

                <View className="mb-4">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('common.confirmation.message.reject')}
                  </Text>
                </View>

                <View className="mb-6">
                  <InputField
                    label={t('common.fields.reason')}
                    value={reason}
                    onChangeText={setReason}
                    error={errors.reason as string}
                  />
                </View>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-3 "
                    onPress={handleClose}>
                    <Text className="text-lg font-semibold text-white">
                      {t('common.button.close')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-red-600 py-3 "
                    onPress={handleReject}>
                    <Text className="text-lg font-semibold text-white">
                      {isReject
                        ? `${t('common.button.processing')}`
                        : `${t('common.button.reject')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RejectModal;
