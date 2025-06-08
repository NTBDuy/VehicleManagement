import { DriverService } from '@/services/driverService';
import { showToast } from '@/utils/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { isValid, parseISO } from 'date-fns';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import Driver from '@/types/Driver';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

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
  const { t } = useTranslation();
  const [driverData, setDriverData] = useState<Driver>(initialDriverData);
  const [errors, setErrors] = useState<Partial<Driver>>({});
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setDriverData(initialDriverData);
      setErrors({});
    }, [])
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Driver> = {};

    if (!driverData.fullName?.trim()) {
      newErrors.fullName = t('validate.required.fullname') as any;
    }

    if (!driverData.licenseNumber?.trim()) {
      newErrors.licenseNumber = t('validate.required.license') as any;
    }

    if (!driverData.phoneNumber?.trim()) {
      newErrors.phoneNumber = t('validate.required.phone') as any;
    } else if (!/^\d{9,10}$/.test(driverData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = t('validate.regex.phone') as any;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!driverData.licenseIssuedDate?.trim()) {
      newErrors.licenseIssuedDate = t('validate.required.licenseIssueDate') as any;
    } else if (!dateRegex.test(driverData.licenseIssuedDate)) {
      newErrors.licenseIssuedDate = t('validate.regex.licenseIssueDate');
    } else if (!isValid(parseISO(driverData.licenseIssuedDate))) {
      newErrors.licenseIssuedDate = t('validate.regex.licenseIssueDate');
    }

    if (driverData.yearsOfExperience == null || isNaN(driverData.yearsOfExperience)) {
      newErrors.yearsOfExperience = t('validate.required.yearOfExperience') as any;
    } else if (driverData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = t('validate.regex.yearOfExperience') as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await DriverService.createDriver(driverData);
      setDriverData(data);
      showToast.success(
        `${t('common.success.title')}`,
        `${t('common.success.created', { item: t('common.items.driver') })}`
      );
      navigation.navigate('DriverDetail', { driverData: data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title={t('driver.add.title')} />

      <ScrollView className="flex-1 px-6">
        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('driver.detail.section.title')}
            </Text>
          </View>
          <View className="p-4">
            <InputField
              label={t('common.fields.fullname')}
              value={driverData.fullName || ''}
              onChangeText={(text) => setDriverData({ ...driverData, fullName: text })}
              error={errors.fullName as string}
            />
            <InputField
              label={t('common.fields.phone')}
              value={driverData.phoneNumber || ''}
              onChangeText={(text) => setDriverData({ ...driverData, phoneNumber: text })}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.phoneNumber as string}
            />
            <InputField
              label={t('driver.detail.section.license')}
              value={driverData.licenseNumber || ''}
              onChangeText={(text) => setDriverData({ ...driverData, licenseNumber: text })}
              error={errors.licenseNumber as string}
            />
            <InputField
              label={t('driver.detail.section.licenseDate')}
              value={driverData.licenseIssuedDate}
              onChangeText={(text) => setDriverData({ ...driverData, licenseIssuedDate: text })}
              placeholder="YYYY-MM-DD"
              error={errors.licenseIssuedDate as string}
            />
            <InputField
              label={t('driver.detail.section.experience')}
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
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 '
            }`}
            onPress={handleCreate}
            disabled={isLoading}>
            <Text className="font-semibold text-white">
              {isLoading ? `${t('common.button.adding')}` : `${t('common.button.add')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverAddScreen;
