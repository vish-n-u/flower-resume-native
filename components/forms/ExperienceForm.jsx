import { View, Text, TouchableOpacity } from 'react-native'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native'
import { useState } from 'react'
import FormField from './FormField'
import RichTextInput from './RichTextInput'

const EMPTY_ENTRY = {
  company: '', position: '', start_date: '', end_date: '',
  is_current: false, description: '',
}

export default function ExperienceForm({ data, onChange }) {
  const entries = data?.experience || []
  const [expanded, setExpanded] = useState(0)

  const update = (index, field, value) => {
    const updated = entries.map((e, i) => i === index ? { ...e, [field]: value } : e)
    onChange({ experience: updated })
  }

  const add = () => {
    onChange({ experience: [...entries, { ...EMPTY_ENTRY, id: Date.now() }] })
    setExpanded(entries.length)
  }

  const remove = (index) => {
    onChange({ experience: entries.filter((_, i) => i !== index) })
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">Experience</Text>
        <TouchableOpacity onPress={add} className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <Plus color="#4f46e5" size={16} />
          <Text className="text-indigo-600 text-sm font-medium">Add</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 && (
        <Text className="text-gray-400 text-sm text-center py-8">No experience added yet</Text>
      )}

      {entries.map((entry, index) => (
        <View key={entry.id || index} className="bg-white border border-gray-200 rounded-2xl mb-3 overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-3"
            onPress={() => setExpanded(expanded === index ? -1 : index)}
          >
            <View className="flex-1">
              <Text className="font-medium text-gray-900" numberOfLines={1}>
                {entry.position || 'New Position'}
              </Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {entry.company || 'Company'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => remove(index)} className="mr-2">
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
            {expanded === index ? <ChevronUp color="#9ca3af" size={18} /> : <ChevronDown color="#9ca3af" size={18} />}
          </TouchableOpacity>

          {expanded === index && (
            <View className="px-4 pb-4 border-t border-gray-100">
              <View className="h-3" />
              <FormField label="Position" value={entry.position} onChangeText={v => update(index, 'position', v)} placeholder="Software Engineer" />
              <FormField label="Company" value={entry.company} onChangeText={v => update(index, 'company', v)} placeholder="Acme Corp" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Start Date" value={entry.start_date} onChangeText={v => update(index, 'start_date', v)} placeholder="Jan 2022" />
                </View>
                <View className="flex-1">
                  <FormField label="End Date" value={entry.end_date} onChangeText={v => update(index, 'end_date', v)} placeholder="Present" />
                </View>
              </View>
              <RichTextInput
                label="Description"
                value={entry.description}
                onChange={v => update(index, 'description', v)}
                placeholder="Describe your responsibilities and achievements..."
                minHeight={120}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  )
}
