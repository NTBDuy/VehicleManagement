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
import Header from 'components/HeaderComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import User from 'types/User';
import InputField from 'components/InputFieldComponent';

const AccountCreateScreen = () => {
  const [userData, setUserData] = useState<User>({
    userId: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    username: '',
    passwordHash: '',
    role: 1,
    status: true,
  });

  const [errors, setErrors] = useState<Partial<User>>({});
  
  const roles = [
    { label: 'Employee', value: 1 },
    { label: 'Manager', value: 2 },
    { label: 'Admin', value: 0 },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!userData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!userData.email.trim()) {
      newErrors.email = 'email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!userData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'phoneNumber number is required';
    } else if (!/^\d{9,10}$/.test(userData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phoneNumber number';
    }

    if (!userData.username.trim()) {
      newErrors.username = 'username is required';
    } else if (userData.username.length < 3) {
      newErrors.username = 'username must be at least 3 characters';
    }

    if (!userData.passwordHash.trim()) {
      newErrors.passwordHash = 'Password is required';
    } else if (userData.passwordHash.length < 6) {
      newErrors.passwordHash = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors above');
      return;
    }

    // TODO: Implement API call to create account
    console.log('Creating account with data:', userData);
    Alert.alert('Success', 'Account created successfully!');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* HEADER */}
      <Header backBtn title="Create New Account" />
      {/* BODY */}
      <ScrollView className="flex-1 px-6">
        {/* Profile Picture Section */}
        <View className="items-center mb-6">
          <View className="relative">
            <Image
              className="w-24 h-24 mt-4 border-2 border-gray-200 rounded-full"
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
              value={userData.fullName}
              onChangeText={(text) => setUserData({ ...userData, fullName: text })}
              error={errors.fullName}
            />
            <InputField
              label="email"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              error={errors.email}
            />
            <InputField
              label="phoneNumber Number"
              value={userData.phoneNumber}
              onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />
          </View>
        </View>

        {/* Account Details Section */}
        <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Account Details</Text>
          </View>
          <View className="p-4">
            <InputField
              label="username"
              value={userData.username}
              onChangeText={(text) => setUserData({ ...userData, username: text })}
              error={errors.username}
            />
            <InputField
              label="Password"
              value={userData.passwordHash}
              onChangeText={(text) => setUserData({ ...userData, passwordHash: text })}
              secureTextEntry
              error={errors.passwordHash}
            />
            <View className="mb-4">
              <Text className="mb-2 text-sm text-gray-600">
                role <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {roles.map((role) => {
                  const isSelected = userData.role === role.value;
                  return (
                    <Pressable
                      key={role.value}
                      onPress={() => setUserData({ ...userData, role: role.value })}
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
              <Text className="text-sm text-gray-600">Account status</Text>
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

        {/* Action Button */}
        <View className="mt-4 mb-8">
          <Pressable
            className="items-center py-4 bg-blue-600 shadow-sm rounded-xl active:bg-blue-700"
            onPress={handleCreateAccount}>
            <Text className="text-lg font-semibold text-white">Create Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountCreateScreen;
