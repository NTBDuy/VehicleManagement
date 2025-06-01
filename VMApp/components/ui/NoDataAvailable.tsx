import { faInbox, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import Header from '@/components/layout/HeaderComponent';

type NoDataAvailableProp = {
  onRetry: any;
};

const NoDataAvailable = ({ onRetry }: NoDataAvailableProp) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header backBtn title="User Detail" />

      <View className="items-center justify-center flex-1 px-8">
        <View className="items-center justify-center w-24 h-24 mb-6 bg-white rounded-full shadow-sm">
          <FontAwesomeIcon icon={faInbox} size={32} color="#6b7280" />
        </View>
        <Text className="mb-2 text-xl font-semibold text-center text-gray-800">
          No Data Available
        </Text>
        <Text className="mb-8 text-base leading-6 text-center text-gray-500">
          There&apos;s no data to display right now.
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="flex-row items-center justify-center px-6 py-3 bg-blue-500 rounded-lg shadow-sm"
            activeOpacity={0.8}>
            <FontAwesomeIcon
              icon={faRefresh}
              size={16}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text className="font-medium text-white">Try Again</Text>
          </TouchableOpacity>
        )}
        <Text className="mt-6 text-sm text-center text-gray-400">
          If the problem persists, please contact support.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default NoDataAvailable;
