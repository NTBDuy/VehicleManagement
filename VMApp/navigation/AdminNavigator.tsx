import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faUsers,
  faCalendarPlus,
  faGear,
  faClockRotateLeft,
  faCarSide,
} from '@fortawesome/free-solid-svg-icons';

import HomeScreen from 'screens/dashboard/AdminDashboard';
import NotificationScreen from 'screens/notification/NotificationScreen';
import SettingScreen from 'screens/profile/SettingScreen';
import AccountScreen from 'screens/account/AccountScreen';
import AccountDetailScreen from 'screens/account/AccountDetailScreen';
import AccountEditScreen from 'screens/account/AccountEditScreen';
import AccountAddScreen from 'screens/account/AccountAddScreen';
import VehicleScreen from 'screens/vehicle/VehicleScreen';
import VehicleDetailScreen from 'screens/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/vehicle/VehicleEditScreen';
import VehicleAddScreen from 'screens/vehicle/VehicleAddScreen';
import EditProfileScreen from 'screens/profile/EditProfileScreen';
import NewRequest from 'screens/request/RequestCreateScreen';
import HistoryBookingScreen from 'screens/request/RequestHistoryScreen';
import RequestDetailScreen from 'screens/request/RequestDetailScreen';

import SidebarComponent from 'components/SidebarComponent';

const Drawer = createDrawerNavigator();
const DashboardStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();
const NewRequestStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="AdminHome" component={HomeScreen} />
      <DashboardStack.Screen name="Notification" component={NotificationScreen} />
    </DashboardStack.Navigator>
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
      <SettingStack.Screen name="EditProfile" component={EditProfileScreen} />
    </SettingStack.Navigator>
  );
}

function NewRequestStackScreen() {
  return (
    <NewRequestStack.Navigator screenOptions={{ headerShown: false }}>
      <NewRequestStack.Screen name="NewRequest" component={NewRequest} />
    </NewRequestStack.Navigator>
  );
}

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryScreen" component={HistoryBookingScreen} />
      <HistoryStack.Screen name="RequestDetail" component={RequestDetailScreen} />
    </HistoryStack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardStack"
      drawerContent={(props) => <SidebarComponent {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen
        name="DashboardStack"
        component={DashboardStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faHome} color={color} size={size} />
          ),
          title: 'Dashboard',
        }}
      />

      <Drawer.Screen
        name="NewRequestStack"
        component={NewRequestStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCalendarPlus} color={color} size={size} />
          ),
          title: 'New Request',
        }}
      />

      <Drawer.Screen
        name="HistoryStack"
        component={HistoryStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faClockRotateLeft} color={color} size={size} />
          ),
          title: 'History Request',
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
        }}
      />

      <Drawer.Screen
        name="SettingStack"
        component={SettingStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faGear} color={color} size={size} />
          ),
          title: 'Setting',
        }}
      />
    </Drawer.Navigator>
  );
}
