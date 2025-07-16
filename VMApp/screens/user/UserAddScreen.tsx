import { faCircleInfo, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';
import { userSchema } from '@/validations/userSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import User from 'types/User';
import UserFormData from '@/types/UserFormData';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

const UserAddScreen = () => {
  const initialUserData = {
    userId: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    username: '',
    passwordHash: '',
    role: 1,
    status: true,
  };

  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<User>(initialUserData);

  const createUserSchema = userSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    },
    mode: 'onChange',
  });

  useFocusEffect(
    useCallback(() => {
      setUserData(initialUserData);
    }, [])
  );

  const roles = [
    { label: t('common.role.employee'), value: 1 },
    { label: t('common.role.manager'), value: 2 },
    { label: t('common.role.admin'), value: 0 },
  ];

  const onSubmit = async (data: UserFormData) => {
    try {
      const createUserData = {
        ...userData,
        ...data,
      };
      const result = await UserService.createUser(createUserData);
      showToast.success(
        `${t('common.success.title')}`,
        `${t('common.success.created', { item: t('common.items.user') })}`
      );
      navigation.navigate('UserDetail', { userData: result });
      reset({
        fullName: '',
        email: '',
        phoneNumber: '',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateUser = async () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title={t('user.add.title')} />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6 items-center">
          <View className="relative">
            <Image
              className="mt-4 h-24 w-24 rounded-full border-2 border-gray-200"
              source={require('@/assets/images/user-default.jpg')}
            />
            <TouchableOpacity className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-blue-500 p-2">
              <FontAwesomeIcon icon={faEdit} size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('user.detail.informationTitle')}
            </Text>
          </View>
          <View className="p-4">
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.fullname')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.email')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t('common.fields.phone')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.phoneNumber?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {' '}
              {t('user.detail.detailTitle')}
            </Text>
          </View>
          <View className="p-4">
            <View className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCircleInfo} size={24} color="#1e40af" />
                <View className="ml-4 flex-1">
                  <Text className="mb-1 font-semibold text-blue-800">
                    {t('user.add.automaticallyGenerated')}
                  </Text>
                  <Text className="text-sm text-blue-600">{t('user.add.passwordDefault')}</Text>
                </View>
              </View>
            </View>
            <View className="mb-4">
              <Text className="mb-2 text-sm text-gray-600">
                {t('common.fields.role')} <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-col flex-wrap gap-2">
                {roles.map((role) => {
                  const isSelected = userData.role === role.value;
                  return (
                    <TouchableOpacity
                      key={role.value}
                      onPress={() => setUserData({ ...userData, role: role.value })}
                      className={`w-[100%] flex-1 items-center rounded-xl border-2 px-4 py-3 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-gray-700'
                        }`}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">{t('common.fields.status')}</Text>
              <View className="flex-row items-center">
                <Text
                  className={`mr-2 text-sm ${userData.status ? 'text-green-600' : 'text-gray-500'}`}>
                  {userData.status ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={userData.status}
                  onValueChange={(value) => setUserData({ ...userData, status: value })}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={userData.status ? '#fff' : '#f9fafb'}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mb-8 mt-4">
          <TouchableOpacity
            className={`items-center rounded-xl py-4 shadow-sm ${isSubmitting ? 'bg-gray-500' : 'bg-blue-600 '}`}
            disabled={isSubmitting}
            onPress={handleCreateUser}>
            <Text className="text-lg font-semibold text-white">
              {isSubmitting ? `${t('common.button.creating')}` : `${t('common.button.create')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserAddScreen;
