import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { FlashList } from '@shopify/flash-list';

import Request from 'types/Request';

import Header from '@/components/layout/HeaderComponent';
import RequestItem from '@/components/request/HistoryRequestItem';
import EmptyList from '@/components/ui/EmptyListComponent';

const RequestHistoryScreen = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [userRequest, setUserRequest] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(4);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<number>();

  const filteredRequest = useMemo(() => {
    let filtered = [...userRequest];
    const q = searchQuery.toLowerCase();

    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          request.vehicle?.licensePlate?.toLowerCase().includes(q) ||
          request.vehicle?.type?.toLowerCase().includes(q) ||
          request.vehicle?.brand?.toLowerCase().includes(q) ||
          request.vehicle?.model?.toLowerCase().includes(q) ||
          request.purpose.toLowerCase().includes(q)
      );
    }

    switch (currentStatusFilter) {
      case 0:
        filtered = filtered.filter((request) => request.status === 0);
        break;
      case 1:
        filtered = filtered.filter((request) => request.status === 1);
        break;
      case 2:
        filtered = filtered.filter((request) => request.status === 2);
        break;
      case 3:
        filtered = filtered.filter((request) => request.status === 3);
        break;
      case 4:
        filtered = filtered.filter((request) => request.status === 4);
        break;
      case 5:
        filtered = filtered.filter((request) => request.status === 5);
        break;
    }

    return filtered;
  }, [userRequest, searchQuery, currentStatusFilter]);

  const filterOptions = [
    { id: 6, name: t('common.status.all') },
    { id: 0, name: t('common.status.pending') },
    { id: 1, name: t('common.status.approved') },
    { id: 4, name: t('common.status.inProgress') },
    { id: 5, name: t('common.status.done') },
    { id: 2, name: t('common.status.rejected') },
    { id: 3, name: t('common.status.cancelled') },
  ];

  useEffect(() => {
    setCurrentStatusFilter(activeFilter);
  }, [userRequest, searchQuery, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchRequestByUserID();
        setActiveFilter(6);
      }
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setActiveFilter(6);
    fetchRequestByUserID();
  }, []);

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleFilterChange = (status: number): void => {
    setActiveFilter(status);
    setCurrentStatusFilter(status);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
  };

  const fetchRequestByUserID = async () => {
    try {
      const data = await UserService.getUserRequests();
      return setUserRequest(data);
    } catch (error) {
      console.error(error);
      return setUserRequest([]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => <RequestItem item={item} />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        title={t('request.history.title')}
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder={t('common.searchPlaceholder.vehicle')}
        handleClearFilters={handleClearFilters}
      />
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
        <FlashList
          showsVerticalScrollIndicator={false}
          data={filteredRequest}
          renderItem={renderRequestItem}
          ListEmptyComponent={<EmptyList title={t('common.noData.requestHistory')} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          estimatedItemSize={80}
        />
      </View>
    </SafeAreaView>
  );
};

export default RequestHistoryScreen;
