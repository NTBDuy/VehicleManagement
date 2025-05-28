import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Image,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faLock, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from 'services/accountService';
import { showToast } from 'utils/toast';

import User from 'types/User';

import Header from 'components/HeaderComponent';
import InputField from 'components/InputFieldComponent';

const AccountEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userData: initialUserData } = route.params as { userData: User };
  const [userData, setUserData] = useState<User>(initialUserData);
  const [errors, setErrors] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateUserData = (field: keyof User, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const roles = [
    { label: 'Employee', value: 1 },
    { label: 'Manager', value: 2 },
    { label: 'Admin', value: 0 },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!userData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required' as any;
    }

    if (!userData.email?.trim()) {
      newErrors.email = 'Email is required' as any;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Please enter a valid email' as any;
    }

    if (!userData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required' as any;
    } else if (!/^\d{9,10}$/.test(userData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors above');
      return;
    }

    Alert.alert('Update Account', 'Are you sure you want to update this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          setIsLoading(true);
          try {
            const data = await AccountService.updateAccount(userData.userId, userData);
            setUserData(data);
            setHasChanges(false);
            showToast.success('Success', 'Account updated successfully!');
          } catch (error) {
            console.log(error);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // Phát triển sau - Coming Soon!
  const handleResetPassword = () => {
    Alert.alert('Reset Password', `Reset password for ${userData.fullName || userData.username}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          console.log('Reset password for user:', userData.userId);
          Alert.alert('Success', 'Password reset link has been sent to user email');
        },
      },
    ]);
  };

  const handleCancel = () => {
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/** HEADER */}
      <Header
        backBtn
        customTitle={
          <View>
            <Text className="text-xl font-bold text-gray-800">Edit Account #{userData.userId}</Text>
            {hasChanges && <Text className="text-xs text-orange-600">Unsaved changes</Text>}
          </View>
        }
      />

      {/** BODY */}
      <ScrollView className="flex-1 px-6">
        {/** Profile Picture */}
        <View className="items-center mb-6">
          <View className="relative">
            <Image
              className="mt-4 border-4 border-white rounded-full shadow-md h-28 w-28"
              source={require('../../assets/images/user-default.jpg')}
            />
            <Pressable className="absolute bottom-0 right-0 p-2 bg-blue-500 border-2 border-white rounded-full">
              <FontAwesomeIcon icon={faEdit} size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Personal Information Section */}
        <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Personal Information</Text>
          </View>
          <View className="p-4">
            <InputField
              label="Full Name"
              value={userData.fullName || ''}
              onChangeText={(text) => updateUserData('fullName', text)}
              error={errors.fullName as string}
            />
            <InputField
              label="Email"
              value={userData.email || ''}
              onChangeText={(text) => updateUserData('email', text)}
              keyboardType="email-address"
              error={errors.email as string}
            />
            <InputField
              label="Phone Number"
              value={userData.phoneNumber || ''}
              onChangeText={(text) => updateUserData('phoneNumber', text)}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.phoneNumber as string}
            />
          </View>
        </View>

        {/* Account Details Section */}
        <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Account Details</Text>
          </View>
          <View className="p-4">
            <View className="p-4 mb-6 border border-blue-200 rounded-2xl bg-blue-50">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCircleInfo} size={24} color="#1e40af" />
                <View className="flex-1 ml-4">
                  <Text className="font-semibold text-blue-800 ">Username cannot be modified</Text>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm text-gray-600">
                Role <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {roles.map((role) => {
                  const isSelected = userData.role === role.value;
                  return (
                    <Pressable
                      key={role.value}
                      onPress={() => updateUserData('role', role.value)}
                      className={`min-w-[30%] flex-1 items-center rounded-xl border-2 px-4 py-3 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-gray-700'
                        }`}>
                        {role.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Account Status</Text>
              <View className="flex-row items-center">
                <Text
                  className={`mr-2 text-sm ${userData.status ? 'text-green-600' : 'text-gray-500'}`}>
                  {userData.status ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={userData.status}
                  onValueChange={(value) => updateUserData('status', value)}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={userData.status ? '#fff' : '#f9fafb'}
                />
              </View>
            </View>
          </View>
        </View>

        {/** Password Section */}
        <View className="mb-6 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Security</Text>
          </View>
          <View className="p-4">
            <Pressable
              className="flex-row items-center px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
              onPress={handleResetPassword}>
              <FontAwesomeIcon icon={faLock} size={16} color="#6b7280" />
              <Text className="ml-3 text-gray-700">Reset Password</Text>
              <Text className="ml-auto text-sm text-blue-600">Send Reset Link</Text>
            </Pressable>
          </View>
        </View>

        
        <View className="flex-row justify-between mt-4 mb-8">
          <Pressable
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isLoading}>
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </Pressable>

          <Pressable
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 active:bg-blue-700'
            }`}
            onPress={handleUpdate}
            disabled={isLoading || !hasChanges}>
            <Text className="font-semibold text-white">
              {isLoading ? 'Updating...' : 'Update Account'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountEditScreen;
