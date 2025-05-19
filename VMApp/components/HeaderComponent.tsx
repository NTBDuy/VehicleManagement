import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faArrowLeft, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

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

const HeaderComponent = ({
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
      <View className="mb-6 mt-10 flex-row items-start justify-between px-6 pt-20">
        {backBtn ? (
          <Pressable onPress={() => navigation.goBack()} className="rounded-full bg-white p-2">
            <FontAwesomeIcon icon={faArrowLeft} size={18} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="rounded-full bg-white p-2">
            <FontAwesomeIcon icon={faBars} size={18} />
          </Pressable>
        )}

        {customTitle ? customTitle : <Text className="text-2xl font-bold">{title}</Text>}

        {rightElement ? rightElement : <View className="w-8"></View>}
      </View>

      {searchSection && (
        <View className="flex-row items-center rounded-full bg-white/40 mx-4 px-4 py-3 mb-6 ">
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#000" />
          <TextInput
            className="ml-3 flex-1 "
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

export default HeaderComponent;
