import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

const ErrorComponent = () => {
  const { t } = useTranslation();
  
  return (
    <View className="flex-1 items-center justify-center">
      <FontAwesomeIcon icon={faTriangleExclamation} size={48} color="#6b7280" />
      <Text className="mt-4 text-gray-500">{t('common.error.screen')}</Text>
    </View>
  );
};

export default ErrorComponent;
