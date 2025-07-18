import { showToast } from '@/utils/toast';
import { faCar, faCross, faEye, faEyeSlash, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import * as yup from 'yup';

import InputField from '@/components/ui/InputFieldComponent';

type QuickLoginRole = {
  title: string;
  Username: string;
  password: string;
};

interface LoginType {
  username: string;
  password: string;
}

const quickLoginRolesVi: QuickLoginRole[] = [
  { title: 'Admin', Username: 'duc.nguyenvan', password: 'P@ssword123' },
  { title: 'Employee', Username: 'son.leminh', password: 'P@ssword123' },
  { title: 'Manager', Username: 'lan.tranthi', password: 'P@ssword123' },
];

const LoginScreen = () => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('vi-VN');
  const [activeRole, setActiveRole] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [countPress, setCountPress] = useState(0);
  const [isOpenTool, setIsOpenTool] = useState(false);

  const loginSchema = yup.object().shape({
    username: yup.string().required(t('validate.required.username')).trim(),
    password: yup
      .string()
      .required(t('validate.required.password'))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, t('validate.regex.password')),
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginType>({
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
        setCurrentLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, [i18n]);

  const onSubmit = async (data: LoginType) => {
    try {
      await login({ username: data.username.trim(), password: data.password });
    } catch (error) {
      console.log(error);
      showToast.error(t('common.error.title'), t('common.error.generic'));
    }
  };

  const handleQuickLogin = (role: QuickLoginRole) => {
    setValue('username', role.Username);
    setValue('password', role.password);
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

  const handleOpenDevTool = () => {
    const newCount = countPress + 1;
    setCountPress(newCount);
    if (newCount === 5) {
      setIsOpenTool(true);
    }
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
          <Pressable onPress={() => handleOpenDevTool()}>
            <View className="mb-4 items-center">
              <FontAwesomeIcon icon={faCar} size={48} />
            </View>
            <View className="mb-8">
              <Text className="text-center text-3xl font-bold">{t('common.vms')}</Text>
            </View>
          </Pressable>
          <View className="mb-4">
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.username')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.username?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.password')}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPasswords}
                  error={errors.password?.message}
                  rightIcon={
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                      <FontAwesomeIcon
                        icon={showPasswords ? faEyeSlash : faEye}
                        size={16}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />
          </View>
          <TouchableOpacity
            disabled={isSubmitting}
            className={`rounded-lg py-3 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500'}`}
            onPress={handleSubmit(onSubmit)}>
            <Text className="text-center font-bold text-white">
              {isSubmitting ? `${t('auth.loggingIn')}...` : `${t('auth.title')}`}
            </Text>
          </TouchableOpacity>

          {isOpenTool && (
            <View>
              <View className="mt-6 rounded-2xl border px-4 py-2">
                <Text className="mb-4">Developer Tool - Quick Login</Text>
                <View className="mb-2 flex-row justify-between">
                  {quickLoginRolesVi.map((role, index) => (
                    <TouchableOpacity
                      key={index}
                      disabled={isSubmitting}
                      className={`mx-1 flex-1 rounded-lg px-4 py-3 ${
                        activeRole === role.title ? 'bg-blue-300' : 'bg-blue-100'
                      }`}
                      onPress={() => handleQuickLogin(role)}>
                      <Text className="text-center font-medium text-blue-800">{role.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                className="absolute -right-3 top-3 rounded-full bg-black p-2"
                onPress={() => {
                  setIsOpenTool(false);
                  setCountPress(0);
                }}>
                <FontAwesomeIcon icon={faX} color="#fff" size={12} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
