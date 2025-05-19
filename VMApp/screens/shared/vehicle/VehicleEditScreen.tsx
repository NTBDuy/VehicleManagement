import { View, Text, TextInput, SafeAreaView, Pressable, ScrollView } from 'react-native';
import React, { useState } from 'react';
import HeaderComponent from 'components/HeaderComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import Vihicle from 'types/Vehicle';
import Vehicle from 'types/Vehicle';
import InputFieldComponent from 'components/InputFieldComponent';

const VehicleEditScreen = () => {
  const route = useRoute();
  const { vehicleData: initialVehicleData } = route.params as { vehicleData: Vihicle };

  const [vehicleData, setVehicleData] = useState<Vehicle>(initialVehicleData);

  const types = [
    { label: 'Sedan', value: 'Sedan' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Truck', value: 'Truck' },
    { label: 'Van', value: 'Van' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HeaderComponent
        backBtn
        customTitle={
          <Text className="text-xl font-bold">Update Vehicle #{vehicleData.VehicleId}</Text>
        }
      />

      <ScrollView className="px-6">
        {/* Vehicle Information */}
        <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Vehicle Information</Text>
          </View>

          <View className="p-4">
            <InputFieldComponent
              label="Plate number"
              value={vehicleData.LicensePlate}
              onChangeText={(text) => setVehicleData({ ...vehicleData, LicensePlate: text })}
            />

            <View className="mb-4">
              <Text className="mb-1 text-sm text-gray-600">Type</Text>
              <View className="flex-row flex-wrap justify-between">
                {types.map((type) => {
                  const isFilterApplied = vehicleData.Type === type.value;
                  return (
                    <Pressable
                      key={type.value}
                      onPress={() => setVehicleData({ ...vehicleData, Type: type.value })}
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

            <InputFieldComponent
              label="Brand"
              value={vehicleData.Brand}
              onChangeText={(text) => setVehicleData({ ...vehicleData, Brand: text })}
            />
            <InputFieldComponent
              label="Model"
              value={vehicleData.Model}
              onChangeText={(text) => setVehicleData({ ...vehicleData, Model: text })}
            />
          </View>
        </View>

        {/** Active button */}
        <View className="mb-40 mt-2">
          <Pressable className="items-center rounded-xl bg-blue-500 py-4">
            <Text className="font-bold text-white">Update Vehicle</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleEditScreen;
