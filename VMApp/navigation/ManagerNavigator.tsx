import {
  faCalendarCheck,
  faCalendarPlus,
  faCarSide,
  faChartSimple,
  faClockRotateLeft,
  faGear,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ChangePasswordScreen from '@/screens/profile/ChangePasswordScreen';
import RequestApproval from '@/screens/statistics/RequestStatistic';
import VehicleManagementScreen from '@/screens/vehicle/VehicleManagementScreen';
import HomeScreen from 'screens/dashboard/ManagerDashboard';
import NotificationScreen from 'screens/notification/NotificationScreen';
import EditProfileScreen from 'screens/profile/EditProfileScreen';
import SettingScreen from 'screens/profile/SettingScreen';
import NewRequest from 'screens/request/RequestCreateScreen';
import RequestDetailScreen from 'screens/request/RequestDetailScreen';
import HistoryRequestScreen from 'screens/request/RequestHistoryScreen';
import RequestInProgress from 'screens/request/RequestInProgress';
import RequestScreen from 'screens/request/RequestScreen';
import ScheduleMaintenance from 'screens/vehicle/ScheduleMaintenance';
import VehicleAddScreen from 'screens/vehicle/VehicleAddScreen';
import VehicleDetailScreen from 'screens/vehicle/VehicleDetailScreen';
import VehicleEditScreen from 'screens/vehicle/VehicleEditScreen';

import SidebarComponent from '@/components/layout/SidebarComponent';

const Drawer = createDrawerNavigator();
const DashboardStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const RequestStack = createNativeStackNavigator();
const NewRequestStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();
const MaintenanceStack = createNativeStackNavigator();
const StatisticStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="ManagerHome" component={HomeScreen} />
      <DashboardStack.Screen name="Notification" component={NotificationScreen} />
    </DashboardStack.Navigator>
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

function RequestStackScreen() {
  return (
    <RequestStack.Navigator screenOptions={{ headerShown: false }}>
      <RequestStack.Screen name="RequestManagement" component={RequestScreen} />
      <RequestStack.Screen name="RequestDetail" component={RequestDetailScreen} />
    </RequestStack.Navigator>
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

function SettingStackScreen() {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="SettingScreen" component={SettingScreen} />
      <SettingStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </SettingStack.Navigator>
  );
}

function StatisticStackScreen() {
  return (
    <StatisticStack.Navigator screenOptions={{ headerShown: false }}>
      <StatisticStack.Screen name="RequestStatistic" component={RequestApproval} />
      <StatisticStack.Screen name="RequestDetail" component={RequestDetailScreen} />
    </StatisticStack.Navigator>
  );
}

export default function ManagerNavigator() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      initialRouteName="DashboardStack"
      drawerContent={(props) => <SidebarComponent {...props} />}>
      <Drawer.Screen
        name="DashboardStack"
        component={DashboardStackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faHome} color={color} size={size} />
          ),
          title: t('dashboard.title'),
          headerShown: false,
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
          title: t('sidebar.history.personal'),
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
          title: t('sidebar.management.request'),
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
          title: t('sidebar.management.vehicle'),
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
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faGear} color={color} size={size} />
          ),
          title: t('sidebar.setting'),
          headerShown: false,
        }}
        component={SettingStackScreen}></Drawer.Screen>
    </Drawer.Navigator>
  );
}
