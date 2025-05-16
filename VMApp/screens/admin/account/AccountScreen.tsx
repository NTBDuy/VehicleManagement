import Header from 'components/Header';
import { View, Text, SafeAreaView, FlatList, Pressable, Alert, Modal } from 'react-native';
import accountData from 'data/user.json';
import User from 'types/User';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faPersonCircleQuestion,
  faUserPlus,
  faEllipsisV,
  faInfoCircle,
  faEdit,
  faKey,
  faTimesCircle,
  faBan,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserInitials } from 'utils/userUtils';
import { useEffect, useState } from 'react';

const account: User[] = accountData;

const AccountScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<User>();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<any>();

  const renderBadgeUserRole = ({ role }: { role: number }) => {
    const getRoleStyle = (role: number) => {
      switch (role) {
        case 0:
          return 'bg-red-500';
        case 1:
          return 'bg-green-500';
        case 2:
          return 'bg-blue-500';
        default:
          return 'bg-gray-500';
      }
    };

    const getRoleLabel = (role: number) => {
      switch (role) {
        case 0:
          return 'Admin';
        case 1:
          return 'Employee';
        case 2:
          return 'Manager';
        default:
          return 'Unknown';
      }
    };

    const bgColor = getRoleStyle(role);

    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getRoleLabel(role)}</Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      onPress={() => handleOption(item)}
      className="mt-4 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">{getUserInitials(item.FullName)}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.FullName}</Text>
        <Text className="text-sm">{item.Username}</Text>
      </View>
      <View className="flex-row items-center">
        <View>{renderBadgeUserRole({ role: item.Role })}</View>
        <FontAwesomeIcon icon={faEllipsisV} />
      </View>
      <View className="absolute -right-0 -top-1">
        <View className={`h-4 w-4 rounded-full ${item.Status ? 'bg-green-500' : 'bg-gray-400'}`} />
      </View>
    </Pressable>
  );

  const EmptyListComponent = () => (
    <View className="flex-1 items-center justify-center py-72">
      <FontAwesomeIcon icon={faPersonCircleQuestion} size={60} color="#6b7280" />
      <Text className="mt-4 text-lg text-gray-500">No user found!</Text>
    </View>
  );

  const handlePress = () => {
    Alert.alert('Comming soon!');
  };

  const handleOption = (user: User) => {
    setSelected(user);
    setModalVisible(true);
  };

  const onClose = () => {
    setModalVisible(false);
  };

  const filter = (query: string): void => {
    let filtered = account;

    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.FullName.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Email.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Phone.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Username.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          (user.Role === 0 && 'admin'.includes(query.toLocaleLowerCase())) ||
          (user.Role === 1 && 'employee'.includes(query.toLocaleLowerCase())) ||
          (user.Role === 2 && 'manager'.includes(query.toLocaleLowerCase()))
      );
    }
    setFilteredUsers(filtered);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    filter(text);
  };

  const clearSearch = (): void => {
    setSearchQuery('');
    filter('');
  };

  useEffect(() => {
    setFilteredUsers(account);
  }, []);

  const onViewDetail = () => {
    navigation.navigate('AccountDetail', { userData: selected });
  };

  const onEdit = () => {
    navigation.navigate('AccountEdit', { userData: selected });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Account Management"
        rightElement={
          <Pressable className="rounded-full bg-white p-2" onPress={handlePress}>
            <FontAwesomeIcon icon={faUserPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search username, phone or email ..."
        clearSearch={clearSearch}
      />

      <View className="mx-6 mb-52">
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.UserId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyListComponent}
        />

        <View className="mt-4 flex items-center">
          <Text className="text-sm font-medium text-gray-500">
            Total Users:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredUsers.length}</Text>
          </Text>
        </View>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-2xl bg-white p-6 pb-12">
            <Text className="mb-6 text-center text-lg font-bold">
              Options for {selected?.Username}
            </Text>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                onViewDetail();
                onClose();
              }}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Detail</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                onEdit();
                onClose();
              }}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Edit</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                // onResetPassword();
                onClose();
              }}>
              <FontAwesomeIcon icon={faKey} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Reset password</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                // onToggleStatus();
                onClose();
              }}>
              <FontAwesomeIcon
                icon={selected?.Status ? faBan : faCircleCheck}
                size={20}
                color={selected?.Status ? '#dc2626' : '#16a34a'}
              />
              <Text
                className={`text-lg font-semibold ${selected?.Status ? 'text-red-600' : 'text-green-600'}`}>
                {selected?.Status ? 'Inactive' : 'Active'}
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center justify-center gap-3" onPress={onClose}>
              <FontAwesomeIcon icon={faTimesCircle} size={20} color="#6b7280" />
              <Text className="text-lg font-semibold text-gray-500">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;
