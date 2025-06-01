import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Text, View } from 'react-native';

interface EmptyListComponentProps {
  title?: string;
  icon?: IconDefinition;
}

const EmptyList: React.FC<EmptyListComponentProps> = ({
  title = 'No items found!',
  icon = faQuestion,
}) => (
  <View className="items-center justify-center flex-1 min-h-96">
    <FontAwesomeIcon icon={icon} size={60} color="#6b7280" />
    <Text className="mt-4 text-lg text-gray-500">{title}</Text>
  </View>
);

export default EmptyList;