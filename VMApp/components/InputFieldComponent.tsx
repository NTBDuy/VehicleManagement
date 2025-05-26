import { View, Text, TextInput } from 'react-native';

const InputField = ({
  label,
  value,
  require = true,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  error,
  multiline,
  numberOfLines,
}: {
  label: string;
  value: string | undefined;
  require?: boolean;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
}) => (
  <View className="mb-4">
    <Text className="mb-1 text-sm text-gray-600">
      {label} {require && <Text className="text-red-500">*</Text>}
    </Text>
    <TextInput
      className={`rounded-xl border px-4 py-2 text-base shadow-sm ${
        error
          ? 'border-red-500 bg-red-50'
          : editable
            ? 'border-gray-300 bg-white focus:border-blue-500'
            : 'border-gray-200 bg-gray-100'
      }`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      placeholderTextColor="#A0AEC0"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />

    {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);

export default InputField;
