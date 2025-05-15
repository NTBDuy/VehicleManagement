import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from 'screens/manager/HomeScreen';

const ManagerStack = createNativeStackNavigator();

export default function ManagerNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <ManagerStack.Navigator screenOptions={{ headerShown: false }}>
      <ManagerStack.Screen name="Home" component={HomeScreen} />
    </ManagerStack.Navigator>
  );
}
