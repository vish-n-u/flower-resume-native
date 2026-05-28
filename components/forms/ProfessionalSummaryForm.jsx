import { View, Text } from 'react-native'
import RichTextInput from './RichTextInput'

export default function ProfessionalSummaryForm({ data, onChange }) {
  return (
    <View>
      <Text className="text-base font-bold text-gray-900 mb-4">Professional Summary</Text>
      <RichTextInput
        value={data?.professional_summary}
        onChange={v => onChange({ professional_summary: v })}
        placeholder="Write a brief summary about yourself, your experience, and what you bring to the table..."
        minHeight={160}
      />
      <Text className="text-xs text-gray-400 mt-2">
        Tip: Keep it to 2-4 sentences. Focus on your strongest skills and value.
      </Text>
    </View>
  )
}
