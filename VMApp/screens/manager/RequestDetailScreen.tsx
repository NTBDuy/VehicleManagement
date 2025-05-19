import { View, Text, SafeAreaView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderComponent from 'components/HeaderComponent'

const RequestDetailScreen = () => {
  const route = useRoute();
  const { requestData } = route.params as { requestData: Request };

  return (
    <SafeAreaView>
        <HeaderComponent title='Request detail' backBtn/>
    </SafeAreaView>
  )
}

export default RequestDetailScreen