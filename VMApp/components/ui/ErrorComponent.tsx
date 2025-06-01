import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Text, View } from 'react-native';

const ErrorComponent = () => {
  return (
    <View className="items-center justify-center flex-1">
      <FontAwesomeIcon icon={faTriangleExclamation} size={48} color="#6b7280" />
      <Text className="mt-4 text-gray-500">Oops! Something went wrong. Try again.</Text>
    </View>
  );
};

export default ErrorComponent;
