import { View, Text, SafeAreaView, Image, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import Header from 'components/HeaderComponent';
import User from 'types/User';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faShieldAlt, faUser, faCrown } from '@fortawesome/free-solid-svg-icons';
import { formatVietnamPhoneNumber } from 'utils/userUtils';
import InfoRow from 'components/InfoRowComponent';

type RoleInfo = {
  label: string;
  icon: any;
  color: string;
};

const AccountDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  // Safety check for route params
  const { userData } = (route.params as { userData?: User }) || {};

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Header backBtn title="Account Detail" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-gray-500">
            No user data available
          </Text>
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
          color: '#2563eb' 
        };
      case 2:
        return { 
          label: 'Manager', 
          icon: faShieldAlt, 
          color: '#16a34a' 
        };
      case 0:
        return { 
          label: 'Admin', 
          icon: faCrown, 
          color: '#9333ea' 
        };
      default:
        return { 
          label: 'Unknown', 
          icon: faUser, 
          color: '#4b5563' 
        };
    }
  };

  const handleEdit = () => {
    navigation.navigate('AccountEdit', { userData });
  };

  const handleResetPassword = () => {
    Alert.alert(
      'Reset Password',
      `Are you sure you want to reset password for ${userData.FullName || userData.Username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement password reset logic
            console.log('Reset password for user:', userData.UserId);
            Alert.alert('Success', 'Password reset link has been sent to user email');
          }
        }
      ]
    );
  };

  const handleToggleStatus = async () => {
    const action = userData.Status ? 'deactivate' : 'activate';
    const actionText = userData.Status ? 'Deactivate' : 'Activate';
    
    Alert.alert(
      `${actionText} Account`,
      `Are you sure you want to ${action} ${userData.FullName || userData.Username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionText, 
          style: userData.Status ? 'destructive' : 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              // TODO: Implement status toggle API call
              console.log(`${actionText} user:`, userData.UserId);
              Alert.alert('Success', `Account has been ${action}d successfully`);
              // Navigate back to refresh the list
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} account`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const roleInfo = getRoleInfo(userData.Role);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/** HEADER */}
      <Header
        backBtn
        customTitle={
          <Text className="text-xl font-bold text-gray-800">
            Account #{userData.UserId}
          </Text>
        }
        rightElement={
          <Pressable 
            onPress={handleEdit} 
            className="rounded-full bg-white p-2 shadow-sm"
          >
            <FontAwesomeIcon icon={faEdit} size={18} color="#374151" />
          </Pressable>
        }
      />

      {/** BODY */}
      <View className="flex-1 px-6">
        {/** Profile Picture */}
        <View className="mb-4 items-center">
          <View className="relative">
            <Image
              className="mt-4 h-28 w-28 rounded-full border-4 border-white shadow-md"
              source={require('../../../assets/images/user-default.jpg')}
            />
            <View className={`absolute bottom-2 right-2 rounded-full p-2 ${userData.Status ? 'bg-green-500' : 'bg-gray-400'}`}>
              <View className="h-3 w-3 rounded-full bg-white" />
            </View>
          </View>
          <Text className="mt-3 text-xl font-bold text-gray-800">
            {userData.FullName || userData.Username || 'No Name'}
          </Text>
          <View className="mt-1 flex-row items-center">
            <FontAwesomeIcon 
              icon={roleInfo.icon} 
              size={14} 
              color={roleInfo.color}
            />
            <Text className={`ml-1 text-sm font-medium ${roleInfo.color}`}>
              {roleInfo.label}
            </Text>
          </View>
        </View>

        {/** Personal Information Section */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              Personal Information
            </Text>
          </View>
          <View className="p-4">
            <InfoRow 
              label="Full Name" 
              value={userData.FullName || 'Not provided'} 
            />
            <InfoRow 
              label="Email" 
              value={userData.Email || 'Not provided'} 
            />
            <InfoRow 
              label="Phone Number" 
              value={userData.Phone ? formatVietnamPhoneNumber(userData.Phone) : 'Not provided'}
              isLast 
            />
          </View>
        </View>

        {/** Account Details Section */}
        <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="bg-gray-50 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">
              Account Details
            </Text>
          </View>
          <View className="p-4">
            <InfoRow 
              label="Username" 
              value={userData.Username || 'Not set'} 
            />
            <InfoRow
              label="Role" 
              value={roleInfo.label}
              valueComponent={
                <View className="flex-row items-center">
                  <FontAwesomeIcon 
                    icon={roleInfo.icon} 
                    size={14} 
                    color={roleInfo.color}
                  />
                  <Text className={`ml-1 font-semibold ${roleInfo.color}`}>
                    {roleInfo.label}
                  </Text>
                </View>
              }
            />
            <InfoRow 
              label="Status" 
              value=""
              valueComponent={
                <View className={`rounded-full px-3 py-1 ${userData.Status ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text className={`text-sm font-medium ${userData.Status ? 'text-green-800' : 'text-gray-600'}`}>
                    {userData.Status ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              }
              isLast
            />
          </View>
        </View>

        {/** Action Buttons */}
        <View className="mt-4 flex-row justify-between">
          <Pressable 
            className="w-[48%] items-center rounded-xl bg-blue-600 py-4 shadow-sm active:bg-blue-700"
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">
              Reset Password
            </Text>
          </Pressable>
          
          <Pressable 
            className={`w-[48%] items-center rounded-xl py-4 shadow-sm ${
              userData.Status 
                ? 'bg-red-600 active:bg-red-700' 
                : 'bg-green-600 active:bg-green-700'
            }`}
            onPress={handleToggleStatus}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">
              {userData.Status ? 'Deactivate' : 'Activate'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountDetailScreen;