import { View, Text } from 'react-native';

const InfoRow = ({
  label,
  value,
  valueComponent,
  isLast = false,
}: {
  label: string;
  value: string;
  valueComponent?: React.ReactNode;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row justify-between ${!isLast ? 'mb-3 border-b border-gray-100 pb-3' : ''}`}>
    <Text className="text-gray-600">{label}</Text>
    {valueComponent || (
      <Text className="max-w-[60%] text-right font-semibold text-gray-800">{value}</Text>
    )}
  </View>
);

export default InfoRow;
