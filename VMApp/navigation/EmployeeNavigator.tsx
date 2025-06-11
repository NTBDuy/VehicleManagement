import {
  faCalendarPlus,
  faClockRotateLeft,
  faGear,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ChangePasswordScreen from '@/screens/profile/ChangePasswordScreen';
import HomeScreen from 'screens/dashboard/EmployeeDashboard';
import NotificationScreen from 'screens/notification/NotificationScreen';
import EditProfileScreen from 'screens/profile/EditProfileScreen';
import SettingScreen from 'screens/profile/SettingScreen';
import NewRequest from 'screens/request/RequestCreateScreen';
import RequestDetailScreen from 'screens/request/RequestDetailScreen';
import HistoryRequestScreen from 'screens/request/RequestHistoryScreen';
import RequestInProgress from 'screens/request/RequestInProgress';
import FindLocationScreen from '@/screens/request/FindLocationScreen';

import SidebarComponent from '@/components/layout/SidebarComponent';

const Drawer = createDrawerNavigator();
const DashboardStack = createNativeStackNavigator();
const NewRequestStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const SettingStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="Dashboard" component={HomeScreen} />
      <DashboardStack.Screen name="Notification" component={NotificationScreen} />
      <DashboardStack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <DashboardStack.Screen name="NewRequestStack" component={NewRequest} />
      <DashboardStack.Screen name="HistoryStack" component={HistoryRequestScreen} />
      <DashboardStack.Screen name="InProgress" component={RequestInProgress} />
    </DashboardStack.Navigator>
  );
}

function NewRequestStackScreen() {
  return (
    <NewRequestStack.Navigator screenOptions={{ headerShown: false }}>
      <NewRequestStack.Screen name="NewRequest" component={NewRequest} />
      <NewRequestStack.Screen name="FindLocation" component={FindLocationScreen} />
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

export default function EmployeeNavigator() {
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
          title: t('sidebar.history.all'),
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
