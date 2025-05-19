import { View, Text, SafeAreaView, FlatList, Pressable, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import Request from 'types/Request';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faEllipsisV,
  faInfoCircle,
  faCircleXmark,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

import requestData from 'data/request.json';
import EmptyList from 'components/EmptyListComponent';
import { getUserInitials } from 'utils/userUtils';
import { formatDate } from 'utils/datetimeUtils';
import { useNavigation } from '@react-navigation/native';
import ApproveModal from 'components/ApproveModalComponent';
import RejectModal from 'components/RejectModalComponent';
import CancelModal from 'components/CancelModalComponent';

const requests: Request[] = requestData;

type RequestStat = {
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

  const navigation = useNavigation<any>();
  const [requestStat, setRequestStat] = useState<RequestStat>(initialStat);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selected, setSelected] = useState<Request>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  useEffect(() => {
    if (requests) calculateRequestStatistics(requests);
    filterRequests('', '');
  }, [requests]);

  /** Func: Color by status */
  const getBorderColorByStatus = (status: number) => {
    switch (status) {
      case 0:
        return 'border-orange-600';
      case 1:
        return 'border-green-600';
      case 2:
        return 'border-red-600';
      case 3:
        return 'border-gray-600';
    }
  };

  /** Func: Statistics  */
  const calculateRequestStatistics = (item: Request[]) => {
    const total = item.length;
    const pending = item.filter((request) => request.Status === 0).length;
    const approved = item.filter((request) => request.Status === 1).length;
    const rejected = item.filter((request) => request.Status === 2).length;
    const cancelled = item.filter((request) => request.Status === 3).length;
    setRequestStat({ total, pending, approved, rejected, cancelled });
  };

  /** Func: Search and filter */
  const filterRequests = (query: string, status: string): void => {
    let filtered = requests;
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

    setFilteredRequests(filtered);
  };

  /** Component: Status Filter */
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

  /** Component: Request Item */
  const renderRequestItem = ({ item }: { item: Request }) => (
    <Pressable
      onPress={() => handleRequestOption(item)}
      className={`mb-4 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 ${getBorderColorByStatus(item.Status)}`}>
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
    </Pressable>
  );

  const handleStatusFilter = (status: string) => {
    filterRequests('', status);
    setIsFiltered(true);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    filterRequests(text, '');
  };

 const handleRequestOption = (data: Request): void => {
    setSelected(data);
    setIsModalVisible(true);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setIsFiltered(false);
    filterRequests('', '');
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
    setIsModalVisible(false);
    setIsApproveModalVisible(false);
    setIsRejectModalVisible(false);
    setIsCancelModalVisible(false);
  };

  const handleApproveConfirm = (driverId: string | null, note: string) => {
    console.log('Approving request with driver:', driverId, 'and note:', note);
    handleCloseModal();
  };

  const handleRejectConfirm = (reason: string) => {
    console.log('Rejecting request with reason:', reason);
    handleCloseModal();
  };

  const handleCancelConfirm = (reason: string) => {
    console.log('Cancelling request with reason:', reason);
    handleCloseModal();
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

      <View className="mx-6 mb-10 flex-1">
        <View className="mb-4 mt-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
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
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
              <StatusCard label="Pending" count={requestStat.pending} bgColor="bg-orange-400" />
              <StatusCard label="Approved" count={requestStat.approved} bgColor="bg-green-400" />
              <StatusCard label="Rejected" count={requestStat.rejected} bgColor="bg-red-400" />
              <StatusCard label="Cancelled" count={requestStat.cancelled} bgColor="bg-gray-400" />
            </View>
          )}
        </View>

        {isFiltered && (
          <Pressable onPress={handleClearFilters} className="items-end ps-4">
            <Text className="mb-4 text-sm">Clear filter</Text>
          </Pressable>
        )}

        <FlatList
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.RequestId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyList title="No request found!" />}
        />
      </View>
      {requests.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
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
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-2xl bg-white p-6 pb-12">
            <Text className="mb-6 text-center text-lg font-bold">
              Options for request ID #{selected?.RequestId}
            </Text>

            <Pressable
              className="mb-6 flex-row items-center gap-3 active:opacity-70"
              onPress={handleViewDetail}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Request details</Text>
            </Pressable>

            {selected?.Status === 0 && (
              <>
                <Pressable
                  className="mb-6 flex-row items-center gap-3 active:opacity-70"
                  onPress={handleApprove}>
                  <FontAwesomeIcon icon={faCircleCheck} size={20} color="#16a34a" />
                  <Text className="text-lg font-semibold text-green-600">
                    Approve and assign a driver
                  </Text>
                </Pressable>

                <Pressable
                  className="mb-6 flex-row items-center gap-3 active:opacity-70"
                  onPress={handleReject}>
                  <FontAwesomeIcon icon={faCircleXmark} size={20} color="#dc2626" />
                  <Text className="text-lg font-semibold text-red-600">Reject the request</Text>
                </Pressable>
              </>
            )}

            {selected?.Status === 1 && (
              <Pressable
                className="mb-6 flex-row items-center gap-3 active:opacity-70"
                onPress={handleCancel}>
                <FontAwesomeIcon icon={faCircleXmark} size={20} color="#4b5563" />
                <Text className="text-lg font-semibold text-gray-600">Cancel the request</Text>
              </Pressable>
            )}

            <Pressable
              className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3 active:bg-gray-700"
              onPress={handleCloseModal}>
              <Text className="text-lg font-semibold text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ApproveModal
        visible={isApproveModalVisible}
        onClose={handleCloseModal}
        onApprove={handleApproveConfirm}
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
    </SafeAreaView>
  );
};

export default RequestScreen;
