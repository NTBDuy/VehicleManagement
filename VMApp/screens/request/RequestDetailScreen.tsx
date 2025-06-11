import { showToast } from '@/utils/toast';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { RequestService } from 'services/requestService';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { formatVietnamPhoneNumber, getUserInitials } from 'utils/userUtils';
import {
  getRequestBackgroundColor,
  getRequestLabelEn,
  getRequestLabelEnVi,
} from '@/utils/requestUtils';
import ImageView from 'react-native-image-viewing';

import Assignment from 'types/Assignment';
import Request from 'types/Request';

import Header from '@/components/layout/HeaderComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import ApproveModal from 'components/modal/ApproveModalComponent';
import CancelModal from 'components/modal/CancelModalComponent';
import RejectModal from 'components/modal/RejectModalComponent';
import CheckPoint from '@/types/CheckPoint';
import { API_CONFIG } from 'config/apiConfig';
import ImageViewing from 'react-native-image-viewing';

const RequestDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isViCurrent = i18n.language === 'vi-VN';
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
  const [checkPoint, setCheckPoint] = useState<CheckPoint[]>([]);
  const baseUrl = API_CONFIG.BASE_URL;
  const [visible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
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

  const renderBadgeRequestStatus = ({ status }: { status: number }) => {
    const bgColor = getRequestBackgroundColor(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">
          {isViCurrent ? getRequestLabelEnVi(status) : getRequestLabelEn(status)}
        </Text>
      </View>
    );
  };

  const handleMapsView = (lat: number, long: number) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    const latLng = `${lat},${long}`;
    const label = 'Destination';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => console.error('Failed to open map:', err));
    }
  };

  const handlePhotoPress = (photo: any) => {
    console.log('Photo pressed:', `${baseUrl}/request/files/${photo.name}`);
    setCurrentImage(`${baseUrl}/request/files/${photo.name}`);
    setIsVisible(true);
  };

  const renderPhotos = (item: CheckPoint) => {
    if (!item.photos) return null;
    console.log(`${baseUrl}/request/files/${item.photos[0].name}`);

    return (
      <View className="mb-3" key={item.checkPointId}>
        <Text className="mb-2 text-sm font-semibold text-gray-800">
          Hình ảnh ({item.photos.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {item.photos.map((photo) => (
            <TouchableOpacity
              key={photo.photoId}
              className="mr-2"
              onPress={() => handlePhotoPress(photo)}>
              <Image
                source={{ uri: `${baseUrl}/request/files/${photo.name}` }}
                className="h-20 w-20 rounded-lg"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCheckPointItem = (item: CheckPoint, index: number) => (
    <View
      className={`border-gray-100 ${index == checkPoint.length - 1 ? 'pt-2' : 'border-b py-2 '}`}
      key={item.checkPointId}>
      <View className="mb-3 flex-row items-center justify-between">
        <View
          className={`rounded-full px-3 py-1.5 ${
            item.type === 0 ? 'bg-green-500' : 'bg-orange-500'
          }`}>
          <Text className="text-sm font-semibold text-white">
            {item.type === 0 ? 'Check-in' : 'Check-out'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-semibold text-gray-800">
            {formatDatetime(item.createdAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="mb-3 flex-row items-center rounded-lg bg-gray-50 p-3"
        onPress={() => handleMapsView(item.latitude, item.longitude)}>
        <Text className="mr-2 text-sm text-gray-600">Vị trí:</Text>
        <Text className="flex-1 font-mono text-sm text-gray-800">
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
      </TouchableOpacity>

      {item.photos.length > 0 && renderPhotos(item)}

      {item.note && (
        <View className="mb-3 rounded-lg bg-gray-50 p-3">
          <Text className="mb-2 text-sm font-semibold text-gray-800">Ghi chú</Text>
          <Text className="text-sm leading-5 text-gray-800">{item.note}</Text>
        </View>
      )}
    </View>
  );

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
        <View className="px-4">
          <View className="mb-4 mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
            <View className="bg-blue-50 p-6">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center">
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
                    <Text className="text-lg font-bold text-white">
                      {getUserInitials(requestData.user?.fullName)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {t('request.detail.requestId')} #{requestData.requestId}
                    </Text>
                    <Text className="mb-1 text-xl font-bold text-gray-900">
                      {requestData.user?.fullName}
                    </Text>
                    <Text className="text-sm text-gray-600">{t('request.detail.submitted')}</Text>
                  </View>
                </View>
                <View className="ml-4">
                  {renderBadgeRequestStatus({ status: requestData.status })}
                </View>
              </View>
              {requestData.status !== 0 && (
                <View className="mt-4 rounded-2xl border border-blue-200 bg-white/90 p-4 shadow-sm">
                  <Text className="text-base leading-relaxed text-gray-700">
                    <Text className="font-semibold">{t('common.fields.status')}: </Text>
                    {t('request.detail.thisRequestWas')}{' '}
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
                      {requestData.status === 1 && t('common.status.approved')}
                      {requestData.status === 4 && t('common.status.approved')}
                      {requestData.status === 5 && t('common.status.approved')}
                      {requestData.status === 2 && t('common.status.rejected')}
                      {requestData.status === 3 && t('common.status.cancelled')}
                    </Text>{' '}
                    {t('request.detail.by')}{' '}
                    <Text className="font-semibold text-gray-800">
                      {requestData.actionByUser.fullName || 'No Information'}
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {(requestData.status === 3 || requestData.status === 2) && (
              <View className="border-t border-red-100 bg-red-50 p-6">
                <View className="flex-row items-start">
                  <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-sm">
                    <Text className="text-sm font-bold text-white">!</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-3 text-lg font-bold text-red-800">
                      {requestData.status === 3
                        ? `${t('request.detail.cancellationTitle')}`
                        : `${t('request.detail.rejectionTitle')}`}
                    </Text>
                    <View className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
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
          <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">
                {t('request.detail.info.section')}
              </Text>
            </View>

            <View className="p-4">
              <InfoRow
                label={t('request.detail.info.requestBy')}
                value={requestData.user?.fullName || t('common.fields.noInfo')}
              />
              <InfoRow
                label={
                  !isASameDate
                    ? `${t('request.detail.info.dateRange')}`
                    : `${t('common.fields.date')}`
                }
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
                label={t('request.detail.info.startLocation')}
                value={requestData.startLocation || t('common.fields.noInfo')}
              />
              <InfoRow
                label={t('request.detail.info.endLocation')}
                value={requestData.endLocation || t('common.fields.noInfo')}
              />
              <InfoRow
                label={t('request.detail.info.vehicle')}
                value=""
                valueComponent={
                  <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                    {requestData.vehicle?.brand} {requestData.vehicle?.model} #
                    {requestData.vehicle?.licensePlate}
                  </Text>
                }
              />
              <InfoRow
                label={t('common.fields.purpose')}
                value={requestData.purpose || t('common.fields.noInfo')}
              />
              <InfoRow
                label={t('request.detail.info.driverRequired')}
                value={
                  requestData.isDriverRequired
                    ? `${t('request.create.confirm.switchText.assign')}`
                    : `${t('request.create.confirm.switchText.self')}`
                }
              />
              <InfoRow
                label={t('request.detail.info.requestDate')}
                value={formatDate(requestData.createdAt)}
                isLast={!requestData.totalDistance}
              />
              {requestData.totalDistance && (
                <InfoRow
                  label="Quãng đường đã đi"
                  value={`${requestData.totalDistance.toString()} Km`}
                  isLast
                />
              )}
            </View>
          </View>

          {requestData.isDriverRequired && assignmentData && (
            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('request.detail.driver.section')}
                </Text>
              </View>

              <View className="p-4">
                <InfoRow
                  label={t('request.detail.driver.name')}
                  value={assignmentData?.driver.fullName || t('common.fields.noInfo')}
                />
                <InfoRow
                  label={t('common.fields.phone')}
                  value={
                    formatVietnamPhoneNumber(assignmentData?.driver.phoneNumber) ||
                    t('common.fields.noInfo')
                  }
                  isLast
                />
              </View>
            </View>
          )}

          {checkPoint.length > 0 && (
            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">Trạng thái sử dụng</Text>
              </View>

              <View className="p-4">
                {checkPoint.map((item, index) => renderCheckPointItem(item, index))}
              </View>
            </View>
          )}

          {user?.role === 2 && (
            <>
              {requestData.status === 0 && (
                <View className="mt-4 flex-row justify-between">
                  <TouchableOpacity
                    className="w-[48%] items-center rounded-xl bg-green-600 py-4 shadow-sm "
                    onPress={handleApprove}>
                    <Text className="font-semibold text-white">{t('common.button.approve')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-[48%] items-center rounded-xl bg-red-600 py-4 shadow-sm "
                    onPress={handleReject}>
                    <Text className="font-semibold text-white">{t('common.button.reject')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {requestData.status === 1 && user?.userId != requestData.userId && (
                <View className="mt-4">
                  <TouchableOpacity
                    className="items-center rounded-xl bg-gray-500 py-4 shadow-sm "
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">{t('common.button.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {requestData.status == 4 && (
                <View className="mt-4">
                  <TouchableOpacity
                    className={`items-center rounded-xl py-4 shadow-sm ${
                      isOverdue(requestData.endTime)
                        ? 'bg-red-500 '
                        : isNearDueDate(requestData.endTime)
                          ? 'bg-orange-500 '
                          : 'bg-amber-500 '
                    }`}
                    onPress={handleRemind}
                    disabled={isReminderSent}>
                    <Text className="font-semibold text-white">
                      {isReminderSent
                        ? `${t('common.button.remind.sent')}`
                        : isOverdue(requestData.endTime)
                          ? `${t('common.button.remind.urgent')}`
                          : isNearDueDate(requestData.endTime)
                            ? `${t('common.button.remind.soon')}`
                            : `${t('common.button.remind.normal')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {user?.userId == requestData.userId && (
            <>
              {requestData.status === 0 && (
                <View className="mt-4">
                  <TouchableOpacity
                    className={`items-center rounded-xl bg-gray-600 py-4 shadow-sm  `}
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">{t('common.button.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {requestData.status === 1 && (
                <View className="mt-4 flex-row justify-between">
                  <TouchableOpacity
                    className="w-[48%] items-center rounded-xl bg-gray-600 py-4 shadow-sm "
                    onPress={handleCancel}>
                    <Text className="font-semibold text-white">{t('common.button.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`w-[48%] items-center rounded-xl ${isUsingLoading ? 'bg-gray-600' : 'bg-blue-600'} py-4 shadow-sm `}
                    disabled={isUsingLoading}
                    onPress={handleUsingVehicle}>
                    <Text className="font-semibold text-white">
                      {isUsingLoading
                        ? `${t('common.button.loading')}`
                        : `${t('common.button.usingVehicle')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {requestData.status === 4 && (
                <View className="mt-4">
                  <TouchableOpacity
                    className={`items-center rounded-xl ${isEndUsageLoading ? 'bg-gray-600' : 'bg-green-600'} py-4 shadow-sm  `}
                    disabled={isEndUsageLoading}
                    onPress={handleEndUsage}>
                    <Text className="font-semibold text-white">
                      {isEndUsageLoading
                        ? `${t('common.button.ending')}`
                        : `${t('common.button.endUsage')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View className="mt-4">
            <Text className="text-right text-sm font-medium text-gray-500">
              {t('common.lastUpdated')}: {formatDatetime(requestData.lastUpdateAt)}
            </Text>
          </View>
        </View>

        <ImageViewing
          images={[{ uri: currentImage }]}
          imageIndex={0}
          visible={visible}
          onRequestClose={() => setIsVisible(false)}
        />
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
