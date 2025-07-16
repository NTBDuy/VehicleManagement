import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RequestService } from 'services/requestService';
import { formatDate } from 'utils/datetimeUtils';
import { getRequestBorderColor } from 'utils/requestUtils';
import { getUserInitials } from 'utils/userUtils';

import Request from 'types/Request';

import Header from '@/components/layout/HeaderComponent';
import RequestOptionModal from '@/components/modal/OptionRequestModal';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';
import StatusCard from '@/components/ui/StatusCardComponent';
import ApproveModal from 'components/modal/ApproveModalComponent';
import CancelModal from 'components/modal/CancelModalComponent';
import RejectModal from 'components/modal/RejectModalComponent';

const { width } = Dimensions.get('window');

const RequestScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selected, setSelected] = useState<Request | null>(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

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
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.user?.fullName?.toLowerCase().includes(q) ||
          item.user?.email?.toLowerCase().includes(q) ||
          item.user?.phoneNumber?.toLowerCase().includes(q) ||
          item.user?.username?.toLowerCase().includes(q) ||
          item.vehicle?.licensePlate?.toLowerCase().includes(q) ||
          item.vehicle?.type?.toLowerCase().includes(q) ||
          item.vehicle?.brand?.toLowerCase().includes(q) ||
          item.vehicle?.model?.toLowerCase().includes(q)
      );
    }

    if (currentStatusFilter) {
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
        default:
          break;
      }
    }

    return filtered;
  }, [requests, searchQuery, currentStatusFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchRequestsData();
    }, [])
  );

  const fetchRequestsData = async () => {
    try {
      setIsLoading(true);
      const data = await RequestService.getAllRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => (
    <TouchableOpacity
      onPress={() => handleRequestOption(item)}
      className={`mb-4 rounded-2xl border-r-2 border-t-2 bg-gray-100 px-4 py-4 ${getRequestBorderColor(item.status)}`}>
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-lg font-bold text-white">
            {getUserInitials(item.user?.fullName || '')}
          </Text>
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {item.user?.fullName || 'N/A'}
          </Text>
          <Text className="text-sm text-gray-500">{item.vehicle?.licensePlate || 'N/A'}</Text>
        </View>

        <View className="mr-4">
          {item.startTime && item.endTime && item.startTime !== item.endTime ? (
            <View>
              <Text className="text-xs text-gray-500">
                {t('request.list.label.start')}: {formatDate(item.startTime)}
              </Text>
              <Text className="text-xs text-gray-500">
                {t('request.list.label.end')}: {formatDate(item.endTime)}
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-xs text-gray-500">
                {t('common.fields.date')}: {formatDate(item.startTime)}
              </Text>
            </View>
          )}
        </View>

        <View className="items-end">
          <View className="mt-1">
            <FontAwesomeIcon icon={faEllipsisV} size={16} color="#6B7280" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleStatusFilter = (status: string) => {
    const newFilter = currentStatusFilter === status ? '' : status;
    setCurrentStatusFilter(newFilter);
    setIsFiltered(!!newFilter || !!searchQuery);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    setIsFiltered(!!text || !!currentStatusFilter);
  };

  const handleRequestOption = (data: Request): void => {
    setSelected(data);
    setIsActionModalVisible(true);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setCurrentStatusFilter('');
    setIsFiltered(false);
  };

  const handleViewDetail = () => {
    if (!selected) return;
    setIsActionModalVisible(false);
    navigation.navigate('RequestDetail', { requestData: selected });
  };

  const handleApprove = (): void => {
    setIsActionModalVisible(false);
    setIsApproveModalVisible(true);
  };

  const handleReject = (): void => {
    setIsActionModalVisible(false);
    setIsRejectModalVisible(true);
  };

  const handleCancel = (): void => {
    setIsActionModalVisible(false);
    setIsCancelModalVisible(true);
  };

  const handleCloseActionModal = () => {
    setIsActionModalVisible(false);
    setSelected(null);
  };

  const handleCloseAllModals = () => {
    setIsActionModalVisible(false);
    setIsApproveModalVisible(false);
    setIsRejectModalVisible(false);
    setIsCancelModalVisible(false);
    setSelected(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequestsData();
  };

  const onModalSuccess = () => {
    handleCloseAllModals();
    onRefresh();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title={t('sidebar.management.request')}
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder={t('common.searchPlaceholder.request')}
        handleClearFilters={handleClearFilters}
      />

      <View className="mx-6 mb-10 flex-1">
        <View className="mb-4 mt-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <TouchableOpacity
            className="flex-row justify-between"
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-base font-medium text-gray-600">
              {t('request.management.totalRequest')}:{' '}
              <Text className="text-xl font-bold text-gray-900">{requestStat.total}</Text>
            </Text>
            <Text className="mt-1 text-sm text-blue-500">
              {isExpanded ? t('common.expand.hide') : t('common.expand.show')}
            </Text>
          </TouchableOpacity>

          {isExpanded && (
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
              <StatusCard
                label={t('common.status.pending')}
                keyword="Pending"
                count={requestStat.pending}
                bgColor="bg-amber-500"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.approved')}
                keyword="Approved"
                count={requestStat.approved}
                bgColor="bg-emerald-500"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.inProgress')}
                keyword="In Progress"
                count={requestStat.inProgress}
                bgColor="bg-blue-500"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.done')}
                keyword="Done"
                count={requestStat.done}
                bgColor="bg-green-600"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.rejected')}
                keyword="Rejected"
                count={requestStat.rejected}
                bgColor="bg-red-500"
                onPress={handleStatusFilter}
              />
              <StatusCard
                label={t('common.status.cancelled')}
                keyword="Cancelled"
                count={requestStat.cancelled}
                bgColor="bg-slate-500"
                onPress={handleStatusFilter}
              />
            </View>
          )}
        </View>

        {isFiltered && (
          <TouchableOpacity onPress={handleClearFilters} className="items-end ps-4">
            <Text className="mb-4 text-sm text-blue-500 underline">
              {t('common.button.clearFilter') || 'Clear filter'}
            </Text>
          </TouchableOpacity>
        )}

        {isLoading ? (
          <LoadingData />
        ) : (
          <FlashList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.requestId?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyList />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            estimatedItemSize={80}
          />
        )}
      </View>

      {requests.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
            {t('request.management.totalRequest')}:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredRequests.length}</Text>
          </Text>
        </View>
      )}

      <RequestOptionModal
        visible={isActionModalVisible}
        selected={selected}
        onClose={handleCloseActionModal}
        onViewDetail={handleViewDetail}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
      />

      {selected && (
        <>
          <ApproveModal
            visible={isApproveModalVisible}
            onClose={handleCloseAllModals}
            onSuccess={onModalSuccess}
            isDriverRequired={selected.isDriverRequired}
            requestId={selected.requestId}
            startTime={selected.startTime}
            endTime={selected.endTime}
          />

          <RejectModal
            visible={isRejectModalVisible}
            onClose={handleCloseAllModals}
            requestId={selected.requestId}
            onSuccess={onModalSuccess}
          />

          <CancelModal
            visible={isCancelModalVisible}
            onClose={handleCloseAllModals}
            requestId={selected.requestId}
            onSuccess={onModalSuccess}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default RequestScreen;
