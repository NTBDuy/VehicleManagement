import { Text, SafeAreaView, Pressable, ScrollView, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell, faCalendarPlus, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Header from 'components/HeaderComponent';
import WelcomeSection from 'components/WelcomeSectionComponent';

import Request from 'types/Request';
import RequestItem from 'components/HistoryRequestItem';
import { UserService } from 'services/userService';

type employeeDashboardStat = {
  pending: Request[];
  incoming: Request[];
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [userRequest, setUserRequest] = useState<Request[]>([]);
  const [stat, setStat] = useState<employeeDashboardStat>({
    pending: [],
    incoming: [],
  });

  useEffect(() => {
    if (user) {
      getRequestByUserID();
      countUnread();
    }
  }, [user]);

  useEffect(() => {
    if (userRequest.length > 0) {
      statistics();
    }
  }, [userRequest]);

  useFocusEffect(
    useCallback(() => {
      getRequestByUserID();
      statistics();
      countUnread();
    }, [])
  );

  const countUnread = async () => {
    const totalNotifications = await UserService.getUserUnreadNotifications();
    setNotificationCount(totalNotifications);
  };

  const getRequestByUserID = async () => {
    const data = await UserService.getUserRequests();
    setUserRequest(data);
  };

  const statistics = () => {
    const pending = userRequest.filter((request) => request.status === 0);
    const incoming = userRequest.filter((request) => request.status === 1);
    setStat({ pending, incoming });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/** HEADER */}
      <Header
        title="Employee Dashboard"
        rightElement={
          <Pressable
            className="relative p-2 bg-white rounded-full"
            onPress={() => navigation.navigate('Notification')}>
            <FontAwesomeIcon icon={faBell} size={18} />
            {notificationCount > 0 && (
              <View className="absolute -right-2 -top-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500">
                <Text className="text-xs font-bold text-center text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </Pressable>
        }
      />

      <ScrollView className="px-6">
        {/* Welcome Section */}
        <WelcomeSection user={user} />

        <View className="mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Quick Actions</Text>
          </View>

          <View className="flex-row justify-between p-4">
            <Pressable
              onPress={() => {
                navigation.getParent()?.navigate('NewRequestStack');
              }}
              className="w-[48%] flex-row justify-center rounded-2xl bg-green-500 p-4 active:bg-green-600">
              <FontAwesomeIcon icon={faCalendarPlus} color="#fff" />
              <Text className="ml-2 font-bold text-white">Booking Now</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                navigation.getParent()?.navigate('HistoryStack');
              }}
              className="w-[48%] flex-row justify-center rounded-2xl bg-gray-500 p-4 active:bg-gray-600">
              <FontAwesomeIcon icon={faCalendarDays} color="#fff" />
              <Text className="ml-2 font-bold text-white">History Request</Text>
            </Pressable>
          </View>
        </View>

        {stat.pending.length > 0 && (
          <View className="mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-lg font-semibold text-gray-800">Pending</Text>
            </View>

            <View className="p-4 -mb-4">
              <View>
                {stat.pending.slice(0, 3).map((item) => (
                  <RequestItem item={item} key={item.requestId} />
                ))}
              </View>
            </View>
          </View>
        )}

        {stat.incoming.length > 0 && (
          <View className="mb-2 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-lg font-semibold text-gray-800">Incoming</Text>
            </View>

            <View className="p-4 -mb-4">
              <View>
                {stat.incoming.slice(0, 3).map((item) => (
                  <RequestItem item={item} key={item.requestId} />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployeeDashboard;
