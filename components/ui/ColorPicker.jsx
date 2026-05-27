import { View, Text, TouchableOpacity } from 'react-native'
import { X, Check } from 'lucide-react-native'

const COLORS = [
  { label: 'Indigo',  value: '#4f46e5' },
  { label: 'Blue',    value: '#2563eb' },
  { label: 'Teal',    value: '#0d9488' },
  { label: 'Green',   value: '#16a34a' },
  { label: 'Rose',    value: '#e11d48' },
  { label: 'Orange',  value: '#ea580c' },
  { label: 'Purple',  value: '#9333ea' },
  { label: 'Slate',   value: '#475569' },
  { label: 'Black',   value: '#111827' },
]

export default function ColorPicker({ current, onSelect, onClose }) {
  return (
    <View className="flex-1 justify-end">
      <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8" style={{ elevation: 20 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-lg font-bold text-gray-900">Accent Color</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#6b7280" size={22} />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {COLORS.map(({ label, value }) => {
            const active = current === value
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onSelect(value)}
                className="items-center"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: value, borderWidth: active ? 3 : 0, borderColor: '#e5e7eb' }}
                >
                  {active && <Check color="#fff" size={18} />}
                </View>
                <Text className="text-xs text-gray-500 mt-1">{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}
