import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import { View, Text, SafeAreaView, Image, Pressable, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faPen, faFileContract, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Header from 'components/Header';

const SettingScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) => {
  const { user, setUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const handlePress = () => {
    Alert.alert('Comming soon!');
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
            <Text className="mt-4 font-bold">{user?.FullName || 'NO INFORMATION'}</Text>
            <Text className="mt-2 text-gray-600">{user?.Phone || 'NO INFORMATION'}</Text>
          </View>
        }
        rightElement={
          <Pressable className="rounded-full bg-white p-2" onPress={handlePress}>
            <FontAwesomeIcon icon={faPen} color="#000" size={18} />
          </Pressable>
        }
      />

      {/** BODY */}
      <View className="px-4">
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
