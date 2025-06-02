import {
  faChevronRight,
  faPen,
  faShieldHalved,
  faUser,
  faLock,
  faFileText,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { Alert, Image, TouchableOpacity, SafeAreaView, Text, View } from 'react-native';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import Header from '@/components/layout/HeaderComponent';

const SettingScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const handlePress = () => {
    Alert.alert('Comming soon!');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: faUser,
      title: 'Update your information',
      subtitle: 'Edit your personal details',
      onPress: handleEditProfile,
      color: '#3b82f6',
    },
    {
      icon: faLock,
      title: 'Change your password',
      subtitle: 'Update your security credentials',
      onPress: handleChangePassword,
      color: '#ef4444',
    },
    {
      icon: faFileText,
      title: 'Terms and Conditions',
      subtitle: 'Read our terms of service',
      onPress: handlePress,
      color: '#10b981',
    },
    {
      icon: faShieldHalved,
      title: 'Privacy Policy',
      subtitle: 'Learn about data protection',
      onPress: handlePress,
      color: '#8b5cf6',
    },
    {
      icon: faSignOut,
      title: 'Sign Out',
      subtitle: 'Log out of your account',
      onPress: handleSignOut,
      color: '#ef4444',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        customTitle={
          <View className="items-center">
            <Image
              className="h-28 w-28 rounded-full border-2 border-white shadow-lg"
              source={require('../../assets/images/user-default.jpg')}
            />
            <Text className="mt-4 text-lg font-bold text-gray-800">
              {user?.fullName || 'NO INFORMATION'}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {user?.phoneNumber ? formatVietnamPhoneNumber(user.phoneNumber) : 'NO PHONE NUMBER'}
            </Text>
          </View>
        }
        rightElement={
          <TouchableOpacity
            className="rounded-full bg-white p-3 shadow-md"
            onPress={handleEditProfile}>
            <FontAwesomeIcon icon={faPen} color="#374151" size={16} />
          </TouchableOpacity>
        }
      />

      <View className="mt-6 px-4">
        <Text className="mb-4 px-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Account Settings
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
