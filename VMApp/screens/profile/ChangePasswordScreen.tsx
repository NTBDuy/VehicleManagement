import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, TouchableOpacity, SafeAreaView, ScrollView, Text, View } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(false);
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

  const [errors, setErrors] = useState<PasswordErrors>({});

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Password and confirmation password do not match';
    }

    if (
      passwordData.currentPassword === passwordData.newPassword &&
      passwordData.newPassword.trim()
    ) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      showToast.error('Validation Error', 'Please fix the errors above');
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
      showToast.success('Success!', 'Your password has been changed successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      navigation.goBack();
    } catch (error: any) {
      console.log('Change password error:', error);
      if (error.response?.data?.message) {
        showToast.error('Error', error.response.data.message);
      } else if (error.message) {
        showToast.error('Error', error.message);
      } else {
        showToast.error('Error', 'Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword;

    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
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
            <Text className="text-xl font-bold text-gray-800">Change Password</Text>
            {hasChanges && <Text className="text-xs text-orange-600">Unsaved changes</Text>}
          </View>
        }
        backBtn
      />

      <ScrollView className="px-6">
        {/* Header Icon */}
        <View className="mb-2 items-center">
          <View className="mt-4 rounded-full bg-blue-100 p-6">
            <FontAwesomeIcon icon={faLock} size={32} color="#3b82f6" />
          </View>
          <Text className="mt-4 text-lg font-semibold text-gray-700">Update Your Password</Text>
          <Text className="mt-1 text-center text-sm text-gray-500">
            Choose a strong password to keep your account secure
          </Text>
        </View>

        <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Password Information</Text>
          </View>

          <View className="p-4">
            <View className="mb-4">
              <InputField
                label="Current Password"
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                error={errors.currentPassword}
                secureTextEntry={!showPasswords.current}
                placeholder="Enter your current password"
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
                label="New Password"
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                error={errors.newPassword}
                secureTextEntry={!showPasswords.new}
                placeholder="Enter your new password (min 6 characters)"
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
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                error={errors.confirmPassword}
                secureTextEntry={!showPasswords.confirm}
                placeholder="Confirm your new password"
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
          <Text className="mb-2 text-sm font-medium text-blue-900">Password Requirements:</Text>
          <Text className="text-xs text-blue-700">• At least 6 characters long</Text>
          <Text className="text-xs text-blue-700">• Different from your current password</Text>
          <Text className="text-xs text-blue-700">
            • Use a mix of letters, numbers, and symbols for better security
          </Text>
        </View>

        <View className="mb-8 mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isLoading}>
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] items-center rounded-xl border-2 border-blue-300 py-4 ${
              isLoading || !hasChanges ? 'border-gray-300 bg-gray-400' : 'bg-blue-600'
            }`}
            onPress={handleChangePassword}
            disabled={isLoading || !hasChanges}>
            <Text className="font-semibold text-white">
              {isLoading ? 'Updating...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
