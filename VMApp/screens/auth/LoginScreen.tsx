import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showToast } from 'utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryFlag from "react-native-country-flag";

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
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<string>('');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, [i18n]);

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

  const handleLanguageChange = async (lang: string) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute top-24 right-6 z-10 flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleLanguageChange('en-US')}
          className={`rounded-lg p-2 ${currentLanguage === 'en-US' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
        >
          <CountryFlag isoCode="us" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleLanguageChange('vi-VN')}
          className={`rounded-lg p-2 ${currentLanguage === 'vi-VN' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
        >
          <CountryFlag isoCode="vn" size={20} />
        </TouchableOpacity>
      </View>

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
              placeholder={t('auth.username')}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View className="mb-6">
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-2"
              placeholder={t('auth.password')}
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
              {isLoading ? `${t('auth.loggingIn')}...` : `${t('auth.title')}`}
            </Text>
          </TouchableOpacity>

          <View className="mt-6 rounded-2xl border px-4 py-2">
            <Text className="mb-4">Developer Tool - Quick Login</Text>
            <View className="mb-2 flex-row justify-between">
              {quickLoginRoles.map((role, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={isLoading}
                  className={`mx-1 flex-1 rounded-lg px-4 py-3 ${
                    activeRole === role.title ? 'bg-blue-300' : 'bg-blue-100'
                  }`}
                  onPress={() => handleQuickLogin(role)}>
                  <Text className="text-center font-medium text-blue-800">{role.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;