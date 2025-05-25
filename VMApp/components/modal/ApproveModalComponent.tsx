import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Modal, Pressable, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import InputField from 'components/InputFieldComponent';
import { DriverService } from 'services/driverService';
import Driver from 'types/Driver';
import { showToast } from 'utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

interface ApproveModalProps {
  visible: boolean;
  onClose: () => void;
  isDriverRequired: boolean;
  onApprove: (driverId: string | null, note: string) => void;
  title?: string;
  approveButtonText?: string;
}

type ItemDropDownPicker = {
  label: string;
  value: string;
};

const ApproveModal: React.FC<ApproveModalProps> = ({
  visible,
  onClose,
  onApprove,
  isDriverRequired,
  title = 'Approve Request',
  approveButtonText = 'Approve',
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
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
    if (visible) {
      getAllDrivers();
    }
  }, [visible]);

  useEffect(() => {
    if (drivers.length > 0) {
      const dropdownItems = drivers.map((driver) => ({
        label: driver.fullName,
        value: String(driver.driverId),
      }));
      setItems(dropdownItems);
    }
  }, [drivers]);

  const getAllDrivers = async () => {
    setLoading(true);
    try {
      const dataDrivers = await DriverService.getAllDrivers();
      setDrivers(dataDrivers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (isDriverRequired && !selectedDriver) {
      showToast.error('Driver Required', 'Please select a driver before approving.');
      return false;
    }
    return true;
  };
  
  const handleApprove = async () => {
    if (!validateForm()) return;
    setIsApproving(true);
    try {
      await onApprove(selectedDriver, note.trim());
      showToast.success('Success', 'Request approved successfully');
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
        <View className="items-center justify-center flex-1 bg-black/30">
          <View className="p-6 bg-white rounded-lg">
            <Text className="text-center">Loading drivers...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="justify-end flex-1 bg-black/30">
        <View className="max-h-[90%] rounded-t-2xl bg-gray-50 p-6 pb-12">
          {/* Header */}
          <Text className="mb-4 text-lg font-bold text-center text-gray-800">{title}</Text>

          {/* Driver Assignment Section */}
          {!isDriverRequired ? (
            <View className="p-4 mb-6 border border-blue-200 rounded-2xl bg-blue-50">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCircleInfo} size={24} color="#1e40af" />
                <View className="flex-1 ml-4">
                  <Text className="mb-1 font-semibold text-blue-800">No Driver Required</Text>
                  <Text className="text-sm text-blue-600">
                    This request can be processed without assigning a driver.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="mb-6 bg-white border border-gray-200 rounded-2xl">
              <View className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800">Driver Assignment</Text>
                <Text className="mt-1 text-sm text-gray-600">
                  Please select a driver for this request
                </Text>
              </View>

              <View className="p-4">
                <View style={{ zIndex: open ? 1000 : 0 }}>
                  <Text className="mb-2 text-sm font-medium text-gray-700">Select Driver *</Text>
                  <DropDownPicker
                    open={open}
                    value={selectedDriver}
                    items={items}
                    setOpen={setOpen}
                    setValue={setSelectedDriver}
                    setItems={setItems}
                    placeholder="Choose a driver..."
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
                  <View className="p-3 mt-3 border border-green-200 rounded-lg bg-green-50">
                    <Text className="text-sm text-green-800">✓ Driver selected successfully</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Note Section */}
          <View className="mb-6">
            <InputField
              label="Note (Optional)"
              value={note}
              onChangeText={setNote}
              require={false}
              multiline
              numberOfLines={3}
              placeholder="Add any additional notes..."
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between space-x-3">
            <Pressable
              className={`w-[48%] items-center justify-center rounded-lg py-4 ${
                (!isDriverRequired || selectedDriver !== null) && !isApproving
                  ? 'bg-green-600 active:bg-green-700'
                  : 'bg-gray-400'
              }`}
              onPress={handleApprove}
              disabled={(isDriverRequired && !selectedDriver) || isApproving}>
              <Text className="text-lg font-semibold text-white">
                {isApproving ? 'Processing...' : approveButtonText}
              </Text>
            </Pressable>

            <Pressable
              className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-4 active:bg-gray-700"
              onPress={handleClose}
              disabled={isApproving}>
              <Text className="text-lg font-semibold text-white">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ApproveModal;
