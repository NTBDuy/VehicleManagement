import { faCar, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View, Image } from 'react-native';

interface SidebarProps {
  [key: string]: any;
}

const SidebarComponent = (props: SidebarProps) => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View className="mb-4 items-center justify-center border-b border-gray-200 py-6">
        <Image
          source={require('@/assets/images/VMS.png')}
          className="h-16"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 px-4">
        <DrawerItemList
          state={props.state}
          navigation={props.navigation}
          descriptors={props.descriptors}
        />
      </View>

      <View className="border-t border-gray-200 px-4 pt-4">
        <DrawerItem
          label={t('auth.signOut.label')}
          labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
          icon={({ size }) => <FontAwesomeIcon icon={faSignOut} color={'#ef4444'} size={size} />}
          onPress={() => {
            Alert.alert(`${t('auth.signOut.title')}`, `${t('auth.signOut.message')}`, [
              { text: `${t('common.button.cancel')}`, style: 'cancel' },
              {
                text: `${t('auth.signOut.title')}`,
                style: 'destructive',
                onPress: handleLogout,
              },
            ]);
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default SidebarComponent;
