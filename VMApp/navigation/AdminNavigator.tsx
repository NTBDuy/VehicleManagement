import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faUser, faUsers, faSignOut, faCar, faCalendarCheck, faGear, faChartArea, faCarSide } from '@fortawesome/free-solid-svg-icons';

import HomeScreen from 'screens/admin/HomeScreen';
import NotificationScreen from 'screens/admin/NotificationScreen';
import SettingScreen from 'screens/admin/SettingScreen';
import AccountScreen from 'screens/admin/AccountScreen';
import ReportScreen from 'screens/admin/ReportScreen';
import RequestScreen from 'screens/admin/RequestScreen';
import VehicleScreen from 'screens/admin/VehicleScreen';

import { Alert, View, Text } from 'react-native';

const HomeStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AdminHome" component={HomeScreen} />
      <HomeStack.Screen name='Notification' component={NotificationScreen}/>
    </HomeStack.Navigator>
  );
}

function SidebarCustom(props: any) {
  const { setIsLoggedIn } = props;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header */}
      <View className="mb-4 items-center justify-center border-b border-gray-200 py-6">
        <FontAwesomeIcon icon={faCar} size={30} color="#1f2937" />
        <Text className="mt-2 text-xl font-bold text-gray-800">Vehicle Management</Text>
      </View>

      {/* Menu items */}
      <View className="flex-1 px-4">
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View className="border-t border-gray-200 px-4 pt-4">
        <DrawerItem
          label="Log out"
          labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
          icon={({ size }) => <FontAwesomeIcon icon={faSignOut} color={'#ef4444'} size={size} />}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                  setIsLoggedIn(false);
                },
              },
            ]);
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function AdminNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <Drawer.Navigator
      initialRouteName="HomeStack"
      drawerContent={(props) => <SidebarCustom {...props} setIsLoggedIn={setIsLoggedIn} />}>
      <Drawer.Screen
        name="HomeStack"
        component={HomeStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faHome} color={color} size={size} />
          ),
          title: 'Home',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Account"
        component={AccountScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUsers} color={color} size={size} />
          ),
          title: 'Account Management',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Vehicle"
        component={VehicleScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCarSide} color={color} size={size} />
          ),
          title: 'Vehicle Management',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Request"
        component={RequestScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCalendarCheck} color={color} size={size} />
          ),
          title: 'Request Management',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Report"
        component={ReportScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faChartArea} color={color} size={size} />
          ),
          title: 'Report & Analysis',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Setting"
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faGear} color={color} size={size} />
          ),
          title: 'Setting',
          headerShown: false,
        }}>
        {() => <SettingScreen setIsLoggedIn={setIsLoggedIn} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
