import { View, Text, TextInput, SafeAreaView, Pressable, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Header from 'components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import Vehicle from 'types/Vehicle';

const VehicleAddScreen = () => {
  const initialVehicleData = {
    VehicleId: 0,
    LicensePlate: '',
    Type: '',
    Brand: '',
    Model: '',
    Status: 0,
    LastMaintenance: '',
  }

  const [vehicleData, setVehicleData] = useState<Vehicle>(initialVehicleData);

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
  }) => (
    <View className="mb-4">
      <Text className="mb-1 text-sm text-gray-600">{label}</Text>
      <TextInput
        className="focus:border-primary rounded-xl border border-gray-300 bg-white px-4 py-2 text-base text-gray-800 shadow-sm focus:outline-none"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Enter ' + label.toLocaleLowerCase()}
        placeholderTextColor="#A0AEC0"
      />
    </View>
  );

  const types = [
    { label: 'Sedan', value: 'Sedan' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Truck', value: 'Truck' },
    { label: 'Van', value: 'Van' },
  ];

  return (
    <SafeAreaView>
      <Header
        backBtn
        title='Add New Vehicle'
      />

      <ScrollView className="px-6">
        {/* Vehicle Information */}
        <View className="mb-6 mt-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-lg font-bold text-gray-800">Vehicle Information</Text>

          <InputField
            label="Plate number"
            value={vehicleData.LicensePlate}
            onChangeText={(text) => setVehicleData({ ...vehicleData, LicensePlate: text })}
          />

          <View className="mb-4">
            <Text className="mb-1 text-sm text-gray-600">Type</Text>
            <View className="flex-row flex-wrap justify-between">
              {types.map((type) => {
                const isSelected = vehicleData.Type === type.value;
                return (
                  <Pressable
                    key={type.value}
                    onPress={() => setVehicleData({ ...vehicleData, Type: type.value })}
                    className={`w-[24%] items-center rounded-xl border px-4 py-2 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                    }`}>
                    <Text className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <InputField
            label="Brand"
            value={vehicleData.Brand}
            onChangeText={(text) => setVehicleData({ ...vehicleData, Brand: text })}
          />
          <InputField
            label="Model"
            value={vehicleData.Model}
            onChangeText={(text) => setVehicleData({ ...vehicleData, Model: text })}
          />
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

export default VehicleAddScreen;
