import { View, Text, TouchableOpacity } from 'react-native'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native'
import { useState } from 'react'
import FormField from './FormField'

const EMPTY = { title: '', description: '', tech_stack: '', link: '' }

export default function ProjectForm({ data, onChange }) {
  const entries = data?.project || []
  const [expanded, setExpanded] = useState(0)

  const update = (i, field, value) =>
    onChange({ project: entries.map((e, idx) => idx === i ? { ...e, [field]: value } : e) })

  const add = () => {
    onChange({ project: [...entries, { ...EMPTY, id: Date.now() }] })
    setExpanded(entries.length)
  }

  const remove = (i) => onChange({ project: entries.filter((_, idx) => idx !== i) })

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">Projects</Text>
        <TouchableOpacity onPress={add} className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <Plus color="#4f46e5" size={16} />
          <Text className="text-indigo-600 text-sm font-medium">Add</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 && <Text className="text-gray-400 text-sm text-center py-8">No projects added yet</Text>}

      {entries.map((entry, index) => (
        <View key={entry.id || index} className="bg-white border border-gray-200 rounded-2xl mb-3 overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-3"
            onPress={() => setExpanded(expanded === index ? -1 : index)}
          >
            <View className="flex-1">
              <Text className="font-medium text-gray-900" numberOfLines={1}>{entry.title || 'New Project'}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(index)} className="mr-2">
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
            {expanded === index ? <ChevronUp color="#9ca3af" size={18} /> : <ChevronDown color="#9ca3af" size={18} />}
          </TouchableOpacity>

          {expanded === index && (
            <View className="px-4 pb-4 border-t border-gray-100 pt-3">
              <FormField label="Project Title" value={entry.title} onChangeText={v => update(index, 'title', v)} placeholder="My Awesome App" />
              <FormField label="Tech Stack" value={entry.tech_stack} onChangeText={v => update(index, 'tech_stack', v)} placeholder="React Native, Node.js, MongoDB" />
              <FormField label="Link" value={entry.link} onChangeText={v => update(index, 'link', v)} placeholder="github.com/you/project" />
              <FormField label="Description" value={entry.description} onChangeText={v => update(index, 'description', v)} placeholder="What does this project do?" multiline numberOfLines={4} />
            </View>
          )}
        </View>
      ))}
    </View>
  )
}
