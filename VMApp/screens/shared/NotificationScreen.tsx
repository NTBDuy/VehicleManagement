import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import Header from 'components/HeaderComponent'

const NotificationScreen = () => {
  return (
    <SafeAreaView>
        <Header title='Notifications' backBtn/>
    </SafeAreaView>
  )
}

export default NotificationScreen