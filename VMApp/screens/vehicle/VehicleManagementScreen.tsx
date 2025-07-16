import { useAuth } from '@/contexts/AuthContext';
import { faCarBurst, faChevronRight, faEllipsisV, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';
import { getVehicleBackground, getVehicleLabel, getVehicleTypeIcon } from 'utils/vehicleUtils';

import Vehicle from 'types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import OptionVehicleModal from '@/components/modal/OptionVehicleModal';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';
import StatusCard from '@/components/ui/StatusCardComponent';

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
      fetchVehiclesData();
    }, [])
  );

  const fetchVehiclesData = async () => {
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
    const bgColor = getVehicleBackground(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getVehicleLabel(status, t)}</Text>
      </View>
    );
  };

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

  const handleVehicleSelection = (vehicle: Vehicle) => {
    if (user?.role == 0) {
      setSelected(vehicle);
      setIsModalVisible(true);
    } else {
      navigation.navigate('VehicleDetail', { vehicleData: vehicle });
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
    fetchVehiclesData();
  };

  const onRemoveVehicle = async () => {
    try {
      if (selected) {
        await VehicleService.deleteVehicle(selected?.vehicleId);
        showToast.success(
          `${t('vehicle.toast.remove.success.title')}`,
          `${t('vehicle.toast.remove.success.message')}`
        );
        fetchVehiclesData();
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
        placeholder={t('common.searchPlaceholder.vehicle')}
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
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.available')}
                keyword="Available"
                count={vehicleStat.available}
                bgColor="bg-green-500"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.inUse')}
                keyword="InUse"
                count={vehicleStat.inUse}
                bgColor="bg-blue-500"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.maintenance')}
                keyword="Maintenance"
                count={vehicleStat.underMaintenance}
                bgColor="bg-orange-500"
                onPress={handleStatusFilter}
              />
            </View>
          )}
        </View>

        {isLoading ? (
          <LoadingData />
        ) : (
          <FlashList
            data={filteredVehicles}
            renderItem={renderVehicleItem}
            keyExtractor={(item) => item.vehicleId.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyList icon={faCarBurst} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            estimatedItemSize={80}
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

      {selected && (
        <OptionVehicleModal
          visible={isModalVisible}
          vehicle={selected}
          onClose={handleCloseModal}
          onViewDetail={handleViewDetail}
          onEdit={handleEditVehicle}
          onScheduleMaintenance={handleSchedule}
          onRemove={onRemoveVehicle}
        />
      )}
    </SafeAreaView>
  );
};

export default VehicleManagementScreen;
