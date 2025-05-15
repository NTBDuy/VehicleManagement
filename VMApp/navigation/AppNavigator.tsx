import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';

import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import ManagerNavigator from './ManagerNavigator';

const RootStack = createNativeStackNavigator();

export default function AppContent() {
  const { user, isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn && user ? (
          <RootStack.Screen name="LoggedIn">
            {() => (
              <>
                {user.Role === 0 ? (
                  <AdminNavigator setIsLoggedIn={setIsLoggedIn} />
                ) : user.Role === 1 ? (
                  <EmployeeNavigator setIsLoggedIn={setIsLoggedIn} />
                ) : user.Role === 2 ? (
                  <ManagerNavigator setIsLoggedIn={setIsLoggedIn} />
                ) : null}
              </>
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator setIsLoggedIn={setIsLoggedIn} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
