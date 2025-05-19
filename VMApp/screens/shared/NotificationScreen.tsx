import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import HeaderComponent from 'components/HeaderComponent'

const NotificationScreen = () => {
  return (
    <SafeAreaView>
        <HeaderComponent title='Notifications' backBtn/>
    </SafeAreaView>
  )
}

export default NotificationScreen