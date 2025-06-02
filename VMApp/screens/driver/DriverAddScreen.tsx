import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { isValid, parseISO } from 'date-fns';

import Driver from '@/types/Driver';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { formatDate } from '@/utils/datetimeUtils';
import { DriverService } from '@/services/driverService';
import { showToast } from '@/utils/toast';

const DriverAddScreen = () => {
  const initialDriverData = {
    driverId: 0,
    fullName: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseIssuedDate: '',
    yearsOfExperience: 0,
    isActive: false,
  };

  const navigation = useNavigation<any>();
  const [driverData, setDriverData] = useState<Driver>(initialDriverData);
  const [errors, setErrors] = useState<Partial<Driver>>({});
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setDriverData(initialDriverData);
    }, [])
  );

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
    } else if (!isValid(parseISO(driverData.licenseIssuedDate))) {
      newErrors.licenseIssuedDate = 'Please enter a valid date (YYYY-MM-DD)';
    }

    if (driverData.yearsOfExperience == null || isNaN(driverData.yearsOfExperience)) {
      newErrors.yearsOfExperience = 'Years of experience is required' as any;
    } else if (driverData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience must be a non-negative number' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors above');
      return;
    }

    Alert.alert('Create New Driver', 'Are you sure you want to create this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async () => {
          setIsLoading(true);
          try {
            const data = await DriverService.createDriver(driverData);
            setDriverData(data);
            showToast.success('Success', 'Driver created successfully!');
            navigation.navigate('DriverDetail', { driverData: data });
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
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title="Create New Driver" />

      <ScrollView className="flex-1 px-6">
        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Driver Information</Text>
          </View>
          <View className="p-4">
            <InputField
              label="Full Name"
              value={driverData.fullName || ''}
              onChangeText={(text) => setDriverData({ ...driverData, fullName: text })}
              error={errors.fullName as string}
            />
            <InputField
              label="Phone Number"
              value={driverData.phoneNumber || ''}
              onChangeText={(text) => setDriverData({ ...driverData, phoneNumber: text })}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.phoneNumber as string}
            />
            <InputField
              label="License Number"
              value={driverData.licenseNumber || ''}
              onChangeText={(text) => setDriverData({ ...driverData, licenseNumber: text })}
              error={errors.licenseNumber as string}
            />
            <InputField
              label="license Issued Date"
              value={driverData.licenseIssuedDate}
              onChangeText={(text) => setDriverData({ ...driverData, licenseIssuedDate: text })}
              placeholder="YYYY-MM-DD"
              error={errors.licenseIssuedDate as string}
            />
            <InputField
              label="Year of Experience"
              value={driverData.yearsOfExperience.toString()}
              onChangeText={(text) =>
                setDriverData({ ...driverData, yearsOfExperience: Number(text) })
              }
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
            onPress={handleCreate}
            disabled={isLoading}>
            <Text className="font-semibold text-white">
              {isLoading ? 'Updating...' : 'Update Driver'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverAddScreen;
