import { View, Text, TextInput } from 'react-native'

export default function FormField({
  label, value, onChangeText, placeholder,
  keyboardType = 'default', multiline = false, numberOfLines = 1,
}) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>}
      <TextInput
        className={`bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 ${
          multiline ? 'min-h-[80px]' : ''
        }`}
        value={value || ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  )
}
