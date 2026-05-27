import { useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ClipboardList, ExternalLink } from 'lucide-react-native'
import { fetchApplications } from '@store/features/applicationsSlice'

const STATUS_COLORS = {
  applied:     { bg: 'bg-blue-50',   text: 'text-blue-700' },
  interviewing:{ bg: 'bg-yellow-50', text: 'text-yellow-700' },
  offered:     { bg: 'bg-green-50',  text: 'text-green-700' },
  rejected:    { bg: 'bg-red-50',    text: 'text-red-700' },
}

export default function Applied() {
  const dispatch = useDispatch()
  const { applications, loading } = useSelector(state => state.applications)
  const { token } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(fetchApplications(token))
  }, [])

  const renderItem = ({ item }) => {
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.applied
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
        style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3 }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
              {item.jobTitle}
            </Text>
            <Text className="text-gray-500 text-sm mt-0.5">{item.company}</Text>
          </View>
          <View className={`px-2.5 py-1 rounded-full ${status.bg}`}>
            <Text className={`text-xs font-medium capitalize ${status.text}`}>{item.status}</Text>
          </View>
        </View>
        <Text className="text-xs text-gray-400 mt-2">
          Applied {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Applications</Text>
        <Text className="text-gray-500 text-sm mt-0.5">{applications.length} total</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingTop: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <ClipboardList color="#d1d5db" size={56} />
              <Text className="text-gray-400 mt-4 text-base">No applications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
