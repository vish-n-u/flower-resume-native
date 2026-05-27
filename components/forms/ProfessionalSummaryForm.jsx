import { View, Text } from 'react-native'
import FormField from './FormField'

export default function ProfessionalSummaryForm({ data, onChange }) {
  return (
    <View>
      <Text className="text-base font-bold text-gray-900 mb-4">Professional Summary</Text>
      <FormField
        label="Summary"
        value={data?.summary}
        onChangeText={v => onChange({ summary: v })}
        placeholder="Write a brief summary about yourself, your experience, and what you bring to the table..."
        multiline
        numberOfLines={6}
      />
      <Text className="text-xs text-gray-400 mt-1">
        Tip: Keep it to 2-4 sentences. Focus on your strongest skills and value.
      </Text>
    </View>
  )
}
