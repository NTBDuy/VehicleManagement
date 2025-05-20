import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from 'components/HeaderComponent';
import Request from 'types/Request';
import { getInitialsFromName } from 'utils/userUtils';
import InfoRow from 'components/InfoRowComponent';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { useState } from 'react';
import ApproveModal from 'components/ApproveModalComponent';
import RejectModal from 'components/RejectModalComponent';
import CancelModal from 'components/CancelModalComponent';

const RequestDetailScreen = () => {
  const route = useRoute();
  const { requestData } = route.params as { requestData: Request };
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  /** Component: Badge Vehicle Status */
  const renderBadgeVehicleStatus = ({ status }: { status: number }) => {
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

  const handleCloseModal = () => {
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Request detail" backBtn />
      <View className="px-6">
        <View className="mb-6 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-blue-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-lg font-bold text-blue-600">
                    {getInitialsFromName(requestData.User?.FullName)}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-500">Request ID #{requestData.RequestId}</Text>
                  <Text className="text-lg font-bold text-gray-800">
                    <Text className="text-base font-semibold text-gray-600">From: </Text>
                    {requestData.User?.FullName}
                  </Text>
                </View>
              </View>
              {renderBadgeVehicleStatus({ status: requestData.Status })}
            </View>
          </View>
        </View>
      </View>

      <View className="px-6">
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Request Information</Text>
          </View>

          <View className="p-4">
            <InfoRow label="Request by" value={requestData.User?.FullName || 'No information'} />
            <InfoRow
              label="Time"
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {formatDate(requestData.StartTime)} - {formatDate(requestData.EndTime)}
                </Text>
              }
            />
            <InfoRow
              label="Vehicle"
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {requestData.Vehicle?.Brand} {requestData.Vehicle?.Model} #
                  {requestData.Vehicle?.LicensePlate}
                </Text>
              }
            />
            <InfoRow label="Purpose" value={requestData.Purpose || 'No information'} />
            <InfoRow label="Request date" value={formatDate(requestData.CreatedAt)} isLast />
          </View>
        </View>

        {/** Action Buttons */}
        {requestData.Status === 0 && (
          <View className="mt-4 flex-row justify-between">
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

        {requestData.Status === 1 && (
          <View>
            <Pressable
              className="items-center rounded-xl bg-red-600 py-4 shadow-sm active:bg-red-700"
              onPress={handleCancel}>
              <Text className="font-semibold text-white">Cancel</Text>
            </Pressable>
          </View>
        )}

        <View className="mt-4">
          <Text className="text-right text-sm font-medium text-gray-500">
            Last updated: {formatDatetime(requestData.CreatedAt)}
          </Text>
        </View>
      </View>

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

export default RequestDetailScreen;
