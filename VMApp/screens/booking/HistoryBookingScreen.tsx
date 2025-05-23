import { View, Text, SafeAreaView, Pressable, FlatList } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import Request from 'types/Request';
import requestData from 'data/request.json';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from 'utils/datetimeUtils';
import EmptyList from 'components/EmptyListComponent';
import { getVehicleTypeIcon } from 'utils/vehicleUntils';
import { getColorByStatus } from 'utils/requestUtils';
import RequestItem from 'components/HistoryRequestItem';

const requests: Request[] = requestData;

const HistoryBookingScreen = () => {
  const [userRequest, setUserRequest] = useState<Request[]>([]);
  const { user } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRequest, setFilteredRequest] = useState<Request[]>([]);
  const [activeFilter, setActiveFilter] = useState(4);

  const filterOptions = [
    { id: 4, name: 'All' },
    { id: 0, name: 'Pending' },
    { id: 1, name: 'Approved' },
    { id: 2, name: 'Rejected' },
    { id: 3, name: 'Cancelled' },
  ];

  useEffect(() => {
    if (user) {
      getRequestByUserID(user.UserId);
    }
  }, [user]);

  useEffect(() => {
    filterRequest(searchQuery, 4);
  }, [userRequest, searchQuery]);

  const filterRequest = (query: string, status: number): void => {
    let filtered = userRequest;

    if (query) {
      filtered = filtered.filter(
        (request) =>
          request.Vehicle?.LicensePlate.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          request.Vehicle?.Type.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          request.Vehicle?.Brand.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          request.Vehicle?.Model.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          request.Purpose.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (status != 4) {
      filtered = filtered.filter((request) => request.Status == status);
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

  const getRequestByUserID = (userId: number) => {
    const data = requests.filter((request) => request.UserId === userId);
    setUserRequest(data);
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
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryBookingScreen;
