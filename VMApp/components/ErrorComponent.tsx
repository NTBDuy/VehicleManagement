import { View, Text } from 'react-native';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const ErrorComponent = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <FontAwesomeIcon icon={faTriangleExclamation} size={48} color="#6b7280" />
      <Text className="mt-4 text-gray-500">Oops! Something went wrong. Try again.</Text>
    </View>
  );
};

export default ErrorComponent;
