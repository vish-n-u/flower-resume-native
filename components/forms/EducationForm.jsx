import { View, Text, TouchableOpacity } from 'react-native'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native'
import { useState } from 'react'
import FormField from './FormField'

const EMPTY_ENTRY = { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }

export default function EducationForm({ data, onChange }) {
  const entries = data?.education || []
  const [expanded, setExpanded] = useState(0)

  const update = (index, field, value) => {
    onChange({ education: entries.map((e, i) => i === index ? { ...e, [field]: value } : e) })
  }

  const add = () => {
    onChange({ education: [...entries, { ...EMPTY_ENTRY, id: Date.now() }] })
    setExpanded(entries.length)
  }

  const remove = (index) => {
    onChange({ education: entries.filter((_, i) => i !== index) })
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">Education</Text>
        <TouchableOpacity onPress={add} className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <Plus color="#4f46e5" size={16} />
          <Text className="text-indigo-600 text-sm font-medium">Add</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 && (
        <Text className="text-gray-400 text-sm text-center py-8">No education added yet</Text>
      )}

      {entries.map((entry, index) => (
        <View key={entry.id || index} className="bg-white border border-gray-200 rounded-2xl mb-3 overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-3"
            onPress={() => setExpanded(expanded === index ? -1 : index)}
          >
            <View className="flex-1">
              <Text className="font-medium text-gray-900" numberOfLines={1}>{entry.degree || 'Degree'}</Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>{entry.institution || 'Institution'}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(index)} className="mr-2">
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
            {expanded === index ? <ChevronUp color="#9ca3af" size={18} /> : <ChevronDown color="#9ca3af" size={18} />}
          </TouchableOpacity>

          {expanded === index && (
            <View className="px-4 pb-4 border-t border-gray-100 pt-3">
              <FormField label="Institution" value={entry.institution} onChangeText={v => update(index, 'institution', v)} placeholder="MIT" />
              <FormField label="Degree" value={entry.degree} onChangeText={v => update(index, 'degree', v)} placeholder="Bachelor of Science" />
              <FormField label="Field of Study" value={entry.field} onChangeText={v => update(index, 'field', v)} placeholder="Computer Science" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Start" value={entry.startDate} onChangeText={v => update(index, 'startDate', v)} placeholder="2018" />
                </View>
                <View className="flex-1">
                  <FormField label="End" value={entry.endDate} onChangeText={v => update(index, 'endDate', v)} placeholder="2022" />
                </View>
                <View className="flex-1">
                  <FormField label="GPA" value={entry.gpa} onChangeText={v => update(index, 'gpa', v)} placeholder="3.8" keyboardType="decimal-pad" />
                </View>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  )
}
