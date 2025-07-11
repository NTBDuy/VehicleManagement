import Header from '@/components/layout/HeaderComponent';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, View } from 'react-native';

const AdminStatistic = () => {
  const { t } = useTranslation();
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('common.items.statistic')} />

      <View>
        
      </View>
    </SafeAreaView>
  );
};

export default AdminStatistic;
