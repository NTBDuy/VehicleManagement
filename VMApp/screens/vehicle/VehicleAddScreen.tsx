import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { TouchableOpacity, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';

import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { useTranslation } from 'react-i18next';

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
  const [vehicleData, setVehicleData] = useState<Vehicle>(initialVehicleData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Vehicle>>({});

  useFocusEffect(
    useCallback(() => {
      setVehicleData(initialVehicleData);
    }, [])
  );

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
      newErrors.model = t('vehicle.validate.model');
    }

    if (!vehicleData.type) {
      newErrors.type = t('vehicle.validate.type');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddVehicle = async () => {
    if (!validateForm()) {
      showToast.error(
        `${t('vehicle.validate.error.title')}`,
        `${t('vehicle.validate.error.message')}`
      );
      return;
    }
    try {
      setIsLoading(true);
      const data = await VehicleService.createVehicle(vehicleData);
      showToast.success(
        `${t('vehicle.toast.add.success.title')}`,
        `${t('vehicle.toast.add.success.message')}`
      );
      navigation.navigate('VehicleDetail', { vehicleData: data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title="Add New Vehicle" />

      <ScrollView className="px-6">
        <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">{t('vehicle.detail.sectionInfo.title')}</Text>
          </View>

          <View className="p-4">
            <InputField
              label={t('vehicle.detail.sectionInfo.label.plate')}
              value={vehicleData.licensePlate}
              onChangeText={(text) => setVehicleData({ ...vehicleData, licensePlate: text })}
              error={errors.licensePlate}
            />

            <View className="mb-4">
              <Text className="mb-1 text-sm text-gray-600">
                {t('vehicle.detail.sectionInfo.label.type')} <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {types.map((type) => {
                  const isFilterApplied = vehicleData.type
                    ? vehicleData.type === type.value
                    : type.value === 'Sedan';
                  return (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setVehicleData({ ...vehicleData, type: type.value })}
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
              onChangeText={(text) => setVehicleData({ ...vehicleData, brand: text })}
              error={errors.brand}
            />
            <InputField
              label={t('vehicle.detail.sectionInfo.label.model')}
              value={vehicleData.model}
              onChangeText={(text) => setVehicleData({ ...vehicleData, model: text })}
              error={errors.model}
            />
          </View>
        </View>

        <View className="mb-40 mt-2">
          <TouchableOpacity
            onPress={handleAddVehicle}
            disabled={isLoading}
            className={`items-center rounded-xl py-4 ${isLoading ? 'bg-gray-500' : 'bg-blue-500 '}`}>
            <Text className="font-bold text-white">
              {isLoading ? `${t('vehicle.add.actions.adding')}` : `${t('vehicle.add.actions.add')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleAddScreen;
