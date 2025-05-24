import { View, Text, SafeAreaView, Pressable, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import Request from 'types/Request';
import { useAuth } from 'contexts/AuthContext';
import EmptyList from 'components/EmptyListComponent';
import RequestItem from 'components/HistoryRequestItem';
import { UserService } from 'services/userService';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const RequestHistoryScreen = () => {
  const { user } = useAuth();
  const [userRequest, setUserRequest] = useState<Request[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRequest, setFilteredRequest] = useState<Request[]>([]);
  const [activeFilter, setActiveFilter] = useState(4);
  const [refreshing, setRefreshing] = useState(false);

  const filterOptions = [
    { id: 4, name: 'All' },
    { id: 0, name: 'Pending' },
    { id: 1, name: 'Approved' },
    { id: 2, name: 'Rejected' },
    { id: 3, name: 'Cancelled' },
  ];

  useEffect(() => {
    if (user) {
      getRequestByUserID(user.userId);
    }
  }, [user]);

  useEffect(() => {
    filterRequest(searchQuery, 4);
  }, [userRequest, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getRequestByUserID(user.userId);
      }
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    getRequestByUserID(user!.userId);
  };

  const filterRequest = (query: string, status: number): void => {
    let filtered = userRequest;

    if (query) {
      filtered = filtered.filter(
        (request) =>
          request.vehicle?.licensePlate?.toLowerCase().includes(query.toLowerCase()) ||
          request.vehicle?.type?.toLowerCase().includes(query.toLowerCase()) ||
          request.vehicle?.brand?.toLowerCase().includes(query.toLowerCase()) ||
          request.vehicle?.model?.toLowerCase().includes(query.toLowerCase()) ||
          request.purpose.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status != 4) {
      filtered = filtered.filter((request) => request.status == status);
    }

    setFilteredRequest(filtered);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleFilterChange = (role: number): void => {
    setActiveFilter(role);
    filterRequest(searchQuery, role);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
  };

  const getRequestByUserID = async (userId: number) => {
    try {
      const data = await UserService.getUserRequests(userId);
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
        title="History Booking"
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search plate, brand, type ..."
        handleClearFilters={handleClearFilters}
      />
      <View className="mx-6">
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
          ListEmptyComponent={<EmptyList title="User never requested vehicle" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default RequestHistoryScreen;
