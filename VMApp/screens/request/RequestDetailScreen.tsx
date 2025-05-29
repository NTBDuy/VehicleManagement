import { useRoute } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
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

const RequestDetailScreen = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { requestData: initialRequestData } = route.params as { requestData: Request };
  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  useEffect(() => {
    if (requestData.isDriverRequired && requestData.status !== 2 && requestData.status !== 0) {
      getAssignmentData(requestData.requestId);
    }
  }, [requestData]);

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
          return 'bg-orange-600';
        case 1:
          return 'bg-green-600';
        case 2:
          return 'bg-red-600';
        case 3:
          return 'bg-gray-600';
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Request detail" backBtn />

      <ScrollView className="flex-1 mb-8">
        <View className="px-6">
          <View className="mt-4 mb-6 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="p-4 bg-blue-50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                    <Text className="text-lg font-bold text-blue-600">
                      {getUserInitials(requestData.user?.fullName)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">
                      Request ID #{requestData.requestId}
                    </Text>
                    <Text className="text-lg font-bold text-gray-800">
                      <Text className="text-base font-semibold text-gray-600">From: </Text>
                      {requestData.user?.fullName}
                    </Text>
                  </View>
                </View>
                {renderBadgeRequestStatus({ status: requestData.status })}
              </View>

              {(requestData.status === 3 || requestData.status === 2) && (
                <View className="p-3 mt-4 border border-red-100 rounded-xl bg-red-50">
                  <View className="flex-row items-start">
                    <View className="items-center justify-center w-6 h-6 mr-3 bg-red-100 rounded-full">
                      <Text className="text-xs font-bold text-red-600">!</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-semibold text-red-700">
                        {requestData.status === 3 ? 'Cancellation' : 'Rejection'} Reason
                      </Text>
                      <Text className="text-sm leading-5 text-red-600">
                        {requestData.cancelOrRejectReason}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
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
                label="Time"
                value=""
                valueComponent={
                  <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                    {formatDate(requestData.startTime)} - {formatDate(requestData.endTime)}
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

          {(user?.role === 0 || user?.role === 2) && (
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

              {requestData.status === 1 && (
                <View className="mt-4">
                  <Pressable
                    className="items-center py-4 bg-gray-500 shadow-sm rounded-xl active:bg-gray-700"
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">Cancel</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {user?.role === 1 && (
            <>
              {(requestData.status === 0 || requestData.status === 1) && (
                <View className="mt-4">
                  <Pressable
                    className={`items-center rounded-xl bg-gray-600 py-4 shadow-sm active:bg-gray-700 `}
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">Cancel</Text>
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
