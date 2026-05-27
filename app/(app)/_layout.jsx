import { Tabs, router } from 'expo-router'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { LayoutDashboard, User } from 'lucide-react-native'

export default function AppLayout() {
  const { token, loading } = useSelector(state => state.auth)

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/(auth)/login')
    }
  }, [token, loading])

  if (loading || !token) return null

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="applied"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      {/* Builder is a full-screen stack, hidden from tab bar */}
      <Tabs.Screen
        name="builder/[resumeId]"
        options={{ href: null }}
      />
    </Tabs>
  )
}
