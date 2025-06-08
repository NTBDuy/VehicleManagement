import { formatDate } from '@/utils/datetimeUtils';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { DriverService } from 'services/driverService';
import { showToast } from 'utils/toast';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import Driver from 'types/Driver';

import Header from '@/components/layout/HeaderComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import LoadingData from '@/components/ui/LoadingData';
import ErrorComponent from '@/components/ui/ErrorComponent';

const DriverDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t } = useTranslation();
  const { driverData: initialDriverData } = (route.params as { driverData?: Driver }) || {};
  const [driverData, setDriverData] = useState<Driver | undefined>(initialDriverData);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonActionLoading, setIsButtonActionLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (initialDriverData?.driverId) {
        fetchDriverData(initialDriverData.driverId);
      }
    }, [initialDriverData?.driverId])
  );

  const fetchDriverData = async (driverId: number) => {
    try {
      setIsLoading(true);
      const data = await DriverService.getDriverById(driverId);
      setDriverData(data);
    } catch (error) {
      console.log('Error fetching driver data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!driverData) {
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
              await DriverService.toggleStatus(driverData?.driverId);
              showToast.success(
                isActivate
                  ? `${t('common.success.deactivated', { item: driverData.fullName })}`
                  : `${t('common.success.activated', { item: driverData.fullName })}`
              );
              await fetchDriverData(driverData.driverId);
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
        </View>
      )}
    </SafeAreaView>
  );
};

export default DriverDetailsScreen;
