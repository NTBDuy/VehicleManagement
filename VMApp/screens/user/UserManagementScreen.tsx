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
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserService } from 'services/userService';
import { getRoleBackgroundColor, getRoleLabel } from 'utils/roleUtils';
import { showToast } from 'utils/toast';
import { getUserInitials } from 'utils/userUtils';

import User from 'types/User';

import Header from '@/components/layout/HeaderComponent';
import EmptyList from '@/components/ui/EmptyListComponent';
import LoadingData from '@/components/ui/LoadingData';

const UserManagementScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filterOptions = [
    { id: 3, name: t('common.status.all') },
    { id: 0, name: t('common.role.admin') },
    { id: 2, name: t('common.role.manager') },
    { id: 1, name: t('common.role.employee') },
  ];

  const filteredUsers = useMemo(() => {
    let filtered = [...users];
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

    switch (activeFilter) {
      case 0:
        filtered = filtered.filter((user) => user.role === 0);
        break;
      case 1:
        filtered = filtered.filter((user) => user.role === 1);
        break;
      case 2:
        filtered = filtered.filter((user) => user.role === 2);
        break;
    }

    return filtered;
  }, [users, searchQuery, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchUsersData();
    }, [])
  );

  const fetchUsersData = async () => {
    try {
      setIsLoading(true);
      const data = await UserService.getAllUsers();
      return setUsers(data);
    } catch (error) {
      console.error(error);
      return setUsers([]);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  const renderBadgeUserRole = ({ role }: { role: number }) => {
    const bgColor = getRoleBackgroundColor(role);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getRoleLabel(role, t)}</Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => handleOption(item)}
      className="mb-4 mt-1 flex-row items-center rounded-2xl bg-gray-100 px-2 py-4">
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
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
    </TouchableOpacity>
  );

  const handleOption = (user: User) => {
    setSelected(user);
    setIsModalVisible(true);
  };

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleFilterChange = (role: number): void => {
    setActiveFilter(role);
  };

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setActiveFilter(3);
  };

  const handleViewDetail = () => {
    navigation.navigate('UserDetail', { userData: selected });
  };

  const handleAddUser = () => {
    navigation.navigate('UserAdd');
  };

  const handleEditUser = () => {
    navigation.navigate('UserEdit', { userData: selected });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsersData();
  };

  const onResetPassword = async () => {
    Alert.alert(
      `${t('common.confirmation.title.reset')}`,
      `${t('common.confirmation.message.reset', {
        user: selected?.fullName || selected?.username,
      })}`,
      [
        { text: `${t('common.button.cancel')}`, style: 'cancel' },
        {
          text: `${t('common.button.reset')}`,
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await UserService.reset(selected!.userId);
              showToast.success(`${t('common.success.passwordReset')}`);
            } catch (error) {
              console.log('Error resetting password:', error);
              showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const onToggleStatus = () => {
    if (selected) {
      const isActivate = selected.status;

      Alert.alert(
        isActivate
          ? `${t('common.confirmation.title.deactivate', { item: selected.fullName })}`
          : `${t('common.confirmation.title.activate', { item: selected.fullName })}`,
        isActivate
          ? `${t('common.confirmation.message.deactivate', { item: selected.fullName })}`
          : `${t('common.confirmation.message.activate', { item: selected.fullName })}`,
        [
          { text: `${t('common.button.cancel')}`, style: 'cancel' },
          {
            text: t('common.button.yesIAmSure'),
            style: selected.status ? 'destructive' : 'default',
            onPress: async () => {
              setIsLoading(true);
              try {
                await UserService.toggleStatus(selected?.userId);
                isActivate
                  ? `${t('common.success.deactivated', { item: selected.fullName })}`
                  : `${t('common.success.activated', { item: selected.fullName })}`;
                fetchUsersData();
                handleCloseModal();
              } catch (error) {
                console.log('Error toggling status:', error);
                Alert.alert(`${t('common.error.title')}`, `${t('common.error.generic')}?`);
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
        title={t('user.management.title')}
        rightElement={
          <TouchableOpacity className="rounded-full bg-white p-2" onPress={handleAddUser}>
            <FontAwesomeIcon icon={faUserPlus} size={18} />
          </TouchableOpacity>
        }
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder={t('common.searchPlaceholder.user')}
        handleClearFilters={handleClearFilters}
      />

      <View className="mx-6 mb-10 flex-1">
        <View className="my-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleFilterChange(item.id)}
                className={`mr-2 items-center rounded-full px-4 py-2 ${activeFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Text
                  className={`text-sm font-medium ${activeFilter === item.id ? 'text-white' : 'text-gray-600'}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
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
            ListEmptyComponent={<EmptyList icon={faPersonCircleQuestion} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {users.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-10">
          <Text className="text-center text-sm font-medium text-gray-500">
            {t('user.management.totalUser')}:{' '}
            <Text className="text-lg font-bold text-gray-800">{filteredUsers.length}</Text>
          </Text>
        </View>
      )}

      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableOpacity onPress={handleCloseModal} className="flex-1 justify-end bg-black/30">
          <TouchableOpacity onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-2xl bg-white p-6 pb-12">
              <Text className="mb-6 text-center text-lg font-bold">
                {t('user.management.modal.title')} #{selected?.username}
              </Text>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  handleViewDetail();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faInfoCircle} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.detail')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  handleEditUser();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faEdit} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.update')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
                onPress={() => {
                  onResetPassword();
                  handleCloseModal();
                }}>
                <FontAwesomeIcon icon={faKey} size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-blue-600">
                  {t('common.button.reset')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-6 flex-row items-center gap-3"
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
                  {selected?.status
                    ? `${t('common.button.deactivate')}`
                    : `${t('common.button.activate')}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg bg-gray-600 py-3"
                onPress={handleCloseModal}>
                <Text className="text-lg font-semibold text-white">{t('common.button.close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default UserManagementScreen;
