import { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ActivityIndicator, ScrollView,
  Modal, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'
import {
  Plus, FileText, Trash2, Sparkles, PencilLine,
  UploadCloud, ArrowRight, ServerCrash, X, Briefcase
} from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@configs/api'

const COLORS = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']
const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2 // 2-column grid with padding

export default function Dashboard() {
  const { token, user } = useSelector(state => state.auth)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
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

  // ── Server banner ────────────────────────────────────────────────────────────
  const startServerBanner = () => {
    serverBannerTimer.current = setTimeout(() => setShowServerBanner(true), 3000)
  }
  const clearServerBanner = () => {
    clearTimeout(serverBannerTimer.current)
    setShowServerBanner(false)
  }

  // ── Fetch resumes + check onboarding ────────────────────────────────────────
  const fetchResumes = async () => {
    setLoading(true)
    startServerBanner()
    try {
      const [resumesRes, profileRes] = await Promise.all([
        api.get('/api/users/resumes', { headers: { Authorization: token } }),
        api.get('/api/users/default-resume-data', { headers: { Authorization: token } }),
      ])
      setResumes(resumesRes.data.resumes || [])

      const d = profileRes.data.defaultResumeData
      const hasMeaningfulData = d && (
        d.personal_info?.full_name ||
        d.professional_summary ||
        (d.experience?.length > 0) ||
        (d.education?.length > 0)
      )
      if (!hasMeaningfulData) setOnboardingVisible(true)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' })
    } finally {
      setLoading(false)
      clearServerBanner()
    }
  }

  useEffect(() => { fetchResumes() }, [])

  // ── Create blank resume ──────────────────────────────────────────────────────
  const createResume = async () => {
    try {
      const { data } = await api.post('/api/resumes/create', {}, { headers: { Authorization: token } })
      router.push(`/(app)/builder/${data.resume._id}`)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create resume' })
    }
  }

  // ── Delete resume ────────────────────────────────────────────────────────────
  const deleteResume = (resumeId) => {
    Alert.alert('Delete Resume', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } })
            setResumes(r => r.filter(x => x._id !== resumeId))
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete resume' })
          }
        }
      }
    ])
  }

  // ── Rename resume ────────────────────────────────────────────────────────────
  const openRename = (resume) => {
    setRenameId(resume._id)
    setRenameTitle(resume.title || resume.name || '')
  }

  const saveRename = async () => {
    if (!renameTitle.trim()) return
    setRenaming(true)
    try {
      await api.put('/api/resumes/update',
        { resumeId: renameId, resumeData: { title: renameTitle } },
        { headers: { Authorization: token } }
      )
      setResumes(r => r.map(x => x._id === renameId ? { ...x, title: renameTitle } : x))
      setRenameId(null)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to rename' })
    } finally {
      setRenaming(false)
    }
  }

  // ── AI Tailor ────────────────────────────────────────────────────────────────
  const createTailoredResume = async () => {
    if (!tailorTitle.trim() || !tailorJD.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill in both fields' })
      return
    }
    setTailoring(true)
    startServerBanner()
    try {
      const { data } = await api.post(
        '/api/ai/tailor-resume',
        { title: tailorTitle, jobDescription: tailorJD },
        { headers: { Authorization: token } }
      )
      setTailorTitle('')
      setTailorJD('')
      setTailorVisible(false)
      await fetchResumes()
      router.push(`/(app)/builder/${data.resumeId}`)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to generate resume' })
    } finally {
      setTailoring(false)
      clearServerBanner()
    }
  }

  // ── Resume card ──────────────────────────────────────────────────────────────
  const ResumeCard = ({ item, index }) => {
    const color = COLORS[index % COLORS.length]
    const title = item.title || item.name || 'Untitled'
    return (
      <TouchableOpacity
        style={{ width: CARD_WIDTH, height: 160, backgroundColor: color + '12', borderColor: color + '40', borderWidth: 1 }}
        className="rounded-2xl p-3 mb-3 justify-between"
        onPress={() => router.push(`/(app)/builder/${item._id}`)}
        activeOpacity={0.85}
      >
        <View className="flex-row justify-between items-start">
          <View className="p-2 rounded-xl" style={{ backgroundColor: color + '20' }}>
            <FileText size={18} color={color} />
          </View>
          <View className="flex-row gap-1">
            <TouchableOpacity
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: color + '15' }}
              onPress={() => openRename(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <PencilLine size={13} color={color} />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: '#ef444415' }}
              onPress={() => deleteResume(item._id)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Trash2 size={13} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text className="font-semibold text-gray-800 text-sm leading-tight" numberOfLines={2} style={{ color }}>
            {title}
          </Text>
          <Text className="text-xs mt-1" style={{ color: color + '99' }}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* Server waking banner */}
      {showServerBanner && (
        <View className="bg-amber-500 px-4 py-2.5 flex-row items-center gap-2">
          <ServerCrash size={16} color="#fff" />
          <Text className="text-white text-xs font-medium flex-1">
            Server is waking up (free plan) — please wait a moment...
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-5 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-gray-500 text-sm mt-0.5">Hey, {user?.name?.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity
            className="bg-gray-800 rounded-xl px-3 py-2.5 flex-row items-center gap-1.5"
            onPress={createResume}
          >
            <Plus color="#fff" size={16} />
            <Text className="text-white font-semibold text-sm">Blank</Text>
          </TouchableOpacity>
        </View>

        {/* AI Tailor banner — main CTA */}
        <TouchableOpacity
          className="mx-5 mb-5 rounded-2xl p-4 overflow-hidden"
          style={{ backgroundColor: '#fefce8', borderWidth: 1.5, borderColor: '#fbbf24' }}
          onPress={() => setTailorVisible(true)}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center gap-3">
            <View className="p-3 rounded-xl" style={{ backgroundColor: '#f59e0b' }}>
              <Sparkles size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                <Text className="font-bold text-gray-900 text-base">AI Resume Creator</Text>
                <View className="bg-amber-500 rounded-full px-2 py-0.5">
                  <Text className="text-white text-[10px] font-bold">NEW</Text>
                </View>
              </View>
              <Text className="text-gray-600 text-xs leading-relaxed">
                Paste a job description — AI tailors your resume instantly
              </Text>
            </View>
            <ArrowRight size={18} color="#d97706" />
          </View>
        </TouchableOpacity>

        {/* Resumes section */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-900">My Resumes</Text>
            <Text className="text-xs text-gray-400">{resumes.length} saved</Text>
          </View>

          {loading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : resumes.length === 0 ? (
            <View className="items-center py-16">
              <FileText size={52} color="#e5e7eb" />
              <Text className="text-gray-400 mt-4 text-base font-medium">No resumes yet</Text>
              <Text className="text-gray-400 text-sm mt-1 text-center px-8">
                Tap the AI Resume Creator above or create a blank one
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {resumes.map((item, index) => (
                <ResumeCard key={item._id} item={item} index={index} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── ONBOARDING MODAL ──────────────────────────────────────────────────── */}
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
              <View className="p-2.5 rounded-xl bg-amber-500">
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

      {/* ── AI TAILOR MODAL ───────────────────────────────────────────────────── */}
      <Modal visible={tailorVisible} animationType="slide" onRequestClose={() => !tailoring && setTailorVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={() => !tailoring && setTailorVisible(false)} className="mr-3">
                <X size={22} color="#374151" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">AI Resume Creator</Text>
                <Text className="text-gray-400 text-xs">Tailored to the job description</Text>
              </View>
              <View className="p-2 rounded-lg bg-amber-100">
                <Sparkles size={18} color="#d97706" />
              </View>
            </View>

            <ScrollView
              className="flex-1 px-4 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Resume Title
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
                value={tailorTitle}
                onChangeText={setTailorTitle}
                placeholder="e.g. Senior Engineer at Google"
                placeholderTextColor="#9ca3af"
                editable={!tailoring}
              />

              {/* Job Description */}
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Job Description
              </Text>
              <Text className="text-xs text-gray-400 mb-2">
                Paste the full job posting for best results
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-2"
                value={tailorJD}
                onChangeText={setTailorJD}
                placeholder={"We are looking for a Senior Software Engineer with 5+ years...\n\nResponsibilities:\n- Lead development of...\n\nRequirements:\n- Strong experience in..."}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={12}
                textAlignVertical="top"
                style={{ minHeight: 220 }}
                editable={!tailoring}
              />
              <Text className="text-xs text-gray-400 mb-6">
                💡 Include requirements, responsibilities and qualifications for best results
              </Text>
            </ScrollView>

            {/* Generate button */}
            <View className="px-4 pb-6 pt-3 border-t border-gray-100">
              <TouchableOpacity
                className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
                style={{ backgroundColor: tailoring ? '#9ca3af' : '#f59e0b' }}
                onPress={createTailoredResume}
                disabled={tailoring}
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
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                onPress={() => setRenameId(null)}
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-indigo-600 rounded-xl py-3 items-center"
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
