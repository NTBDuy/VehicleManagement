import { TouchableOpacity, Text } from 'react-native';

interface StatusCardProps {
  label: string;
  keyword: string;
  count: number;
  bgColor: string;
  onPress: (keyword: string) => void;
}

const StatusCard = ({ label, keyword, count, bgColor, onPress }: StatusCardProps) => (
  <TouchableOpacity
    onPress={() => onPress(keyword)}
    className={`w-[48%] flex-row items-center justify-between rounded-2xl ${bgColor} px-4 py-2 shadow-sm`}>
    <Text className="text-base font-medium text-white">{label}</Text>
    <Text className="text-lg font-bold text-white">{count}</Text>
  </TouchableOpacity>
);

export default StatusCard;
