import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from 'screens/auth/LoginScreen';

const AuthStack = createNativeStackNavigator();

export default function AuthNavigator({
}: {
}) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {() => <LoginScreen  />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}
