import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import InputField from 'components/InputFieldComponent';

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ visible, onClose, onReject }) => {
  const [reason, setReason] = useState('');

  const handleReject = () => {
    onReject(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="rounded-t-2xl bg-gray-50 p-6 pb-12">
          <Text className="mb-6 text-center text-lg font-bold">Reject Request</Text>

          <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">
                Are you sure want to reject this request?
              </Text>
            </View>
            <View className="p-4">
              <InputField
                label="Reason"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </View>

          <View className="flex-row justify-between">
            <Pressable
              className="w-[48%] items-center justify-center rounded-lg bg-red-600 py-3 active:bg-red-700"
              onPress={handleReject}>
              <Text className="text-lg font-semibold text-white">Reject</Text>
            </Pressable>
            <Pressable
              className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-3 active:bg-gray-700"
              onPress={handleClose}>
              <Text className="text-lg font-semibold text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RejectModal;