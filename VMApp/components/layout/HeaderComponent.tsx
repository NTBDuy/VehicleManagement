import { faArrowLeft, faBars, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, Text, TextInput, View } from 'react-native';

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
  isHiddenLeftComponent?: boolean;
  isOverlay?: boolean;
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
  isHiddenLeftComponent,
  isOverlay = false,
}: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <View className={`${isOverlay ? '-mt-8' : '-mt-24'} overflow-hidden rounded-b-[40px] bg-blue-300 shadow-md`}>
      <View className="mb-6 mt-10 flex-row items-start justify-between px-6 pt-20">
        {!isHiddenLeftComponent ? (
          <View>
            {backBtn ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="rounded-full bg-white p-2">
                <FontAwesomeIcon icon={faArrowLeft} size={18} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                className="rounded-full bg-white p-2">
                <FontAwesomeIcon icon={faBars} size={18} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="w-8"></View>
        )}

        {customTitle ? customTitle : <Text className="text-2xl font-bold text-white">{title}</Text>}

        {rightElement ? rightElement : <View className="w-8"></View>}
      </View>

      {searchSection && (
        <View className="mx-4 mb-6 flex-row items-center rounded-full bg-white/40 px-4 py-3">
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#000" />
          <TextInput
            className="ml-3 flex-1"
            placeholder={placeholder}
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={handleClearFilters}>
              <FontAwesomeIcon icon={faXmark} size={16} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;