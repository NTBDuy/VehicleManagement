import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { RequestService } from 'services/requestService';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { formatVietnamPhoneNumber, getUserInitials } from 'utils/userUtils';

import Assignment from 'types/Assignment';
import Request from 'types/Request';

import Header from 'components/HeaderComponent';
import InfoRow from 'components/InfoRowComponent';
import ApproveModal from 'components/modal/ApproveModalComponent';
import CancelModal from 'components/modal/CancelModalComponent';
import RejectModal from 'components/modal/RejectModalComponent';
import { showToast } from '@/utils/toast';

const RequestDetailScreen = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { requestData: initialRequestData } = route.params as { requestData: Request };
  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [isASameDate] = useState(initialRequestData.startTime == initialRequestData.endTime);
  const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isUsingLoading, setIsUsingLoading] = useState(false);
  const [isEndUsageLoading, setIsEndUsageLoading] = useState(false);
  const [isReminderSent, setIsReminderSent] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAssignmentData(null);
      if (requestData.isDriverRequired && requestData.status !== 2 && requestData.status !== 0) {
        getAssignmentData(requestData.requestId);
      }
    }, [requestData])
  );

  const getAssignmentData = async (requestId: number) => {
    try {
      const data = await RequestService.getAssignmentDetails(requestId);
      setAssignmentData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const renderBadgeRequestStatus = ({ status }: { status: number }) => {
    const getStatusStyle = (status: number) => {
      switch (status) {
        case 0:
          return 'bg-amber-600';
        case 1:
          return 'bg-emerald-600';
        case 2:
          return 'bg-red-600';
        case 3:
          return 'bg-slate-600';
        case 4:
          return 'bg-blue-600';
        case 5:
          return 'bg-green-600';
        default:
          return 'bg-gray-600';
      }
    };

    const getStatusLabel = (status: number) => {
      switch (status) {
        case 0:
          return 'Pending';
        case 1:
          return 'Approved';
        case 2:
          return 'Rejected';
        case 3:
          return 'Cancelled';
        case 4:
          return 'In Progress';
        case 5:
          return 'Done';
        default:
          return 'Unknown';
      }
    };

    const bgColor = getStatusStyle(status);

    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getStatusLabel(status)}</Text>
      </View>
    );
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
    Alert.alert('Start Vehicle Usage', 'Are you sure you want to start using the vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          if (!canUseVehicle()) {
            showToast.error('Cannot use vehicle', 'Vehicle can only be used on the scheduled date');
            return;
          }
          try {
            setIsUsingLoading(true);
            const response = await RequestService.usingVehicle(requestData.requestId);
            setRequestData(response);
            showToast.success(
              'Vehicle usage started successfully',
              'You can now use the vehicle. Please remember to end usage when finished.'
            );
          } catch (error) {
            console.log(error);
          } finally {
            setIsUsingLoading(false);
          }
        },
      },
    ]);
  };

  const handleEndUsage = () => {
    Alert.alert('End Vehicle Usage', 'Are you sure you want to end the vehicle usage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setIsEndUsageLoading(true);
            const response = await RequestService.endUsageVehicle(requestData.requestId);
            setRequestData(response);
            showToast.success(
              'Vehicle usage ended successfully',
              'The vehicle has been returned and the request is now marked as complete.'
            );
          } catch (error) {
            console.log(error);
          } finally {
            setIsEndUsageLoading(false);
          }
        },
      },
    ]);
  };

  const isOverdue = (endDate: string) => {
    const today = new Date().toDateString();
    const dueDate = new Date(endDate).toDateString();

    return new Date(today) > new Date(dueDate);
  };

  const isNearDueDate = (endDate: string) => {
    const now = new Date();
    const dueDate = new Date(endDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 1 && daysDiff > 0;
  };

  const handleRemind = () => {
    Alert.alert('Send Reminder', 'Are you sure you want to send a reminder to use the vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setIsUsingLoading(true);
            await RequestService.remindVehicle(requestData.requestId);
            showToast.success(
              'Reminder sent',
              'The user has been reminded to start vehicle usage.'
            );
          } catch (error) {
            console.log(error);
          } finally {
            setIsUsingLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Request detail" backBtn />

      <ScrollView className="flex-1 mb-8">
        <View className="px-4">
          <View className="mt-6 mb-4 overflow-hidden bg-white border border-gray-100 shadow-lg rounded-3xl">
            <View className="p-6 bg-blue-50">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="items-center justify-center w-12 h-12 mr-4 bg-blue-600 shadow-md rounded-2xl">
                    <Text className="text-lg font-bold text-white">
                      {getUserInitials(requestData.user?.fullName)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Request ID #{requestData.requestId}
                    </Text>
                    <Text className="mb-1 text-xl font-bold text-gray-900">
                      {requestData.user?.fullName}
                    </Text>
                    <Text className="text-sm text-gray-600">Submitted request</Text>
                  </View>
                </View>
                <View className="ml-4">
                  {renderBadgeRequestStatus({ status: requestData.status })}
                </View>
              </View>
              {requestData.status !== 0 && (
                <View className="p-4 mt-4 border border-blue-200 shadow-sm rounded-2xl bg-white/90">
                  <Text className="text-base leading-relaxed text-gray-700">
                    <Text className="font-semibold">Status: </Text>
                    This request was{' '}
                    <Text
                      className={`font-bold ${
                        requestData.status === 1
                          ? 'text-green-600'
                          : requestData.status === 4
                            ? 'text-green-600'
                            : requestData.status === 5
                              ? 'text-green-600'
                              : requestData.status === 2
                                ? 'text-red-600'
                                : 'text-orange-600'
                      }`}>
                      {requestData.status === 1 && 'approved'}
                      {requestData.status === 4 && 'approved'}
                      {requestData.status === 5 && 'approved'}
                      {requestData.status === 2 && 'rejected'}
                      {requestData.status === 3 && 'cancelled'}
                    </Text>{' '}
                    by{' '}
                    <Text className="font-semibold text-gray-800">
                      {requestData.actionByUser.fullName || 'No Information'}
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Rejection/Cancellation Reason */}
            {(requestData.status === 3 || requestData.status === 2) && (
              <View className="p-6 border-t border-red-100 bg-red-50">
                <View className="flex-row items-start">
                  <View className="items-center justify-center w-8 h-8 mr-4 bg-red-500 rounded-full shadow-sm">
                    <Text className="text-sm font-bold text-white">!</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-3 text-lg font-bold text-red-800">
                      {requestData.status === 3 ? 'Cancellation' : 'Rejection'} Details
                    </Text>
                    <View className="p-4 bg-white border border-red-200 shadow-sm rounded-xl">
                      <Text className="text-base font-medium leading-6 text-red-700">
                        {requestData.cancelOrRejectReason}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="px-6">
          <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-lg font-semibold text-gray-800">Request Information</Text>
            </View>

            <View className="p-4">
              <InfoRow label="Request by" value={requestData.user?.fullName || 'No information'} />
              <InfoRow
                label={!isASameDate ? 'Date range' : 'Date'}
                value=""
                valueComponent={
                  <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                    {!isASameDate
                      ? `${formatDate(requestData.startTime)} - ${formatDate(requestData.endTime)}`
                      : `${formatDate(requestData.startTime)}`}
                  </Text>
                }
              />
              <InfoRow
                label="vehicle"
                value=""
                valueComponent={
                  <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                    {requestData.vehicle?.brand} {requestData.vehicle?.model} #
                    {requestData.vehicle?.licensePlate}
                  </Text>
                }
              />
              <InfoRow label="Purpose" value={requestData.purpose || 'No information'} />
              <InfoRow
                label="Driver required"
                value={requestData.isDriverRequired ? 'Assign a driver' : 'Drive by self'}
              />
              <InfoRow label="Request date" value={formatDate(requestData.createdAt)} isLast />
            </View>
          </View>

          {requestData.isDriverRequired && assignmentData && (
            <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800">Driver Information</Text>
              </View>

              <View className="p-4">
                <InfoRow
                  label="Driver"
                  value={assignmentData?.driver.fullName || 'No information'}
                />
                <InfoRow
                  label="Phone"
                  value={
                    formatVietnamPhoneNumber(assignmentData?.driver.phoneNumber) || 'No information'
                  }
                  isLast
                />
              </View>
            </View>
          )}

          {user?.role === 2 && (
            <>
              {requestData.status === 0 && (
                <View className="flex-row justify-between mt-4">
                  <Pressable
                    className="w-[48%] items-center rounded-xl bg-green-600 py-4 shadow-sm active:bg-green-700"
                    onPress={handleApprove}>
                    <Text className="font-semibold text-white">Approve</Text>
                  </Pressable>

                  <Pressable
                    className="w-[48%] items-center rounded-xl bg-red-600 py-4 shadow-sm active:bg-red-700"
                    onPress={handleReject}>
                    <Text className="font-semibold text-white">Reject</Text>
                  </Pressable>
                </View>
              )}

              {requestData.status === 1 && user?.userId != requestData.userId && (
                <View className="mt-4">
                  <Pressable
                    className="items-center py-4 bg-gray-500 shadow-sm rounded-xl active:bg-gray-700"
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">Cancel</Text>
                  </Pressable>
                </View>
              )}

              {requestData.status == 4 && (
                <View className="mt-4">
                  <Pressable
                    className={`items-center rounded-xl py-4 shadow-sm ${
                      isOverdue(requestData.endTime)
                        ? 'bg-red-500 active:bg-red-700'
                        : isNearDueDate(requestData.endTime)
                          ? 'bg-orange-500 active:bg-orange-700'
                          : 'bg-amber-500 active:bg-amber-700'
                    }`}
                    onPress={handleRemind}
                    disabled={isReminderSent}>
                    <Text className="font-semibold text-white">
                      {isReminderSent
                        ? '✓ Reminder sent'
                        : isOverdue(requestData.endTime)
                          ? 'Urgent: Return overdue vehicle'
                          : isNearDueDate(requestData.endTime)
                            ? 'Due soon: Remind return'
                            : 'Remind for return vehicle'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {user?.userId == requestData.userId && (
            <>
              {requestData.status === 0 && (
                <View className="mt-4">
                  <Pressable
                    className={`items-center rounded-xl bg-gray-600 py-4 shadow-sm active:bg-gray-700 `}
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">Cancel</Text>
                  </Pressable>
                </View>
              )}
              {requestData.status === 1 && (
                <View className="flex-row justify-between mt-4">
                  <Pressable
                    className="w-[48%] items-center rounded-xl bg-gray-600 py-4 shadow-sm active:bg-gray-700"
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">Cancel</Text>
                  </Pressable>

                  <Pressable
                    className={`w-[48%] items-center rounded-xl ${isUsingLoading ? 'bg-gray-600' : 'bg-blue-600'} py-4 shadow-sm active:bg-blue-700`}
                    disabled={isUsingLoading}
                    onPress={handleUsingVehicle}>
                    <Text className="font-semibold text-white">
                      {isUsingLoading ? 'Loading...' : 'Using Vehicle'}
                    </Text>
                  </Pressable>
                </View>
              )}
              {requestData.status === 4 && (
                <View className="mt-4">
                  <Pressable
                    className={`items-center rounded-xl ${isEndUsageLoading ? 'bg-gray-600' : 'bg-green-600'} py-4 shadow-sm active:bg-green-700 `}
                    disabled={isEndUsageLoading}
                    onPress={handleEndUsage}>
                    <Text className="font-semibold text-white">
                      {isEndUsageLoading ? 'Ending...' : 'End Usage'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          <View className="mt-4">
            <Text className="text-sm font-medium text-right text-gray-500">
              Last updated: {formatDatetime(requestData.lastUpdateAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <ApproveModal
        visible={isApproveModalVisible}
        onClose={handleCloseModal}
        onApprove={handleApproveConfirm}
        isDriverRequired={requestData.isDriverRequired}
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
