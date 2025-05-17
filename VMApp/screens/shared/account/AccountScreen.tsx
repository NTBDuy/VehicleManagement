import Header from 'components/Header';
import { View, Text, SafeAreaView, FlatList, Pressable, Modal } from 'react-native';
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
  faBan,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserInitials } from 'utils/userUtils';
import { useEffect, useState } from 'react';
import EmptyListComponent from 'components/EmptyListComponent';

const account: User[] = accountData;

const filterOptions = [
  { id: 3, name: 'All' },
  { id: 0, name: 'Administrator' },
  { id: 2, name: 'Manager' },
  { id: 1, name: 'Employee' },
];

const AccountScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<User>();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeFilter, setActiveFilter] = useState(3);

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
      className="mb-4 mt-1 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
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

  const handleOption = (user: User) => {
    setSelected(user);
    setModalVisible(true);
  };

  const onAdd = () => {
    navigation.navigate('AccountAdd');
  };

  const onClose = () => {
    setModalVisible(false);
  };

  const filter = (query: string, role: number): void => {
    let filtered = account;

    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.FullName.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Email.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Phone.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.Username.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (role !== 3) {
      filtered = filtered.filter((user) => user.Role === role);
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    filter(text, 3);
  };

  const clearSearch = (): void => {
    setSearchQuery('');
    filter('', 3);
  };

  useEffect(() => {
    setFilteredUsers(account);
  }, []);

  const handleFilterChange = (role: number): void => {
    setActiveFilter(role);
    filter(searchQuery, role);
  };

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
          <Pressable className="rounded-full bg-white p-2" onPress={onAdd}>
            <FontAwesomeIcon icon={faUserPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search username, phone or email ..."
        clearSearch={clearSearch}
      />

      <View className="mx-6 mb-10 flex-1">
        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.id.toString()}
            className="my-4"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleFilterChange(item.id)}
                className={`mr-2 items-center rounded-full px-4 py-2 ${activeFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Text
                  className={`text-sm font-medium ${activeFilter === item.id ? 'text-white' : 'text-gray-600'}`}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.UserId.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyListComponent title="No user found!" icon={faPersonCircleQuestion} />
          }
        />
      </View>

      {account.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
            Total Users:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredUsers.length}</Text>
          </Text>
        </View>
      )}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-2xl bg-white p-6 pb-12">
            <Text className="mb-6 text-center text-lg font-bold">
              Options for #{selected?.Username}
            </Text>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                onViewDetail();
                onClose();
              }}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Account details</Text>
            </Pressable>

            <Pressable
              className="mb-6 flex-row items-center gap-3"
              onPress={() => {
                onEdit();
                onClose();
              }}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Edit profile</Text>
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
                {selected?.Status ? 'Deactivate user' : 'Activate user'}
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3"
              onPress={onClose}>
              <Text className="text-lg font-semibold text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;
