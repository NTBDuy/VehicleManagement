import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useCallback, useState } from 'react';
import Header from 'components/HeaderComponent';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Vehicle from 'types/Vehicle';
import InputField from 'components/InputFieldComponent';
import { showToast } from 'utils/toast';
import { VehicleService } from 'services/vehicleService';

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

  const handleAddVehicle = async () => {
    if (!validateForm()) {
      showToast.error('Validation Error', 'Please fix the errors above');
      return;
    }
    try {
      setIsLoading(true);
      const data = await VehicleService.createVehicle(vehicleData);
      showToast.success('Success', 'Vehicle created successfully!');
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
        <View className="mt-4 mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
          </View>

          <View className="p-4">
            <InputField
              label="Plate number"
              value={vehicleData.licensePlate}
              onChangeText={(text) => setVehicleData({ ...vehicleData, licensePlate: text })}
              error={errors.licensePlate}
            />

            <View className="mb-4">
              <Text className="mb-1 text-sm text-gray-600">
                Type <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {types.map((type) => {
                  const isFilterApplied = vehicleData.type
                    ? vehicleData.type === type.value
                    : type.value == 'Sedan';
                  return (
                    <Pressable
                      key={type.value}
                      onPress={() => setVehicleData({ ...vehicleData, type: type.value })}
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
              onChangeText={(text) => setVehicleData({ ...vehicleData, brand: text })}
              error={errors.brand}
            />
            <InputField
              label="Model"
              value={vehicleData.model}
              onChangeText={(text) => setVehicleData({ ...vehicleData, model: text })}
              error={errors.model}
            />
          </View>
        </View>

        {/** Active button */}
        <View className="mt-2 mb-40">
          <Pressable
            onPress={handleAddVehicle}
            disabled={isLoading}
            className={`items-center rounded-xl py-4 ${isLoading ? 'bg-gray-500' : 'bg-blue-500 active:bg-blue-700'}`}>
            <Text className="font-bold text-white">{isLoading ? 'Adding... ' : 'Add Vehicle'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleAddScreen;
