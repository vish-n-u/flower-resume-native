import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'
import { Plus, FileText, Trash2 } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@configs/api'

export default function Dashboard() {
  const { token, user } = useSelector(state => state.auth)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/api/users/data', {
        headers: { Authorization: token },
      })
      setResumes(data.user?.resumes || [])
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load resumes' })
    } finally {
      setLoading(false)
    }
  }

  const createResume = async () => {
    try {
      const { data } = await api.post(
        '/api/resumes/create',
        {},
        { headers: { Authorization: token } }
      )
      router.push(`/(app)/builder/${data.resume._id}`)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create resume' })
    }
  }

  const deleteResume = async (resumeId) => {
    try {
      await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: token },
      })
      setResumes(r => r.filter(x => x._id !== resumeId))
      Toast.show({ type: 'success', text1: 'Resume deleted' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to delete resume' })
    }
  }

  useEffect(() => { fetchResumes() }, [])

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center"
      onPress={() => router.push(`/(app)/builder/${item._id}`)}
      style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }}
    >
      <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center mr-3">
        <FileText color="#4f46e5" size={22} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900" numberOfLines={1}>
          {item.name || 'Untitled Resume'}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        className="p-2"
        onPress={() => deleteResume(item._id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 color="#ef4444" size={18} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">My Resumes</Text>
          <Text className="text-gray-500 text-sm mt-0.5">Hello, {user?.name?.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl px-4 py-2.5 flex-row items-center gap-2"
          onPress={createResume}
        >
          <Plus color="#fff" size={18} />
          <Text className="text-white font-semibold text-sm">New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={resumes}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingTop: 12 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <FileText color="#d1d5db" size={56} />
              <Text className="text-gray-400 mt-4 text-base">No resumes yet</Text>
              <Text className="text-gray-400 text-sm">Tap "New" to create one</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
