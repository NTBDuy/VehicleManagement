import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from 'screens/employee/HomeScreen';

const EmployeeStack = createNativeStackNavigator();

export default function EmployeeNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
      <EmployeeStack.Screen name="Home" component={HomeScreen} />
    </EmployeeStack.Navigator>
  );
}
