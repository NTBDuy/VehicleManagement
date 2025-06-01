import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { DriverService } from 'services/driverService';
import { showToast } from 'utils/toast';

import Driver from 'types/Driver';

import InputField from '@/components/ui/InputFieldComponent';
import { formatDate } from '@/utils/datetimeUtils';
interface ApproveModalProps {
  visible: boolean;
  onClose: () => void;
  isDriverRequired: boolean;
  onApprove: (driverId: string | null, note: string) => void;
  title?: string;
  approveButtonText?: string;
  startTime: string;
  endTime: string;
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
  startTime,
  endTime,
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
      getAvailableDrivers();
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

  const getAvailableDrivers = async () => {
    setLoading(true);
    try {
      const dataDrivers = await DriverService.getAvailableDrivers(startTime, endTime);
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
        <TouchableOpacity onPress={onClose} className="items-center justify-center flex-1 bg-black/30">
          <TouchableOpacity onPress={(e) => e.stopPropagation()}>
            <View className="p-6 bg-white rounded-lg">
              <Text className="text-center">Loading drivers...</Text>
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
        <TouchableOpacity onPress={onClose} className="justify-end flex-1 bg-black/30">
          <TouchableOpacity onPress={(e) => e.stopPropagation()}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="p-6 pb-12 rounded-t-2xl bg-gray-50">
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

                    {drivers.length > 0 ? (
                      <View className="p-4">
                        <View style={{ zIndex: open ? 1000 : 0 }}>
                          <Text className="mb-2 text-sm font-medium text-gray-700">
                            Select Driver *
                          </Text>
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
                            <Text className="text-sm text-green-800">
                              ✓ Driver selected successfully
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <Text className="text-sm text-red-800">
                          There are no drivers available for this request from
                          {formatDate(startTime)} to {formatDate(endTime)}.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Note Section */}
                {isDriverRequired && (
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
                )}

                {/* Action Buttons */}
                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-4 "
                    onPress={handleClose}
                    disabled={isApproving}>
                    <Text className="text-lg font-semibold text-white">Cancel</Text>
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
                      {isApproving ? 'Processing...' : approveButtonText}
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
