import { View, Text, TextInput } from 'react-native';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InputFieldProps {
  label?: string;
  value: string | number;
  require?: boolean;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad';
  editable?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  rightIcon?: ReactNode;
  onFocus?: () => void;
}

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
  rightIcon,
  onFocus,
}: InputFieldProps) => {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState(value?.toString() || '');

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  const handleDecimalChange = (text: string) => {
    const sanitized = text.replace(',', '.');
    const regex = /^(\d+)?([.]?\d*)?$/;

    if (sanitized === '' || regex.test(sanitized)) {
      setInputValue(sanitized);
      onChangeText(sanitized);
    }
  };

  const handleChangeText = (text: string) => {
    if (keyboardType === 'decimal-pad') {
      handleDecimalChange(text);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm text-gray-600">
          {label} {require && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <View className="relative">
        <TextInput
          className={`rounded-xl border px-4 py-2 text-base shadow-sm ${rightIcon ? 'pr-12' : ''} ${
            error
              ? 'border-red-500 bg-red-50'
              : editable
                ? 'border-gray-300 bg-white focus:border-blue-500'
                : 'border-gray-200 bg-gray-100'
          }`}
          value={keyboardType === 'decimal-pad' ? inputValue : value?.toString()}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder || `${t('common.fields.enter')} ${label && label!.toLowerCase()}`}
          placeholderTextColor="#A0AEC0"
          secureTextEntry={secureTextEntry}
          editable={editable}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={onFocus}
        />

        {rightIcon && (
          <View className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</View>
        )}
      </View>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

export default InputField;
