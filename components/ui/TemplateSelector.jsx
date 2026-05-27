import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { X, Check } from 'lucide-react-native'

const TEMPLATES = [
  { key: 'classic',       label: 'Classic' },
  { key: 'modern',        label: 'Modern' },
  { key: 'minimal',       label: 'Minimal' },
  { key: 'minimal-image', label: 'Minimal + Photo' },
  { key: 'compact',       label: 'Compact' },
]

export default function TemplateSelector({ current, onSelect, onClose }) {
  return (
    <View className="flex-1 justify-end">
      <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8" style={{ elevation: 20 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-lg font-bold text-gray-900">Choose Template</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#6b7280" size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {TEMPLATES.map(({ key, label }) => {
            const active = current === key
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onSelect(key)}
                className={`flex-row items-center px-4 py-4 rounded-xl mb-2 border ${
                  active ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'
                }`}
              >
                <View className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${
                  active ? 'bg-indigo-600' : 'bg-gray-100'
                }`}>
                  {active && <Check color="#fff" size={16} />}
                </View>
                <Text className={`font-medium text-base ${active ? 'text-indigo-700' : 'text-gray-800'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}
