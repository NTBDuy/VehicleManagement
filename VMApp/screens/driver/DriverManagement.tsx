import { View, Text, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import React, { useCallback, useState } from 'react';

import Driver from '@/types/Driver';

import Header from '@/components/layout/HeaderComponent';
import { useFocusEffect } from '@react-navigation/core';
import { DriverService } from '@/services/driverService';
import LoadingData from '@/components/ui/LoadingData';
import { formatDate } from '@/utils/datetimeUtils';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>();
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchDriverData();
    }, [])
  );

  const fetchDriverData = async () => {
    try {
      setIsLoading(true);
      const data = await DriverService.getAllDrivers();
      setDrivers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDriverItem = ({ item }: { item: Driver }) => {
    return (
      <TouchableOpacity className="p-4 mx-4 mb-3 bg-white border border-gray-100 rounded-lg shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="flex-1 text-lg font-semibold text-gray-900">{item.fullName}</Text>

          <View
            className={`rounded-full px-2 py-1 ${item.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text
              className={`text-xs font-medium ${
                item.isActive ? 'text-green-700' : 'text-gray-600'
              }`}>
              {item.isActive ? 'Active' : 'Deactivate'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Experience: {item.yearsOfExperience} năm</Text>
            <Text className="text-sm text-gray-500">Phone: {item.phoneNumber}</Text>
          </View>

          <View className="items-center justify-center w-6 h-6">
            <Text className="text-lg text-gray-400">›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Driver Management" />

      {isLoading ? (
        <LoadingData />
      ) : (
        <View className="flex-1 pt-4 mx-4">
          <FlatList
            data={drivers}
            keyExtractor={(item) => item.driverId.toString()}
            renderItem={renderDriverItem}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default DriverManagement;
