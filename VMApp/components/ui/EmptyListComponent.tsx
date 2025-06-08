import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface EmptyListComponentProps {
  title?: string;
  icon?: IconDefinition;
}

const EmptyList = ({ title, icon = faQuestion }: EmptyListComponentProps) => {
  const { t } = useTranslation();

  return (
    <View className="min-h-96 flex-1 items-center justify-center">
      <FontAwesomeIcon icon={icon} size={36} color="#6b7280" />
      <Text className="mt-4 text-lg text-gray-500">{title ?? t('common.fields.noItem')}</Text>
    </View>
  );
};

export default EmptyList;
