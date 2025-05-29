import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from 'contexts/AuthContext';

import AdminNavigator from 'navigation/AdminNavigator';
import AuthNavigator from 'navigation/AuthNavigator';
import EmployeeNavigator from 'navigation/EmployeeNavigator';
import ManagerNavigator from 'navigation/ManagerNavigator';

const RootStack = createNativeStackNavigator();

export default function AppContent() {
  const { isAuthenticated, user } = useAuth();
 
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          <RootStack.Screen name="LoggedIn">
            {() => (
              <>
                {user.role === 0 ? (
                  <AdminNavigator />
                ) : user.role === 1 ? (
                  <EmployeeNavigator />
                ) : user.role === 2 ? (
                  <ManagerNavigator />
                ) : null}
              </>
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
