import Header from 'components/Header'
import { View, Text, SafeAreaView } from 'react-native'

const AccountScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Header title='Account Management'/>
    </SafeAreaView>
  )
}

export default AccountScreen