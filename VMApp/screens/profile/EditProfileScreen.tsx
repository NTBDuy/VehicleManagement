import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';
import { userSchema } from '@/validations/userSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import User from 'types/User';
import UserFormData from '@/types/UserFormData';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InputField from '@/components/ui/InputFieldComponent';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [isDeleting, setIsDeleting] = useState(false);
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
      fullName: user?.fullName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  if (user == undefined || userData == undefined) {
    return <ErrorComponent />;
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      const result = await UserService.updateProfile(data);
      setUser(result);
      showToast.success(`${t('common.success.title')}`, `${t('common.success.profile')}`);
      reset(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateProfile = () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      `${t('common.confirmation.title.deleteAccount')}`,
      `${t('common.confirmation.message.deleteAccount')}`,
      [
        {
          text: `${t('common.button.cancel')}`,
          style: 'cancel',
        },
        {
          text: `${t('common.button.deleteAccount')}`,
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await UserService.selfDelete();
      showToast.success(`${t('common.success.deleteAccount')}`);
      await logout();
    } catch (error) {
      console.log('Delete account error:', error);
    } finally {
      setIsDeleting(false);
    }
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
        customTitle={
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800">{t('user.editProfile.title')}</Text>
            {isDirty && <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>}
          </View>
        }
        backBtn
      />

      <ScrollView className="px-6">
        <View className="mb-4 items-center">
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

        <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('user.editProfile.section.title')}
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

        <View className="mb-4 mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isSubmitting || isDeleting}>
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl border-2 border-blue-300 py-4 ${
              isSubmitting || isDeleting ? 'bg-gray-400' : 'bg-blue-600 '
            }`}
            onPress={() => handleUpdateProfile()}
            disabled={isSubmitting || !isDirty || isDeleting}>
            <Text className="font-semibold text-white">
              {isSubmitting ? `${t('common.button.updating')}` : `${t('common.button.update')}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account Section */}
        <View className="mb-8 mt-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
          <View className="bg-red-50 px-4 py-3">
            <Text className="text-lg font-semibold text-red-800">
              {t('user.deleteAccount.section.title')}
            </Text>
          </View>

          <View className="p-4">
            <Text className="mb-4 text-sm text-gray-600">
              {t('user.deleteAccount.section.description')}
            </Text>

            <TouchableOpacity
              className={`flex-row items-center justify-center rounded-xl border-2 border-red-300 py-4 ${
                isDeleting || isSubmitting ? 'bg-gray-400' : 'bg-red-600'
              }`}
              onPress={handleDeleteAccount}
              disabled={isDeleting || isSubmitting}>
              {!isDeleting && (
                <FontAwesomeIcon icon={faTrash} size={16} color="#fff" style={{ marginRight: 8 }} />
              )}

              <Text className="font-semibold text-white">
                {isDeleting ? `${t('common.button.loading')}` : `${t('common.button.delete')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
