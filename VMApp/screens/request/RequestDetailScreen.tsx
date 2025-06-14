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

const REQUEST_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  CANCELLED: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
} as const;

const RequestDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { requestData: initialRequestData } = route.params as { requestData: Request };
  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
  const [checkPoint, setCheckPoint] = useState<CheckPoint[]>([]);

  const [visible, setVisible] = useState({
    approve: false,
    reject: false,
    cancel: false,
  });

  const [loadingStates, setLoadingStates] = useState({
    assignment: false,
    checkPoint: false,
    usingVehicle: false,
    endUsage: false,
    reminder: false,
    refreshing: false,
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setAssignmentData(null);
        if (shouldLoadAssignmentData()) {
          await fetchAssignmentData(requestData.requestId);
        }
        if (shouldLoadCheckPointData()) {
          await fetchCheckPoint(requestData.requestId);
        }
      };

      loadData();
    }, [requestData])
  );

  const shouldLoadAssignmentData = () => {
    return (
      requestData.isDriverRequired &&
      ![REQUEST_STATUS.REJECTED, REQUEST_STATUS.CANCELLED, REQUEST_STATUS.PENDING].includes(
        requestData.status as any
      )
    );
  };

  const shouldLoadCheckPointData = () => {
    return [REQUEST_STATUS.IN_PROGRESS, REQUEST_STATUS.COMPLETED].includes(
      requestData.status as any
    );
  };

  const fetchAssignmentData = async (requestId: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, assignment: true }));
      const data = await RequestService.getAssignmentDetails(requestId);
      setAssignmentData(data);
    } catch (error) {
      console.error('Failed to fetch assignment data:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, assignment: false }));
    }
  };

  const fetchCheckPoint = async (requestId: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, checkPoint: true }));
      const data = await RequestService.checkPointList(requestId);
      setCheckPoint(data);
    } catch (error) {
      console.error('Failed to fetch checkpoint data:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, checkPoint: false }));
    }
  };

  const onRefresh = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, refreshing: true }));
      const data = await RequestService.getRequestDetails(requestData.requestId);
      setRequestData(data);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, refreshing: false }));
    }
  };

  const showModal = (modalType: 'approve' | 'reject' | 'cancel') => {
    setVisible({
      approve: modalType === 'approve',
      reject: modalType === 'reject',
      cancel: modalType === 'cancel',
    });
  };

  const handleCloseModal = () => {
    setVisible({
      approve: false,
      reject: false,
      cancel: false,
    });
  };

  const canUseVehicle = () => {
    const now = new Date();
    const startTime = new Date(requestData.startTime);
    const endTime = new Date(requestData.endTime);
    return now >= startTime && now <= endTime;
  };

  const handleUsingVehicle = () => {
    if (!canUseVehicle()) {
      showToast.error(t('common.error.startUsing'));
      return;
    }

    Alert.alert(
      t('common.confirmation.title.startUsing'),
      t('common.confirmation.message.startUsing'),
      [
        { text: t('common.button.cancel'), style: 'cancel' },
        {
          text: t('common.button.confirm'),
          onPress: async () => {
            try {
              setLoadingStates((prev) => ({ ...prev, usingVehicle: true }));
              const response = await RequestService.usingVehicle(requestData.requestId);
              setRequestData(response);
              showToast.success(t('common.success.startUsing'));
              navigation.navigate('InProgress', { requestData: response });
            } catch (error) {
              console.error('Failed to start vehicle usage:', error);
            } finally {
              setLoadingStates((prev) => ({ ...prev, usingVehicle: false }));
            }
          },
        },
      ]
    );
  };

  const handleEndUsage = () => {
    Alert.alert(
      t('common.confirmation.title.endUsage'),
      t('common.confirmation.message.endUsage'),
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.confirm')}`,
          onPress: async () => {
            try {
              setLoadingStates((prev) => ({ ...prev, endUsage: true }));
              const response = await RequestService.endUsageVehicle(requestData.requestId);
              setRequestData(response);
              showToast.success(t('common.success.endUsage'));
            } catch (error) {
              console.log(error);
            } finally {
              setLoadingStates((prev) => ({ ...prev, endUsage: false }));
            }
          },
        },
      ]
    );
  };

  const handleRemind = () => {
    Alert.alert(t('common.confirmation.title.remind'), t('common.confirmation.message.remind'), [
      { text: t('common.button.cancel'), style: 'cancel' },
      {
        text: t('common.button.confirm'),
        onPress: async () => {
          try {
            setLoadingStates((prev) => ({ ...prev, reminder: true }));
            await RequestService.remindVehicle(requestData.requestId);
            showToast.success(t('common.success.remind'));
          } catch (error) {
            console.log('Failed to send reminder:', error);
          } finally {
            setLoadingStates((prev) => ({ ...prev, reminder: false }));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('request.detail.title')} backBtn />

      <ScrollView
        className="mb-8 flex-1"
        refreshControl={
          <RefreshControl refreshing={loadingStates.refreshing} onRefresh={onRefresh} />
        }>
        <RequestDetailHeader requestData={requestData} />

        <View className="px-6">
          <InformationSection requestData={requestData} />

          {requestData.isDriverRequired && assignmentData && (
            <DriverInformation assignmentData={assignmentData} />
          )}

          {checkPoint.length > 0 && (
            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('request.detail.usageStatus')}
                </Text>
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
              isUsingLoading={loadingStates.usingVehicle}
              isEndUsageLoading={loadingStates.endUsage}
              isReminderSent={loadingStates.reminder}
              onApprove={() => showModal('approve')}
              onReject={() => showModal('reject')}
              onCancel={() => showModal('cancel')}
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
        visible={visible.approve}
        onClose={handleCloseModal}
        onSuccess={onRefresh}
        requestId={requestData.requestId}
        isDriverRequired={requestData.isDriverRequired}
        startTime={requestData.startTime}
        endTime={requestData.endTime}
      />

      <RejectModal
        visible={visible.reject}
        onClose={handleCloseModal}
        onSuccess={onRefresh}
        requestId={requestData.requestId}
      />

      <CancelModal
        visible={visible.cancel}
        onClose={handleCloseModal}
        onSuccess={onRefresh}
        requestId={requestData.requestId}
      />
    </SafeAreaView>
  );
};

export default RequestDetailScreen;
