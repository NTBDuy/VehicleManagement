import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import Vehicle from 'types/Vehicle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCarBurst,
  faEllipsisV,
  faPlus,
  faInfoCircle,
  faEdit,
  faTrash,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import EmptyList from 'components/EmptyListComponent';
import { getVehicleTypeIcon } from 'utils/vehicleUntils';
import { VehicleService } from 'services/vehicleService';

type VehicleStat = {
  total: number;
  available: number;
  inUse: number;
  underMaintenance: number;
};

const VehicleScreen = () => {
  const navigation = useNavigation<any>();
  const [vehicleStat, setVehicleStat] = useState<VehicleStat>({
    total: 0,
    available: 0,
    inUse: 0,
    underMaintenance: 0,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<Vehicle>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getVehiclesData();
  }, []);

  useEffect(() => {
    if (vehicles) {
      setFilteredVehicles(vehicles);
      calculateVehicleStatistics(vehicles);
    }
  }, [vehicles]);

  useFocusEffect(
    useCallback(() => {
      getVehiclesData();
    }, [])
  );

  const getVehiclesData = async () => {
    try {
      setIsLoading(true);
      const data = await VehicleService.getAllVehicles();
      return setVehicles(data);
    } catch (error) {
      console.error(error);
      return setVehicles([]);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  /** Func: Statistics */
  const calculateVehicleStatistics = (item: Vehicle[]) => {
    const total = item.length;
    const available = item.filter((request) => request.status === 0).length;
    const inUse = item.filter((request) => request.status === 1).length;
    const underMaintenance = item.filter((request) => request.status === 2).length;
    setVehicleStat({ total, available, inUse, underMaintenance });
  };

  /** Func: Filter Vehicle */
  const filterVehicles = (query: string, status: string): void => {
    let filtered = vehicles;

    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.licensePlate.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.type.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.brand.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.model.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (status == 'Available') {
      filtered = filtered.filter((item) => item.status === 0);
    } else if (status == 'InUse') {
      filtered = filtered.filter((item) => item.status === 1);
    } else if (status == 'Maintenance') {
      filtered = filtered.filter((item) => item.status === 2);
    }

    setFilteredVehicles(filtered);
  };
  /** Component: Badge Vehicle status */
  const renderBadgeVehicleStatus = ({ status }: { status: number }) => {
    const getStatusStyle = (status: number) => {
      switch (status) {
        case 0:
          return 'bg-green-500';
        case 1:
          return 'bg-blue-500';
        case 3:
          return 'bg-gray-500';
        default:
          return 'bg-orange-500';
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

  /** Component: status Card */
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
      className="flex-row items-center px-2 py-4 mb-4 bg-gray-100 rounded-2xl">
      <View className="items-center justify-center w-12 h-12 ml-2 mr-4 bg-blue-300 rounded-full">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={getVehicleTypeIcon(item.type)} size={24} color="#0d4d87" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.licensePlate}</Text>
        <Text className="text-sm">
          {item.brand} {item.model}
        </Text>
      </View>
      <View className="flex-row items-center">
        <View>{renderBadgeVehicleStatus({ status: item.status })}</View>
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

  const onRefresh = () => {
    setRefreshing(true);
    getVehiclesData();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Vehicle Management"
        rightElement={
          <Pressable className="p-2 bg-white rounded-full" onPress={handleAddVehicle}>
            <FontAwesomeIcon icon={faPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search plate, type or brand ..."
        handleClearFilters={handleClearFilters}
      />

      <View className="flex-1 mx-6 mb-10">
        <View className="p-4 mt-4 mb-4 bg-gray-100 shadow-sm rounded-2xl">
          <Pressable
            className="flex-row justify-between"
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-base font-medium text-gray-600">Summary</Text>
            <Text className="mt-1 text-sm text-blue-500">
              {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
            </Text>
          </Pressable>

          {isExpanded && (
            <View className="flex-row flex-wrap justify-between mt-4 gap-y-4">
              <StatusCard label="Total" count={vehicleStat.total} bgColor="bg-gray-400" />
              <StatusCard label="Available" count={vehicleStat.available} bgColor="bg-green-500" />
              <StatusCard label="InUse" count={vehicleStat.inUse} bgColor="bg-blue-500" />
              <StatusCard
                label="Maintenance"
                count={vehicleStat.underMaintenance}
                bgColor="bg-orange-500"
              />
            </View>
          )}
        </View>

        {isLoading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-2 text-gray-500">Loading vehicles...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredVehicles}
            renderItem={renderVehicleItem}
            keyExtractor={(item) => item.vehicleId.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyList title="No vehicles found!" icon={faCarBurst} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {vehicles.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-white">
          <Text className="text-sm font-medium text-center text-gray-500">
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
        <View className="justify-end flex-1 bg-black/30">
          <View className="p-6 pb-12 bg-white rounded-t-2xl">
            <Text className="mb-6 text-lg font-bold text-center">
              Options for plate number #{selected?.licensePlate}
            </Text>

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                handleViewDetail();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Vehicle details</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                handleEditVehicle();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#ca8a04" />
              <Text className="text-lg font-semibold text-yellow-600">Edit vehicles</Text>
            </Pressable>

            {selected?.status != 2 && (
              <Pressable
                className="flex-row items-center gap-3 mb-6"
                onPress={() => {
                  // onResetPassword();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#059669" />
                <Text className="text-lg font-semibold text-emerald-600">Schedule maintenance</Text>
              </Pressable>
            )}

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                // onToggleStatus();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faTrash} size={20} color="#dc2626" />
              <Text className="text-lg font-semibold text-red-600">Remove vehicles</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center justify-center py-3 bg-gray-600 rounded-lg"
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
