import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import { View, Text, SafeAreaView, Image, Pressable, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSignOut, faPen, faFileContract, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

const SettingScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) => {
  const { user, setUser } = useContext(AuthContext);

  const handlePress = () => {
    Alert.alert("Comming soon!");
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/** HEADER */}
      <View className="-mt-20 bg-blue-300">
        <View className="mb-4 items-center pt-20 ">
          <Image
            className="mt-4 h-28 w-28 rounded-full border border-white"
            source={require('../../assets/images/user-default.jpg')}
          />
          <Text className="mt-4 font-bold">{user?.FullName || "NO INFORMATION"}</Text>
          <Text className="mt-2 text-gray-600">{user?.Phone || "NO INFORMATION"}</Text>
          <Pressable 
            className='absolute right-6 top-24 rounded-full p-2 bg-white'
            onPress={handlePress}>
            <FontAwesomeIcon icon={faPen} color='#000' size={12}/>
          </Pressable>
        </View>
      </View>

      {/** BODY */}
      <View className='px-4'>
        <Pressable 
            className='flex-row items-center py-4 px-2 border-b border-gray-200'
            onPress={handlePress}>
            <FontAwesomeIcon icon={faFileContract} size={24} color='#4b5563'/>
            <Text className='ml-2 text-gray-600'>Terms and Conditions</Text>
        </Pressable>

        <Pressable 
            className='flex-row items-center py-4 px-2'
            onPress={handlePress}>
            <FontAwesomeIcon icon={faShieldHalved} size={24} color='#4b5563'/>
            <Text className='ml-2 text-gray-600'>Privacy Policy</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SettingScreen;
