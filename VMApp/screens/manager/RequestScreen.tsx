import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from 'components/Header';
import Request from 'types/Request';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import requestData from 'data/request.json';
import EmptyListComponent from 'components/EmptyListComponent';
import { getUserInitials } from 'utils/userUtils';
import { formatDate } from 'utils/datetimeUtils';

const data: Request[] = requestData;

type stat = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

const RequestScreen = () => {
  const initialStat = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  const [stat, setStat] = useState<stat>(initialStat);
  const [filteredRequests, setfilteredRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSelected, setIsSelected] = useState(false);

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
      onPress={() => handleStatus(label)}
      className={`w-[48%] flex-row items-center justify-between rounded-2xl ${bgColor} px-4 py-2 shadow-sm`}>
      <Text className="text-base font-medium text-white">{label}</Text>
      <Text className="text-lg font-bold text-white">{count}</Text>
    </Pressable>
  );

  const renderColor = (status: number) => {
    switch (status) {
      case 0:
        return 'orange';
      case 1:
        return 'green';
      case 2:
        return 'red';
      case 3:
        return 'gray';
      default:
        return 'gray';
    }
  };

  const countStat = (item: Request[]) => {
    const total = item.length;
    const pending = item.filter((request) => request.Status === 0).length;
    const approved = item.filter((request) => request.Status === 1).length;
    const rejected = item.filter((request) => request.Status === 2).length;
    const cancelled = item.filter((request) => request.Status === 3).length;
    setStat({ total, pending, approved, rejected, cancelled });
  };

  const filter = (query: string, status: string): void => {
    let filtered = data;
    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.User?.FullName.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.User?.Email.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.User?.Phone.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.User?.Username.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Vehicle?.LicensePlate.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Vehicle?.Type.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Vehicle?.Brand.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          item.Vehicle?.Model.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (status == 'Pending') {
      filtered = filtered.filter((item) => item.Status === 0);
    } else if (status == 'Approved') {
      filtered = filtered.filter((item) => item.Status === 1);
    } else if (status == 'Rejected') {
      filtered = filtered.filter((item) => item.Status === 2);
    } else if (status == 'Cancelled') {
      filtered = filtered.filter((item) => item.Status === 3);
    }

    setfilteredRequests(filtered);
  };

  const handleStatus = (status: string) => {
    filter('', status);
    setIsSelected(true);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    filter(text, '');
  };

  const clearSearch = (): void => {
    setSearchQuery('');
    setIsSelected(false);
    filter('', '');
  };

  const renderDataItem = ({ item }: { item: Request }) => (
    <View
      className={`mt-4 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 border-${renderColor(item.Status)}-400`}>
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-lg font-bold text-white">
            {getUserInitials(item.User?.FullName)}
          </Text>
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.User?.FullName}</Text>
          <Text className="text-sm text-gray-500">{item.Vehicle?.LicensePlate}</Text>
        </View>

        <View className="mr-4">
          <Text className="text-xs text-gray-500">Start: {formatDate(item.StartTime)}</Text>
          <Text className="text-xs text-gray-500">End: {formatDate(item.EndTime)}</Text>
        </View>

        <View className="items-end">
          <View className="mt-1">
            <FontAwesomeIcon icon={faEllipsisV} size={16} color="#6B7280" />
          </View>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    if (data) countStat(data);
    filter('', '');
  }, [data]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Request Management"
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search username, phone or email ..."
        clearSearch={clearSearch}
      />

      <View className="flex-1 mx-6 mb-10">
        <View className="mb-4 mt-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Pressable
            className="flex-row justify-between"
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-base font-medium text-gray-600">
              Total Request: <Text className="text-xl font-bold text-gray-900">{stat.total}</Text>
            </Text>
            <Text className="mt-1 text-sm text-blue-500">
              {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
            </Text>
          </Pressable>

          {isExpanded && (
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
              <StatusCard label="Pending" count={stat.pending} bgColor="bg-orange-400" />
              <StatusCard label="Approved" count={stat.approved} bgColor="bg-green-400" />
              <StatusCard label="Rejected" count={stat.rejected} bgColor="bg-red-400" />
              <StatusCard label="Cancelled" count={stat.cancelled} bgColor="bg-gray-400" />
            </View>
          )}
        </View>

        {isSelected && (
          <Pressable onPress={clearSearch} className="items-end ps-4">
            <Text className="mb-4 text-sm">Clear filter</Text>
          </Pressable>
        )}

        <FlatList
          data={filteredRequests}
          renderItem={renderDataItem}
          keyExtractor={(item) => item.RequestId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyListComponent title="No request found!" />}
        />
      </View>
      {data.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-white">
          <Text className="text-center text-sm font-medium text-gray-500">
            Total Request:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredRequests.length}</Text>
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RequestScreen;
