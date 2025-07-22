import { faCrown, faEdit, faShieldAlt, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InfoRow from '@/components/ui/InfoRowComponent';
import LoadingData from '@/components/ui/LoadingData';
import { formatDatetime } from '@/utils/datetimeUtils';

type RoleInfo = {
  label: string;
  icon: any;
  color: string;
};

const UserDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [isButtonActionLoading, setIsButtonActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { userId } = route.params as { userId: number };

  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: !!userId,
  });

  if (isError || !userData) {
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
              await UserService.reset(userData!.userId);
              showToast.success(`${t('common.success.passwordReset')}`);
            } catch (error) {
              console.log('Error resetting password:', error);
              showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
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
              await refetch();
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

  const handleDeleteAccount = () => {
    Alert.alert(
      `${t('common.confirmation.title.deleteAccount')}`,
      `${t('common.confirmation.message.deleteAccount')}`,
      [
        {
          text: `${t('common.button.cancel')}`,
          style: 'cancel',
        },
        {
          text: `${t('common.button.deleteAccount')}`,
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await Promise.all([
        UserService.removeAccount(userId),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ]);
      navigation.goBack();

      showToast.success(`${t('common.success.deleteAccount')}`);
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
        <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
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
                <InfoRow
                  label={t('common.fields.email')}
                  value={userData.email || 'Not provided'}
                />
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
                <InfoRow
                  label={t('common.fields.username')}
                  value={userData.username || 'Not set'}
                />
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
                <InfoRow label="Ngày tạo" value={formatDatetime(userData.createdAt)} />
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

            <View className="mt-6">
              <Text className="text-right text-sm font-medium text-gray-500">
                {t('common.lastUpdated')}: {formatDatetime(userData.lastUpdateAt)}
              </Text>
            </View>

            {/* Delete Account Section */}
            <View className="mb-8 mt-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
              <View className="bg-red-50 px-4 py-3">
                <Text className="text-lg font-semibold text-red-800">
                  {t('user.deleteAccount.section.title')}
                </Text>
              </View>

              <View className="p-4">
                <Text className="mb-4 text-sm text-gray-600">
                  {t('user.deleteAccount.section.description')}
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

export default UserDetailsScreen;
