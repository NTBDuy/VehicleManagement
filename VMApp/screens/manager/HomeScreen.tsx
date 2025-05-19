import { Text, SafeAreaView, Pressable } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import HeaderComponent from 'components/HeaderComponent';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/** HEADER */}
      <HeaderComponent
        customTitle={<Text className="text-2xl font-bold">Hi {user?.FullName}</Text>}
        rightElement={
          <Pressable 
            className="rounded-full bg-white p-2"
            onPress={() => navigation.navigate("Notification")}>
            <FontAwesomeIcon icon={faBell} size={18} />
          </Pressable>
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
