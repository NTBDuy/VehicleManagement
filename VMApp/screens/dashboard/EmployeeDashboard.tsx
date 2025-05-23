import { Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import Header from 'components/HeaderComponent';
import { useNavigation } from '@react-navigation/native';
import WelcomeSection from 'components/WelcomeSectionComponent';

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/** HEADER */}
      <Header
        title='Employee Dashboard'
        rightElement={
          <Pressable
            className="rounded-full bg-white p-2"
            onPress={() => navigation.navigate('Notification')}>
            <FontAwesomeIcon icon={faBell} size={18} />
          </Pressable>
        }
      />

      <ScrollView className="px-6">
        {/* Welcome Section */}
        <WelcomeSection user={user} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
