import { View, Text, SafeAreaView, FlatList, Pressable, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import Vehicle from 'types/Vehicle';
import vehicleData from '../../../data/vehicle.json';
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
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import EmptyList from 'components/EmptyListComponent';

const vehicles: Vehicle[] = vehicleData;

type VehicleStat = {
  total: number;
  available: number;
  inUse: number;
  underMaintenance: number;
};

const VehicleScreen = () => {
  const initialStat = {
    total: 0,
    available: 0,
    inUse: 0,
    underMaintenance: 0,
  };

  const navigation = useNavigation<any>();
  const [vehicleStat, setVehicleStat] = useState<VehicleStat>(initialStat);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<Vehicle>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (vehicles) {
      setFilteredVehicles(vehicles);
      calculateVehicleStatistics(vehicles);
    }
  }, [vehicles]);

  /** Func: Statistics */
  const calculateVehicleStatistics = (item: Vehicle[]) => {
    const total = item.length;
    const available = item.filter((request) => request.Status === 0).length;
    const inUse = item.filter((request) => request.Status === 1).length;
    const underMaintenance = item.filter((request) => request.Status === 2).length;
    setVehicleStat({ total, available, inUse, underMaintenance });
  };

  /** Func: Get icon for each vehicle */
  const getVehicleTypeIcon = (type: string) => {
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

  /** Func: Filter Vehicle */
  const filterVehicles = (query: string, status: string): void => {
    let filtered = vehicles;

    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.LicensePlate.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Type.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Brand.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Model.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (status == 'Available') {
      filtered = filtered.filter((item) => item.Status === 0);
    } else if (status == 'InUse') {
      filtered = filtered.filter((item) => item.Status === 1);
    } else if (status == 'Maintenance') {
      filtered = filtered.filter((item) => item.Status === 2);
    }

    setFilteredVehicles(filtered);
  };
  /** Component: Badge Vehicle Status */
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

  /** Component: Status Card */
  const StatusCard = ({
    label,
    count,
    bgColor,
  }: {
    label: string;
    count: number;
    bgColor: string;
  }) => (
    <Pressable
      onPress={() => handleStatusFilter(label)}
      className={`w-[48%] flex-row items-center justify-between rounded-2xl ${bgColor} px-4 py-2 shadow-sm`}>
      <Text className="text-base font-medium text-white">{label}</Text>
      <Text className="text-lg font-bold text-white">{count}</Text>
    </Pressable>
  );

  /** Component: Vehicle Item */
  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <Pressable
      onPress={() => handleVehicleSelection(item)}
      className="mb-4 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={getVehicleTypeIcon(item.Type)} size={24} color="#0d4d87" />
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

  const handleStatusFilter = (status: string) => {
    filterVehicles('', status);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    filterVehicles(text, '');
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    filterVehicles('', '');
  };

  const handleVehicleSelection = (vehicles: Vehicle) => {
    setSelected(vehicles);
    setIsModalVisible(true);
  };

  const handleViewDetail = () => {
    navigation.navigate('VehicleDetail', { vehicleData: selected });
  };

  const handleAddVehicle = () => {
    navigation.navigate('VehicleAdd');
  };

  const handleEditVehicle = () => {
    navigation.navigate('VehicleEdit', { vehicleData: selected });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Vehicle Management"
        rightElement={
          <Pressable className="rounded-full bg-white p-2" onPress={handleAddVehicle}>
            <FontAwesomeIcon icon={faPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search plate, type or brand ..."
        handleClearFilters={handleClearFilters}
      />

      <View className="mx-6 mb-10 flex-1">
        <View className="mb-4 mt-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Pressable
            className="flex-row justify-between"
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-base font-medium text-gray-600">Summary</Text>
            <Text className="mt-1 text-sm text-blue-500">
              {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
            </Text>
          </Pressable>

          {isExpanded && (
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
              <StatusCard label="Total" count={vehicleStat.total} bgColor="bg-orange-400" />
              <StatusCard label="Available" count={vehicleStat.available} bgColor="bg-green-500" />
              <StatusCard label="InUse" count={vehicleStat.inUse} bgColor="bg-blue-500" />
              <StatusCard
                label="Maintenance"
                count={vehicleStat.underMaintenance}
                bgColor="bg-gray-500"
              />
            </View>
          )}
        </View>

        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.VehicleId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyList title="No vehicles found!" icon={faCarBurst} />}
        />
      </View>

      {vehicles.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
            Total Vehicle:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredVehicles.length}</Text>
          </Text>
        </View>
      )}

      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-2xl bg-white p-6 pb-12">
            <Text className="mb-6 text-center text-lg font-bold">
              Options for plate number #{selected?.LicensePlate}
            </Text>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                handleViewDetail();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Vehicle details</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                handleEditVehicle();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#ca8a04" />
              <Text className="text-lg font-semibold text-yellow-600">Edit vehicles</Text>
            </Pressable>

            {selected?.Status != 2 && (
              <Pressable
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  // onResetPassword();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#059669" />
                <Text className="text-lg font-semibold text-emerald-600">Schedule maintenance</Text>
              </Pressable>
            )}

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                // onToggleStatus();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faTrash} size={20} color="#dc2626" />
              <Text className="text-lg font-semibold text-red-600">Remove vehicles</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3"
              onPress={handleCloseModal}>
              <Text className="text-lg font-semibold text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleScreen;
