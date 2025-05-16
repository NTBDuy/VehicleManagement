import React from 'react';
import { Alert, View, Text } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCar, faSignOut } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  setIsLoggedIn: (value: boolean) => void;
  [key: string]: any; 
}

const SidebarCustom: React.FC<SidebarProps> = (props) => {
  const { setIsLoggedIn } = props;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header */}
      <View className="mb-4 items-center justify-center border-b border-gray-200 py-6">
        <FontAwesomeIcon icon={faCar} size={30} color="#1f2937" />
        <Text className="mt-2 text-xl font-bold text-gray-800">Vehicle Management</Text>
      </View>

      {/* Menu items */}
      <View className="flex-1 px-4">
        <DrawerItemList state={props.state} navigation={props.navigation} descriptors={props.descriptors} />
      </View>

      {/* Footer */}
      <View className="border-t border-gray-200 px-4 pt-4">
        <DrawerItem
          label="Log out"
          labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
          icon={({ size }) => <FontAwesomeIcon icon={faSignOut} color={'#ef4444'} size={size} />}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => setIsLoggedIn(false),
              },
            ]);
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default SidebarCustom;
