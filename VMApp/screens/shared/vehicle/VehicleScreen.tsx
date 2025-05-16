import { View, Text, SafeAreaView, FlatList, Pressable, Alert, Modal } from 'react-native';
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
  faInfoCircle,
  faEdit,
  faTrash,
  faCalendarCheck,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import EmptyListComponent from 'components/EmptyListComponent';

const vehicle: Vehicle[] = vehicleData;

const VehicleScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Vehicle>();
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();

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
    <Pressable
      onPress={() => handleOption(item)}
      className="mt-4 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={vehicleType(item.Type)} size={24} color="#0d4d87" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.LicensePlate}</Text>
        <Text className="text-sm">
          {item.Brand} {item.Model}
        </Text>
      </View>
      <View className="flex-row items-center">
        <View>{renderBadgeVehicleStatus({ status: item.Status })}</View>
        <FontAwesomeIcon icon={faEllipsisV} />
      </View>
    </Pressable>
  );

  const filter = (query: string): void => {
    let filtered = vehicle;

    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.LicensePlate.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Type.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Brand.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Model.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          (item.Status === 0 && 'Available'.includes(query.toLocaleLowerCase())) ||
          (item.Status === 1 && 'InUse'.includes(query.toLocaleLowerCase())) ||
          (item.Status === 2 && 'UnderMaintenance'.includes(query.toLocaleLowerCase()))
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

  const handleOption = (vehicle: Vehicle) => {
    setSelected(vehicle);
    setModalVisible(true);
  };

  const onViewDetail = () => {
    navigation.navigate('VehicleDetail', { vehicleData: selected });
  };

  const onAdd = () => {
    navigation.navigate('VehicleAdd');
  };

  const onClose = () => {
    setModalVisible(false);
  };

  const onEdit = () => {
    navigation.navigate('VehicleEdit', { vehicleData: selected });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Vehicle Management"
        rightElement={
          <Pressable className="rounded-full bg-white p-2" onPress={onAdd}>
            <FontAwesomeIcon icon={faPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search plate, type or brand ..."
        clearSearch={clearSearch}
      />

      <View className="mx-6 mb-10 flex-1">
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.VehicleId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyListComponent title="No vehicle found!" icon={faCarBurst} />}
        />
      </View>

      {vehicle.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-white">
          <Text className="text-center text-sm font-medium text-gray-500">
            Total Vehicle:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredVehicles.length}</Text>
          </Text>
        </View>
      )}

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-2xl bg-white p-6 pb-12">
            <Text className="mb-6 text-center text-lg font-bold">
              Options for {selected?.LicensePlate}
            </Text>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                onViewDetail();
                onClose();
              }}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Detail</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                onEdit();
                onClose();
              }}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Edit</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                // onResetPassword();
                onClose();
              }}>
              <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Schedule Maintenance</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                // onToggleStatus();
                onClose();
              }}>
              <FontAwesomeIcon icon={faTrash} size={20} color="#dc2626" />
              <Text className="text-lg font-semibold text-red-600">Remove</Text>
            </Pressable>

            <Pressable className="flex-row items-center justify-center gap-3" onPress={onClose}>
              <FontAwesomeIcon icon={faTimesCircle} size={20} color="#6b7280" />
              <Text className="text-lg font-semibold text-gray-500">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleScreen;
