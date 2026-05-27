import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native'
import { useDispatch } from 'react-redux'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import api from '@configs/api'
import { login } from '@store/features/authSlice'
import { saveToken } from '@utils/storage'

export default function LoginScreen() {
  const dispatch = useDispatch()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login'
      const payload = isRegister
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }

      const { data } = await api.post(endpoint, payload)

      if (data.token) {
        await saveToken(data.token)
        dispatch(login({ token: data.token, user: data.user }))
        router.replace('/(app)')
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Create account' : 'Welcome back'}
          </Text>
          <Text className="text-gray-500 mb-8">
            {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
          </Text>

          {isRegister && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Name</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="John Doe"
                value={form.name}
                onChangeText={(v) => setForm(f => ({ ...f, name: v }))}
                autoCapitalize="words"
              />
            </View>
          )}

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="••••••••"
              value={form.password}
              onChangeText={(v) => setForm(f => ({ ...f, password: v }))}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-indigo-600 rounded-xl py-4 items-center mb-4"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-semibold text-base">
                  {isRegister ? 'Create Account' : 'Sign In'}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(r => !r)}>
            <Text className="text-center text-gray-500">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="text-indigo-600 font-medium">
                {isRegister ? 'Sign in' : 'Sign up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
