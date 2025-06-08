import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { UserService } from 'services/userService';
import { showToast } from 'utils/toast';

import User from 'types/User';

import Header from '@/components/layout/HeaderComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import InputField from '@/components/ui/InputFieldComponent';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
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
      newErrors.fullName = `${t('validate.required.fullname')}` as any;
    }

    if (!userData?.email?.trim()) {
      newErrors.email = `${t('validate.required.email')}` as any;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = `${t('validate.regex.email')}` as any;
    }

    if (!userData?.phoneNumber?.trim()) {
      newErrors.phoneNumber = `${t('validate.required.phone')}` as any;
    } else if (!/^\d{9,10}$/.test(userData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = `${t('validate.regex.phone')}` as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!user) return;
    if (!validateForm()) {
      showToast.error(
        `${t('common.error.validation.title')}`,
        `${t('common.error.validation.message')}`
      );
      return;
    }
    try {
      setIsLoading(true);
      const updated = await UserService.updateProfile(data);
      setUser(updated);
      showToast.success(`${t('common.success.title')}`, `${t('common.success.profile')}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        customTitle={
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800">{t('user.editProfile.title')}</Text>
            {hasChanges && <Text className="text-xs text-orange-600">{t('common.unsaved')}</Text>}
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
                source={require('@/assets/images/user-default.jpg')}
              />
              <TouchableOpacity className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-blue-500 p-2">
                <FontAwesomeIcon icon={faEdit} size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="bg-gray-50 px-4 py-3">
              <Text className="text-lg font-semibold text-gray-800">
                {t('user.editProfile.section.title')}
              </Text>
            </View>

            <View className="p-4">
              <InputField
                label={t('common.fields.fullname')}
                value={userData.fullName}
                onChangeText={(text) => setUserData({ ...userData!, fullName: text })}
                error={errors.fullName as string}
              />
              <InputField
                label={t('common.fields.email')}
                value={userData?.email}
                onChangeText={(text) => setUserData({ ...userData!, email: text })}
                error={errors.email as string}
                keyboardType="email-address"
              />
              <InputField
                label={t('common.fields.phone')}
                value={userData?.phoneNumber}
                onChangeText={(text) => setUserData({ ...userData!, phoneNumber: text })}
                error={errors.phoneNumber as string}
                placeholder="e.g. 0912345678"
                keyboardType="phone-pad"
              />
            </View>
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
                isLoading ? 'bg-gray-400' : 'bg-blue-600 '
              }`}
              onPress={() => handleUpdateProfile(userData)}
              disabled={isLoading || !hasChanges}>
              <Text className="font-semibold text-white">
                {isLoading ? `${t('common.button.updating')}` : `${t('common.button.update')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ErrorComponent />
      )}
    </SafeAreaView>
  );
};

export default EditProfileScreen;
