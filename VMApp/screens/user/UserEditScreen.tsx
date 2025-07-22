import { userSchema } from '@/validations/userSchema';
import { faCircleInfo, faEdit, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';

import UserFormData from '@/types/UserFormData';
import User from 'types/User';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

const UserEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { userData: initialUserFromRoute } = route.params as { userData: User };
  const [initialUserData, setInitialUserData] = useState<User>(initialUserFromRoute);
  const [userData, setUserData] = useState<User>(initialUserFromRoute);
  const isRoleChanged = userData.role !== initialUserData.role;
  const queryClient = useQueryClient();

  const updateUserSchema = userSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UserFormData>({
    resolver: yupResolver(updateUserSchema),
    defaultValues: {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
    },
    mode: 'onChange',
  });

  const updateUserData = (field: keyof User, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const roles = [
    { label: t('common.role.employee'), value: 1 },
    { label: t('common.role.manager'), value: 2 },
    { label: t('common.role.admin'), value: 0 },
  ];

  const onSubmit = async (data: UserFormData) => {
    Alert.alert(
      `${t('common.confirmation.title.update', { item: t('common.items.user') })}`,
      `${t('common.confirmation.message.update', { item: t('common.items.user') })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.update')}`,
          onPress: async () => {
            try {
              const updatedData = { ...userData, ...data };

              const result = await UserService.updateUser(userData.userId, updatedData);

              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['user', userData.userId] }),
                queryClient.invalidateQueries({ queryKey: ['users'] }),
              ]);

              setUserData(result);
              setInitialUserData(result);
              showToast.success(
                `${t('common.success.title')}`,
                `${t('common.success.updated', { item: t('common.items.user') })}`
              );
              reset({
                fullName: result.fullName,
                email: result.email,
                phoneNumber: result.phoneNumber,
              });
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]
    );
  };

  const handleUpdate = () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
  };

  const handleResetPassword = () => {
    Alert.alert(
      `${t('common.confirmation.title.reset')}`,
      `${t('common.confirmation.message.reset', {
        user: userData?.fullName || userData?.username,
      })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.reset')}`,
          style: 'destructive',
          onPress: async () => {
            try {
              await UserService.reset(userData!.userId);
              showToast.success(`${t('common.success.passwordReset')}`);
            } catch (error) {
              console.log('Error resetting password:', error);
              showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        `${t('common.confirmation.title.discardChanges')}`,
        `${t('common.confirmation.message.discardChanges')}`,
        [
          { text: `${t('common.button.keepEdit')}`, style: 'cancel' },
          {
            text: `${t('common.button.discard')}`,
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        backBtn
        customTitle={
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800">{t('user.edit.title')}</Text>
            <Text className="text-xl font-bold text-gray-800">#{userData.userId}</Text>
            {(isDirty || isRoleChanged) && (
              <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>
            )}
          </View>
        }
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6 items-center">
          <View className="relative">
            <Image
              className="mt-4 h-28 w-28 rounded-full border-4 border-white shadow-md"
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
              {t('user.detail.detailTitle')}
            </Text>
          </View>
          <View className="p-4">
            <View className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCircleInfo} size={24} color="#1e40af" />
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-blue-800 ">
                    {t('user.edit.cannotModified')}
                  </Text>
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
                      onPress={() => updateUserData('role', role.value)}
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
          </View>
        </View>

        <View className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('common.fields.security')}
            </Text>
          </View>
          <View className="p-4">
            <TouchableOpacity
              className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
              onPress={handleResetPassword}>
              <FontAwesomeIcon icon={faLock} size={16} color="#6b7280" />
              <Text className="ml-3 text-gray-700">{t('common.button.reset')}</Text>
              <Text className="ml-auto text-sm text-blue-600">{t('common.button.sendReset')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8 mt-4 flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isSubmitting}>
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600 '
            }`}
            onPress={handleUpdate}
            disabled={isSubmitting || (!isDirty && !isRoleChanged)}>
            <Text className="font-semibold text-white">
              {isSubmitting ? `${t('common.button.updating')}` : `${t('common.button.update')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserEditScreen;
