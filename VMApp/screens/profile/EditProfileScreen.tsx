import { View, Text, SafeAreaView, ScrollView, Image, Pressable, Alert } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';

import InputField from 'components/InputFieldComponent';
import User from 'types/User';
import ErrorComponent from 'components/ErrorComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { ApiClient } from 'utils/apiClient';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !userData) return;

    const changed =
      user.fullName !== userData.fullName ||
      user.email !== userData.email ||
      user.phoneNumber !== userData.phoneNumber;

    setHasChanges(changed);
  }, [userData, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!userData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required' as any;
    }

    if (!userData?.email?.trim()) {
      newErrors.email = 'email is required' as any;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Please enter a valid email' as any;
    }

    if (!userData?.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'phoneNumber number is required' as any;
    } else if (!/^\d{9,10}$/.test(userData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phoneNumber number' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors above');
      return;
    }

    Alert.alert('Update Account', 'Are you sure you want to update information?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          setIsLoading(true);
          try {
            const data = {
              fullName: userData?.fullName,
              email: userData?.email,
              phoneNumber: userData?.phoneNumber,
            };

            const res = await ApiClient.updateUserProfile(userData!.userID, data);
            
            const updatedUser = { ...res };

            setUserData(updatedUser);
            setUser(updatedUser);

            Alert.alert('Success', 'Account updated successfully!', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update account. Please try again.');
          } finally {
            setIsLoading(false);
          }
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
      <Header
        customTitle={
          <View>
            <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
            {hasChanges && <Text className="text-xs text-orange-600">Unsaved changes</Text>}
          </View>
        }
        backBtn
      />

      {userData ? (
        <ScrollView className="px-6">
          <View className="mb-4 items-center">
            <View className="relative">
              <Image
                className="mt-4 h-28 w-28 rounded-full border-4 border-white shadow-md"
                source={require('../../assets/images/user-default.jpg')}
              />
              <Pressable className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-blue-500 p-2">
                <FontAwesomeIcon icon={faEdit} size={14} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">User Information</Text>
            </View>

            <View className="p-4">
              <InputField
                label="Fullname"
                value={userData.fullName}
                onChangeText={(text) => setUserData({ ...userData!, fullName: text })}
                error={errors.fullName as string}
              />
              <InputField
                label="email"
                value={userData?.email}
                onChangeText={(text) => setUserData({ ...userData!, email: text })}
                error={errors.email as string}
                keyboardType="email-address"
              />
              <InputField
                label="phoneNumber Number"
                value={userData?.phoneNumber}
                onChangeText={(text) => setUserData({ ...userData!, phoneNumber: text })}
                error={errors.phoneNumber as string}
                placeholder="e.g. 0912345678"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          {/** Action Buttons */}
          <View className="mb-8 mt-4 flex-row items-center justify-between">
            <Pressable
              className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
              onPress={handleCancel}
              disabled={isLoading}>
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </Pressable>

            <Pressable
              className={`w-[48%] items-center rounded-xl border-2 border-blue-300 py-4 ${
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
      ) : (
        <ErrorComponent />
      )}
    </SafeAreaView>
  );
};

export default EditProfileScreen;
