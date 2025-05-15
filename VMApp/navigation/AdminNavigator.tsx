import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from 'screens/admin/HomeScreen';

const AdminStack = createNativeStackNavigator();

export default function AdminNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="Home" component={HomeScreen} />
    </AdminStack.Navigator>
  );
}
