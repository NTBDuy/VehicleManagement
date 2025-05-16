import { View, Text, SafeAreaView, Pressable, Image, Switch, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Header from 'components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useRoute } from '@react-navigation/native';
import User from 'types/User';
import { TextInput } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';

const AccountEditScreen = () => {
  const route = useRoute();
  const { userData: initialUserData } = route.params as { userData: User };

  const [userData, setUserData] = useState<User>(initialUserData);

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
  }) => (
    <View className="mb-4">
      <Text className="mb-1 text-sm text-gray-600">{label}</Text>
      <TextInput
        className="focus:border-primary rounded-xl border border-gray-300 bg-white px-4 py-2 text-base text-gray-800 shadow-sm focus:outline-none"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Enter ' + label.toLocaleLowerCase()}
        placeholderTextColor="#A0AEC0"
      />
    </View>
  );

  const roles = [
    { label: 'Admin', value: 0 },
    { label: 'Employee', value: 1 },
    { label: 'Manager', value: 2 },
  ];

  return (
    <SafeAreaView>
      {/** HEADER */}
      <Header
        backBtn
        customTitle={<Text className="text-xl font-bold">Update Account #{userData.UserId}</Text>}
      />

      {/** BODY */}
      <ScrollView className="px-6">
        {/** Ảnh của người dùng */}
        <View className="mb-4 items-center">
          <View>
            <Image
              className="mt-4 h-24 w-24 rounded-full border border-white"
              source={require('../../../assets/images/user-default.jpg')}
            />
            <Pressable className="absolute bottom-0 right-0 rounded-full border bg-white p-1">
              <FontAwesomeIcon icon={faEdit} size={14} />
            </Pressable>
          </View>
        </View>

        {/* Personal Information Section */}
        <View className="mb-6 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-xl font-semibold text-gray-800">Personal Information</Text>
          <InputField
            label="Fullname"
            value={userData.FullName}
            onChangeText={(text) => setUserData({ ...userData, FullName: text })}
          />
          <InputField
            label="Email"
            value={userData.Email}
            onChangeText={(text) => setUserData({ ...userData, Email: text })}
          />
          <InputField
            label="Phone number"
            value={userData.Phone}
            onChangeText={(text) => setUserData({ ...userData, Phone: text })}
            placeholder="e.g. 912345678"
          />
        </View>

        {/* Account Detail Section */}
        <View className="mb-6 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-xl font-semibold text-gray-800">Account Detail</Text>
          <InputField
            label="Username"
            value={userData.Username}
            onChangeText={(text) => setUserData({ ...userData, Username: text })}
          />

          <View className="mb-4">
            <Text className="mb-1 text-sm text-gray-600">Role</Text>
            <View className="flex-row flex-wrap gap-2 justify-between">
              {roles.map((role) => {
                const isSelected = userData.Role === role.value;
                return (
                  <Pressable
                    key={role.value}
                    onPress={() => setUserData({ ...userData, Role: role.value })}
                    className={`w-[31%] items-center rounded-xl border px-4 py-2 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                    }`}>
                    <Text className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Status</Text>
            <Switch
              value={userData.Status}
              onValueChange={(value) => setUserData({ ...userData, Status: value })}
              trackColor={{ false: '#ccc', true: '#22c55e' }}
              thumbColor={userData.Status ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/** Active button */}
        <View className="mt-2 mb-40">
          <Pressable className="items-center rounded-xl bg-blue-500 py-4">
            <Text className="font-bold text-white">Update Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountEditScreen;
