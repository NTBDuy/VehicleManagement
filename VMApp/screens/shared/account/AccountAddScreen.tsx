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
import { TextInput } from 'react-native-gesture-handler';
import InputField from 'components/InputFieldComponent';

const AccountCreateScreen = () => {
  const [userData, setUserData] = useState<User>({
    UserId: 0,
    FullName: '',
    Email: '',
    Phone: '',
    Username: '',
    PasswordHash: '',
    Role: 1,
    Status: true,
  });

  const [errors, setErrors] = useState<Partial<User>>({});

  const roles = [
    { label: 'Employee', value: 1 },
    { label: 'Manager', value: 2 },
    { label: 'Admin', value: 3 },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!userData.FullName.trim()) {
      newErrors.FullName = 'Full name is required';
    }

    if (!userData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.Email)) {
      newErrors.Email = 'Please enter a valid email';
    }

    if (!userData.Phone.trim()) {
      newErrors.Phone = 'Phone number is required';
    } else if (!/^\d{9,10}$/.test(userData.Phone.replace(/\s/g, ''))) {
      newErrors.Phone = 'Please enter a valid phone number';
    }

    if (!userData.Username.trim()) {
      newErrors.Username = 'Username is required';
    } else if (userData.Username.length < 3) {
      newErrors.Username = 'Username must be at least 3 characters';
    }

    if (!userData.PasswordHash.trim()) {
      newErrors.PasswordHash = 'Password is required';
    } else if (userData.PasswordHash.length < 6) {
      newErrors.PasswordHash = 'Password must be at least 6 characters';
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
        <View className="mb-6 items-center">
          <View className="relative">
            <Image
              className="mt-4 h-24 w-24 rounded-full border-2 border-gray-200"
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
            <Text className="text-lg font-semibold text-gray-800">Personal Information</Text>
          </View>
          <View className="p-4">
            <InputField
              label="Full Name"
              value={userData.FullName}
              onChangeText={(text) => setUserData({ ...userData, FullName: text })}
              error={errors.FullName}
            />
            <InputField
              label="Email"
              value={userData.Email}
              onChangeText={(text) => setUserData({ ...userData, Email: text })}
              keyboardType="email-address"
              error={errors.Email}
            />
            <InputField
              label="Phone Number"
              value={userData.Phone}
              onChangeText={(text) => setUserData({ ...userData, Phone: text })}
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              error={errors.Phone}
            />
          </View>
        </View>

        {/* Account Details Section */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">Account Details</Text>
          </View>
          <View className="p-4">
            <InputField
              label="Username"
              value={userData.Username}
              onChangeText={(text) => setUserData({ ...userData, Username: text })}
              error={errors.Username}
            />
            <InputField
              label="Password"
              value={userData.PasswordHash}
              onChangeText={(text) => setUserData({ ...userData, PasswordHash: text })}
              secureTextEntry
              error={errors.PasswordHash}
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
                      onPress={() => setUserData({ ...userData, Role: role.value })}
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
                  className={`mr-2 text-sm ${userData.Status ? 'text-green-600' : 'text-gray-500'}`}>
                  {userData.Status ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={userData.Status}
                  onValueChange={(value) => setUserData({ ...userData, Status: value })}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={userData.Status ? '#fff' : '#f9fafb'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View className="mb-8 mt-4">
          <Pressable
            className="items-center rounded-xl bg-blue-600 py-4 shadow-sm active:bg-blue-700"
            onPress={handleCreateAccount}>
            <Text className="text-lg font-semibold text-white">Create Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountCreateScreen;
