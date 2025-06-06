import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, TouchableOpacity, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';

import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { useTranslation } from 'react-i18next';
const VehicleEditScreen = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { vehicleData: initialVehicleData } = route.params as { vehicleData: Vehicle };
  const [vehicleData, setVehicleData] = useState<Vehicle>(initialVehicleData);
  const [errors, setErrors] = useState<Partial<Vehicle>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateVehicleData = (field: keyof Vehicle, value: any) => {
    setVehicleData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const types = [
    { label: 'Sedan', value: 'Sedan' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Truck', value: 'Truck' },
    { label: 'Van', value: 'Van' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Vehicle> = {};

    if (!vehicleData.licensePlate.trim()) {
      newErrors.licensePlate = t('vehicle.validate.plate');
    }

    if (!vehicleData.brand.trim()) {
      newErrors.brand = t('vehicle.validate.brand');
    }

    if (!vehicleData.model.trim()) {
      newErrors.model = t('vehicle.validate.modal');
    }

    if (!vehicleData.type) {
      newErrors.type = t('vehicle.validate.type');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateVehicle = () => {
    if (!validateForm()) {
      showToast.error(
        `${t('vehicle.validate.error.title')}`,
        `${t('vehicle.validate.error.message')}`
      );
      return;
    }
    Alert.alert(
      `${t('vehicle.validate.toast.update.confirm.title')}`,
      `${t('vehicle.validate.toast.update.confirm.message')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setIsLoading(true);
            try {
              setIsLoading(true);
              const data = await VehicleService.updateVehicle(vehicleData.vehicleId, vehicleData);
              setVehicleData(data);
              showToast.success(
                `${t('vehicle.validate.toast.update.success.title')}`,
                `${t('vehicle.validate.toast.update.success.message')}`
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
        `${t('vehicle.toast.remove.cancel.title')}`,
        `${t('vehicle.toast.remove.cancel.message')}`,
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
          <Text className="text-xl font-bold">
            {t('vehicle.edit.title')} #{vehicleData.vehicleId}
          </Text>
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
            <InputField
              label={t('vehicle.detail.sectionInfo.label.plate')}
              value={vehicleData.licensePlate}
              onChangeText={(text) => updateVehicleData('licensePlate', text)}
              error={errors.licensePlate}
            />

            <View className="mb-4">
              <Text className="mb-1 text-sm text-gray-600">
                {t('vehicle.detail.sectionInfo.label.type')} <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {types.map((type) => {
                  const isFilterApplied = vehicleData.type === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => updateVehicleData('type', type.value)}
                      className={`w-[24%] items-center rounded-xl border px-4 py-2 ${
                        isFilterApplied ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-sm ${isFilterApplied ? 'text-white' : 'text-gray-700'}`}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <InputField
              label={t('vehicle.detail.sectionInfo.label.brand')}
              value={vehicleData.brand}
              onChangeText={(text) => updateVehicleData('brand', text)}
              error={errors.brand}
            />
            <InputField
              label={t('vehicle.detail.sectionInfo.label.model')}
              value={vehicleData.model}
              onChangeText={(text) => updateVehicleData('model', text)}
              error={errors.model}
            />
          </View>
        </View>

        <View className="mb-40 mt-2 flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isLoading}>
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdateVehicle}
            disabled={isLoading}
            className={`w-[48%] items-center rounded-xl py-4 ${isLoading ? 'bg-gray-500' : 'bg-blue-500 '}`}>
            <Text className="font-bold text-white">
              {isLoading
                ? `${t('vehicle.edit.actions.updating')}`
                : `${t('vehicle.edit.actions.update')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleEditScreen;
