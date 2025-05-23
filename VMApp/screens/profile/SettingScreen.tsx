import { View, Text, SafeAreaView, Image, Pressable, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPen, faFileContract, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import Header from 'components/HeaderComponent';
import { formatVietnamPhoneNumber } from 'utils/userUtils';
import { useAuth } from 'contexts/AuthContext';

const SettingScreen = () => {
  const { user } = useAuth();

  const navigation = useNavigation<any>();

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
              className="h-28 w-28 rounded-full border border-white"
              source={require('../../assets/images/user-default.jpg')}
            />
            <Text className="mt-4 font-bold">{user?.fullName || 'NO INFORMATION'}</Text>
            <Text className="mt-2 text-gray-600">
              {user?.phoneNumber ? formatVietnamPhoneNumber(user.phoneNumber) : 'NO PHONE NUMBER'}
            </Text>
          </View>
        }
        rightElement={
          <Pressable className="rounded-full bg-white p-2" onPress={handleEditProfile}>
            <FontAwesomeIcon icon={faPen} color="#000" size={18} />
          </Pressable>
        }
      />

      {/** BODY */}
      <View className="px-6">
        <Pressable
          className="flex-row items-center border-b border-gray-200 px-2 py-4"
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
