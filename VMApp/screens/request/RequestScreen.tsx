import {
  faCircleCheck,
  faCircleXmark,
  faEllipsisV,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, SafeAreaView, Text, View } from 'react-native';
import { RequestService } from 'services/requestService';
import { formatDate } from 'utils/datetimeUtils';
import { getColorByStatus } from 'utils/requestUtils';
import { getUserInitials } from 'utils/userUtils';

import Request from 'types/Request';

import EmptyList from '@/components/ui/EmptyListComponent';
import Header from '@/components/layout/HeaderComponent';
import LoadingData from '@/components/ui/LoadingData';
import ApproveModal from 'components/modal/ApproveModalComponent';
import CancelModal from 'components/modal/CancelModalComponent';
import RejectModal from 'components/modal/RejectModalComponent';

const RequestScreen = () => {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('');
  const [selected, setSelected] = useState<Request>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestStat = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 0).length;
    const approved = requests.filter((r) => r.status === 1).length;
    const rejected = requests.filter((r) => r.status === 2).length;
    const cancelled = requests.filter((r) => r.status === 3).length;
    const inProgress = requests.filter((r) => r.status === 4).length;
    const done = requests.filter((r) => r.status === 5).length;
    return { total, pending, approved, rejected, cancelled, inProgress, done };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let filtered = [...requests];
    const q = searchQuery.toLowerCase();

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.user?.fullName.toLowerCase().includes(q) ||
          item.user?.email.toLowerCase().includes(q) ||
          item.user?.phoneNumber.toLowerCase().includes(q) ||
          item.user?.username.toLowerCase().includes(q) ||
          item.vehicle?.licensePlate.toLowerCase().includes(q) ||
          item.vehicle?.type.toLowerCase().includes(q) ||
          item.vehicle?.brand.toLowerCase().includes(q) ||
          item.vehicle?.model.toLowerCase().includes(q)
      );
    }

    switch (currentStatusFilter) {
      case 'Pending':
        filtered = filtered.filter((item) => item.status === 0);
        break;
      case 'Approved':
        filtered = filtered.filter((item) => item.status === 1);
        break;
      case 'Rejected':
        filtered = filtered.filter((item) => item.status === 2);
        break;
      case 'Cancelled':
        filtered = filtered.filter((item) => item.status === 3);
        break;
      case 'In Progress':
        filtered = filtered.filter((item) => item.status === 4);
        break;
      case 'Done':
        filtered = filtered.filter((item) => item.status === 5);
        break;
    }

    return filtered;
  }, [requests, searchQuery, currentStatusFilter]);

  useFocusEffect(
    useCallback(() => {
      getRequestsData();
    }, [])
  );

  const getRequestsData = async () => {
    try {
      setIsLoading(true);
      const data = await RequestService.getAllRequests();
      return setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

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

  const renderRequestItem = ({ item }: { item: Request }) => (
    <Pressable
      onPress={() => handleRequestOption(item)}
      className={`mb-4 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 ${getColorByStatus(item.status)}`}>
      <View className="flex-row items-center">
        <View className="items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
          <Text className="text-lg font-bold text-white">
            {getUserInitials(item.user?.fullName)}
          </Text>
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-base font-semibold text-gray-800">{item.user?.fullName}</Text>
          <Text className="text-sm text-gray-500">{item.vehicle?.licensePlate}</Text>
        </View>

        <View className="mr-4">
          {item.startTime !== item.endTime ? (
            <View>
              <Text className="text-xs text-gray-500">Start: {formatDate(item.startTime)}</Text>
              <Text className="text-xs text-gray-500">End: {formatDate(item.endTime)}</Text>
            </View>
          ) : (
            <View>
              <Text className="text-xs text-gray-500">Date: {formatDate(item.startTime)}</Text>
            </View>
          )}
        </View>

        <View className="items-end">
          <View className="mt-1">
            <FontAwesomeIcon icon={faEllipsisV} size={16} color="#6B7280" />
          </View>
        </View>
      </View>
    </Pressable>
  );

  const handleStatusFilter = (status: string) => {
    setCurrentStatusFilter(status);
    setIsFiltered(true);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleRequestOption = (data: Request): void => {
    setSelected(data);
    setIsModalVisible(true);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setCurrentStatusFilter('');
    setIsFiltered(false);
  };

  const handleViewDetail = () => {
    navigation.navigate('RequestDetail', { requestData: selected });
    setIsModalVisible(false);
  };

  const handleApprove = (): void => {
    setIsModalVisible(false);
    setIsApproveModalVisible(true);
  };

  const handleReject = (): void => {
    setIsModalVisible(false);
    setIsRejectModalVisible(true);
  };

  const handleCancel = (): void => {
    setIsModalVisible(false);
    setIsCancelModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelected(undefined);
    setIsModalVisible(false);
    setIsApproveModalVisible(false);
    setIsRejectModalVisible(false);
    setIsCancelModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getRequestsData();
  };

  const handleApproveConfirm = async (driverId: string | null, note: string) => {
    const assignmentData = { driverId, note };

    if (selected!.isDriverRequired) {
      await RequestService.approveRequest(selected!.requestId, assignmentData);
    } else {
      await RequestService.approveRequest(selected!.requestId);
    }

    await getRequestsData();
  };

  const handleRejectConfirm = async (reason: string) => {
    const reasonData = { reason };
    await RequestService.rejectRequest(selected!.requestId, reasonData);
    await getRequestsData();
  };

  const handleCancelConfirm = async (reason: string) => {
    const reasonData = { reason };
    await RequestService.cancelRequest(selected!.requestId, reasonData);
    await getRequestsData();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Request Management"
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search username, phone or email ..."
        handleClearFilters={handleClearFilters}
      />

      <View className="flex-1 mx-6 mb-10">
        <View className="p-4 mt-4 mb-4 bg-gray-100 shadow-sm rounded-2xl">
          <Pressable
            className="flex-row justify-between"
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-base font-medium text-gray-600">
              Total Request:{' '}
              <Text className="text-xl font-bold text-gray-900">{requestStat.total}</Text>
            </Text>
            <Text className="mt-1 text-sm text-blue-500">
              {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
            </Text>
          </Pressable>

          {isExpanded && (
            <View className="flex-row flex-wrap justify-between mt-4 gap-y-4">
              <StatusCard label="Pending" count={requestStat.pending} bgColor="bg-amber-500" />
              <StatusCard label="Approved" count={requestStat.approved} bgColor="bg-emerald-500" />
              <StatusCard label="Rejected" count={requestStat.rejected} bgColor="bg-red-500" />
              <StatusCard label="Cancelled" count={requestStat.cancelled} bgColor="bg-slate-500" />
              <StatusCard
                label="In Progress"
                count={requestStat.inProgress}
                bgColor="bg-blue-500"
              />
              <StatusCard label="Done" count={requestStat.done} bgColor="bg-green-600" />
            </View>
          )}
        </View>

        {isFiltered && (
          <Pressable onPress={handleClearFilters} className="items-end ps-4">
            <Text className="mb-4 text-sm">Clear filter</Text>
          </Pressable>
        )}

        {isLoading ? (
          <LoadingData />
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.requestId.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyList title="No request found!" />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
      {requests.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-white">
          <Text className="text-sm font-medium text-center text-gray-500">
            Total Request:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredRequests.length}</Text>
          </Text>
        </View>
      )}

      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}>
        <Pressable onPress={handleCloseModal} className="justify-end flex-1 bg-black/30">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="p-6 pb-12 bg-white rounded-t-2xl">
              <Text className="mb-6 text-lg font-bold text-center">
                Options for request ID #{selected?.requestId}
              </Text>

              <Pressable
                className="flex-row items-center gap-3 mb-6 active:opacity-70"
                onPress={handleViewDetail}>
                <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">Request details</Text>
              </Pressable>

              {selected?.status === 0 && (
                <>
                  <Pressable
                    className="flex-row items-center gap-3 mb-6 active:opacity-70"
                    onPress={handleApprove}>
                    <FontAwesomeIcon icon={faCircleCheck} size={20} color="#16a34a" />
                    <Text className="text-lg font-semibold text-green-600">
                      {selected.isDriverRequired
                        ? 'Approve and assign a driver'
                        : 'Approve the request'}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="flex-row items-center gap-3 mb-6 active:opacity-70"
                    onPress={handleReject}>
                    <FontAwesomeIcon icon={faCircleXmark} size={20} color="#dc2626" />
                    <Text className="text-lg font-semibold text-red-600">Reject the request</Text>
                  </Pressable>
                </>
              )}

              {selected?.status === 1 && (
                <Pressable
                  className="flex-row items-center gap-3 mb-6 active:opacity-70"
                  onPress={handleCancel}>
                  <FontAwesomeIcon icon={faCircleXmark} size={20} color="#4b5563" />
                  <Text className="text-lg font-semibold text-gray-600">Cancel the request</Text>
                </Pressable>
              )}

              <Pressable
                className="flex-row items-center justify-center py-3 bg-gray-600 rounded-lg active:bg-gray-700"
                onPress={handleCloseModal}>
                <Text className="text-lg font-semibold text-white">Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {selected && (
        <>
          <ApproveModal
            visible={isApproveModalVisible}
            onClose={handleCloseModal}
            onApprove={handleApproveConfirm}
            isDriverRequired={selected.isDriverRequired}
            startTime={selected.startTime}
            endTime={selected.endTime}
          />

          <RejectModal
            visible={isRejectModalVisible}
            onClose={handleCloseModal}
            onReject={handleRejectConfirm}
          />

          <CancelModal
            visible={isCancelModalVisible}
            onClose={handleCloseModal}
            onCancel={handleCancelConfirm}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default RequestScreen;
