import { showToast } from '@/utils/toast';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import * as yup from 'yup';

import InputField from '@/components/ui/InputFieldComponent';

interface LoginType {
  username: string;
  password: string;
}

const LoginScreen = () => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('vi-VN');
  const [showPasswords, setShowPasswords] = useState(false);

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
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        if (savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage);
        }
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
          onPress={() => handleLanguageChange('vi-VN')}
          className={`rounded-lg p-2 ${currentLanguage === 'vi-VN' ? 'border-2 border-blue-500 bg-blue-100' : 'bg-gray-100'}`}>
          <CountryFlag isoCode="vn" size={14} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleLanguageChange('en-US')}
          className={`rounded-lg p-2 ${currentLanguage === 'en-US' ? 'border-2 border-blue-500 bg-blue-100' : 'bg-gray-100'}`}>
          <CountryFlag isoCode="us" size={14} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-8">
          <View className="mb-8 items-center">
            <Image
              source={require('@/assets/images/VMS.png')}
              className="h-24 items-center"
              resizeMode="contain"
            />
          </View>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
