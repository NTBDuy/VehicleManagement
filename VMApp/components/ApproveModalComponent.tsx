import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import InputField from 'components/InputFieldComponent';

interface ApproveModalProps {
  visible: boolean;
  onClose: () => void;
  onApprove: (driverId: string | null, note: string) => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({ visible, onClose, onApprove }) => {
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: 'Driver 1', value: 'driver1' },
    { label: 'Driver 2', value: 'driver2' },
  ]);
  const [note, setNote] = useState('');

  const handleApprove = () => {
    onApprove(selectedDriver, note);
    setSelectedDriver(null);
    setNote('');
    setOpen(false);
  };

  const handleClose = () => {
    setSelectedDriver(null);
    setNote('');
    setOpen(false);
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
          <Text className="mb-6 text-center text-lg font-bold">Approve Request</Text>

          <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">Assign a driver</Text>
            </View>
            <View className="p-4">
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Select Driver</Text>
                <View className="z-10 rounded-lg border border-gray-300 bg-white">
                  <DropDownPicker
                    open={open}
                    value={selectedDriver}
                    items={items}
                    setOpen={setOpen}
                    setValue={setSelectedDriver}
                    setItems={setItems}
                    placeholder="Choose a driver..."
                    style={{ borderColor: '#D1D5DB', borderRadius: 8 }}
                    dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
                  />
                </View>
              </View>
              <InputField
                label="Note"
                value={note}
                onChangeText={setNote}
                require={false}
              />
            </View>
          </View>

          <View className="flex-row justify-between">
            <Pressable
              className="w-[48%] items-center justify-center rounded-lg bg-green-600 py-3 active:bg-green-700"
              onPress={handleApprove}>
              <Text className="text-lg font-semibold text-white">Approve</Text>
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

export default ApproveModal;