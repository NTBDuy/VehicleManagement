import { ActivityIndicator, View, Text } from 'react-native';

type LoadingDataProps = {
  text?: string;
};

const LoadingData = ({ text }: LoadingDataProps) => (
  <View className="items-center justify-center flex-1">
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text className="mt-2 text-gray-500">Loading {text ?? 'data'}...</Text>
  </View>
);

export default LoadingData;