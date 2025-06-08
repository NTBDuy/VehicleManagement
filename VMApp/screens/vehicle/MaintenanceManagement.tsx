import { formatDate } from '@/utils/datetimeUtils';
import { getMaintenanceBorderColor } from '@/utils/maintenanceUtils';
import { getVehicleTypeIcon } from '@/utils/vehicleUtils';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { VehicleService } from 'services/vehicleService';

import MaintenanceSchedule from 'types/MaintenanceSchedule';

import Header from '@/components/layout/HeaderComponent';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';

const MaintenanceManagement = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [maintenance, setMaintenance] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStatusFilter, setCurrentStatusFilter] = useState(3);

  const filterOptions = [
    { id: 3, name: t('common.status.all') },
    { id: 0, name: t('dashboard.incoming') },
    { id: 1, name: t('common.status.inProgress') },
    { id: 2, name: t('common.status.done') },
  ];

  const filteredMaintenance = useMemo(() => {
    let filtered = [...maintenance];
    const q = searchQuery.toLowerCase();

    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.vehicle.licensePlate.toLocaleLowerCase().includes(q) ||
          item.vehicle.brand.toLocaleLowerCase().includes(q) ||
          item.vehicle.model.toLocaleLowerCase().includes(q) ||
          item.vehicle.type.toLocaleLowerCase().includes(q) ||
          item.description.toLocaleLowerCase().includes(q)
      );
    }

    switch (currentStatusFilter) {
      case 0:
        filtered = filtered.filter((item) => item.status === 0);
        break;
      case 1:
        filtered = filtered.filter((item) => item.status === 1);
        break;
      case 2:
        filtered = filtered.filter((item) => item.status === 2);
        break;
    }
    return filtered;
  }, [maintenance, searchQuery, currentStatusFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchMaintenanceList();
    }, [])
  );

  const fetchMaintenanceList = async () => {
    try {
      setIsLoading(true);
      const response = await VehicleService.getAllMaintenance();
      setMaintenance(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMaintenanceList();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (status: number) => {
    setCurrentStatusFilter(status);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCurrentStatusFilter(3);
  };

  const handleViewDetail = (item: MaintenanceSchedule) => {
    navigation.navigate('MaintenanceDetails', { maintenanceData: item });
  };

  const renderMaintenanceItem = ({ item }: { item: MaintenanceSchedule }) => (
    <TouchableOpacity
      onPress={() => {
        handleViewDetail(item);
      }}
      className={`mb-4 flex-row items-center rounded-2xl border-r-2 border-t-2 bg-gray-100 px-2 py-4 ${getMaintenanceBorderColor(item.status)}`}>
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={getVehicleTypeIcon(item.vehicle.type)} size={24} color="#0d4d87" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.vehicle.licensePlate}</Text>
        <Text className="text-sm">
          {item.vehicle.brand} {item.vehicle.model}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="mr-2 text-base text-gray-500">{formatDate(item.scheduledDate)}</Text>
        <FontAwesomeIcon icon={faChevronRight} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('maintenance.management.title')}
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder={t('common.searchPlaceholder.vehicle')}
        handleClearFilters={handleClearFilters}
      />

      <View className="mx-6 mb-10 flex-1">
        <View className="my-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleFilterChange(item.id)}
                className={`mr-2 items-center rounded-full px-4 py-2 ${currentStatusFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Text
                  className={`text-sm font-medium ${currentStatusFilter === item.id ? 'text-white' : 'text-gray-600'}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {isLoading ? (
          <LoadingData />
        ) : (
          <View>
            <FlatList
              data={filteredMaintenance}
              keyExtractor={(item) => item.vehicleId.toString()}
              renderItem={renderMaintenanceItem}
              ListEmptyComponent={<EmptyList />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          </View>
        )}
      </View>

      {maintenance.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
            {t('maintenance.management.totalSchedule')}:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredMaintenance.length}</Text>
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MaintenanceManagement;
