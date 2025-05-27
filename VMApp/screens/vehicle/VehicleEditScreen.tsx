import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import Header from 'components/HeaderComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import Vehicle from 'types/Vehicle';
import InputField from 'components/InputFieldComponent';
import { showToast } from 'utils/toast';
import { VehicleService } from 'services/vehicleService';

const VehicleEditScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
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
      newErrors.licensePlate = 'License plate is required';
    }

    if (!vehicleData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!vehicleData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!vehicleData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateVehicle = () => {
    if (!validateForm()) {
      showToast.error('Validation Error', 'Please fix the errors above');
      return;
    }
    Alert.alert('Update Vehicle', 'Are you sure you want to update this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          setIsLoading(true);
          try {
            setIsLoading(true);
            const data = await VehicleService.updateVehicle(vehicleData.vehicleId, vehicleData);
            setVehicleData(data);
            showToast.success('Success', 'Vehicle updated successfully!');
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
          <Text className="text-xl font-bold">Update Vehicle #{vehicleData.vehicleId}</Text>
        }
      />

      <ScrollView className="px-6">
        {/* Vehicle Information */}
        <View className="mt-4 mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
          </View>

          <View className="p-4">
            <InputField
              label="Plate number"
              value={vehicleData.licensePlate}
              onChangeText={(text) => updateVehicleData('licensePlate', text)}
              error={errors.licensePlate}
            />

            <View className="mb-4">
              <Text className="mb-1 text-sm text-gray-600">
                Type <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {types.map((type) => {
                  const isFilterApplied = vehicleData.type === type.value;
                  return (
                    <Pressable
                      key={type.value}
                      onPress={() => updateVehicleData('type', type.value)}
                      className={`w-[24%] items-center rounded-xl border px-4 py-2 ${
                        isFilterApplied ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-sm ${isFilterApplied ? 'text-white' : 'text-gray-700'}`}>
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <InputField
              label="Brand"
              value={vehicleData.brand}
              onChangeText={(text) => updateVehicleData('brand', text)}
              error={errors.brand}
            />
            <InputField
              label="Model"
              value={vehicleData.model}
              onChangeText={(text) => updateVehicleData('model', text)}
              error={errors.model}
            />
          </View>
        </View>

        {/** Active button */}
        <View className="flex-row justify-between mt-2 mb-40">
          <Pressable
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isLoading}>
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleUpdateVehicle}
            disabled={isLoading}
            className={`w-[48%] items-center rounded-xl py-4 ${isLoading ? 'bg-gray-500' : 'bg-blue-500 active:bg-blue-700'}`}>
            <Text className="font-bold text-white">
              {isLoading ? 'Updating ...' : 'Update Vehicle'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleEditScreen;
