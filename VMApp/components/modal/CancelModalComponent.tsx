import { useState } from 'react';
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
interface CancelModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
}

interface ReasonProps {
  reason: string;
}

const CancelModal = ({ visible, onClose, onCancel }: CancelModalProps) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [isCancel, setIsCancel] = useState(false);
  const [errors, setErrors] = useState<Partial<ReasonProps>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ReasonProps> = {};

    if (!reason || reason.trim().length <= 5) {
      newErrors.reason = t('validate.required.reasonCancel');
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleCancel = async () => {
    if (!validateForm()) return;
    setIsCancel(true);
    try {
      await onCancel(reason.trim());
      showToast.success(`${t('common.success.title')}`, 'Request cancel successfully');
      setReason('');
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCancel(false);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <TouchableOpacity onPress={onClose} className="flex-1 justify-end bg-black/30">
            <TouchableOpacity onPress={(e) => e.stopPropagation()}>
              <View className="rounded-t-2xl bg-gray-50 p-6 pb-12">
                <Text className="mb-6 text-center text-lg font-bold">
                  {t('common.confirmation.title.cancel')}
                </Text>

                <View className="mb-4">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('common.confirmation.message.cancel')}
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
                      {' '}
                      {t('common.button.close')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-red-600 py-3 "
                    onPress={handleCancel}>
                    <Text className="text-lg font-semibold text-white">
                      {isCancel
                        ? `${t('common.button.processing')}`
                        : `${t('common.button.cancel')}`}
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

export default CancelModal;
