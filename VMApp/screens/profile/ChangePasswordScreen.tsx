import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';

import Header from '@/components/layout/HeaderComponent';
import InputField from '@/components/ui/InputFieldComponent';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = t('common.required.currentPassword');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = t('common.required.newPassword');
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      newErrors.newPassword = t('validate.regex.password');
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('common.required.confirmPassword');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('common.regex.notMatch');
    }

    if (
      passwordData.currentPassword === passwordData.newPassword &&
      passwordData.newPassword.trim()
    ) {
      newErrors.newPassword = t('common.regex.differentPassword');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
      return;
    }

    try {
      setIsLoading(true);
      const changePasswordDTO = {
        CurrentPassword: passwordData.currentPassword,
        NewPassword: passwordData.newPassword,
        ConfirmPassword: passwordData.confirmPassword,
      };
      await UserService.changePassword(changePasswordDTO);
      showToast.success(`${t('common.success.title')}`, `${t('common.success.passwordChange')}`);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      navigation.goBack();
    } catch (error: any) {
      console.log('Change password error:', error);
      showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword;

    if (hasChanges) {
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

  const hasChanges =
    passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        customTitle={
          <View>
            <Text className="text-xl font-bold text-gray-800">
              {t('setting.changePassword.header')}
            </Text>
            {hasChanges && <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>}
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
              <InputField
                label={t('setting.changePassword.section.label.current')}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                error={errors.currentPassword}
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
            </View>

            <View className="mb-4">
              <InputField
                label={t('setting.changePassword.section.label.new')}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                error={errors.newPassword}
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
            </View>

            <View>
              <InputField
                label={t('setting.changePassword.section.label.confirm')}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                error={errors.confirmPassword}
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
            disabled={isLoading}>
            <Text className="font-semibold text-gray-700">{t('common.button.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl border-2 border-blue-300 py-4 ${
              isLoading || !hasChanges ? 'border-gray-300 bg-gray-400' : 'bg-blue-600'
            }`}
            onPress={handleChangePassword}
            disabled={isLoading || !hasChanges}>
            <Text className="font-semibold text-white">
              {isLoading
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
