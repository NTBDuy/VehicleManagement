import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';
import { vehicleSchema } from '@/validations/vehicleSchema';
import { types } from '@/utils/vehicleUtils';

import Vehicle from 'types/Vehicle';
import VehicleFormData from '@/types/VehicleFormData';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

const VehicleEditScreen = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { vehicleData: initialVehicleData } = route.params as { vehicleData: Vehicle };

  const editVehicleSchema = vehicleSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<VehicleFormData>({
    resolver: yupResolver(editVehicleSchema),
    defaultValues: {
      licensePlate: initialVehicleData.licensePlate || '',
      brand: initialVehicleData.brand || '',
      model: initialVehicleData.model || '',
      type: initialVehicleData.type || '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: VehicleFormData) => {
    Alert.alert(
      `${t('common.confirmation.title.update', { item: t('common.items.vehicle') })}`,
      `${t('common.confirmation.message.update', { item: t('common.items.vehicle') })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.update')}`,
          onPress: async () => {
            try {
              const updatedVehicleData = {
                ...initialVehicleData,
                ...data,
              };

              const result = await VehicleService.updateVehicle(
                initialVehicleData.vehicleId,
                updatedVehicleData
              );

              reset(result);

              showToast.success(
                `${t('common.success.title')}`,
                `${t('common.success.updated', { item: t('common.items.vehicle') })}`
              );
            } catch (error) {
              console.log(error);
              showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
            }
          },
        },
      ]
    );
  };

  const handleUpdateVehicle = () => {
    if (isDirty) {
      handleSubmit(onSubmit, (errors) => {
        console.log('Validation errors:', errors);
        showToast.error(
          `${t('common.error.validation.title')}`,
          `${t('common.error.validation.message')}`
        );
      })();
    } else {
      showToast.info(t('common.info.nothingChanges'));
    }
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
            <Text className="text-xl font-bold">
              {t('vehicle.edit.title')} #{initialVehicleData.vehicleId}
            </Text>
            {(isDirty) && (
              <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>
            )}
          </View>
        }
      />

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

        <View className="mb-40 mt-2 flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isSubmitting}>
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUpdateVehicle}
            disabled={isSubmitting}
            className={`w-[48%] items-center rounded-xl py-4 ${
              isSubmitting ? 'bg-gray-500' : 'bg-blue-500'
            }`}>
            <Text className="font-bold text-white">
              {isSubmitting ? `${t('common.button.updating')}` : `${t('common.button.update')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleEditScreen;
