import { useEffect, useState, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  FlatList, Modal, TextInput, Alert,
  Dimensions, KeyboardAvoidingView, Platform, RefreshControl
} from 'react-native'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'
import * as Haptics from 'expo-haptics'
import {
  Plus, FileText, Trash2, Sparkles, PencilLine,
  ArrowRight, ServerCrash, X, Briefcase, MoreVertical
} from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@configs/api'

const COLORS = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']
const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 52) / 2  // 2 columns, 16px side padding, 12px gap + 8px extra

export default function Dashboard() {
  const { token, user } = useSelector(state => state.auth)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showServerBanner, setShowServerBanner] = useState(false)
  const serverBannerTimer = useRef(null)

  // Onboarding
  const [onboardingVisible, setOnboardingVisible] = useState(false)

  // AI Tailor modal
  const [tailorVisible, setTailorVisible] = useState(false)
  const [tailorTitle, setTailorTitle] = useState('')
  const [tailorJD, setTailorJD] = useState('')
  const [tailoring, setTailoring] = useState(false)

  // Rename modal
  const [renameId, setRenameId] = useState(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [renaming, setRenaming] = useState(false)

  // Card action menu (long-press)
  const [cardMenuId, setCardMenuId] = useState(null)
  const [cardMenuTitle, setCardMenuTitle] = useState('')

  // ── Server banner ──────────────────────────────────────────────────────────
  const startServerBanner = () => {
    serverBannerTimer.current = setTimeout(() => setShowServerBanner(true), 3000)
  }
  const clearServerBanner = () => {
    clearTimeout(serverBannerTimer.current)
    setShowServerBanner(false)
  }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchResumes = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    startServerBanner()
    try {
      const [resumesRes, profileRes] = await Promise.all([
        api.get('/api/users/resumes', { headers: { Authorization: token } }),
        api.get('/api/users/default-resume-data', { headers: { Authorization: token } }),
      ])
      setResumes(resumesRes.data.resumes || [])
      const d = profileRes.data.defaultResumeData
      const hasData = d && (d.personal_info?.full_name || d.professional_summary || d.experience?.length > 0 || d.education?.length > 0)
      if (!hasData && !isRefresh) setOnboardingVisible(true)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' })
    } finally {
      setLoading(false)
      setRefreshing(false)
      clearServerBanner()
    }
  }

  useEffect(() => { fetchResumes() }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchResumes(true)
  }, [])

  // ── Create blank ───────────────────────────────────────────────────────────
  const createResume = async () => {
    if (creating) return
    setCreating(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const { data } = await api.post('/api/resumes/create', {}, { headers: { Authorization: token } })
      router.push(`/(app)/builder/${data.resume._id}`)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create resume' })
    } finally {
      setCreating(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteResume = (resumeId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    Alert.alert('Delete Resume', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } })
            setResumes(r => r.filter(x => x._id !== resumeId))
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete resume' })
          }
        }
      }
    ])
  }

  // ── Rename ─────────────────────────────────────────────────────────────────
  const saveRename = async () => {
    if (!renameTitle.trim()) return
    setRenaming(true)
    try {
      await api.put('/api/resumes/update',
        { resumeId: renameId, resumeData: { title: renameTitle } },
        { headers: { Authorization: token } }
      )
      setResumes(r => r.map(x => x._id === renameId ? { ...x, title: renameTitle } : x))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setRenameId(null)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to rename' })
    } finally {
      setRenaming(false)
    }
  }

  // ── AI Tailor ──────────────────────────────────────────────────────────────
  const createTailoredResume = async () => {
    if (!tailorTitle.trim() || !tailorJD.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill in both fields' })
      return
    }
    setTailoring(true)
    startServerBanner()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const { data } = await api.post(
        '/api/ai/tailor-resume',
        { title: tailorTitle, jobDescription: tailorJD },
        { headers: { Authorization: token } }
      )
      setTailorTitle('')
      setTailorJD('')
      setTailorVisible(false)
      await fetchResumes(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.push(`/(app)/builder/${data.resumeId}`)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to generate resume' })
    } finally {
      setTailoring(false)
      clearServerBanner()
    }
  }

  // ── Resume card ────────────────────────────────────────────────────────────
  const ResumeCard = useCallback(({ item, index }) => {
    const color = COLORS[index % COLORS.length]
    const title = item.title || item.name || 'Untitled'
    const updatedAt = new Date(item.updatedAt)
    const daysAgo = Math.floor((Date.now() - updatedAt) / 86400000)
    const dateLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`

    return (
      <TouchableOpacity
        style={{ width: CARD_WIDTH, backgroundColor: color + '10', borderColor: color + '35', borderWidth: 1 }}
        className="rounded-2xl p-4 mb-3"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push(`/(app)/builder/${item._id}`)
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          setCardMenuId(item._id)
          setCardMenuTitle(title)
        }}
        activeOpacity={0.75}
        delayLongPress={300}
      >
        <View className="p-2 rounded-xl mb-3 self-start" style={{ backgroundColor: color + '20' }}>
          <FileText size={20} color={color} />
        </View>
        <Text className="font-semibold text-sm leading-snug mb-2 flex-1" numberOfLines={2} style={{ color }}>
          {title}
        </Text>
        <Text className="text-xs font-medium" style={{ color: color + 'aa' }}>{dateLabel}</Text>
      </TouchableOpacity>
    )
  }, [])

  // ── List header (rendered inside FlatList) ─────────────────────────────────
  const ListHeader = () => (
    <View>
      {/* Greeting header */}
      <View className="px-5 pt-5 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">My Resumes</Text>
          <Text className="text-gray-500 text-sm mt-0.5">
            Hey, {user?.name?.split(' ')[0] || 'there'} 👋
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-xl px-3 py-2.5 flex-row items-center gap-1.5"
          style={{ backgroundColor: creating ? '#d1d5db' : '#111827' }}
          onPress={createResume}
          disabled={creating}
          activeOpacity={0.8}
        >
          {creating
            ? <ActivityIndicator color="#fff" size="small" />
            : <Plus color="#fff" size={16} />
          }
          <Text className="text-white font-semibold text-sm">Blank</Text>
        </TouchableOpacity>
      </View>

      {/* AI Tailor banner */}
      <TouchableOpacity
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#fffbeb', borderWidth: 1.5, borderColor: '#fbbf24' }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setTailorVisible(true)
        }}
        activeOpacity={0.88}
      >
        <View className="flex-row items-center gap-3">
          <View className="p-3 rounded-xl" style={{ backgroundColor: '#f59e0b' }}>
            <Sparkles size={22} color="#fff" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-0.5">
              <Text className="font-bold text-gray-900 text-base">AI Resume Creator</Text>
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: '#f59e0b' }}>
                <Text className="text-white text-[10px] font-bold">AI</Text>
              </View>
            </View>
            <Text className="text-gray-600 text-xs leading-relaxed">
              Paste a job description — AI tailors your resume instantly
            </Text>
          </View>
          <ArrowRight size={18} color="#d97706" />
        </View>
      </TouchableOpacity>

      {/* Section label */}
      <View className="px-5 flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-gray-700 uppercase tracking-wide">Saved Resumes</Text>
        <Text className="text-xs text-gray-400">{resumes.length} total</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* Server waking banner */}
      {showServerBanner && (
        <View className="bg-amber-500 px-4 py-2.5 flex-row items-center gap-2">
          <ServerCrash size={16} color="#fff" />
          <Text className="text-white text-xs font-medium flex-1">
            Server is waking up (free plan) — please wait...
          </Text>
        </View>
      )}

      <FlatList
        data={resumes}
        keyExtractor={item => item._id}
        numColumns={2}
        renderItem={({ item, index }) => <ResumeCard item={item} index={index} />}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f59e0b"
            colors={['#f59e0b']}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#f59e0b" />
            </View>
          ) : (
            <View className="items-center py-12 px-8">
              <View className="w-20 h-20 rounded-3xl bg-gray-100 items-center justify-center mb-4">
                <FileText size={36} color="#d1d5db" />
              </View>
              <Text className="text-gray-700 text-base font-semibold mb-1">No resumes yet</Text>
              <Text className="text-gray-400 text-sm text-center">
                Tap AI Resume Creator above or create a blank one
              </Text>
            </View>
          )
        }
      />

      {/* ── CARD ACTION MENU (long press) ───────────────────────────────────── */}
      <Modal visible={!!cardMenuId} animationType="fade" transparent onRequestClose={() => setCardMenuId(null)}>
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setCardMenuId(null)}
        >
          <View className="bg-white rounded-t-3xl px-5 pt-3 pb-10">
            <View className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <Text className="font-bold text-gray-900 text-base mb-4 px-1" numberOfLines={1}>
              {cardMenuTitle}
            </Text>

            <TouchableOpacity
              className="flex-row items-center gap-4 py-4 border-b border-gray-100"
              onPress={() => {
                setCardMenuId(null)
                setRenameId(cardMenuId)
                setRenameTitle(cardMenuTitle)
              }}
            >
              <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center">
                <PencilLine size={18} color="#374151" />
              </View>
              <Text className="text-gray-800 font-medium text-base">Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-4 py-4"
              onPress={() => { setCardMenuId(null); deleteResume(cardMenuId) }}
            >
              <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center">
                <Trash2 size={18} color="#ef4444" />
              </View>
              <Text className="text-red-500 font-medium text-base">Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── ONBOARDING MODAL ────────────────────────────────────────────────── */}
      <Modal visible={onboardingVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
            <Text className="text-2xl font-bold text-gray-900 mb-1">Welcome! 🌻</Text>
            <Text className="text-gray-500 text-sm mb-6">
              To use the AI resume generator, we need your details first.
            </Text>

            <TouchableOpacity
              className="flex-row items-center gap-4 p-4 rounded-2xl mb-3 border-2 border-purple-200"
              style={{ backgroundColor: '#faf5ff' }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setOnboardingVisible(false)
                router.push('/(app)/profile')
              }}
            >
              <View className="p-2.5 rounded-xl bg-purple-500">
                <PencilLine size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">Fill Profile Manually</Text>
                <Text className="text-gray-500 text-xs mt-0.5">Add your experience, education, and skills</Text>
              </View>
              <View className="bg-purple-500 rounded-full px-2 py-0.5">
                <Text className="text-white text-[10px] font-bold">RECOMMENDED</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-4 p-4 rounded-2xl border-2 border-amber-200"
              style={{ backgroundColor: '#fffbeb' }}
              onPress={() => setOnboardingVisible(false)}
            >
              <View className="p-2.5 rounded-xl bg-amber-400">
                <Briefcase size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">Skip for now</Text>
                <Text className="text-gray-500 text-xs mt-0.5">Browse and create blank resumes</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── AI TAILOR MODAL ─────────────────────────────────────────────────── */}
      <Modal visible={tailorVisible} animationType="slide" onRequestClose={() => !tailoring && setTailorVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={() => !tailoring && setTailorVisible(false)} className="mr-3">
                <X size={22} color="#374151" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">AI Resume Creator</Text>
                <Text className="text-gray-400 text-xs">Tailored to the job description</Text>
              </View>
              <View className="p-2 rounded-xl bg-amber-100">
                <Sparkles size={18} color="#d97706" />
              </View>
            </View>

            <ScrollableForm
              tailorTitle={tailorTitle} setTailorTitle={setTailorTitle}
              tailorJD={tailorJD} setTailorJD={setTailorJD}
              tailoring={tailoring}
            />

            <View className="px-4 pb-6 pt-3 border-t border-gray-100">
              <TouchableOpacity
                className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
                style={{ backgroundColor: tailoring ? '#9ca3af' : '#f59e0b' }}
                onPress={createTailoredResume}
                disabled={tailoring}
                activeOpacity={0.85}
              >
                {tailoring ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="text-white font-bold text-base">Generating resume...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} color="#fff" />
                    <Text className="text-white font-bold text-base">Generate Tailored Resume</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── RENAME MODAL ──────────────────────────────────────────────────────── */}
      <Modal visible={!!renameId} animationType="fade" transparent onRequestClose={() => setRenameId(null)}>
        <View className="flex-1 justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-5">
            <Text className="font-bold text-gray-900 text-base mb-4">Rename Resume</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
              value={renameTitle}
              onChangeText={setRenameTitle}
              placeholder="Resume title"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3.5 items-center"
                onPress={() => setRenameId(null)}
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl py-3.5 items-center"
                style={{ backgroundColor: '#f59e0b' }}
                onPress={saveRename}
                disabled={renaming}
              >
                {renaming
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text className="text-white font-semibold">Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

// Extracted so KeyboardAvoidingView + ScrollView work correctly inside Modal
import { ScrollView } from 'react-native'
function ScrollableForm({ tailorTitle, setTailorTitle, tailorJD, setTailorJD, tailoring }) {
  return (
    <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Resume Title</Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-5"
        value={tailorTitle}
        onChangeText={setTailorTitle}
        placeholder="e.g. Senior Engineer at Google"
        placeholderTextColor="#9ca3af"
        editable={!tailoring}
      />
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Job Description</Text>
      <Text className="text-xs text-gray-400 mb-2">Paste the full job posting for best results</Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-2"
        value={tailorJD}
        onChangeText={setTailorJD}
        placeholder={"We are looking for a Senior Software Engineer...\n\nResponsibilities:\n- Lead development of...\n\nRequirements:\n- Strong experience in..."}
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={12}
        textAlignVertical="top"
        style={{ minHeight: 220 }}
        editable={!tailoring}
      />
      <Text className="text-xs text-gray-400 mb-8">
        💡 Include requirements, responsibilities and qualifications for best results
      </Text>
    </ScrollView>
  )
}
