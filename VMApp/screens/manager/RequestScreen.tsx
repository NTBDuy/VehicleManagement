import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import Header from 'components/Header'

const RequestScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Header title='Request Management'/>
    </SafeAreaView>
  )
}

export default RequestScreen