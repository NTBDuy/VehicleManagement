import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import InputField from 'components/InputFieldComponent';
import { showToast } from 'utils/toast';

interface CancelModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ visible, onClose, onCancel }) => {
  const [reason, setReason] = useState('');
  const [isCancel, setIsCancel] = useState(false);

  const validateForm = (): boolean => {
    if (!reason || reason.trim().length <= 5) {
      showToast.error(
        'Reason Required',
        'Please provide a reason with at least 6 characters before cancelling.'
      );
      return false;
    }
    return true;
  };

  const handleCancel = async () => {
    if (!validateForm()) return;
    setIsCancel(true);
    try {
      await onCancel(reason.trim());
      showToast.success('Success', 'Request cancel successfully');
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
          <View className="justify-end flex-1 bg-black/30">
            <View className="p-6 pb-12 rounded-t-2xl bg-gray-50">
              <Text className="mb-6 text-lg font-bold text-center">Cancel Request</Text>

              <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-800">
                  Are you sure want to cancel this request?
                </Text>
              </View>

              <View className="mb-6">
                <InputField label="Reason" value={reason} onChangeText={setReason} />
              </View>
              <View className="flex-row justify-between">
                <Pressable
                  className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-3 active:bg-gray-700"
                  onPress={handleClose}>
                  <Text className="text-lg font-semibold text-white">Close</Text>
                </Pressable>
                <Pressable
                  className="w-[48%] items-center justify-center rounded-lg bg-red-600 py-3 active:bg-red-700"
                  onPress={handleCancel}>
                  <Text className="text-lg font-semibold text-white">
                    {isCancel ? 'Canceling....' : 'Cancel'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CancelModal;
