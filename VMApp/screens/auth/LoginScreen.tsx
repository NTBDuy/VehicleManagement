import { AuthContext } from 'contexts/AuthContext';
import { useContext, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import User from 'types/User';

type LoginScreenProps = {
  setIsLoggedIn: (value: boolean) => void;
};

const account: User[] = [
  {
    UserId: 1,
    Username: 'Admin',
    PasswordHash: 'Admin@123',
    FullName: 'Admin',
    Email: 'admin@vms.com',
    Phone: '0123456789',
    Role: 0,
    Status: true,
  },
  {
    UserId: 2,
    Username: 'Manager',
    PasswordHash: 'Manager@123',
    FullName: 'Manager',
    Email: 'manager@vms.com',
    Phone: '0123456798',
    Role: 2,
    Status: true,
  },
  {
    UserId: 2,
    Username: 'Employee',
    PasswordHash: 'Employee@123',
    FullName: 'Employee',
    Email: 'Employee@vms.com',
    Phone: '0123456978',
    Role: 1,
    Status: true,
  },
];

const LoginScreen = ({ setIsLoggedIn }: LoginScreenProps) => {
  const { setUser } = useContext(AuthContext);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const matchedUser = account.find(
      (user) =>
        user.Username.toLocaleLowerCase === username.toLocaleLowerCase &&
        user.PasswordHash === password
    );

    if (matchedUser) {
      Alert.alert('Login Successful', `Welcome, ${matchedUser.FullName}!`);
      setUser(matchedUser);
      setIsLoggedIn(true);
    } else {
      Alert.alert('Error', 'Incorrect username or password.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -240 : 0}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-8">
            <View className="mb-8">
              <Text className="text-center text-3xl font-bold">VMS Login</Text>
            </View>
            <View className="mb-4">
              <TextInput
                className="rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <View className="mb-6">
              <TextInput
                className="rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <TouchableOpacity className="rounded-lg bg-blue-500 py-3" onPress={handleLogin}>
              <Text className="text-center font-bold text-white">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
