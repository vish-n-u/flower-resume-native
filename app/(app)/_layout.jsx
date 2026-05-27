import { Tabs, router } from 'expo-router'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { FileText, LayoutDashboard, Briefcase, ClipboardList, User } from 'lucide-react-native'

export default function AppLayout() {
  const { user, token } = useSelector(state => state.auth)

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login')
    }
  }, [token])

  if (!token) return null

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
        options={{
          title: 'Applied',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
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
