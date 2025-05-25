import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faCalendarCheck,
  faGear,
  faClockRotateLeft,
  faCarSide,
  faCalendarPlus,
} from '@fortawesome/free-solid-svg-icons';

import HomeScreen from 'screens/dashboard/ManagerDashboard';
import NotificationScreen from 'screens/notification/NotificationScreen';
import SettingScreen from 'screens/profile/SettingScreen';
import RequestScreen from 'screens/request/RequestScreen';
import VehicleScreen from 'screens/vehicle/VehicleScreen';
import VehicleDetailScreen from 'screens/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/vehicle/VehicleEditScreen';
import VehicleAddScreen from 'screens/vehicle/VehicleAddScreen';
import SidebarComponent from 'components/SidebarComponent';
import RequestDetailScreen from 'screens/request/RequestDetailScreen';
import BookingScreen from 'screens/request/RequestCreateScreen';
import EditProfileScreen from 'screens/profile/EditProfileScreen';
import HistoryBookingScreen from 'screens/request/RequestHistoryScreen';

const Drawer = createDrawerNavigator();
const HomeStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const RequestStack = createNativeStackNavigator();
const BookingStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ManagerHome" component={HomeScreen} />
      <HomeStack.Screen name="Notification" component={NotificationScreen} />
    </HomeStack.Navigator>
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

function RequestStackScreen() {
  return (
    <RequestStack.Navigator screenOptions={{ headerShown: false }}>
      <RequestStack.Screen name="RequestManagement" component={RequestScreen} />
      <RequestStack.Screen name="RequestDetail" component={RequestDetailScreen} />
    </RequestStack.Navigator>
  );
}

function BookingStackScreen() {
  return (
    <BookingStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingStack.Screen name="BookingScreen" component={BookingScreen} />
    </BookingStack.Navigator>
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

function SettingStackScreen() {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="SettingScreen" component={SettingScreen} />
      <SettingStack.Screen name="EditProfile" component={EditProfileScreen} />
    </SettingStack.Navigator>
  );
}

export default function ManagerNavigator({}: {}) {
  return (
    <Drawer.Navigator
      initialRouteName="HomeStack"
      drawerContent={(props) => <SidebarComponent {...props} />}>
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
        name="BookingStack"
        component={BookingStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCalendarPlus} color={color} size={size} />
          ),
          title: 'Booking',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="HistoryStack"
        component={HistoryStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faClockRotateLeft} color={color} size={size} />
          ),
          title: 'History',
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="RequestStack"
        component={RequestStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCalendarCheck} color={color} size={size} />
          ),
          title: 'Request Management',
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
