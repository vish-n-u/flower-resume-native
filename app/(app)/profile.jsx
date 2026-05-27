import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, ActivityIndicator
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { Camera, LogOut, User } from 'lucide-react-native'
import api from '@configs/api'
import { logout, updateUser } from '@store/features/authSlice'
import { router } from 'expo-router'
import { removeToken } from '@utils/storage'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, token } = useSelector(state => state.auth)
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const uri = result.assets[0].uri
      const formData = new FormData()
      formData.append('image', { uri, type: 'image/jpeg', name: 'profile.jpg' })

      try {
        const { data } = await api.put('/api/users/update-default-resume-data', formData, {
          headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        })
        dispatch(updateUser(data.user))
        Toast.show({ type: 'success', text1: 'Photo updated' })
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to update photo' })
      }
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(
        '/api/users/update',
        { name },
        { headers: { Authorization: token } }
      )
      dispatch(updateUser(data.user))
      Toast.show({ type: 'success', text1: 'Profile saved' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await removeToken()
    dispatch(logout())
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

        {/* Avatar */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} className="relative">
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="w-24 h-24 rounded-full bg-gray-200"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center">
                <User color="#4f46e5" size={40} />
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-8 h-8 items-center justify-center border-2 border-white">
              <Camera color="#fff" size={14} />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-2">Tap to change photo</Text>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email (read-only) */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
            <Text className="text-base text-gray-500">{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-indigo-600 rounded-xl py-4 items-center mb-4"
          onPress={saveProfile}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-semibold text-base">Save Changes</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-red-200 rounded-xl py-4 items-center flex-row justify-center gap-2"
          onPress={handleLogout}
        >
          <LogOut color="#ef4444" size={18} />
          <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
