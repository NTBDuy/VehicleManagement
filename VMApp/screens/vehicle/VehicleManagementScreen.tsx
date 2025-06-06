import {
  faCalendarCheck,
  faCarBurst,
  faChevronRight,
  faEdit,
  faEllipsisV,
  faInfoCircle,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';
import { getVehicleTypeIcon } from 'utils/vehicleUtils';

import Vehicle from 'types/Vehicle';

import EmptyList from '@/components/ui/EmptyListComponent';
import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const VehicleManagementScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<Vehicle>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('');

  const vehicleStat = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((request) => request.status === 0).length;
    const inUse = vehicles.filter((request) => request.status === 1).length;
    const underMaintenance = vehicles.filter((request) => request.status === 2).length;
    return { total, available, inUse, underMaintenance };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];
    const q = searchQuery.toLowerCase();

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.licensePlate.toLowerCase().includes(q) ||
          item.type.toLocaleLowerCase().toLowerCase().includes(q) ||
          item.brand.toLocaleLowerCase().toLowerCase().includes(q) ||
          item.model.toLocaleLowerCase().toLowerCase().includes(q)
      );
    }

    switch (currentStatusFilter) {
      case 'Available':
        filtered = filtered.filter((item) => item.status === 0);
        break;
      case 'InUse':
        filtered = filtered.filter((item) => item.status === 1);
        break;
      case 'Maintenance':
        filtered = filtered.filter((item) => item.status === 2);
        break;
    }

    return filtered;
  }, [vehicles, searchQuery, currentStatusFilter]);

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

  const StatusCard = ({
    label,
    count,
    bgColor,
    keyword,
  }: {
    label: string;
    count: number;
    bgColor: string;
    keyword: string;
  }) => (
    <TouchableOpacity
      onPress={() => handleStatusFilter(keyword)}
      className={`w-[48%] flex-row items-center justify-between rounded-2xl ${bgColor} px-4 py-2 shadow-sm`}>
      <Text className="text-base font-medium text-white">{label}</Text>
      <Text className="text-lg font-bold text-white">{count}</Text>
    </TouchableOpacity>
  );

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      onPress={() => handleVehicleSelection(item)}
      className="mb-4 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
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
        {user?.role == 0 ? (
          <FontAwesomeIcon icon={faEllipsisV} />
        ) : (
          <FontAwesomeIcon icon={faChevronRight} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleStatusFilter = (status: string) => {
    setCurrentStatusFilter(status);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setCurrentStatusFilter('');
  };

  const handleVehicleSelection = (vehicles: Vehicle) => {
    if (user?.role == 0) {
      setSelected(vehicles);
      setIsModalVisible(true);
    } else {
      navigation.navigate('VehicleDetail', { vehicleData: vehicles });
    }
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

  const handleSchedule = () => {
    navigation.navigate('ScheduleMaintenance', { vehicleData: selected });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getVehiclesData();
  };

  const onRemoveVehicle = async () => {
    try {
      if (selected) {
        await VehicleService.deleteVehicle(selected?.vehicleId);
        showToast.success(
          `${t('vehicle.toast.remove.success.title')}`,
          `${t('vehicle.toast.remove.success.message')}`
        );
        getVehiclesData();
        handleCloseModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title={t('vehicle.management.title')}
        rightElement={
          user?.role == 0 && (
            <TouchableOpacity className="rounded-full bg-white p-2" onPress={handleAddVehicle}>
              <FontAwesomeIcon icon={faPlus} size={18} />
            </TouchableOpacity>
          )
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder={t('vehicle.management.searchPlaceholder')}
        handleClearFilters={handleClearFilters}
      />

      <View className="mx-6 mb-10 flex-1">
        <View className="mb-4 mt-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <TouchableOpacity
            className="flex-row justify-between"
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-base font-medium text-gray-600">
              {t('vehicle.management.summary')}
            </Text>
            <Text className="mt-1 text-sm text-blue-500">
              {isExpanded ? `${t('common.expand.hide')}` : `${t('common.expand.show')}`}
            </Text>
          </TouchableOpacity>

          {isExpanded && (
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
              <StatusCard
                label={t('common.status.total')}
                keyword="Total"
                count={vehicleStat.total}
                bgColor="bg-gray-400"
              />
              <StatusCard
                label={t('common.status.available')}
                keyword="Available"
                count={vehicleStat.available}
                bgColor="bg-green-500"
              />
              <StatusCard
                label={t('common.status.inUse')}
                keyword="InUse"
                count={vehicleStat.inUse}
                bgColor="bg-blue-500"
              />
              <StatusCard
                label={t('common.status.maintenance')}
                keyword="Maintenance"
                count={vehicleStat.underMaintenance}
                bgColor="bg-orange-500"
              />
            </View>
          )}
        </View>

        {isLoading ? (
          <LoadingData text="vehicles" />
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
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
            {t('vehicle.management.totalVehicle')}:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredVehicles.length}</Text>
          </Text>
        </View>
      )}

      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableOpacity onPress={handleCloseModal} className="flex-1 justify-end bg-black/30">
          <TouchableOpacity onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-2xl bg-white p-6 pb-12">
              <Text className="mb-6 text-center text-lg font-bold">
                {t('vehicle.modal.title')}{selected?.licensePlate}
              </Text>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  handleViewDetail();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">{t('vehicle.modal.actions.detail')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  handleEditVehicle();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faEdit} size={20} color="#ca8a04" />
                <Text className="text-lg font-semibold text-yellow-600">{t('vehicle.modal.actions.edit')}</Text>
              </TouchableOpacity>

              {selected?.status !== 2 && selected?.nextMaintenanceId == null && (
                <TouchableOpacity
                  className="mb-6 flex-row items-center gap-3"
                  onPress={() => {
                    handleSchedule();
                    handleCloseModal();
                  }}>
                  <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#059669" />
                  <Text className="text-lg font-semibold text-emerald-600">
                    {t('vehicle.modal.actions.maintenance')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  onRemoveVehicle();
                }}>
                <FontAwesomeIcon icon={faTrash} size={20} color="#dc2626" />
                <Text className="text-lg font-semibold text-red-600">{t('vehicle.modal.actions.remove')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3"
                onPress={handleCloseModal}>
                <Text className="text-lg font-semibold text-white">{t('vehicle.modal.actions.close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleManagementScreen;
