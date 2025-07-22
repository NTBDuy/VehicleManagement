import { types } from '@/utils/vehicleUtils';
import { vehicleSchema } from '@/validations/vehicleSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';

import VehicleFormData from '@/types/VehicleFormData';
import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

const VehicleAddScreen = () => {
  const initialVehicleData = {
    vehicleId: 0,
    licensePlate: '',
    type: '',
    brand: '',
    model: '',
    status: 0,
    lastMaintenance: '',
  };

  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const createVehicleSchema = vehicleSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VehicleFormData>({
    resolver: yupResolver(createVehicleSchema),
    defaultValues: {
      licensePlate: initialVehicleData.licensePlate || '',
      brand: initialVehicleData.brand || '',
      model: initialVehicleData.model || '',
      type: initialVehicleData.type || '',
    },
    mode: 'onChange',
  });

  useFocusEffect(
    useCallback(() => {
      reset({
        licensePlate: '',
        brand: '',
        model: '',
        type: '',
      });
    }, [])
  );

  const onSubmit = async (data: VehicleFormData) => {
    try {
      const createVehicleData = {
        ...initialVehicleData,
        ...data,
      };

      const result = await VehicleService.createVehicle(createVehicleData);
      showToast.success(
        `${t('common.success.title')}`,
        `${t('common.success.created', { item: t('common.items.vehicle') })}`
      );
      navigation.navigate('VehicleDetail', { vehicleId: result });
      reset({
        licensePlate: '',
        brand: '',
        model: '',
        type: '',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddVehicle = async () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title={t('vehicle.add.title')} />

      <ScrollView className="px-6">
        <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('vehicle.detail.sectionInfo.title')}
            </Text>
          </View>

          <View className="p-4">
            <Controller
              control={control}
              name="licensePlate"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('vehicle.detail.sectionInfo.label.plate')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.licensePlate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('vehicle.detail.sectionInfo.label.type')}{' '}
                    <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    {types.map((type) => {
                      const isSelected = value === type.value;
                      return (
                        <TouchableOpacity
                          key={type.value}
                          onPress={() => onChange(type.value)}
                          className={`w-[24%] items-center rounded-xl border px-4 py-2 ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                          }`}>
                          <Text
                            className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.type && (
                    <Text className="mt-1 text-sm text-red-500">{errors.type.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('vehicle.detail.sectionInfo.label.brand')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.brand?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="model"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('vehicle.detail.sectionInfo.label.model')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.model?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="mb-40 mt-2">
          <TouchableOpacity
            onPress={handleAddVehicle}
            disabled={isSubmitting}
            className={`items-center rounded-xl py-4 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500 '}`}>
            <Text className="font-bold text-white">
              {isSubmitting ? `${t('common.button.adding')}` : `${t('common.button.add')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleAddScreen;
