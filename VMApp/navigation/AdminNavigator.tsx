import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faUsers,
  faCalendarCheck,
  faGear,
  faChartArea,
  faCarSide,
} from '@fortawesome/free-solid-svg-icons';

import HomeScreen from 'screens/admin/HomeScreen';
import NotificationScreen from 'screens/shared/NotificationScreen';
import SettingScreen from 'screens/shared/SettingScreen';
import ReportScreen from 'screens/shared/ReportScreen';
import RequestScreen from 'screens/manager/RequestScreen';
import AccountScreen from 'screens/admin/account/AccountScreen';
import AccountDetailScreen from 'screens/admin/account/AccountDetailScreen';
import AccountEditScreen from 'screens/admin/account/AccountEditScreen';
import AccountAddScreen from 'screens/admin/account/AccountAddScreen';
import VehicleScreen from 'screens/shared/vehicle/VehicleScreen';
import VehicleDetailScreen from 'screens/shared/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/shared/vehicle/VehicleEditScreen';
import VehicleAddScreen from 'screens/shared/vehicle/VehicleAddScreen';
import EditProfileScreen from 'screens/shared/EditProfileScreen';

import SidebarComponent from 'components/SidebarComponent';

const Drawer = createDrawerNavigator();
const HomeStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AdminHome" component={HomeScreen} />
      <HomeStack.Screen name="Notification" component={NotificationScreen} />
    </HomeStack.Navigator>
  );
}

function AccountStackScreen() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountManagement" component={AccountScreen} />
      <AccountStack.Screen name="AccountDetail" component={AccountDetailScreen} />
      <AccountStack.Screen name="AccountEdit" component={AccountEditScreen} />
      <AccountStack.Screen name="AccountAdd" component={AccountAddScreen} />
    </AccountStack.Navigator>
  );
}

function VehicleStackScreen() {
  return (
    <VehicleStack.Navigator screenOptions={{ headerShown: false }}>
      <VehicleStack.Screen name="VehicleManagement" component={VehicleScreen} />
      <VehicleStack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
      <VehicleStack.Screen name="VehicleEdit" component={VehicleEditScreen} />
      <VehicleStack.Screen name="VehicleAdd" component={VehicleAddScreen} />
    </VehicleStack.Navigator>
  );
}

function SettingStackScreen() {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="SettingScreen" component={SettingScreen} />
      <SettingStack.Screen name='EditProfile' component={EditProfileScreen} />
    </SettingStack.Navigator>
  )
}

export default function AdminNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <Drawer.Navigator
      initialRouteName="HomeStack"
      drawerContent={(props) => <SidebarComponent {...props} setIsLoggedIn={setIsLoggedIn} />}>
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
        name="AccountStack"
        component={AccountStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUsers} color={color} size={size} />
          ),
          title: 'Account Management',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="VehicleStack"
        component={VehicleStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCarSide} color={color} size={size} />
          ),
          title: 'Vehicle Management',
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
        name="SettingStack"
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faGear} color={color} size={size} />
          ),
          title: 'Setting',
          headerShown: false,
        }}
        component={SettingStackScreen}></Drawer.Screen>
    </Drawer.Navigator>
  );
}
