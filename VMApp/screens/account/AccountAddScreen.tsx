import { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, Pressable, Image, Switch, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from 'services/accountService';
import { showToast } from 'utils/toast';

import User from 'types/User';

import InputField from 'components/InputFieldComponent';
import Header from 'components/HeaderComponent';

const AccountCreateScreen = () => {
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
  const [userData, setUserData] = useState<User>(initialUserData);
  const [errors, setErrors] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setUserData(initialUserData);
    }, [])
  );
  
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
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      showToast.error('Validation Error', 'Please fix the errors above');
      return;
    }
    try {
      setIsLoading(true);
      const data = await AccountService.createAccount(userData);
      showToast.success('Success', 'Account created successfully!');
      navigation.navigate('AccountDetail', { userData: data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
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
              label="Email"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              error={errors.email}
            />
            <InputField
              label="Phone Number"
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
            <View className="p-4 mb-6 border border-blue-200 rounded-2xl bg-blue-50">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCircleInfo} size={24} color="#1e40af" />
                <View className="flex-1 ml-4">
                  <Text className="mb-1 font-semibold text-blue-800">
                    Username and password will be automatically generated
                  </Text>
                  <Text className="text-sm text-blue-600">
                    Default password will be: P@ssword123
                  </Text>
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
            className={`items-center rounded-xl py-4 shadow-sm ${isLoading ? 'bg-gray-500' : 'bg-blue-600 active:bg-blue-700'}`}
            disabled={isLoading}
            onPress={handleCreateAccount}>
            <Text className="text-lg font-semibold text-white">
              {isLoading ? 'Creating...' : 'Create Account'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountCreateScreen;
