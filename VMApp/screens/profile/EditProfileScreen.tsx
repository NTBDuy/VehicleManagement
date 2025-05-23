import { View, Text, SafeAreaView, ScrollView, Image, Pressable, Alert } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import { AuthContext } from 'contexts/AuthContext';
import InputField from 'components/InputFieldComponent';
import User from 'types/User';
import ErrorComponent from 'components/ErrorComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

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
      user.FullName !== userData.FullName ||
      user.Email !== userData.Email ||
      user.Phone !== userData.Phone;

    setHasChanges(changed);
  }, [userData, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!userData?.FullName?.trim()) {
      newErrors.FullName = 'Full name is required' as any;
    }

    if (!userData?.Email?.trim()) {
      newErrors.Email = 'Email is required' as any;
    } else if (!/\S+@\S+\.\S+/.test(userData.Email)) {
      newErrors.Email = 'Please enter a valid email' as any;
    }

    if (!userData?.Phone?.trim()) {
      newErrors.Phone = 'Phone number is required' as any;
    } else if (!/^\d{9,10}$/.test(userData.Phone.replace(/\s/g, ''))) {
      newErrors.Phone = 'Please enter a valid phone number' as any;
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
            console.log('Updating account:', userData);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            Alert.alert('Success', 'Account updated successfully!', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
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
                value={userData?.FullName}
                onChangeText={(text) => setUserData({ ...userData, FullName: text })}
                error={errors.FullName as string}
              />
              <InputField
                label="Email"
                value={userData?.Email}
                onChangeText={(text) => setUserData({ ...userData, Email: text })}
                error={errors.Email as string}
                keyboardType="email-address"
              />
              <InputField
                label="Phone Number"
                value={userData?.Phone}
                onChangeText={(text) => setUserData({ ...userData, Phone: text })}
                error={errors.Phone as string}
                placeholder="e.g. 0912345678"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          {/** Action Buttons */}
          <View className="mb-8 mt-4 flex-row justify-between items-center">
            <Pressable
              className="w-[48%] items-center rounded-xl border-2 border-gray-300 bg-white py-4"
              onPress={handleCancel}
              disabled={isLoading}>
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </Pressable>

            <Pressable
              className={`w-[48%] items-center rounded-xl py-4 border-2 border-blue-300 ${
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
