import { View, Text } from 'react-native';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'text-green-600';
    case 'inUse':
      return 'text-blue-600';
    case 'underMaintenance':
      return 'text-orange-600';
    case 'admin':
      return 'text-red-600';
    case 'employee':
      return 'text-green-600';
    case 'manager':
      return 'text-blue-600';
    case 'total' :
      return 'text-gray-600';
    case 'pending' :
      return 'text-orange-600';
    case 'approved' :
      return 'text-green-600';
    case 'rejected' :
      return 'text-red-600';
    case 'cancelled' :
      return 'text-gray-600';
    default:
      return 'text-gray-800';
  }
};

const StatItem = ({ label, value, status }: { label: string; value: number; status?: string }) => (
  <View className="flex-row items-center justify-between py-2">
    <Text className="text-gray-700">{label}</Text>
    <Text className={`font-semibold ${status ? getStatusColor(status) : 'text-gray-800'}`}>
      {value}
    </Text>
  </View>
);

export default StatItem;
