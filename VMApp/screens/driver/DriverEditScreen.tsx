import { showToast } from '@/utils/toast';
import { driverSchema } from '@/validations/driverSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import Driver from '@/types/Driver';
import DriverFormData from '@/types/DriverFormData';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { DriverService } from '@/services/driverService';

const DriverEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { driverData: initialDriverData } = route.params as { driverData: Driver };
  const [driverData, setDriverData] = useState<Driver>(initialDriverData);
  const queryClient = useQueryClient();

  const updateDriverSchema = driverSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<DriverFormData>({
    resolver: yupResolver(updateDriverSchema),
    defaultValues: {
      fullName: driverData.fullName,
      phoneNumber: driverData.phoneNumber,
      licenseNumber: driverData.licenseNumber,
      licenseIssuedDate: driverData.licenseIssuedDate.split('T')[0],
      yearsOfExperience: driverData.yearsOfExperience,
    },
    mode: 'onChange',
  });

  const onSubmit = (data: DriverFormData) => {
    Alert.alert(
      `${t('common.confirmation.title.update', { item: t('common.items.driver') })}`,
      `${t('common.confirmation.message.update', { item: t('common.items.driver') })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.update')}`,
          onPress: async () => {
            try {
              const updateData = {
                ...driverData,
                ...data,
              };
              const result = await DriverService.updateDriver(driverData.driverId, updateData);
              
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['driver', result.driverId] }),
                queryClient.invalidateQueries({ queryKey: ['drivers'] }),
              ]);

              setDriverData(result);
              reset({
                fullName: result.fullName,
                phoneNumber: result.phoneNumber,
                licenseNumber: result.licenseNumber,
                licenseIssuedDate: result.licenseIssuedDate.split('T')[0],
                yearsOfExperience: result.yearsOfExperience,
              });
              showToast.success(
                `${t('common.success.title')}`,
                `${t('common.success.updated', { item: t('common.items.driver') })}`
              );
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]
    );
  };

  const handleUpdate = () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
  };

  const handleCancel = () => {
    if (isDirty) {
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
            {isDirty && <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>}
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
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.fullname')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.phone')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="licenseNumber"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('driver.detail.section.license')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.licenseNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="licenseIssuedDate"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('driver.detail.section.licenseDate')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.licenseIssuedDate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="yearsOfExperience"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('driver.detail.section.experience')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.yearsOfExperience?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="mb-8 mt-4 flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isSubmitting}>
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600 '
            }`}
            onPress={handleUpdate}
            disabled={isSubmitting || !isDirty}>
            <Text className="font-semibold text-white">
              {isSubmitting ? `${t('common.button.updating')}` : `${t('common.button.update')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverEditScreen;
