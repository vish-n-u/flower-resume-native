import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Plus, X } from 'lucide-react-native'

export default function SkillsForm({ data, onChange }) {
  const skills = data?.skills || []
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange({ skills: [...skills, trimmed] })
      setInput('')
    }
  }

  const remove = (skill) => {
    onChange({ skills: skills.filter(s => s !== skill) })
  }

  return (
    <View>
      <Text className="text-base font-bold text-gray-900 mb-4">Skills</Text>

      <View className="flex-row mb-4 gap-2">
        <TextInput
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
          value={input}
          onChangeText={setInput}
          placeholder="e.g. React Native"
          placeholderTextColor="#9ca3af"
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={add}
          className="bg-indigo-600 rounded-xl px-4 items-center justify-center"
        >
          <Plus color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {skills.map(skill => (
          <View
            key={skill}
            className="flex-row items-center bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 gap-1.5"
          >
            <Text className="text-indigo-700 text-sm font-medium">{skill}</Text>
            <TouchableOpacity onPress={() => remove(skill)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
              <X color="#4f46e5" size={14} />
            </TouchableOpacity>
          </View>
        ))}
        {skills.length === 0 && (
          <Text className="text-gray-400 text-sm">Add skills one by one</Text>
        )}
      </View>
    </View>
  )
}
