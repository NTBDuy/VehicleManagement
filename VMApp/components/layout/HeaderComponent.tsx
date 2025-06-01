import { faArrowLeft, faBars, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface HeaderProps {
  backBtn?: boolean;
  title?: string;
  customTitle?: React.ReactNode;
  rightElement?: React.ReactNode;
  searchSection?: boolean;
  searchQuery?: string;
  handleSearch?: any;
  placeholder?: string;
  handleClearFilters?: any;
}

const Header = ({
  backBtn,
  title,
  customTitle,
  rightElement,
  searchSection,
  searchQuery,
  handleSearch,
  placeholder,
  handleClearFilters,
}: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <View className="-mt-20 overflow-hidden rounded-b-[40px] bg-blue-300 shadow-md">
      <View className="flex-row items-start justify-between px-6 pt-20 mt-10 mb-6">
        {backBtn ? (
          <Pressable onPress={() => navigation.goBack()} className="p-2 bg-white rounded-full">
            <FontAwesomeIcon icon={faArrowLeft} size={18} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="p-2 bg-white rounded-full">
            <FontAwesomeIcon icon={faBars} size={18} />
          </Pressable>
        )}

        {customTitle ? customTitle : <Text className="text-2xl font-bold">{title}</Text>}

        {rightElement ? rightElement : <View className="w-8"></View>}
      </View>

      {searchSection && (
        <View className="flex-row items-center px-4 py-3 mx-4 mb-6 rounded-full bg-white/40 ">
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#000" />
          <TextInput
            className="flex-1 ml-3 "
            placeholder={placeholder}
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <Pressable onPress={handleClearFilters}>
              <FontAwesomeIcon icon={faXmark} size={16} color="#000" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;
