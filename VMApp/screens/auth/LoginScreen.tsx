import { useAuth } from 'contexts/AuthContext';
import { useState } from 'react';
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
  Pressable,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -240 : 0}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-8">
            <View className="mb-4 items-center">
              <FontAwesomeIcon icon={faCar} size={48} />
            </View>
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
            <TouchableOpacity
              disabled={isLoading}
              className={`rounded-lg py-3 ${isLoading ? 'bg-gray-500' : 'bg-blue-500'}`}
              onPress={handleLogin}>
              <Text className="text-center font-bold text-white">
                {' '}
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View className="mt-6 rounded-2xl border px-4 py-2">
              <Text className="mb-4">Developer Tool - Quick Login</Text>
              <View className="mb-2 flex-row justify-between">
                {quickLoginRoles.map((role, index) => (
                  <Pressable
                    key={index}
                    className={`mx-1 flex-1 rounded-lg px-4 py-3 ${
                      activeRole === role.title ? 'bg-blue-300' : 'bg-blue-100'
                    }`}
                    onPress={() => handleQuickLogin(role)}>
                    <Text className="text-center font-medium text-blue-800">{role.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
