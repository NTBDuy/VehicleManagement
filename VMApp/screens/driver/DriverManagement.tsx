import { DriverService } from '@/services/driverService';
import {
  getUserBackgroundColor,
  getUserInitials,
  getUserLabelEn,
  getUserLabelVi,
} from '@/utils/userUtils';
import { faChevronRight, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import Driver from '@/types/Driver';

import Header from '@/components/layout/HeaderComponent';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';

const DriverManagement = () => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const isViCurrent = currentLocale === 'vi-VN';
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(2);
  const filterOptions = [
    { id: 2, name: t('common.status.all') },
    { id: 0, name: t('common.status.active') },
    { id: 1, name: t('common.status.inactive') },
  ];

  const filteredDrivers = useMemo(() => {
    let filtered = [...drivers];
    const q = searchQuery.toLowerCase();

    if (q) {
      filtered = filtered.filter(
        (driver) =>
          (driver.fullName?.toLowerCase().includes(q) ?? false) ||
          (driver.licenseIssuedDate?.toLowerCase().includes(q) ?? false) ||
          (driver.licenseNumber?.toLowerCase().includes(q) ?? false) ||
          (driver.phoneNumber?.toLowerCase().includes(q) ?? false)
      );
    }

    switch (activeFilter) {
      case 0:
        filtered = filtered.filter((driver) => driver.isActive);
        break;
      case 1:
        filtered = filtered.filter((driver) => !driver.isActive);
        break;
    }

    return filtered;
  }, [drivers, searchQuery, activeFilter]);

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
      setRefreshing(false);
    }
  };

  const renderBadgeStatus = (status: boolean) => {
    const bgColor = getUserBackgroundColor(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">
          {isViCurrent ? getUserLabelVi(status) : getUserLabelEn(status)}
        </Text>
      </View>
    );
  };

  const handleViewDetail = (driverData: Driver) => {
    navigation.navigate('DriverDetail', { driverData });
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <TouchableOpacity
      onPress={() => handleViewDetail(item)}
      className="mb-4 mt-1 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">{getUserInitials(item.fullName)}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.fullName}</Text>
        <Text className="text-sm">{item.phoneNumber}</Text>
      </View>
      <View className="flex-row items-center">
        <View className="mr-2">{renderBadgeStatus(item.isActive)}</View>
        <FontAwesomeIcon icon={faChevronRight} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setActiveFilter(2);
  };

  const handleFilterChange = (status: number): void => {
    setActiveFilter(status);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDriverData();
  };

  const handleAddDriver = () => {
    navigation.navigate('DriverAdd');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('driver.management.title')}
        rightElement={
          <TouchableOpacity className="rounded-full bg-white p-2" onPress={handleAddDriver}>
            <FontAwesomeIcon icon={faUserPlus} size={18} />
          </TouchableOpacity>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder={t('common.searchPlaceholder.driver')}
        handleClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <LoadingData />
      ) : (
        <View className="mx-6 flex-1">
          <View className="my-4">
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleFilterChange(item.id)}
                  className={`mr-2 items-center rounded-full px-4 py-2 ${activeFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                  <Text
                    className={`text-sm font-medium ${activeFilter === item.id ? 'text-white' : 'text-gray-600'}`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <FlatList
            data={filteredDrivers}
            keyExtractor={(item) => item.driverId.toString()}
            renderItem={renderDriverItem}
            ListEmptyComponent={<EmptyList />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default DriverManagement;
