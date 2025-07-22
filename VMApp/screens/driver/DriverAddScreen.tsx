import { DriverService } from '@/services/driverService';
import { showToast } from '@/utils/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { driverSchema } from '@/validations/driverSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import DriverFormData from '@/types/DriverFormData';

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

  const createDriverSchema = driverSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DriverFormData>({
    resolver: yupResolver(createDriverSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      licenseNumber: '',
      licenseIssuedDate: '',
      yearsOfExperience: 0,
    },
    mode: 'onChange',
  });

  useFocusEffect(
    useCallback(() => {
      reset(initialDriverData);
    }, [])
  );

  const onSubmit = async (data: DriverFormData) => {
    try {
      const result = await DriverService.createDriver(data);
      showToast.success(
        `${t('common.success.title')}`,
        `${t('common.success.created', { item: t('common.items.driver') })}`
      );
      navigation.navigate('DriverDetail', { driverId: result });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreate = async () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
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
            onPress={handleCreate}
            disabled={isSubmitting}>
            <Text className="font-semibold text-white">
              {isSubmitting ? `${t('common.button.adding')}` : `${t('common.button.add')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverAddScreen;
