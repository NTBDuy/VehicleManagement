import { View, Text } from 'react-native';
import User from 'types/User';

interface WelcomeSectionProps {
  user: User | null;
}

const WelcomeSection = ({ user }: WelcomeSectionProps) => (
  <View className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <View className="p-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-600">Welcome back,</Text>
          <Text className="text-2xl font-bold text-gray-800">{user?.FullName}</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View className="h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <Text className="text-2xl">👋</Text>
        </View>
      </View>
    </View>
  </View>
);

export default WelcomeSection;
