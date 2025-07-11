import {
  faCalendarPlus,
  faCarSide,
  faChartSimple,
  faClockRotateLeft,
  faGear,
  faHome,
  faPeopleGroup,
  faTools,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import DriverAddScreen from '@/screens/driver/DriverAddScreen';
import DriverDetailsScreen from '@/screens/driver/DriverDetailsScreen';
import DriverEditScreen from '@/screens/driver/DriverEditScreen';
import DriverManagement from '@/screens/driver/DriverManagement';
import ChangePasswordScreen from '@/screens/profile/ChangePasswordScreen';
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
import HistoryRequestScreen from 'screens/request/RequestHistoryScreen';
import MaintenanceManagement from 'screens/vehicle/MaintenanceManagement';
import ScheduleMaintenance from 'screens/vehicle/ScheduleMaintenance';
import VehicleAddScreen from 'screens/vehicle/VehicleAddScreen';
import VehicleDetailScreen from 'screens/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/vehicle/VehicleEditScreen';
import RequestInProgress from 'screens/request/RequestInProgress';
import AdminStatistic from '@/screens/statistics/AdminStatistic';

import SidebarComponent from '@/components/layout/SidebarComponent';

const Drawer = createDrawerNavigator();
const DashboardStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();
const NewRequestStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const MaintenanceStack = createNativeStackNavigator();
const DriverStack = createNativeStackNavigator();
const StatisticStack = createNativeStackNavigator();

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
      <VehicleStack.Screen name="ScheduleMaintenance" component={ScheduleMaintenance} />
    </VehicleStack.Navigator>
  );
}

function SettingStackScreen() {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="SettingScreen" component={SettingScreen} />
      <SettingStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
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
      <HistoryStack.Screen name="HistoryScreen" component={HistoryRequestScreen} />
      <HistoryStack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <HistoryStack.Screen name="InProgress" component={RequestInProgress} />
    </HistoryStack.Navigator>
  );
}

function MaintenanceStackScreen() {
  return (
    <MaintenanceStack.Navigator screenOptions={{ headerShown: false }}>
      <MaintenanceStack.Screen name="Maintenance" component={MaintenanceManagement} />
      <MaintenanceStack.Screen name="MaintenanceDetails" component={MaintenanceDetailScreen} />
    </MaintenanceStack.Navigator>
  );
}

function DriverStackScreen() {
  return (
    <DriverStack.Navigator screenOptions={{ headerShown: false }}>
      <DriverStack.Screen name="DriverManagement" component={DriverManagement} />
      <DriverStack.Screen name="DriverDetail" component={DriverDetailsScreen} />
      <DriverStack.Screen name="DriverEdit" component={DriverEditScreen} />
      <DriverStack.Screen name="DriverAdd" component={DriverAddScreen} />
    </DriverStack.Navigator>
  );
}

function StatisticStackScreen() {
  return (
    <StatisticStack.Navigator screenOptions={{ headerShown: false }}>
      <StatisticStack.Screen name="Statistic" component={AdminStatistic} />
    </StatisticStack.Navigator>
  );
}

export default function AdminNavigator() {
  const { t } = useTranslation();

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
          title: t('dashboard.title'),
        }}
      />

      <Drawer.Screen
        name="NewRequestStack"
        component={NewRequestStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCalendarPlus} color={color} size={size} />
          ),
          title: t('sidebar.newRequest'),
        }}
      />

      <Drawer.Screen
        name="HistoryStack"
        component={HistoryStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faClockRotateLeft} color={color} size={size} />
          ),
          title: t('sidebar.history.personal'),
        }}
      />

      <Drawer.Screen
        name="UserStack"
        component={UserStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUsers} color={color} size={size} />
          ),
          title: t('sidebar.management.user'),
        }}
      />

      <Drawer.Screen
        name="VehicleStack"
        component={VehicleStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCarSide} color={color} size={size} />
          ),
          title: t('sidebar.management.vehicle'),
        }}
      />

      <Drawer.Screen
        name="MaintenanceStack"
        component={MaintenanceStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faTools} color={color} size={size} />
          ),
          title: t('sidebar.management.maintenance'),
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="DriverStack"
        component={DriverStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faPeopleGroup} color={color} size={size} />
          ),
          title: t('sidebar.management.driver'),
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="StatisticStack"
        component={StatisticStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faChartSimple} color={color} size={size} />
          ),
          title: t('sidebar.management.statistic'),
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
          title: t('sidebar.setting'),
        }}
      />
    </Drawer.Navigator>
  );
}
