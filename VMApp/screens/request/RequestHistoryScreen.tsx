import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, SafeAreaView, Text, View } from 'react-native';
import { UserService } from 'services/userService';

import Request from 'types/Request';

import EmptyList from 'components/EmptyListComponent';
import Header from 'components/HeaderComponent';
import RequestItem from 'components/HistoryRequestItem';

const RequestHistoryScreen = () => {
  const { user } = useAuth();
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
    { id: 6, name: 'All' },
    { id: 0, name: 'Pending' },
    { id: 1, name: 'Approved' },
    { id: 2, name: 'Rejected' },
    { id: 3, name: 'Cancelled' },
    { id: 4, name: 'In Progress' },
    { id: 5, name: 'Done' },
  ];

  useEffect(() => {
    setCurrentStatusFilter(activeFilter);
  }, [userRequest, searchQuery, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getRequestByUserID();
        setActiveFilter(6);
      }
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setActiveFilter(6);
    getRequestByUserID();
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

  const getRequestByUserID = async () => {
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
        title="History Request"
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search plate, brand, type ..."
        handleClearFilters={handleClearFilters}
      />
      <View className="flex-1 mx-6">
        <View className="my-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleFilterChange(item.id)}
                className={`mr-2 items-center rounded-full px-4 py-2 ${activeFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Text
                  className={`text-sm font-medium ${activeFilter === item.id ? 'text-white' : 'text-gray-600'}`}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
        <FlatList
          data={filteredRequest}
          renderItem={renderRequestItem}
          ListEmptyComponent={<EmptyList title="User has not requested any vehicles" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default RequestHistoryScreen;
