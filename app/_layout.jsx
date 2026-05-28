import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { Provider, useDispatch } from 'react-redux'
import Toast from 'react-native-toast-message'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { store } from '@store/index'
import { bootstrapAuth } from '@store/features/authSlice'

SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(bootstrapAuth()).finally(() => SplashScreen.hideAsync())
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <Toast position="bottom" bottomOffset={80} />
    </>
  )
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  )
}
