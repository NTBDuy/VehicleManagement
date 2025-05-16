import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

import HomeScreen from 'screens/employee/HomeScreen';
import NotificationScreen from 'screens/shared/NotificationScreen';
import SettingScreen from 'screens/shared/SettingScreen';
import SidebarCustom from 'components/SidebarCustom';

const Drawer = createDrawerNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ManagerHome" component={HomeScreen} />
      <HomeStack.Screen name="Notification" component={NotificationScreen} />
    </HomeStack.Navigator>
  );
}

export default function EmployeeNavigator({
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
