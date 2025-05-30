import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';

import User from 'types/User';

import ErrorComponent from 'components/ErrorComponent';
import Header from 'components/HeaderComponent';
import InputField from 'components/InputFieldComponent';

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

  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!user) return;
    if (!validateForm()) {
      showToast.error('Validation Error', 'Please fix the errors above');
      return;
    }
    try {
      setIsLoading(true);
      const updated = await UserService.updateProfile(data);
      setUser(updated);
      showToast.success('Saved!', 'Your info has been updated.');
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
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
          <View className="items-center mb-4">
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

          <View className="mt-4 mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
            <View className="px-4 py-3 bg-gray-50">
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
          
          <View className="flex-row items-center justify-between mt-4 mb-8">
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
              onPress={() => handleUpdateProfile(userData)}
              disabled={isLoading || !hasChanges}>
              <Text className="font-semibold text-white">
                {isLoading ? 'Updating...' : 'Update User'}
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
