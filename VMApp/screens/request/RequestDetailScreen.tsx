import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from 'components/HeaderComponent';
import Request from 'types/Request';
import { getUserInitials } from 'utils/userUtils';
import InfoRow from 'components/InfoRowComponent';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { useContext, useState } from 'react';
import ApproveModal from 'components/modal/ApproveModalComponent';
import RejectModal from 'components/modal/RejectModalComponent';
import CancelModal from 'components/modal/CancelModalComponent';
import { useAuth } from 'contexts/AuthContext';
import { RequestService } from 'services/requestService';

const RequestDetailScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { requestData: initialRequestData } = route.params as { requestData: Request };

  const [requestData, setRequestData] = useState<Request>(initialRequestData);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  /** Component: Badge Request status */
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

  // const handleCancelForEmployee = () => {
  //   Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [
  //     { text: 'No', style: 'cancel' },
  //     {
  //       text: 'Yes, Cancel',
  //       onPress: async () => {
  //         setIsLoading(true);
  //         try {
  //           await new Promise((resolve) => setTimeout(resolve, 1000));

  //           Alert.alert('Success', 'This request cancelled successfully!', [
  //             { text: 'OK', onPress: () => navigation.goBack() },
  //           ]);
  //         } catch (error) {
  //           Alert.alert('Error', 'Failed to update account. Please try again.');
  //         } finally {
  //           setIsLoading(false);
  //         }
  //       },
  //     },
  //   ]);
  // };

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
                  <Text className="text-sm text-gray-500">Request ID #{requestData.requestId}</Text>
                  <Text className="text-lg font-bold text-gray-800">
                    <Text className="text-base font-semibold text-gray-600">From: </Text>
                    {requestData.user?.fullName}
                  </Text>
                </View>
              </View>
              {renderBadgeRequestStatus({ status: requestData.status })}
            </View>
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

        {/** Action Buttons */}
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
            {(requestData.status == 0 || requestData.status == 1) && (
              <View className="mt-4">
                <Pressable
                  className={`items-center rounded-xl py-4 shadow-sm active:bg-gray-700 ${isLoading ? 'bg-gray-500' : 'bg-gray-600 active:bg-gray-700'}`}
                  onPress={handleCancel}
                  disabled={isLoading}>
                  <Text className="font-semibold text-white">
                    {isLoading ? 'Canceling...' : 'Cancel'}
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
