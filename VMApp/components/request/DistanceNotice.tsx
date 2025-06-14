import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface DistanceNoticeProps {
  show: boolean;
}

export const DistanceNotice = ({ show }: DistanceNoticeProps) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <View className="my-2 rounded-xl bg-blue-50 p-4">
      <Text className="mb-1 text-sm font-medium text-blue-900">{t('notice.title')}:</Text>
      <Text className="text-sm text-blue-700">• {t('notice.distance')}</Text>
    </View>
  );
};
