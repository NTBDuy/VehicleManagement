import { faCar, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { showToast } from 'utils/toast';

import InputField from '@/components/ui/InputFieldComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryFlag from 'react-native-country-flag';

type QuickLoginRole = {
  title: string;
  Username: string;
  password: string;
};

interface LoginType {
  username: string;
  password: string;
}

const quickLoginRolesEn: QuickLoginRole[] = [
  { title: 'Admin', Username: 'john.doe', password: 'P@ssword123' },
  { title: 'Employee', Username: 'michael.brown', password: 'P@ssword123' },
  { title: 'Manager', Username: 'jane.smith', password: 'P@ssword123' },
];

const quickLoginRolesVi: QuickLoginRole[] = [
  { title: 'Admin', Username: 'duc.nguyenvan', password: 'P@ssword123' },
  { title: 'Employee', Username: 'son.leminh', password: 'P@ssword123' },
  { title: 'Manager', Username: 'lan.tranthi', password: 'P@ssword123' },
];

const LoginScreen = () => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('');
  const [errors, setErrors] = useState<Partial<LoginType>>({});
  const [showPasswords, setShowPasswords] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginType> = {};

    if (!username?.trim()) {
      newErrors.username = t('validate.required.username') as string;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!password?.trim()) {
      newErrors.password = t('validate.required.password') as string;
    } else if (!passwordRegex.test(password)) {
      newErrors.password = t('validate.regex.password');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
      return;
    }

    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (error) {
      console.log(error)
      // showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
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

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute right-6 top-24 z-10 flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleLanguageChange('en-US')}
          className={`rounded-lg p-2 ${currentLanguage === 'en-US' ? 'border-2 border-blue-500 bg-blue-100' : 'bg-gray-100'}`}>
          <CountryFlag isoCode="us" size={14} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleLanguageChange('vi-VN')}
          className={`rounded-lg p-2 ${currentLanguage === 'vi-VN' ? 'border-2 border-blue-500 bg-blue-100' : 'bg-gray-100'}`}>
          <CountryFlag isoCode="vn" size={14} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-8">
          <View className="mb-4 items-center">
            <FontAwesomeIcon icon={faCar} size={48} />
          </View>
          <View className="mb-8">
            <Text className="text-center text-3xl font-bold">{t('common.vms')}</Text>
          </View>
          <View className="mb-6">
            <InputField
              label={t('common.fields.username')}
              value={username}
              onChangeText={setUsername}
              error={errors.username as string}
            />
            <InputField
              label={t('common.fields.password')}
              value={password}
              onChangeText={setPassword}
              error={errors.password as string}
              secureTextEntry={!showPasswords}
              rightIcon={
                <TouchableOpacity onPress={() => togglePasswordVisibility()}>
                  <FontAwesomeIcon
                    icon={showPasswords ? faEyeSlash : faEye}
                    size={16}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              }
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
              {(currentLanguage === 'en-US' ? quickLoginRolesEn : quickLoginRolesVi).map(
                (role, index) => (
                  <TouchableOpacity
                    key={index}
                    disabled={isLoading}
                    className={`mx-1 flex-1 rounded-lg px-4 py-3 ${
                      activeRole === role.title ? 'bg-blue-300' : 'bg-blue-100'
                    }`}
                    onPress={() => handleQuickLogin(role)}>
                    <Text className="text-center font-medium text-blue-800">{role.title}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
