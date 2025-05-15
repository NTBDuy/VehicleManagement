import { View, Text, SafeAreaView, Pressable } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from 'contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBell, faBars } from '@fortawesome/free-solid-svg-icons'
import { useNavigation, DrawerActions } from '@react-navigation/native'

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  return (
    <SafeAreaView className='flex-1 bg-white'>
      {/** HEADER */}
      <View className='-mt-20 bg-blue-300'>
        <View className='pt-20 px-6 mt-10 mb-6 flex-row items-center justify-between'>
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className='rounded-full bg-white p-2'>
            <FontAwesomeIcon icon={faBars} size={18} />
          </Pressable>
          <Text className='font-bold text-2xl'>Hi {user?.FullName || "NO INFORMATION"}</Text>
          <Pressable className='rounded-full bg-white p-2'>
            <FontAwesomeIcon icon={faBell} size={18}/>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen