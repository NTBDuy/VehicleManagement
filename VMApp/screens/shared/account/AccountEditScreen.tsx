import { View, Text, SafeAreaView, Pressable, Image, Switch, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import Header from 'components/HeaderComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faLock } from '@fortawesome/free-solid-svg-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import User from 'types/User';
import { TextInput } from 'react-native-gesture-handler';
import InputField from 'components/InputFieldComponent';

const AccountEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userData: initialUserData } = route.params as { userData: User };

  const [userData, setUserData] = useState<User>(initialUserData);
  const [errors, setErrors] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  const updateUserData = (field: keyof User, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };


  const roles = [
    { label: 'Employee', value: 1 },
    { label: 'Manager', value: 2 },
    { label: 'Admin', value: 0 },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!userData.FullName?.trim()) {
      newErrors.FullName = 'Full name is required' as any;
    }

    if (!userData.Email?.trim()) {
      newErrors.Email = 'Email is required' as any;
    } else if (!/\S+@\S+\.\S+/.test(userData.Email)) {
      newErrors.Email = 'Please enter a valid email' as any;
    }

    if (!userData.Phone?.trim()) {
      newErrors.Phone = 'Phone number is required' as any;
    } else if (!/^\d{9,10}$/.test(userData.Phone.replace(/\s/g, ''))) {
      newErrors.Phone = 'Please enter a valid phone number' as any;
    }

    if (!userData.Username?.trim()) {
      newErrors.Username = 'Username is required' as any;
    } else if (userData.Username.length < 3) {
      newErrors.Username = 'Username must be at least 3 characters' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors above');
      return;
    }

    Alert.alert(
      'Update Account',
      'Are you sure you want to update this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            setIsLoading(true);
            try {
              // TODO: Implement API call to update account
              console.log('Updating account:', userData);
              
              // Simulate API delay
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              Alert.alert('Success', 'Account updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to update account. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleResetPassword = () => {
    Alert.alert(
      'Reset Password',
      `Reset password for ${userData.FullName || userData.Username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement password reset
            console.log('Reset password for user:', userData.UserId);
            Alert.alert('Success', 'Password reset link has been sent to user email');
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
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
            <Text className="text-xl font-bold text-gray-800">
              Edit Account #{userData.UserId}
            </Text>
            {hasChanges && (
              <Text className="text-xs text-orange-600">Unsaved changes</Text>
            )}
          </View>
        }
      />

      {/** BODY */}
      <ScrollView className="flex-1 px-6">
        {/** Profile Picture */}
        <View className="mb-6 items-center">
          <View className="relative">
            <Image
              className="mt-4 h-28 w-28 rounded-full border-4 border-white shadow-md"
              source={require('../../../assets/images/user-default.jpg')}
            />
            <Pressable className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-blue-500 p-2">
              <FontAwesomeIcon icon={faEdit} size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Personal Information Section */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              Personal Information
            </Text>
          </View>
          <View className="p-4">
            <InputField
              label="Full Name"
              value={userData.FullName || ''}
              onChangeText={(text) => updateUserData('FullName', text)}
              error={errors.FullName as string}
            />
            <InputField
              label="Email"
              value={userData.Email || ''}
              onChangeText={(text) => updateUserData('Email', text)}
              keyboardType="email-address"
              error={errors.Email as string}
            />
            <InputField
              label="Phone Number"
              value={userData.Phone || ''}
              onChangeText={(text) => updateUserData('Phone', text)}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.Phone as string}
            />
          </View>
        </View>

        {/* Account Details Section */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              Account Details
            </Text>
          </View>
          <View className="p-4">
            <InputField
              label="Username"
              value={userData.Username || ''}
              onChangeText={(text) => updateUserData('Username', text)}
              error={errors.Username as string}
            />

            <View className="mb-4">
              <Text className="mb-2 text-sm text-gray-600">
                Role <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {roles.map((role) => {
                  const isSelected = userData.Role === role.value;
                  return (
                    <Pressable
                      key={role.value}
                      onPress={() => updateUserData('Role', role.value)}
                      className={`flex-1 min-w-[30%] items-center rounded-xl border-2 px-4 py-3 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 bg-white'
                      }`}>
                      <Text className={`text-sm font-medium ${
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
                <Text className={`mr-2 text-sm ${userData.Status ? 'text-green-600' : 'text-gray-500'}`}>
                  {userData.Status ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={userData.Status}
                  onValueChange={(value) => updateUserData('Status', value)}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={userData.Status ? '#fff' : '#f9fafb'}
                />
              </View>
            </View>
          </View>
        </View>

        {/** Password Section */}
        <View className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              Security
            </Text>
          </View>
          <View className="p-4">
            <Pressable 
              className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
              onPress={handleResetPassword}
            >
              <FontAwesomeIcon icon={faLock} size={16} color="#6b7280" />
              <Text className="ml-3 text-gray-700">Reset Password</Text>
              <Text className="ml-auto text-sm text-blue-600">Send Reset Link</Text>
            </Pressable>
          </View>
        </View>

        {/** Action Buttons */}
        <View className="mb-8 mt-4 flex-row justify-between">
          <Pressable 
            className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </Pressable>
          
          <Pressable 
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              isLoading 
                ? 'bg-gray-400' 
                : 'bg-blue-600 active:bg-blue-700'
            }`}
            onPress={handleUpdate}
            disabled={isLoading || !hasChanges}
          >
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