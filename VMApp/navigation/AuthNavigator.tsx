import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from 'screens/auth/LoginScreen';

const AuthStack = createNativeStackNavigator();

export default function AuthNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}
