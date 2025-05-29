import {
  faBan,
  faCircleCheck,
  faEdit,
  faEllipsisV,
  faInfoCircle,
  faKey,
  faPersonCircleQuestion,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { AccountService } from 'services/accountService';
import { getRoleLabel, getRoleStyle } from 'utils/roleUtils';
import { showToast } from 'utils/toast';
import { getUserInitials } from 'utils/userUtils';

import User from 'types/User';

import EmptyList from 'components/EmptyListComponent';
import Header from 'components/HeaderComponent';
import LoadingData from 'components/LoadingData';

const filterOptions = [
  { id: 3, name: 'All' },
  { id: 0, name: 'Administrator' },
  { id: 2, name: 'Manager' },
  { id: 1, name: 'Employee' },
];

const AccountScreen = () => {
  const navigation = useNavigation<any>();
  const [accounts, setAccounts] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    let filtered = accounts;
    const q = searchQuery.toLowerCase();
    
    if (q) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLocaleLowerCase().includes(q) ||
          user.email.toLocaleLowerCase().includes(q) ||
          user.phoneNumber.toLocaleLowerCase().includes(q) ||
          user.username.toLocaleLowerCase().includes(q)
      );
    }

    switch(activeFilter) {
      case 0 : 
        filtered = filtered.filter((user) => user.role === 0);
        break;
      case 1 : 
        filtered = filtered.filter((user) => user.role === 1);
        break;
      case 2 : 
        filtered = filtered.filter((user) => user.role === 2);
        break;
    }

    return(filtered);
  }, [accounts]);

  useFocusEffect(
    useCallback(() => {
      getAccountsData();
    }, [])
  );

  const getAccountsData = async () => {
    try {
      setIsLoading(true);
      const data = await AccountService.getAllAccounts();
      return setAccounts(data);
    } catch (error) {
      console.error(error);
      return setAccounts([]);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  const renderBadgeUserRole = ({ role }: { role: number }) => {
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
      className="flex-row items-center px-2 py-4 mt-1 mb-4 bg-gray-100 rounded-2xl">
      <View className="items-center justify-center w-12 h-12 ml-2 mr-4 bg-blue-300 rounded-full">
        <Text className="text-xl font-semibold text-white">{getUserInitials(item.fullName)}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.fullName}</Text>
        <Text className="text-sm">{item.username}</Text>
      </View>
      <View className="flex-row items-center">
        <View>{renderBadgeUserRole({ role: item.role })}</View>
        <FontAwesomeIcon icon={faEllipsisV} />
      </View>
      <View className="absolute -right-0 -top-1">
        <View className={`h-4 w-4 rounded-full ${item.status ? 'bg-green-500' : 'bg-gray-400'}`} />
      </View>
    </Pressable>
  );

  const handleOption = (user: User) => {
    setSelected(user);
    setIsModalVisible(true);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    setActiveFilter(3);
  };

  const handleFilterChange = (role: number): void => {
    setActiveFilter(role);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setActiveFilter(3);
  };

  const handleViewDetail = () => {
    navigation.navigate('AccountDetail', { userData: selected });
  };

  const handleAddUser = () => {
    navigation.navigate('AccountAdd');
  };

  const handleEditUser = () => {
    navigation.navigate('AccountEdit', { userData: selected });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getAccountsData();
  };

  const onToggleStatus = () => {
    if (selected) {
      const action = selected.status ? 'deactivate' : 'activate';
      const actionText = selected.status ? 'Deactivate' : 'Activate';

      Alert.alert(
        `${actionText} Account`,
        `Are you sure you want to ${action} ${selected.fullName || selected.username}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: actionText,
            style: selected.status ? 'destructive' : 'default',
            onPress: async () => {
              setIsLoading(true);
              try {
                await AccountService.toggleStatus(selected?.userId);
                showToast.success('Success', 'Account status changed successfully!');
                getAccountsData();
                handleCloseModal();
              } catch (error) {
                console.log(error);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Account Management"
        rightElement={
          <Pressable className="p-2 bg-white rounded-full" onPress={handleAddUser}>
            <FontAwesomeIcon icon={faUserPlus} size={18} />
          </Pressable>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search username, phone or email ..."
        handleClearFilters={handleClearFilters}
      />

      <View className="flex-1 mx-6 mb-10">
        <View className="my-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.id.toString()}
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
        {isLoading ? (
          <LoadingData />
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.userId.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyList title="No accounts found!" icon={faPersonCircleQuestion} />
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {accounts.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-white">
          <Text className="text-sm font-medium text-center text-gray-500">
            Total Users:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredUsers.length}</Text>
          </Text>
        </View>
      )}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View className="justify-end flex-1 bg-black/30">
          <View className="p-6 pb-12 bg-white rounded-t-2xl">
            <Text className="mb-6 text-lg font-bold text-center">
              Options for #{selected?.username}
            </Text>

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                handleViewDetail();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Account details</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                handleEditUser();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Edit profile</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                // onResetPassword();
                handleCloseModal();
              }}>
              <FontAwesomeIcon icon={faKey} size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-600">Reset password</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 mb-6"
              onPress={() => {
                onToggleStatus();
              }}>
              <FontAwesomeIcon
                icon={selected?.status ? faBan : faCircleCheck}
                size={20}
                color={selected?.status ? '#dc2626' : '#16a34a'}
              />
              <Text
                className={`text-lg font-semibold ${selected?.status ? 'text-red-600' : 'text-green-600'}`}>
                {selected?.status ? 'Deactivate user' : 'Activate user'}
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center justify-center py-3 bg-gray-600 rounded-lg"
              onPress={handleCloseModal}>
              <Text className="text-lg font-semibold text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;
