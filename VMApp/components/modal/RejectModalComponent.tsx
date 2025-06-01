import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  Text,
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

const RejectModal: React.FC<RejectModalProps> = ({ visible, onClose, onReject }) => {
  const [reason, setReason] = useState('');
  const [isReject, setIsReject] = useState(false);

  const validateForm = (): boolean => {
    if (!reason || reason.trim().length <= 5) {
      showToast.error(
        'Reason Required',
        'Please provide a reason with at least 6 characters before rejecting.'
      );
      return false;
    }
    return true;
  };

  const handleReject = async () => {
    if (!validateForm()) return;
    setIsReject(true);
    try {
      await onReject(reason.trim());
      showToast.success('Success', 'Request reject successfully');
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <TouchableOpacity onPress={onClose} className="justify-end flex-1 bg-black/30">
            <TouchableOpacity onPress={(e) => e.stopPropagation()}>
              <View className="p-6 pb-12 rounded-t-2xl bg-gray-50">
                <Text className="mb-6 text-lg font-bold text-center">Reject Request</Text>

                <View className="mb-4">
                  <Text className="text-lg font-semibold text-gray-800">
                    Are you sure want to reject this request?
                  </Text>
                </View>

                <View className="mb-6">
                  <InputField label="Reason" value={reason} onChangeText={setReason} />
                </View>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-3 "
                    onPress={handleClose}>
                    <Text className="text-lg font-semibold text-white">Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-red-600 py-3 "
                    onPress={handleReject}>
                    <Text className="text-lg font-semibold text-white">
                      {isReject ? 'Rejecting....' : 'Reject'}
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
