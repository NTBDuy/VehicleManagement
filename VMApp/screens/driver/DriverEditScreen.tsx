import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Driver from '@/types/Driver';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { formatDate } from '@/utils/datetimeUtils';
import { DriverService } from '@/services/driverService';
import { showToast } from '@/utils/toast';

const DriverEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { driverData: initialDriverData } = route.params as { driverData: Driver };
  const [driverData, setDriverData] = useState<Driver>(initialDriverData);
  const [errors, setErrors] = useState<Partial<Driver>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateDriverData = (field: keyof Driver, value: any) => {
    setDriverData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Driver> = {};

    if (!driverData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required' as any;
    }

    if (!driverData.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License number is required' as any;
    }

    if (!driverData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required' as any;
    } else if (!/^\d{9,10}$/.test(driverData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (9-10 digits)' as any;
    }

    if (!driverData.licenseIssuedDate?.trim()) {
      newErrors.licenseIssuedDate = 'License issued date is required' as any;
    } else if (isNaN(Date.parse(driverData.licenseIssuedDate))) {
      newErrors.licenseIssuedDate = 'Please enter a valid date (e.g. YYYY-MM-DD)' as any;
    }

    if (driverData.yearsOfExperience == null || isNaN(driverData.yearsOfExperience)) {
      newErrors.yearsOfExperience = 'Years of experience is required' as any;
    } else if (driverData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience must be a non-negative number' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors above');
      return;
    }

    Alert.alert('Update Driver', 'Are you sure you want to update this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          setIsLoading(true);
          try {
            const data = await DriverService.updateDriver(driverData.driverId, driverData);
            setDriverData(data);
            setHasChanges(false);
            showToast.success('Success', 'Driver updated successfully!');
          } catch (error) {
            console.log(error);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        customTitle={
          <View>
            <Text className="text-xl font-bold text-gray-800">
              Edit Driver #{driverData.driverId}
            </Text>
            {hasChanges && <Text className="text-xs text-orange-600">Unsaved changes</Text>}
          </View>
        }
      />

      <ScrollView className="flex-1 px-6">
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Driver Information</Text>
          </View>
          <View className="p-4">
            <InputField
              label="Full Name"
              value={driverData.fullName || ''}
              onChangeText={(text) => updateDriverData('fullName', text)}
              error={errors.fullName as string}
            />
            <InputField
              label="Phone Number"
              value={driverData.phoneNumber || ''}
              onChangeText={(text) => updateDriverData('phoneNumber', text)}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.phoneNumber as string}
            />
            <InputField
              label="License Number"
              value={driverData.licenseNumber || ''}
              onChangeText={(text) => updateDriverData('licenseNumber', text)}
              error={errors.licenseNumber as string}
            />
            <InputField
              label="License Issued Date"
              value={driverData.licenseIssuedDate?.split('T')[0] || ''}
              onChangeText={(text) => updateDriverData('licenseIssuedDate', text)}
              placeholder="YYYY-MM-DD"
              error={errors.licenseIssuedDate as string}
            />

            <InputField
              label="Year of Experience"
              value={driverData.yearsOfExperience.toString()}
              onChangeText={(text) => updateDriverData('yearsOfExperience', text)}
              keyboardType="numeric"
              error={errors.yearsOfExperience?.toString()}
            />
          </View>
        </View>

        <View className="mb-8 mt-4 flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isLoading}>
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 '
            }`}
            onPress={handleUpdate}
            disabled={isLoading || !hasChanges}>
            <Text className="font-semibold text-white">
              {isLoading ? 'Updating...' : 'Update Driver'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverEditScreen;
