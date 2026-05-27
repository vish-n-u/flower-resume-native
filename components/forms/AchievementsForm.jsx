import { View, Text, TouchableOpacity } from 'react-native'
import { Plus, Trash2 } from 'lucide-react-native'
import FormField from './FormField'

const EMPTY = { title: '', description: '', date: '' }

export default function AchievementsForm({ data, onChange }) {
  const entries = data?.achievements || []

  const update = (i, field, value) =>
    onChange({ achievements: entries.map((e, idx) => idx === i ? { ...e, [field]: value } : e) })

  const add = () => onChange({ achievements: [...entries, { ...EMPTY, id: Date.now() }] })
  const remove = (i) => onChange({ achievements: entries.filter((_, idx) => idx !== i) })

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">Achievements & Awards</Text>
        <TouchableOpacity onPress={add} className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <Plus color="#4f46e5" size={16} />
          <Text className="text-indigo-600 text-sm font-medium">Add</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 && <Text className="text-gray-400 text-sm text-center py-8">No achievements added yet</Text>}

      {entries.map((entry, index) => (
        <View key={entry.id || index} className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-medium text-gray-700">Achievement {index + 1}</Text>
            <TouchableOpacity onPress={() => remove(index)}>
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
          </View>
          <FormField label="Title" value={entry.title} onChangeText={v => update(index, 'title', v)} placeholder="Best Developer Award" />
          <FormField label="Date" value={entry.date} onChangeText={v => update(index, 'date', v)} placeholder="2023" />
          <FormField label="Description" value={entry.description} onChangeText={v => update(index, 'description', v)} placeholder="Brief description..." multiline numberOfLines={3} />
        </View>
      ))}
    </View>
  )
}
