import { showToast } from '@/utils/toast';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { RequestService } from 'services/requestService';
import { formatDatetime } from 'utils/datetimeUtils';

import Assignment from 'types/Assignment';
import Request from 'types/Request';

import Header from '@/components/layout/HeaderComponent';
import CheckPointItem from '@/components/request/CheckPointItem';
import ActionButtons from '@/components/request/RequestDetailActionButtons';
import DriverInformation from '@/components/request/RequestDetailDriverSection';
import RequestDetailHeader from '@/components/request/RequestDetailHeader';
import InformationSection from '@/components/request/RequestDetailInformationSection';
import CheckPoint from '@/types/CheckPoint';
import ApproveModal from 'components/modal/ApproveModalComponent';
import CancelModal from 'components/modal/CancelModalComponent';
import RejectModal from 'components/modal/RejectModalComponent';

const RequestDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { requestData: initialRequestData } = route.params as { requestData: Request };
  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isUsingLoading, setIsUsingLoading] = useState(false);
  const [isEndUsageLoading, setIsEndUsageLoading] = useState(false);
  const [isReminderSent, setIsReminderSent] = useState(false);
  const [checkPoint, setCheckPoint] = useState<CheckPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAssignmentData(null);
      if (
        requestData.isDriverRequired &&
        requestData.status !== 2 &&
        requestData.status !== 3 &&
        requestData.status !== 0
      ) {
        fetchAssignmentData(requestData.requestId);
      }
    }, [requestData])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await RequestService.getRequestDetails(requestData.requestId);
      setRequestData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAssignmentData(null);
      if (requestData.status == 4 || requestData.status == 5) {
        fetchCheckPoint(requestData.requestId);
      }
    }, [requestData])
  );

  const fetchAssignmentData = async (requestId: number) => {
    try {
      const data = await RequestService.getAssignmentDetails(requestId);
      setAssignmentData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCheckPoint = async (requestId: number) => {
    try {
      const data = await RequestService.checkPointList(requestId);
      setCheckPoint(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = () => {
    setIsApproveModalVisible(true);
  };

  const handleReject = () => {
    setIsRejectModalVisible(true);
  };

  const handleCancel = () => {
    setIsCancelModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsApproveModalVisible(false);
    setIsRejectModalVisible(false);
    setIsCancelModalVisible(false);
  };

  const handleApproveConfirm = async (driverId: string | null, note: string) => {
    const assignmentData = { driverId, note };

    const updatedRequest = requestData.isDriverRequired
      ? await RequestService.approveRequest(requestData.requestId, assignmentData)
      : await RequestService.approveRequest(requestData.requestId);

    setRequestData(updatedRequest);
    handleCloseModal();
  };

  const handleRejectConfirm = async (reason: string) => {
    const reasonData = { reason };
    const updatedRequest = await RequestService.rejectRequest(requestData.requestId, reasonData);
    setRequestData(updatedRequest);
    handleCloseModal();
  };

  const handleCancelConfirm = async (reason: string) => {
    const reasonData = { reason };
    const updatedRequest = await RequestService.cancelRequest(requestData.requestId, reasonData);
    setRequestData(updatedRequest);
    handleCloseModal();
  };

  const canUseVehicle = () => {
    const today = new Date();
    const startDate = new Date(requestData.startTime);
    const endDate = new Date(requestData.endTime);
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return today >= startDate && today <= endDate;
  };

  const handleUsingVehicle = () => {
    Alert.alert(
      `${t('request.detail.toast.startUsing.title')}`,
      `${t('request.detail.toast.startUsing.message')}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.confirm')}`,
          onPress: async () => {
            if (!canUseVehicle()) {
              showToast.error(
                `${t('request.detail.toast.startUsingError.title')}`,
                `${t('request.detail.toast.startUsingError.message')}`
              );
              return;
            }
            try {
              setIsUsingLoading(true);
              const response = await RequestService.usingVehicle(requestData.requestId);
              setRequestData(response);
              showToast.success(`${t('request.detail.toast.startUsingSuccess.message')}`);
              navigation.navigate('InProgress', { requestData });
            } catch (error) {
              console.log(error);
            } finally {
              setIsUsingLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEndUsage = () => {
    Alert.alert(
      `${t('request.detail.toast.endUsage.title')}`,
      `${t('request.detail.toast.endUsage.message')}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.confirm')}`,
          onPress: async () => {
            try {
              setIsEndUsageLoading(true);
              const response = await RequestService.endUsageVehicle(requestData.requestId);
              setRequestData(response);
              showToast.success(
                `${t('request.detail.toast.endUsageSuccess.title')}`,
                `${t('request.detail.toast.endUsageSuccess.message')}`
              );
            } catch (error) {
              console.log(error);
            } finally {
              setIsEndUsageLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemind = () => {
    Alert.alert(
      `${t('request.detail.toast.remind.title')}`,
      `${t('request.detail.toast.remind.message')}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.confirm')}`,
          onPress: async () => {
            try {
              setIsUsingLoading(true);
              await RequestService.remindVehicle(requestData.requestId);
              showToast.success(
                `${t('request.detail.toast.remindSuccess.title')}`,
                `${t('request.detail.toast.remindSuccess.message')}`
              );
            } catch (error) {
              console.log(error);
            } finally {
              setIsUsingLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('request.detail.title')} backBtn />

      <ScrollView
        className="mb-8 flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <RequestDetailHeader requestData={requestData} />

        <View className="px-6">
          <InformationSection requestData={requestData} />

          {requestData.isDriverRequired && assignmentData && (
            <DriverInformation assignmentData={assignmentData} />
          )}

          {checkPoint.length > 0 && (
            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">Trạng thái sử dụng</Text>
              </View>

              <View className="p-4">
                {checkPoint.map((item, index) => (
                  <CheckPointItem
                    key={item.checkPointId}
                    item={item}
                    index={index}
                    size={requestData.locations.length}
                  />
                ))}
              </View>
            </View>
          )}

          {user && (
            <ActionButtons
              user={user}
              requestData={requestData}
              isUsingLoading={isUsingLoading}
              isEndUsageLoading={isEndUsageLoading}
              isReminderSent={isReminderSent}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
              onUsingVehicle={handleUsingVehicle}
              onEndUsage={handleEndUsage}
              onRemind={handleRemind}
            />
          )}

          <View className="mt-4">
            <Text className="text-right text-sm font-medium text-gray-500">
              {t('common.lastUpdated')}: {formatDatetime(requestData.lastUpdateAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <ApproveModal
        visible={isApproveModalVisible}
        onClose={handleCloseModal}
        onApprove={handleApproveConfirm}
        isDriverRequired={requestData.isDriverRequired}
        startTime={requestData.startTime}
        endTime={requestData.endTime}
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

export default RequestDetailScreen;
