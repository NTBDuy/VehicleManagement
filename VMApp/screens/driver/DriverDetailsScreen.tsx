import { formatDate } from '@/utils/datetimeUtils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DriverService } from 'services/driverService';
import { showToast } from 'utils/toast';
import { formatVietnamPhoneNumber, getUserInitials } from 'utils/userUtils';
import { useQueryClient } from '@tanstack/react-query';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import LoadingData from '@/components/ui/LoadingData';
import Request from '@/types/Request';
import { getRequestBorderColor } from '@/utils/requestUtils';
import { faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FlashList } from '@shopify/flash-list';

const DriverDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t } = useTranslation();
  const { driverId } = route.params as { driverId: number };
  const [isButtonActionLoading, setIsButtonActionLoading] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(0);
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: driverData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      const data = DriverService.getDriverById(driverId);
      return data;
    },
  });

  const { data: driverRequests = [] } = useQuery({
    queryKey: ['driverRequests', driverId],
    queryFn: () => DriverService.getDriverRequestById(driverId),
  });

  const filterOptions = [
    { id: 0, name: t('common.status.all') },
    { id: 1, name: t('common.status.incoming') },
    { id: 4, name: t('common.status.inProgress') },
    { id: 5, name: t('common.status.done') },
  ];

  const filtered = useMemo(() => {
    let filtered = [...driverRequests];

    switch (currentStatusFilter) {
      case 1:
        filtered = filtered.filter((item) => item.status === 1);
        break;
      case 4:
        filtered = filtered.filter((item) => item.status === 4);
        break;
      case 5:
        filtered = filtered.filter((item) => item.status === 5);
        break;
    }
    return filtered;
  }, [driverRequests, currentStatusFilter]);

  const handleFilterChange = (status: number) => {
    setCurrentStatusFilter(status);
  };

  if (error || !driverData) {
    return <ErrorComponent />;
  }

  const handleEdit = () => {
    navigation.navigate('DriverEdit', { driverData });
  };

  const handleToggleStatus = async () => {
    const isActivate = driverData.isActive;

    Alert.alert(
      isActivate
        ? `${t('common.confirmation.title.deactivate', { item: driverData.fullName })}`
        : `${t('common.confirmation.title.activate', { item: driverData.fullName })}`,
      isActivate
        ? `${t('common.confirmation.message.deactivate', { item: driverData.fullName })}`
        : `${t('common.confirmation.message.activate', { item: driverData.fullName })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: t('common.button.yesIAmSure'),
          style: driverData.isActive ? 'destructive' : 'default',
          onPress: async () => {
            setIsButtonActionLoading(true);
            try {
              await DriverService.toggleStatus(driverId);
              showToast.success(
                isActivate
                  ? `${t('common.success.deactivated', { item: driverData.fullName })}`
                  : `${t('common.success.activated', { item: driverData.fullName })}`
              );
              await refetch();

              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['driver', driverId] }),
                queryClient.invalidateQueries({ queryKey: ['drivers'] }),
              ]);
            } catch (error) {
              console.log('Error toggling isActive:', error);
              Alert.alert(`${t('common.error.title')}`, `${t('common.error.generic')}?`);
            } finally {
              setIsButtonActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = (item: Request) => (
    <TouchableOpacity
      key={item.requestId}
      onPress={() => {
        navigation.navigate('RequestDetail', { requestId: item.requestId });
      }}
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

  const handleDeleteAccount = () => {
    Alert.alert(
      `${t('common.confirmation.title.deleteDriver')}`,
      `${t('common.confirmation.message.deleteDriver')}`,
      [
        {
          text: `${t('common.button.cancel')}`,
          style: 'cancel',
        },
        {
          text: `${t('common.button.deleteDriver')}`,
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await DriverService.removeDriver(driverId);
      await queryClient.invalidateQueries({ queryKey: ['drivers'] });
      navigation.goBack();

      showToast.success(`${t('common.success.deleteDriver')}`);
    } catch (error) {
      console.log('Delete account error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        customTitle={
          <Text className="text-xl font-bold text-gray-800">
            {t('driver.detail.title')} #{driverData.driverId}
          </Text>
        }
      />

      {isLoading ? (
        <LoadingData />
      ) : (
        <ScrollView>
          <View className="flex-1 px-6">
            <View className="mb-4 items-center">
              <View className="relative">
                <Image
                  className="mt-4 h-28 w-28 rounded-full border-4 border-white shadow-md"
                  source={require('@/assets/images/user-default.jpg')}
                />
                <View
                  className={`absolute bottom-2 right-2 rounded-full p-2 ${driverData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <View className="h-3 w-3 rounded-full bg-white" />
                </View>
              </View>
              <Text className="mt-3 text-xl font-bold text-gray-800">
                {driverData.fullName || 'No Name'}
              </Text>
            </View>

            <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <View className="bg-gray-50 px-4 py-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {t('driver.detail.section.title')}
                </Text>
              </View>
              <View className="p-4">
                <InfoRow
                  label={t('common.fields.fullname')}
                  value={driverData.fullName || 'Not provided'}
                />
                <InfoRow
                  label={t('common.fields.phone')}
                  value={
                    driverData.phoneNumber
                      ? formatVietnamPhoneNumber(driverData.phoneNumber)
                      : 'Not provided'
                  }
                />
                <InfoRow
                  label={t('driver.detail.section.license')}
                  value={driverData.licenseNumber || 'Not provided'}
                />
                <InfoRow
                  label={t('driver.detail.section.licenseDate')}
                  value={formatDate(driverData.licenseIssuedDate) || 'Not provided'}
                />
                <InfoRow
                  label={t('driver.detail.section.experience')}
                  value={driverData.yearsOfExperience.toString() || 'Not provided'}
                />
                <InfoRow
                  label={t('common.fields.status')}
                  value=""
                  valueComponent={
                    <View
                      className={`rounded-full px-3 py-1 ${driverData.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Text
                        className={`text-sm font-medium ${driverData.isActive ? 'text-green-800' : 'text-gray-600'}`}>
                        {driverData.isActive
                          ? `${t('common.status.active')}`
                          : `${t('common.status.inactive')}`}
                      </Text>
                    </View>
                  }
                  isLast
                />
              </View>
            </View>

            {driverRequests.length > 0 && (
              <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
                <View className="bg-gray-50 px-4 py-3">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('driver.scheduleList')}
                  </Text>
                </View>
                <View className="p-4">
                  <View className="my-4 mb-7">
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={filterOptions}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => handleFilterChange(item.id)}
                          className={`mr-2 items-center rounded-full px-4 py-2 ${currentStatusFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                          <Text
                            className={`text-sm font-medium ${currentStatusFilter === item.id ? 'text-white' : 'text-gray-600'}`}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                  <FlashList
                    data={filtered}
                    renderItem={({ item }) => renderRequestItem(item)}
                    keyExtractor={(item) => item.requestId.toString()}
                    estimatedItemSize={80}
                  />
                </View>
              </View>
            )}

            <View className="mt-4 flex-row justify-between">
              <TouchableOpacity
                className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
                  driverData.isActive ? 'bg-red-600 ' : 'bg-green-600 '
                }`}
                onPress={handleToggleStatus}
                disabled={isButtonActionLoading}>
                <Text className="font-semibold text-white">
                  {isButtonActionLoading
                    ? `${t('common.button.loading')}`
                    : driverData.isActive
                      ? `${t('common.button.deactivate')}`
                      : `${t('common.button.activate')}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] items-center rounded-xl bg-blue-600 py-4 shadow-sm "
                onPress={handleEdit}
                disabled={isLoading}>
                <Text className="font-semibold text-white">{t('common.button.update')}</Text>
              </TouchableOpacity>
            </View>

            {/* Delete Driver Section */}
            <View className="mb-8 mt-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
              <View className="bg-red-50 px-4 py-3">
                <Text className="text-lg font-semibold text-red-800">
                  {t('user.deleteDriver.section.title')}
                </Text>
              </View>

              <View className="p-4">
                <Text className="mb-4 text-sm text-gray-600">
                  {t('user.deleteDriver.section.description')}
                </Text>

                <TouchableOpacity
                  className={`flex-row items-center justify-center rounded-xl border-2 border-red-300 py-4 ${
                    isDeleting ? 'bg-gray-400' : 'bg-red-600'
                  }`}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}>
                  {!isDeleting && (
                    <FontAwesomeIcon
                      icon={faTrash}
                      size={16}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                  )}

                  <Text className="font-semibold text-white">
                    {isDeleting ? `${t('common.button.loading')}` : `${t('common.button.delete')}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DriverDetailsScreen;
