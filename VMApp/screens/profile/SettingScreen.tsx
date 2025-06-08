import { showToast } from '@/utils/toast';
import {
  faChevronRight,
  faFileText,
  faGlobe,
  faLock,
  faPen,
  faShieldHalved,
  faSignOut,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import Header from '@/components/layout/HeaderComponent';
import CountryFlag from 'react-native-country-flag';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handlePress = () => {
    showToast.info(t('common.soon'));
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleLanguageChange = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      closeLanguageModal();
      showToast.success(t('setting.languageChanged'));
    } catch (error) {
      showToast.error(t('setting.languageChangeError'));
    }
  };

  const openLanguageModal = () => {
    setShowLanguageModal(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeLanguageModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLanguageModal(false);
    });
  };

  const handleLanguagePress = () => {
    openLanguageModal();
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

  const menuItems: MenuItem[] = useMemo(
    () => [
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
    ],
    [t, handleEditProfile, handleChangePassword, handleLanguagePress, handlePress, handleSignOut]
  );

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

  const renderLanguageModal = () => {
    const languages = [
      {
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        flag: 'us',
      },
      {
        code: 'vi-VN',
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        flag: 'vn',
      },
    ];

    return (
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeLanguageModal}>
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 items-center justify-center bg-black/50 px-4">
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <View className="flex-row items-center justify-between border-b border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-800">{t('setting.selectLanguage')}</Text>
              <TouchableOpacity
                onPress={closeLanguageModal}
                className="rounded-full bg-gray-100 p-2"
                activeOpacity={0.7}>
                <FontAwesomeIcon icon={faTimes} size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="px-2 py-4">
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageChange(language.code)}
                  className={`mx-2 flex-row items-center rounded-xl p-4 ${
                    currentLanguage === language.code
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'bg-transparent hover:bg-gray-50'
                  } ${index !== languages.length - 1 ? 'mb-2' : ''}`}
                  activeOpacity={0.7}>
                  <View className="mr-4 rounded-lg bg-white p-2 shadow-sm">
                    <CountryFlag isoCode={language.flag} size={24} />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold ${
                        currentLanguage === language.code ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                      {language.name}
                    </Text>
                    <Text
                      className={`text-sm ${
                        currentLanguage === language.code ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {language.nativeName}
                    </Text>
                  </View>

                  {currentLanguage === language.code && (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                      <View className="h-2 w-2 rounded-full bg-white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
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

      {renderLanguageModal()}

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
