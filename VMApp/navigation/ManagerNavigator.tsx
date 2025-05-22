import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faCalendarCheck,
  faGear,
  faChartArea,
  faCarSide,
  faCalendarPlus
} from '@fortawesome/free-solid-svg-icons';

import HomeScreen from 'screens/manager/HomeScreen';
import NotificationScreen from 'screens/shared/NotificationScreen';
import SettingScreen from 'screens/shared/SettingScreen';
import ReportScreen from 'screens/shared/ReportScreen';
import RequestScreen from 'screens/manager/RequestScreen';
import VehicleScreen from 'screens/shared/vehicle/VehicleScreen';
import VehicleDetailScreen from 'screens/shared/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/shared/vehicle/VehicleEditScreen';
import VehicleAddScreen from 'screens/shared/vehicle/VehicleAddScreen';
import SidebarComponent from 'components/SidebarComponent';
import RequestDetailScreen from 'screens/manager/RequestDetailScreen';
import BookingScreen from 'screens/shared/BookingScreen';
import EditProfileScreen from 'screens/shared/EditProfileScreen';

const Drawer = createDrawerNavigator();
const HomeStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const RequestStack = createNativeStackNavigator();
const BookingStack = createNativeStackNavigator();
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

function SettingStackScreen() {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="SettingScreen" component={SettingScreen} />
      <SettingStack.Screen name='EditProfile' component={EditProfileScreen} />
    </SettingStack.Navigator>
  )
}

export default function ManagerNavigator({
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
