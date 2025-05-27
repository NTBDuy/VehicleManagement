import { View, Text, SafeAreaView, Image, Pressable, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import Header from 'components/HeaderComponent';
import User from 'types/User';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faShieldAlt, faUser, faCrown } from '@fortawesome/free-solid-svg-icons';
import { formatVietnamPhoneNumber } from 'utils/userUtils';
import InfoRow from 'components/InfoRowComponent';
// Import your account service
import { AccountService } from 'services/accountService';

type RoleInfo = {
  label: string;
  icon: any;
  color: string;
};

const AccountDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const { userData: initialUserData } = (route.params as { userData?: User }) || {};
  const [userData, setUserData] = useState<User | undefined>(initialUserData);

  const fetchUserData = async () => {
    if (!userData?.userId) return;
    
    try {
      setIsLoading(true);
      const updatedData = await AccountService.getAccountById(userData.userId);
      setUserData(updatedData);
    } catch (error) {
      console.log('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userData?.userId) {
        fetchUserData();
      }
    }, [userData?.userId])
  );
  
  if (!userData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Header backBtn title="Account Detail" />
        <View className="items-center justify-center flex-1 px-6">
          <Text className="text-center text-gray-500">No user data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getRoleInfo = (role: number): RoleInfo => {
    switch (role) {
      case 1:
        return {
          label: 'Employee',
          icon: faUser,
          color: '#2563eb',
        };
      case 2:
        return {
          label: 'Manager',
          icon: faShieldAlt,
          color: '#16a34a',
        };
      case 0:
        return {
          label: 'Admin',
          icon: faCrown,
          color: '#9333ea',
        };
      default:
        return {
          label: 'Unknown',
          icon: faUser,
          color: '#4b5563',
        };
    }
  };

  const handleEdit = () => {
    navigation.navigate('AccountEdit', { userData });
  };

  const handleResetPassword = async () => {
    Alert.alert(
      'Reset Password',
      `Are you sure you want to reset password for ${userData.fullName || userData.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // await AccountService.resetPassword(userData.userId);
              Alert.alert('Success', 'Password reset link has been sent to user email');
            } catch (error) {
              console.log('Error resetting password:', error);
              Alert.alert('Error', 'Failed to reset password');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async () => {
    const action = userData.status ? 'deactivate' : 'activate';
    const actionText = userData.status ? 'Deactivate' : 'Activate';

    Alert.alert(
      `${actionText} Account`,
      `Are you sure you want to ${action} ${userData.fullName || userData.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          style: userData.status ? 'destructive' : 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              // await AccountService.toggleUserStatus(userData.userId, !userData.status);
              Alert.alert('Success', `Account has been ${action}d successfully`);
              // Refresh dữ liệu sau khi cập nhật status
              await fetchUserData();
            } catch (error) {
              console.log('Error toggling status:', error);
              Alert.alert('Error', `Failed to ${action} account`);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const roleInfo = getRoleInfo(userData.role);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/** HEADER */}
      <Header
        backBtn
        customTitle={
          <Text className="text-xl font-bold text-gray-800">Account #{userData.userId}</Text>
        }
        rightElement={
          <Pressable onPress={handleEdit} className="p-2 bg-white rounded-full shadow-sm">
            <FontAwesomeIcon icon={faEdit} size={18} color="#374151" />
          </Pressable>
        }
      />

      {/** BODY */}
      <View className="flex-1 px-6">
        {/** Profile Picture */}
        <View className="items-center mb-4">
          <View className="relative">
            <Image
              className="mt-4 border-4 border-white rounded-full shadow-md h-28 w-28"
              source={require('../../assets/images/user-default.jpg')}
            />
            <View
              className={`absolute bottom-2 right-2 rounded-full p-2 ${userData.status ? 'bg-green-500' : 'bg-gray-400'}`}>
              <View className="w-3 h-3 bg-white rounded-full" />
            </View>
          </View>
          <Text className="mt-3 text-xl font-bold text-gray-800">
            {userData.fullName || userData.username || 'No Name'}
          </Text>
          <View className="flex-row items-center mt-1">
            <FontAwesomeIcon icon={roleInfo.icon} size={14} color={roleInfo.color} />
            <Text className={`ml-1 text-sm font-medium`} style={{ color: roleInfo.color }}>
              {roleInfo.label}
            </Text>
          </View>
        </View>

        {/** Personal Information Section */}
        <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Personal Information</Text>
          </View>
          <View className="p-4">
            <InfoRow label="Full Name" value={userData.fullName || 'Not provided'} />
            <InfoRow label="Email" value={userData.email || 'Not provided'} />
            <InfoRow
              label="Phone Number"
              value={
                userData.phoneNumber
                  ? formatVietnamPhoneNumber(userData.phoneNumber)
                  : 'Not provided'
              }
              isLast
            />
          </View>
        </View>

        {/** Account Details Section */}
        <View className="mb-4 overflow-hidden bg-white shadow-sm rounded-2xl">
          <View className="px-4 py-3 bg-gray-50">
            <Text className="text-lg font-semibold text-gray-800">Account Details</Text>
          </View>
          <View className="p-4">
            <InfoRow label="Username" value={userData.username || 'Not set'} />
            <InfoRow
              label="Role"
              value={roleInfo.label}
              valueComponent={
                <View className="flex-row items-center">
                  <FontAwesomeIcon icon={roleInfo.icon} size={14} color={roleInfo.color} />
                  <Text className={`ml-1 font-semibold`} style={{ color: roleInfo.color }}>
                    {roleInfo.label}
                  </Text>
                </View>
              }
            />
            <InfoRow
              label="Status"
              value=""
              valueComponent={
                <View
                  className={`rounded-full px-3 py-1 ${userData.status ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text
                    className={`text-sm font-medium ${userData.status ? 'text-green-800' : 'text-gray-600'}`}>
                    {userData.status ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              }
              isLast
            />
          </View>
        </View>

        {/** Action Buttons */}
        <View className="flex-row justify-between mt-4">
          <Pressable
            className="w-[48%] items-center rounded-xl bg-blue-600 py-4 shadow-sm active:bg-blue-700"
            onPress={handleResetPassword}
            disabled={isLoading}>
            <Text className="font-semibold text-white">Reset Password</Text>
          </Pressable>

          <Pressable
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              userData.status ? 'bg-red-600 active:bg-red-700' : 'bg-green-600 active:bg-green-700'
            }`}
            onPress={handleToggleStatus}
            disabled={isLoading}>
            <Text className="font-semibold text-white">
              {isLoading ? 'Loading...' : userData.status ? 'Deactivate' : 'Activate'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountDetailScreen;