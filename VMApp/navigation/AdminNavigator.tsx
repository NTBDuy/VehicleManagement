import {
  faCalendarPlus,
  faCarSide,
  faClockRotateLeft,
  faGear,
  faHome,
  faTools,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UserAddScreen from '@/screens/user/UserAddScreen';
import UserDetailScreen from '@/screens/user/UserDetailsScreen';
import UserEditScreen from '@/screens/user/UserEditScreen';
import UserManagementScreen from '@/screens/user/UserManagementScreen';
import MaintenanceDetailScreen from '@/screens/vehicle/MaintenanceDetailScreen';
import VehicleManagementScreen from '@/screens/vehicle/VehicleManagementScreen';
import HomeScreen from 'screens/dashboard/AdminDashboard';
import NotificationScreen from 'screens/notification/NotificationScreen';
import EditProfileScreen from 'screens/profile/EditProfileScreen';
import SettingScreen from 'screens/profile/SettingScreen';
import NewRequest from 'screens/request/RequestCreateScreen';
import RequestDetailScreen from 'screens/request/RequestDetailScreen';
import HistoryNewRequestScreen from 'screens/request/RequestHistoryScreen';
import MaintenanceManagement from 'screens/vehicle/MaintenanceManagement';
import VehicleAddScreen from 'screens/vehicle/VehicleAddScreen';
import VehicleDetailScreen from 'screens/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/vehicle/VehicleEditScreen';

import SidebarComponent from 'components/SidebarComponent';

const Drawer = createDrawerNavigator();
const DashboardStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();
const NewRequestStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const MaintenanceStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="AdminHome" component={HomeScreen} />
      <DashboardStack.Screen name="Notification" component={NotificationScreen} />
    </DashboardStack.Navigator>
  );
}

function UserStackScreen() {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      <UserStack.Screen name="UserManagement" component={UserManagementScreen} />
      <UserStack.Screen name="UserDetail" component={UserDetailScreen} />
      <UserStack.Screen name="UserEdit" component={UserEditScreen} />
      <UserStack.Screen name="UserAdd" component={UserAddScreen} />
    </UserStack.Navigator>
  );
}

function VehicleStackScreen() {
  return (
    <VehicleStack.Navigator screenOptions={{ headerShown: false }}>
      <VehicleStack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
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
      <HistoryStack.Screen name="HistoryScreen" component={HistoryNewRequestScreen} />
      <HistoryStack.Screen name="RequestDetail" component={RequestDetailScreen} />
    </HistoryStack.Navigator>
  );
}

function MaintenanceStackScreen() {
  return (
    <MaintenanceStack.Navigator screenOptions={{ headerShown: false }}>
      <MaintenanceStack.Screen name='Maintenance' component={MaintenanceManagement}/>
      <MaintenanceStack.Screen name='MaintenanceDetails' component={MaintenanceDetailScreen}/>
    </MaintenanceStack.Navigator>
  )
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
          title: 'Personal History Request',
        }}
      />

      <Drawer.Screen
        name="UserStack"
        component={UserStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUsers} color={color} size={size} />
          ),
          title: 'User Management',
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
        name="MaintenanceStack"
        component={MaintenanceStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faTools} color={color} size={size} />
          ),
          title: 'Maintenance Management',
          headerShown: false,
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
