import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Dimensions
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import {
  ArrowLeft, User, Briefcase, GraduationCap, FolderOpen,
  Wrench, Award, Trophy, Plus, Eye, Palette, Settings
} from 'lucide-react-native'
import api from '@configs/api'
import ResumeWebView from '@components/resume/ResumeWebView'
import PersonalInfoForm from '@components/forms/PersonalInfoForm'
import ExperienceForm from '@components/forms/ExperienceForm'
import EducationForm from '@components/forms/EducationForm'
import ProjectForm from '@components/forms/ProjectForm'
import SkillsForm from '@components/forms/SkillsForm'
import CertificationsForm from '@components/forms/CertificationsForm'
import AchievementsForm from '@components/forms/AchievementsForm'
import ProfessionalSummaryForm from '@components/forms/ProfessionalSummaryForm'
import TemplateSelector from '@components/ui/TemplateSelector'
import ColorPicker from '@components/ui/ColorPicker'

const SECTIONS = [
  { key: 'personal',    label: 'Personal',    icon: User },
  { key: 'summary',     label: 'Summary',     icon: Briefcase },
  { key: 'experience',  label: 'Experience',  icon: Briefcase },
  { key: 'education',   label: 'Education',   icon: GraduationCap },
  { key: 'projects',    label: 'Projects',    icon: FolderOpen },
  { key: 'skills',      label: 'Skills',      icon: Wrench },
  { key: 'certs',       label: 'Certs',       icon: Award },
  { key: 'achievements',label: 'Awards',      icon: Trophy },
]

export default function ResumeBuilder() {
  const { resumeId } = useLocalSearchParams()
  const { token } = useSelector(state => state.auth)
  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const [previewVisible, setPreviewVisible] = useState(false)
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false)
  const [colorPickerVisible, setColorPickerVisible] = useState(false)
  const saveTimer = useRef(null)

  const fetchResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: token },
      })
      setResumeData(data.resume)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load resume' })
    } finally {
      setLoading(false)
    }
  }

  const saveResume = async (updatedData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      try {
        await api.put('/api/resumes/update', updatedData, {
          headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        })
      } catch {
        Toast.show({ type: 'error', text1: 'Auto-save failed' })
      } finally {
        setSaving(false)
      }
    }, 1500)
  }

  const updateResumeData = (updates) => {
    const updated = { ...resumeData, ...updates }
    setResumeData(updated)
    saveResume(updated)
  }

  useEffect(() => { fetchResume() }, [resumeId])

  const renderForm = () => {
    if (!resumeData) return null
    const props = { data: resumeData, onChange: updateResumeData }
    switch (activeSection) {
      case 'personal':    return <PersonalInfoForm {...props} />
      case 'summary':     return <ProfessionalSummaryForm {...props} />
      case 'experience':  return <ExperienceForm {...props} />
      case 'education':   return <EducationForm {...props} />
      case 'projects':    return <ProjectForm {...props} />
      case 'skills':      return <SkillsForm {...props} />
      case 'certs':       return <CertificationsForm {...props} />
      case 'achievements':return <AchievementsForm {...props} />
      default:            return null
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft color="#374151" size={22} />
        </TouchableOpacity>
        <Text className="flex-1 font-semibold text-gray-900 text-base" numberOfLines={1}>
          {resumeData?.name || 'Resume Builder'}
        </Text>
        <View className="flex-row items-center gap-3">
          {saving && <ActivityIndicator size="small" color="#9ca3af" />}
          <TouchableOpacity onPress={() => setColorPickerVisible(true)}>
            <Palette color="#6b7280" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTemplatePickerVisible(true)}>
            <Settings color="#6b7280" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-600 rounded-lg px-3 py-1.5 flex-row items-center gap-1"
            onPress={() => setPreviewVisible(true)}
          >
            <Eye color="#fff" size={16} />
            <Text className="text-white text-sm font-medium">Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-100 max-h-14"
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {SECTIONS.map(({ key, label, icon: Icon }) => {
          const active = activeSection === key
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveSection(key)}
              className={`flex-row items-center gap-1.5 px-3 py-4 mr-1 border-b-2 ${
                active ? 'border-indigo-600' : 'border-transparent'
              }`}
            >
              <Icon color={active ? '#4f46e5' : '#9ca3af'} size={15} />
              <Text className={`text-sm font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Form content */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {renderForm()}
        </View>
      </ScrollView>

      {/* Resume Preview Modal */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <TouchableOpacity onPress={() => setPreviewVisible(false)} className="mr-3">
              <ArrowLeft color="#374151" size={22} />
            </TouchableOpacity>
            <Text className="font-semibold text-gray-900">Preview</Text>
          </View>
          <ResumeWebView resumeId={resumeId} />
        </SafeAreaView>
      </Modal>

      {/* Template Selector Modal */}
      <Modal visible={templatePickerVisible} animationType="slide" transparent onRequestClose={() => setTemplatePickerVisible(false)}>
        <TemplateSelector
          current={resumeData?.template}
          onSelect={(t) => {
            updateResumeData({ template: t })
            setTemplatePickerVisible(false)
          }}
          onClose={() => setTemplatePickerVisible(false)}
        />
      </Modal>

      {/* Color Picker Modal */}
      <Modal visible={colorPickerVisible} animationType="slide" transparent onRequestClose={() => setColorPickerVisible(false)}>
        <ColorPicker
          current={resumeData?.accentColor}
          onSelect={(c) => {
            updateResumeData({ accentColor: c })
            setColorPickerVisible(false)
          }}
          onClose={() => setColorPickerVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  )
}
