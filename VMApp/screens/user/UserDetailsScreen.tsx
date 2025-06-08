import { faCrown, faEdit, faShieldAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import User from 'types/User';

import Header from '@/components/layout/HeaderComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import LoadingData from '@/components/ui/LoadingData';
import ErrorComponent from '@/components/ui/ErrorComponent';

type RoleInfo = {
  label: string;
  icon: any;
  color: string;
};

const UserDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { userData: initialUserData } = (route.params as { userData?: User }) || {};
  const [userData, setUserData] = useState<User | undefined>(initialUserData);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonActionLoading, setIsButtonActionLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (initialUserData?.userId) {
        fetchUserData(initialUserData.userId);
      }
    }, [initialUserData?.userId])
  );

  const fetchUserData = async (userId: number) => {
    try {
      setIsLoading(true);
      const data = await UserService.getUserById(userId);
      setUserData(data);
    } catch (error) {
      console.log('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (userData?.userId) {
      fetchUserData(userData?.userId);
    } else {
      navigation.goBack();
    }
  };

  if (!userData) {
    return <ErrorComponent />;
  }

  const getRoleInfo = (role: number): RoleInfo => {
    switch (role) {
      case 1:
        return {
          label: t('common.role.employee'),
          icon: faUser,
          color: '#2563eb',
        };
      case 2:
        return {
          label: t('common.role.manager'),
          icon: faShieldAlt,
          color: '#16a34a',
        };
      case 0:
        return {
          label: t('common.role.admin'),
          icon: faCrown,
          color: '#9333ea',
        };
      default:
        return {
          label: 'Unknown',
          icon: faUser,
          color: '#4b5563',
        };
    }
  };

  const handleEdit = () => {
    navigation.navigate('UserEdit', { userData });
  };

  const handleResetPassword = async () => {
    Alert.alert(
      `${t('common.confirmation.title.reset')}`,
      `${t('common.confirmation.message.reset', {
        user: userData?.fullName || userData?.username,
      })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.reset')}`,
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await UserService.reset(userData!.userId);
              showToast.success(`${t('common.success.passwordReset')}`);
            } catch (error) {
              console.log('Error resetting password:', error);
              showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async () => {
    const isActivate = userData.status;

    Alert.alert(
      isActivate
        ? `${t('common.confirmation.title.deactivate', { item: userData.fullName })}`
        : `${t('common.confirmation.title.activate', { item: userData.fullName })}`,
      isActivate
        ? `${t('common.confirmation.message.deactivate', { item: userData.fullName })}`
        : `${t('common.confirmation.message.activate', { item: userData.fullName })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: t('common.button.yesIAmSure'),
          style: userData.status ? 'destructive' : 'default',
          onPress: async () => {
            setIsButtonActionLoading(true);
            try {
              await UserService.toggleStatus(userData?.userId);
              isActivate
                ? `${t('common.success.deactivated', { item: userData.fullName })}`
                : `${t('common.success.activated', { item: userData.fullName })}`;
              await fetchUserData(userData.userId);
            } catch (error) {
              console.log('Error toggling status:', error);
              Alert.alert(`${t('common.error.title')}`, `${t('common.error.generic')}?`);
            } finally {
              setIsButtonActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const roleInfo = getRoleInfo(userData.role);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        customTitle={
          <Text className="text-xl font-bold text-gray-800">
            {t('user.detail.title')} #{userData.userId}
          </Text>
        }
        rightElement={
          <TouchableOpacity onPress={handleEdit} className="rounded-full bg-white p-2 shadow-sm">
            <FontAwesomeIcon icon={faEdit} size={18} color="#374151" />
          </TouchableOpacity>
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
                className={`absolute bottom-2 right-2 rounded-full p-2 ${userData.status ? 'bg-green-500' : 'bg-gray-400'}`}>
                <View className="h-3 w-3 rounded-full bg-white" />
              </View>
            </View>
            <Text className="mt-3 text-xl font-bold text-gray-800">
              {userData.fullName || userData.username || 'No Name'}
            </Text>
            <View className="mt-1 flex-row items-center">
              <FontAwesomeIcon icon={roleInfo.icon} size={14} color={roleInfo.color} />
              <Text className={`ml-1 text-sm font-medium`} style={{ color: roleInfo.color }}>
                {roleInfo.label}
              </Text>
            </View>
          </View>

          <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">
                {t('user.detail.informationTitle')}
              </Text>
            </View>
            <View className="p-4">
              <InfoRow
                label={t('common.fields.fullname')}
                value={userData.fullName || 'Not provided'}
              />
              <InfoRow label={t('common.fields.email')} value={userData.email || 'Not provided'} />
              <InfoRow
                label={t('common.fields.phone')}
                value={
                  userData.phoneNumber
                    ? formatVietnamPhoneNumber(userData.phoneNumber)
                    : 'Not provided'
                }
                isLast
              />
            </View>
          </View>

          <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">
                {t('user.detail.detailTitle')}
              </Text>
            </View>
            <View className="p-4">
              <InfoRow label={t('common.fields.username')} value={userData.username || 'Not set'} />
              <InfoRow
                label={t('common.fields.role')}
                value={roleInfo.label}
                valueComponent={
                  <View className="flex-row items-center">
                    <FontAwesomeIcon icon={roleInfo.icon} size={14} color={roleInfo.color} />
                    <Text className={`ml-1 font-semibold`} style={{ color: roleInfo.color }}>
                      {roleInfo.label}
                    </Text>
                  </View>
                }
              />
              <InfoRow
                label={t('common.fields.status')}
                value=""
                valueComponent={
                  <View
                    className={`rounded-full px-3 py-1 ${userData.status ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Text
                      className={`text-sm font-medium ${userData.status ? 'text-green-800' : 'text-gray-600'}`}>
                      {userData.status
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
              className="w-[48%] items-center rounded-xl bg-blue-600 py-4 shadow-sm "
              onPress={handleResetPassword}
              disabled={isLoading}>
              <Text className="font-semibold text-white">{t('common.button.reset')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
                userData.status ? 'bg-red-600 ' : 'bg-green-600 '
              }`}
              onPress={handleToggleStatus}
              disabled={isButtonActionLoading}>
              <Text className="font-semibold text-white">
                {isButtonActionLoading
                  ? `${t('common.button.processing')}`
                  : userData.status
                    ? `${t('common.button.deactivate')}`
                    : `${t('common.button.activate')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default UserDetailsScreen;
