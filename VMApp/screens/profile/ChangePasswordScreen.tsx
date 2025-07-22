import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { passwordSchema } from '@/validations/passwordSchema';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updateUserSchema = passwordSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ChangePasswordData>({
    resolver: yupResolver(updateUserSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      await UserService.changePassword(data);
      showToast.success(`${t('common.success.title')}`, `${t('common.success.passwordChange')}`);
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      navigation.goBack();
    } catch (error: any) {
      console.log('Change password error:', error);
    }
  };

  const handleChangePassword = () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
    })();
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
          <View>
            <Text className="text-xl font-bold text-gray-800">
              {t('setting.changePassword.header')}
            </Text>
            {isDirty && <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>}
          </View>
        }
        backBtn
      />

      <ScrollView className="px-6">
        <View className="mb-2 items-center">
          <View className="mt-4 rounded-full bg-blue-100 p-6">
            <FontAwesomeIcon icon={faLock} size={32} color="#3b82f6" />
          </View>
          <Text className="mt-4 text-lg font-semibold text-gray-700">
            {t('setting.changePassword.title')}
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500">
            {t('setting.changePassword.subTitle')}
          </Text>
        </View>

        <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('setting.changePassword.section.title')}
            </Text>
          </View>

          <View className="p-4">
            <View className="mb-4">
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('setting.changePassword.section.label.current')}
                    value={value}
                    onChangeText={onChange}
                    error={errors.currentPassword?.message}
                    secureTextEntry={!showPasswords.current}
                    rightIcon={
                      <TouchableOpacity onPress={() => togglePasswordVisibility('current')}>
                        <FontAwesomeIcon
                          icon={showPasswords.current ? faEyeSlash : faEye}
                          size={16}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    }
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('setting.changePassword.section.label.new')}
                    value={value}
                    onChangeText={onChange}
                    error={errors.newPassword?.message}
                    secureTextEntry={!showPasswords.new}
                    rightIcon={
                      <TouchableOpacity onPress={() => togglePasswordVisibility('new')}>
                        <FontAwesomeIcon
                          icon={showPasswords.new ? faEyeSlash : faEye}
                          size={16}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    }
                  />
                )}
              />
            </View>

            <View>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('setting.changePassword.section.label.confirm')}
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                    secureTextEntry={!showPasswords.confirm}
                    rightIcon={
                      <TouchableOpacity onPress={() => togglePasswordVisibility('confirm')}>
                        <FontAwesomeIcon
                          icon={showPasswords.confirm ? faEyeSlash : faEye}
                          size={16}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    }
                  />
                )}
              />
            </View>
          </View>
        </View>

        <View className="mb-6 rounded-xl bg-blue-50 p-4">
          <Text className="mb-2 text-sm font-medium text-blue-900">
            {t('setting.changePassword.requirement.title')}:
          </Text>
          <Text className="text-xs text-blue-700">
            • {t('setting.changePassword.requirement.require1')}
          </Text>
          <Text className="text-xs text-blue-700">
            • {t('setting.changePassword.requirement.require2')}
          </Text>
          <Text className="text-xs text-blue-700">
            • {t('setting.changePassword.requirement.require3')}
          </Text>
        </View>

        <View className="mb-8 mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isSubmitting}>
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl border-2 border-blue-300 py-4 ${
              isSubmitting || !isDirty ? 'border-gray-300 bg-gray-400' : 'bg-blue-600'
            }`}
            onPress={handleChangePassword}
            disabled={isSubmitting || !isDirty}>
            <Text className="font-semibold text-white">
              {isSubmitting
                ? `${t('common.button.updating')}`
                : `${t('setting.changePassword.header')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
