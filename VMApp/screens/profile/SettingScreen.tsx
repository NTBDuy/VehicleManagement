import { showToast } from '@/utils/toast';
import {
  faBullseye,
  faChevronRight,
  faFileText,
  faGlobe,
  faLock,
  faPen,
  faShieldHalved,
  faSignOut,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import Header from '@/components/layout/HeaderComponent';
import CheckInRadiusModal from '@/components/modal/CheckInRadiusModal';
import LanguageModal from '@/components/modal/LanguageModal';

Dimensions.get('window');

interface MenuItem {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  testID?: string;
}

const SettingScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  const handlePress = () => {
    showToast.info(t('common.soon'));
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const openLanguageModal = () => {
    setShowLanguageModal(true);
  };

  const closeLanguageModal = () => {
    setShowLanguageModal(false);
  };

  const handleLanguagePress = () => {
    openLanguageModal();
  };

  const openRadiusModal = () => {
    setShowRadiusModal(true);
  };

  const closeRadiusModal = () => {
    setShowRadiusModal(false);
  };

  const handleCheckInRadiusPress = () => {
    openRadiusModal();
  };

  const handleSignOut = () => {
    Alert.alert(`${t('auth.signOut.title')}`, `${t('auth.signOut.message')}`, [
      { text: `${t('common.button.cancel')}`, style: 'cancel' },
      {
        text: `${t('auth.signOut.title')}`,
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {
        icon: faUser,
        title: t('setting.label.user'),
        subtitle: t('setting.info.user'),
        onPress: handleEditProfile,
        color: '#3b82f6',
        testID: 'edit-profile-button',
      },
      {
        icon: faLock,
        title: t('setting.label.password'),
        subtitle: t('setting.info.password'),
        onPress: handleChangePassword,
        color: '#ef4444',
        testID: 'change-password-button',
      },
      {
        icon: faGlobe,
        title: t('setting.label.language'),
        subtitle: t('setting.info.language'),
        onPress: handleLanguagePress,
        color: '#f59e0b',
        testID: 'language-button',
      },
      {
        icon: faFileText,
        title: t('setting.label.term'),
        subtitle: t('setting.info.term'),
        onPress: handlePress,
        color: '#10b981',
        testID: 'terms-button',
      },
      {
        icon: faShieldHalved,
        title: t('setting.label.privacy'),
        subtitle: t('setting.info.privacy'),
        onPress: handlePress,
        color: '#8b5cf6',
        testID: 'privacy-button',
      },
      {
        icon: faSignOut,
        title: t('setting.label.signOut'),
        subtitle: t('setting.info.signOut'),
        onPress: handleSignOut,
        color: '#ef4444',
        testID: 'sign-out-button',
      },
    ];

    if (user?.role === 0 || user?.role === 2) {
      items.splice(3, 0, {
        icon: faBullseye,
        title: t('setting.label.checkInRadius'),
        subtitle: t('setting.info.checkInRadius'),
        onPress: handleCheckInRadiusPress,
        color: '#f59e0b',
        testID: 'check-in-button',
      });
    }

    return items;
  }, [
    t,
    handleEditProfile,
    handleChangePassword,
    handleLanguagePress,
    handlePress,
    handleSignOut,
    handleCheckInRadiusPress,
    user?.role,
  ]);

  const renderUserAvatar = () => {
    const avatarSource = require('@/assets/images/user-default.jpg');
    return (
      <View className="items-center">
        <View className="relative">
          <Image
            className="h-28 w-28 rounded-full border-2 border-white shadow-lg"
            source={avatarSource}
            testID="user-avatar"
          />
          <View className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500" />
        </View>
        <Text className="mt-4 text-lg font-bold text-gray-800" testID="user-name">
          {user?.fullName || t('setting.noInformation')}
        </Text>
        <Text className="mt-1 text-sm text-gray-500" testID="user-phone">
          {user?.phoneNumber
            ? formatVietnamPhoneNumber(user.phoneNumber)
            : t('setting.noPhoneNumber')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        customTitle={renderUserAvatar()}
        rightElement={
          <TouchableOpacity
            className="rounded-full bg-white p-3 shadow-md"
            onPress={handleEditProfile}>
            <FontAwesomeIcon icon={faPen} color="#374151" size={16} />
          </TouchableOpacity>
        }
      />

      <LanguageModal visible={showLanguageModal} onClose={closeLanguageModal} />

      <CheckInRadiusModal visible={showRadiusModal} onClose={closeRadiusModal} />

      <View className="mt-6 px-4">
        <Text className="mb-4 px-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('setting.title')}
        </Text>

        <View className="rounded-xl bg-white shadow-sm">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View className="mr-4 rounded-lg bg-gray-50 p-3">
                <FontAwesomeIcon icon={item.icon} size={20} color={item.color} />
              </View>

              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">{item.title}</Text>
                <Text className="mt-1 text-sm text-gray-500">{item.subtitle}</Text>
              </View>

              <FontAwesomeIcon icon={faChevronRight} size={14} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingScreen;
