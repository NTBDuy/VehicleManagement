import { showToast } from '@/utils/toast';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { isValid, parseISO } from 'date-fns';

import Driver from '@/types/Driver';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { DriverService } from '@/services/driverService';

const DriverEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
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

  const handleUpdate = () => {
    if (!validateForm()) {
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
      return;
    }

    Alert.alert(
      `${t('common.confirmation.title.update', { item: t('common.items.driver') })}`,
      `${t('common.confirmation.message.update', { item: t('common.items.driver') })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.update')}`,
          onPress: async () => {
            setIsLoading(true);
            try {
              const data = await DriverService.updateDriver(driverData.driverId, driverData);
              setDriverData(data);
              setHasChanges(false);
              showToast.success(
                `${t('common.success.title')}`,
                `${t('common.success.updated', { item: t('common.items.driver') })}`
              );
            } catch (error) {
              console.log(error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        `${t('common.confirmation.title.discardChanges')}`,
        `${t('common.confirmation.message.discardChanges')}`,
        [
          { text: `${t('common.button.keepEdit')}`, style: 'cancel' },
          {
            text: `${t('common.button.discard')}`,
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
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
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800">{t('driver.edit.title')}</Text>
            <Text className="text-xl font-bold text-gray-800">#{driverData.driverId}</Text>
            {hasChanges && <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>}
          </View>
        }
      />

      <ScrollView className="flex-1 px-6">
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('driver.detail.section.title')}
            </Text>
          </View>
          <View className="p-4">
            <InputField
              label={t('common.fields.fullname')}
              value={driverData.fullName || ''}
              onChangeText={(text) => updateDriverData('fullName', text)}
              error={errors.fullName as string}
            />
            <InputField
              label={t('common.fields.phone')}
              value={driverData.phoneNumber || ''}
              onChangeText={(text) => updateDriverData('phoneNumber', text)}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.phoneNumber as string}
            />
            <InputField
              label={t('driver.detail.section.license')}
              value={driverData.licenseNumber || ''}
              onChangeText={(text) => updateDriverData('licenseNumber', text)}
              error={errors.licenseNumber as string}
            />
            <InputField
              label={t('driver.detail.section.licenseDate')}
              value={driverData.licenseIssuedDate?.split('T')[0] || ''}
              onChangeText={(text) => updateDriverData('licenseIssuedDate', text)}
              placeholder="YYYY-MM-DD"
              error={errors.licenseIssuedDate as string}
            />

            <InputField
              label={t('driver.detail.section.experience')}
              value={driverData.yearsOfExperience.toString()}
              onChangeText={(text) => {
                const num = text === '' ? 0 : Number(text);
                updateDriverData('yearsOfExperience', num);
              }}
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
            onPress={handleUpdate}
            disabled={isLoading || !hasChanges}>
            <Text className="font-semibold text-white">
              {isLoading ? `${t('common.button.updating')}` : `${t('common.button.update')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverEditScreen;
