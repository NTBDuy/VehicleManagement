import { View, Text, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from 'components/Header';
import Vehicle from 'types/Vehicle';
import vehicleData from 'data/vehicle.json';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCarBurst,
  faEllipsisV,
  faCar,
  faCarSide,
  faTruckPickup,
  faVanShuttle,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

const vehicle: Vehicle[] = vehicleData;

const VehicleScreen = () => {
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const renderBadgeVehicleStatus = ({ status }: { status: number }) => {
    const getStatusStyle = (status: number) => {
      switch (status) {
        case 0:
          return 'bg-green-500';
        case 1:
          return 'bg-blue-500';
        case 3:
          return 'bg-orange-500';
        default:
          return 'bg-gray-500';
      }
    };

    const getStatusLabel = (status: number) => {
      switch (status) {
        case 0:
          return 'Available';
        case 1:
          return 'InUse';
        case 2:
          return 'UnderMaintenance';
        default:
          return 'Unknown';
      }
    };

    const bgColor = getStatusStyle(status);

    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getStatusLabel(status)}</Text>
      </View>
    );
  };

  const vehicleType = (type: string) => {
    switch (type) {
      case 'Sedan':
        return faCar;
      case 'SUV':
        return faCarSide;
      case 'Truck':
        return faTruckPickup;
      case 'Van':
        return faVanShuttle;
      default:
        return faCar;
    }
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <View className="mt-4 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={vehicleType(item.Type)} size={24} color="#3f3f3f" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.LicensePlate}</Text>
        <Text className="text-sm">{item.Model}</Text>
      </View>
      <View className="flex-row items-center">
        <View>{renderBadgeVehicleStatus({ status: item.Status })}</View>
        <View>
          <Pressable className="m-2" onPress={() => {}}>
            <FontAwesomeIcon icon={faEllipsisV} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const EmptyListComponent = () => (
    <View className="flex-1 items-center justify-center py-72">
      <FontAwesomeIcon icon={faCarBurst} size={60} color="#6b7280" />
      <Text className="mt-4 text-lg text-gray-500">No vehicle found!</Text>
    </View>
  );

  const filter = (query: string): void => {
    let filtered = vehicle;

    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.LicensePlate.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Type.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Brand.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Model.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          (user.Status === 0 && 'Available'.includes(query.toLocaleLowerCase())) ||
          (user.Status === 1 && 'InUse'.includes(query.toLocaleLowerCase())) ||
          (user.Status === 2 && 'UnderMaintenance'.includes(query.toLocaleLowerCase()))
      );
    }
    setFilteredVehicles(filtered);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    filter(text);
  };

  const clearSearch = (): void => {
    setSearchQuery('');
    filter('');
  };

  useEffect(() => {
    setFilteredVehicles(vehicle);
  }, []);

  const handlePress = () => {
    Alert.alert('Comming soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Vehicle Management"
        rightElement={
          <Pressable className="rounded-full bg-white p-2" onPress={handlePress}>
            <FontAwesomeIcon icon={faPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search plate, type or brand ..."
        clearSearch={clearSearch}
      />

      <View className="mx-6 mb-52">
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.VehicleId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyListComponent}
        />

        <View className="mt-4 flex items-center">
          <Text className="text-sm font-medium text-gray-500">
            Total Vehicle:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredVehicles.length}</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VehicleScreen;
