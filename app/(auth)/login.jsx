import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Animated
} from 'react-native'
import { useDispatch } from 'react-redux'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { ServerCrash, Sparkles } from 'lucide-react-native'
import api from '@configs/api'
import { login } from '@store/features/authSlice'
import { saveToken } from '@utils/storage'

const GUEST = { email: 'guest@gmail.com', password: 'abcd1234' }

export default function LoginScreen() {
  const dispatch = useDispatch()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [showServerBanner, setShowServerBanner] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const serverTimer = useRef(null)

  const startServerBanner = () => {
    serverTimer.current = setTimeout(() => setShowServerBanner(true), 3000)
  }
  const clearServerBanner = () => {
    clearTimeout(serverTimer.current)
    setShowServerBanner(false)
  }

  const handleAuth = async (credentials, isGuest = false) => {
    isGuest ? setGuestLoading(true) : setLoading(true)
    startServerBanner()
    try {
      const endpoint = (!isGuest && isRegister) ? '/api/users/register' : '/api/users/login'
      const { data } = await api.post(endpoint, credentials)
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
      isGuest ? setGuestLoading(false) : setLoading(false)
      clearServerBanner()
    }
  }

  const handleSubmit = () => {
    const payload = isRegister
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password }
    handleAuth(payload)
  }

  const handleGuestLogin = () => handleAuth(GUEST, true)

  const anyLoading = loading || guestLoading

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Server waking banner */}
      {showServerBanner && (
        <View className="bg-amber-500 px-4 py-3 flex-row items-center gap-2">
          <ServerCrash size={16} color="#fff" />
          <Text className="text-white text-xs font-medium flex-1">
            Server is waking up (free plan) — please wait a moment...
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">

          {/* Logo / brand */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-2xl bg-amber-400 items-center justify-center mb-3"
              style={{ elevation: 4, shadowColor: '#f59e0b', shadowOpacity: 0.4, shadowRadius: 8 }}>
              <Sparkles size={26} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">Flower Resume</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {isRegister ? 'Create your account' : 'Sign in to continue'}
            </Text>
          </View>

          {/* Name field (register only) */}
          {isRegister && (
            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="John Doe"
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                autoCapitalize="words"
                editable={!anyLoading}
              />
            </View>
          )}

          {/* Email */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!anyLoading}
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              placeholder="••••••••"
              value={form.password}
              onChangeText={v => setForm(f => ({ ...f, password: v }))}
              secureTextEntry
              editable={!anyLoading}
            />
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center mb-3"
            style={{ backgroundColor: anyLoading ? '#9ca3af' : '#f59e0b' }}
            onPress={handleSubmit}
            disabled={anyLoading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold text-base">
                  {isRegister ? 'Create Account' : 'Sign In'}
                </Text>
            }
          </TouchableOpacity>

          {/* Guest login (login mode only) */}
          {!isRegister && (
            <TouchableOpacity
              className="rounded-xl py-4 items-center mb-6 border-2 border-amber-400"
              onPress={handleGuestLogin}
              disabled={anyLoading}
            >
              {guestLoading
                ? <ActivityIndicator color="#f59e0b" />
                : <Text className="text-amber-600 font-bold text-base">Try as Guest</Text>
              }
            </TouchableOpacity>
          )}

          {/* Toggle */}
          <TouchableOpacity onPress={() => !anyLoading && setIsRegister(r => !r)}>
            <Text className="text-center text-gray-500 text-sm">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="text-amber-600 font-semibold">
                {isRegister ? 'Sign in' : 'Sign up'}
              </Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
