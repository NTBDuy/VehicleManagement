import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'contexts/AuthContext';
import { showToast } from 'utils/toast';

type QuickLoginRole = {
  title: string;
  Username: string;
  password: string;
};

const quickLoginRoles: QuickLoginRole[] = [
  { title: 'Admin', Username: 'john.doe', password: 'P@ssword123' },
  { title: 'Employee', Username: 'michael.brown', password: 'P@ssword123' },
  { title: 'Manager', Username: 'jane.smith', password: 'P@ssword123' },
];

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<string>('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showToast.error('Missing info', 'Please fill in both fields to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (error) {
      showToast.error('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: QuickLoginRole) => {
    setUsername(role.Username);
    setPassword(role.password);
    setActiveRole(role.title);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="justify-center flex-1 px-6 py-8">
          <View className="items-center mb-4">
            <FontAwesomeIcon icon={faCar} size={48} />
          </View>
          <View className="mb-8">
            <Text className="text-3xl font-bold text-center">VMS Login</Text>
          </View>
          <View className="mb-4">
            <TextInput
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View className="mb-6">
            <TextInput
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            disabled={isLoading}
            className={`rounded-lg py-3 ${isLoading ? 'bg-gray-500' : 'bg-blue-500'}`}
            onPress={handleLogin}>
            <Text className="font-bold text-center text-white">
              {' '}
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View className="px-4 py-2 mt-6 border rounded-2xl">
            <Text className="mb-4">Developer Tool - Quick Login</Text>
            <View className="flex-row justify-between mb-2">
              {quickLoginRoles.map((role, index) => (
                <Pressable
                  key={index}
                  className={`mx-1 flex-1 rounded-lg px-4 py-3 ${
                    activeRole === role.title ? 'bg-blue-300' : 'bg-blue-100'
                  }`}
                  onPress={() => handleQuickLogin(role)}>
                  <Text className="font-medium text-center text-blue-800">{role.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
