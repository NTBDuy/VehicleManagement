import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';

const NotificationButton = ({ notificationCount }: { notificationCount: number }) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      className="relative rounded-full bg-white p-2"
      onPress={() => navigation.navigate('Notification')}>
      <FontAwesomeIcon icon={faBell} size={18} />
      {notificationCount > 0 && (
        <View className="absolute -right-2 -top-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500">
          <Text className="text-center text-xs font-bold text-white">
            {notificationCount > 99 ? '99+' : notificationCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationButton;
