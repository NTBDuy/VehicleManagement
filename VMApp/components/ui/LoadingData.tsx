import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View, Text } from 'react-native';

const LoadingData = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-2 text-gray-500">{t('common.loadingData')}...</Text>
    </View>
  );
};

export default LoadingData;
