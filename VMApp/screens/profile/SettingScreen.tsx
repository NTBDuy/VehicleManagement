import { faFileContract, faPen, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { Alert, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { formatVietnamPhoneNumber } from 'utils/userUtils';

import Header from '@/components/layout/HeaderComponent';

const SettingScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const handlePress = () => {
    Alert.alert('Comming soon!');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/** HEADER */}
      <Header
        customTitle={
          <View className="items-center ">
            <Image
              className="border border-white rounded-full h-28 w-28"
              source={require('../../assets/images/user-default.jpg')}
            />
            <Text className="mt-4 font-bold">{user?.fullName || 'NO INFORMATION'}</Text>
            <Text className="mt-2 text-gray-600">
              {user?.phoneNumber ? formatVietnamPhoneNumber(user.phoneNumber) : 'NO PHONE NUMBER'}
            </Text>
          </View>
        }
        rightElement={
          <Pressable className="p-2 bg-white rounded-full" onPress={handleEditProfile}>
            <FontAwesomeIcon icon={faPen} color="#000" size={18} />
          </Pressable>
        }
      />

      {/** BODY */}
      <View className="px-6">
        <Pressable
          className="flex-row items-center px-2 py-4 border-b border-gray-200"
          onPress={handlePress}>
          <FontAwesomeIcon icon={faFileContract} size={24} color="#4b5563" />
          <Text className="ml-2 text-gray-600">Terms and Conditions</Text>
        </Pressable>

        <Pressable className="flex-row items-center px-2 py-4" onPress={handlePress}>
          <FontAwesomeIcon icon={faShieldHalved} size={24} color="#4b5563" />
          <Text className="ml-2 text-gray-600">Privacy Policy</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SettingScreen;
