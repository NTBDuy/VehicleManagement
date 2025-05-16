import { View, Text, SafeAreaView, Image, Pressable } from 'react-native';
import Header from 'components/Header';
import User from 'types/User';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const AccountDetailScreen = () => {
  const route = useRoute();
  const { userData } = route.params as { userData: User };
  const navigation = useNavigation<any>();

  const userRole = (role: number) => {
    switch(role) {
      case 0: return 'Admin'
      case 1: return 'Employee'
      case 2: return 'Manager'
      default: return 'Undefined'
    }
  }

  const onEdit = () => {
    navigation.navigate("AccountEdit", { userData });
  }

  return (
    <SafeAreaView>
      {/** HEADER */}
      <Header
        backBtn
        customTitle={<Text className="text-xl font-bold">Account Detail #{userData.UserId}</Text>}
        rightElement={
          <Pressable
            onPress={onEdit}
            className="rounded-full bg-white p-2">
            <FontAwesomeIcon icon={faEdit} size={18} />
          </Pressable>
        }
      />

      {/** BODY */}
      <View className="px-6">
        {/** Ảnh của người dùng */}
        <View className="mb-4 items-center">
          <View>
            <Image
              className="mt-4 h-24 w-24 rounded-full border border-white"
              source={require('../../../assets/images/user-default.jpg')}
            />
          </View>
        </View>

        {/** Section - thông tin cá nhân */}
                <View className="mb-6 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-lg font-bold">Personal information</Text>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Fullname</Text>
            <Text className="font-semibold text-gray-700">
              {userData.FullName || 'No information'}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Email</Text>
            <Text className="font-semibold text-gray-700">
              {userData.Email || 'No information'}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Phone number</Text>
            <Text className="font-semibold text-gray-700">
              (+84) {userData.Phone || 'No information'}
            </Text>
          </View>
        </View>

        {/** Section - thông tin tài khoản */}
                <View className="mb-6 rounded-2xl bg-gray-100 p-4 shadow-sm">
          <Text className="mb-4 text-lg font-bold">Account detail</Text>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Username</Text>
            <Text className="font-semibold text-gray-700">
              {userData.Username || 'No information'}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-gray-600">Role</Text>
            <Text className="font-semibold text-gray-700">{userRole(userData.Role) || 'No information'}</Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Status</Text>
            <Text className="font-semibold text-gray-700">
              {userData.Status ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/** Active button */}
        <View className="mt-2 flex-row justify-between">
          <Pressable className="w-[48%] items-center rounded-xl bg-blue-500 py-4">
            <Text className="font-bold text-white">Reset password</Text>
          </Pressable>
          {userData.Status ? (
            <Pressable className="w-[48%] items-center rounded-xl bg-red-500 py-4">
              <Text className="font-bold text-white">Inactive</Text>
            </Pressable>
          ) : (
            <Pressable className="w-[48%] items-center rounded-xl bg-green-500 py-4">
              <Text className="font-bold text-white">Active</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountDetailScreen;
