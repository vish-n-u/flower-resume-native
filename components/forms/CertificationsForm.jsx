import { View, Text, TouchableOpacity } from 'react-native'
import { Plus, Trash2 } from 'lucide-react-native'
import FormField from './FormField'

const EMPTY = { name: '', issuer: '', date: '', credentialId: '' }

export default function CertificationsForm({ data, onChange }) {
  const entries = data?.certifications || []

  const update = (i, field, value) =>
    onChange({ certifications: entries.map((e, idx) => idx === i ? { ...e, [field]: value } : e) })

  const add = () => onChange({ certifications: [...entries, { ...EMPTY, id: Date.now() }] })
  const remove = (i) => onChange({ certifications: entries.filter((_, idx) => idx !== i) })

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">Certifications</Text>
        <TouchableOpacity onPress={add} className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <Plus color="#4f46e5" size={16} />
          <Text className="text-indigo-600 text-sm font-medium">Add</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 && <Text className="text-gray-400 text-sm text-center py-8">No certifications added yet</Text>}

      {entries.map((entry, index) => (
        <View key={entry.id || index} className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-medium text-gray-700">Certification {index + 1}</Text>
            <TouchableOpacity onPress={() => remove(index)}>
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
          </View>
          <FormField label="Certification Name" value={entry.name} onChangeText={v => update(index, 'name', v)} placeholder="AWS Certified Developer" />
          <FormField label="Issuing Organization" value={entry.issuer} onChangeText={v => update(index, 'issuer', v)} placeholder="Amazon Web Services" />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormField label="Date" value={entry.date} onChangeText={v => update(index, 'date', v)} placeholder="Mar 2024" />
            </View>
            <View className="flex-1">
              <FormField label="Credential ID" value={entry.credentialId} onChangeText={v => update(index, 'credentialId', v)} placeholder="ABC123" />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
