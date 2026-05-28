import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Modal, Share, KeyboardAvoidingView, Platform
} from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { router, useLocalSearchParams } from 'expo-router'
import { useSelector } from 'react-redux'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import Toast from 'react-native-toast-message'
import {
  ArrowLeft, User, Briefcase, GraduationCap, FolderOpen,
  Wrench, Award, Trophy, Eye, EyeOff, Palette, Settings,
  Share2, Sparkles, Globe, Lock, X, FileText, CheckCircle,
  AlertCircle, Clock, MapPin, Download
} from 'lucide-react-native'
import api, { API_BASE_URL } from '@configs/api'
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

// section key → sectionVisibility key (null = always visible)
const VISIBILITY_KEY = {
  personal: null,
  summary: 'summary',
  experience: 'experience',
  education: 'education',
  projects: 'projects',
  skills: 'skills',
  certs: 'certifications',
  achievements: 'achievements',
}

const SECTIONS = [
  { key: 'personal',     label: 'Personal',    icon: User },
  { key: 'summary',      label: 'Summary',     icon: FileText },
  { key: 'experience',   label: 'Experience',  icon: Briefcase },
  { key: 'education',    label: 'Education',   icon: GraduationCap },
  { key: 'projects',     label: 'Projects',    icon: FolderOpen },
  { key: 'skills',       label: 'Skills',      icon: Wrench },
  { key: 'certs',        label: 'Certs',       icon: Award },
  { key: 'achievements', label: 'Awards',      icon: Trophy },
]

const DEFAULT_VISIBILITY = {
  summary: true, experience: true, education: true,
  projects: true, skills: true, certifications: true, achievements: true,
}

export default function ResumeBuilder() {
  const { resumeId } = useLocalSearchParams()
  const { token } = useSelector(state => state.auth)
  const insets = useSafeAreaInsets()

  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '' | 'saving' | 'saved'
  const [activeSection, setActiveSection] = useState('personal')

  // Modals
  const [previewVisible, setPreviewVisible] = useState(false)
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false)
  const [colorPickerVisible, setColorPickerVisible] = useState(false)
  const [aiPromptVisible, setAiPromptVisible] = useState(false)
  const [jobReqVisible, setJobReqVisible] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  // AI Prompt state
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Job Requirements state
  const [jobReqLoading, setJobReqLoading] = useState(false)
  const [jobRequirements, setJobRequirements] = useState(null)
  const [checkedItems, setCheckedItems] = useState({})

  const saveTimer = useRef(null)
  const isInitialLoad = useRef(true)
  const webViewRef = useRef(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // ─── Load resume ───────────────────────────────────────────────────────────
  const fetchResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: token },
      })
      const resume = {
        ...data.resume,
        sectionVisibility: data.resume.sectionVisibility || DEFAULT_VISIBILITY,
      }
      setResumeData(resume)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load resume' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResume() }, [resumeId])

  // ─── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialLoad.current) { isInitialLoad.current = false; return }
    if (!resumeData?._id) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(), 3000)
    return () => clearTimeout(saveTimer.current)
  }, [resumeData])

  const autoSave = async () => {
    setAutoSaveStatus('saving')
    try {
      const formData = new FormData()
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify(resumeData))
      await api.put('/api/resumes/update', formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
      })
      setAutoSaveStatus('saved')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setTimeout(() => setAutoSaveStatus(''), 2000)
    } catch {
      setAutoSaveStatus('')
    }
  }

  const updateResumeData = (updates) => {
    setResumeData(prev => ({ ...prev, ...updates }))
  }

  // ─── Section visibility ────────────────────────────────────────────────────
  const toggleSectionVisibility = (visKey) => {
    if (!visKey) return
    Haptics.selectionAsync()
    updateResumeData({
      sectionVisibility: {
        ...resumeData.sectionVisibility,
        [visKey]: !resumeData.sectionVisibility?.[visKey],
      },
    })
  }

  const activeSectionVisKey = VISIBILITY_KEY[activeSection]
  const activeSectionVisible = activeSectionVisKey
    ? resumeData?.sectionVisibility?.[activeSectionVisKey] !== false
    : true

  // ─── Public / private ──────────────────────────────────────────────────────
  const togglePublic = async () => {
    Haptics.selectionAsync()
    try {
      const newPublic = !resumeData.public
      const formData = new FormData()
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify({ public: newPublic }))
      await api.put('/api/resumes/update', formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
      })
      setResumeData(prev => ({ ...prev, public: newPublic }))
      Toast.show({ type: 'success', text1: newPublic ? 'Resume is now public' : 'Resume set to private' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update visibility' })
    }
  }

  // ─── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await Share.share({ url: `${API_BASE_URL}/view/${resumeId}` })
    } catch {}
  }

  // ─── PDF Download ────────────────────────────────────────────────────────
  const downloadPDF = () => {
    if (downloadingPdf) return
    setDownloadingPdf(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    webViewRef.current?.captureHTML()
  }

  const handleHTMLCapture = async (html) => {
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false })
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${resumeData?.title || 'Resume'}.pdf`,
        UTI: 'com.adobe.pdf',
      })
    } catch (err) {
      Toast.show({ type: 'error', text1: 'PDF generation failed' })
    } finally {
      setDownloadingPdf(false)
    }
  }

  // ─── AI Custom Prompt ──────────────────────────────────────────────────────
  const handleAiPrompt = async () => {
    if (!aiPrompt.trim()) {
      Toast.show({ type: 'error', text1: 'Enter a prompt first' })
      return
    }
    setAiLoading(true)
    try {
      const { data } = await api.post(
        '/api/ai/custom-prompt',
        { userPrompt: aiPrompt, currentResumeData: resumeData },
        { headers: { Authorization: token } }
      )
      if (data.supported === false) {
        Toast.show({ type: 'error', text1: data.reason || 'Request not supported', visibilityTime: 5000 })
        return
      }
      setResumeData(prev => ({ ...prev, ...data.generatedData }))
      Toast.show({ type: 'success', text1: 'Resume updated!' })
      setAiPrompt('')
      setAiPromptVisible(false)
    } catch (error) {
      Toast.show({ type: 'error', text1: error?.response?.data?.message || 'AI generation failed' })
    } finally {
      setAiLoading(false)
    }
  }

  // ─── Job Requirements ──────────────────────────────────────────────────────
  const extractJobRequirements = async () => {
    if (!resumeData?.job_description?.trim()) {
      Toast.show({ type: 'info', text1: 'No job description attached to this resume' })
      return
    }
    setJobReqLoading(true)
    setJobRequirements(null)
    setCheckedItems({})
    try {
      const { data } = await api.post(
        '/api/ai/extract-job-requirements',
        { jobDescription: resumeData.job_description },
        { headers: { Authorization: token } }
      )
      if (data.success) setJobRequirements(data.requirements)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to extract requirements' })
    } finally {
      setJobReqLoading(false)
    }
  }

  const openJobReq = () => {
    setFabOpen(false)
    setJobReqVisible(true)
    if (!jobRequirements) extractJobRequirements()
  }

  // ─── Render form ───────────────────────────────────────────────────────────
  const renderForm = () => {
    if (!resumeData) return null
    const props = { data: resumeData, onChange: updateResumeData }
    switch (activeSection) {
      case 'personal':     return <PersonalInfoForm {...props} />
      case 'summary':      return <ProfessionalSummaryForm {...props} />
      case 'experience':   return <ExperienceForm {...props} />
      case 'education':    return <EducationForm {...props} />
      case 'projects':     return <ProjectForm {...props} />
      case 'skills':       return <SkillsForm {...props} />
      case 'certs':        return <CertificationsForm {...props} />
      case 'achievements': return <AchievementsForm {...props} />
      default:             return null
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

      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft color="#374151" size={22} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
            {resumeData?.title || 'Resume Builder'}
          </Text>
          {autoSaveStatus !== '' && (
            <Text className="text-xs text-gray-400">
              {autoSaveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={togglePublic}>
            {resumeData?.public
              ? <Globe color="#10b981" size={20} />
              : <Lock color="#9ca3af" size={20} />
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Share2 color="#6b7280" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setColorPickerVisible(true)}>
            <Palette color="#6b7280" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTemplatePickerVisible(true)}>
            <Settings color="#6b7280" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-lg px-3 py-1.5 flex-row items-center gap-1"
            style={{ backgroundColor: '#f59e0b' }}
            onPress={() => setPreviewVisible(true)}
          >
            <Eye color="#fff" size={16} />
            <Text className="text-white text-sm font-medium">Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Section tabs ── */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-14"
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const active = activeSection === key
            const visKey = VISIBILITY_KEY[key]
            const visible = visKey ? resumeData?.sectionVisibility?.[visKey] !== false : true
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveSection(key)}
                className={`flex-row items-center gap-1.5 px-3 py-4 mr-1 border-b-2 ${
                  active ? 'border-indigo-600' : 'border-transparent'
                }`}
              >
                <Icon color={active ? '#4f46e5' : (visible ? '#9ca3af' : '#d1d5db')} size={15} />
                <Text className={`text-sm font-medium ${active ? 'text-indigo-600' : (visible ? 'text-gray-400' : 'text-gray-200')}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Section visibility toggle bar */}
        {activeSectionVisKey && (
          <TouchableOpacity
            onPress={() => toggleSectionVisibility(activeSectionVisKey)}
            className="flex-row items-center gap-1.5 px-4 py-2 border-t border-gray-50"
          >
            {activeSectionVisible
              ? <Eye color="#6b7280" size={14} />
              : <EyeOff color="#9ca3af" size={14} />
            }
            <Text className="text-xs text-gray-500">
              {activeSectionVisible ? 'Visible on resume — tap to hide' : 'Hidden from resume — tap to show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Form content ── */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {renderForm()}
        </View>
      </ScrollView>

      {/* ── FAB (AI actions) ── */}
      <View style={{ position: 'absolute', bottom: insets.bottom + 16, right: 16, zIndex: 30 }}>
        {fabOpen && (
          <>
            <TouchableOpacity
              className="absolute inset-0 w-screen h-screen"
              style={{ position: 'absolute', top: -9999, left: -9999, right: -9999, bottom: -9999 }}
              onPress={() => setFabOpen(false)}
            />
            <View className="absolute bottom-14 right-0 gap-3" style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => { setFabOpen(false); setAiPromptVisible(true) }}
                className="flex-row items-center gap-3 bg-white rounded-full pl-4 pr-5 py-3 shadow-lg"
              >
                <View className="bg-purple-100 rounded-full p-2">
                  <Sparkles color="#9333ea" size={16} />
                </View>
                <Text className="text-sm font-medium text-gray-700">AI Prompt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openJobReq}
                className="flex-row items-center gap-3 bg-white rounded-full pl-4 pr-5 py-3 shadow-lg"
              >
                <View className="bg-blue-100 rounded-full p-2">
                  <Briefcase color="#2563eb" size={16} />
                </View>
                <Text className="text-sm font-medium text-gray-700">Job Needs</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={() => setFabOpen(o => !o)}
          className="rounded-full p-4 shadow-xl"
          style={{ backgroundColor: fabOpen ? '#7c3aed' : '#8b5cf6' }}
        >
          {fabOpen
            ? <X color="#fff" size={22} />
            : <Sparkles color="#fff" size={22} />
          }
        </TouchableOpacity>
      </View>

      {/* ── Preview Modal ── */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <TouchableOpacity onPress={() => setPreviewVisible(false)} className="mr-3">
              <ArrowLeft color="#374151" size={22} />
            </TouchableOpacity>
            <Text className="flex-1 font-semibold text-gray-900">Preview</Text>
            <TouchableOpacity
              onPress={downloadPDF}
              disabled={downloadingPdf}
              className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5"
              style={{ backgroundColor: downloadingPdf ? '#d1d5db' : '#f59e0b' }}
            >
              {downloadingPdf
                ? <ActivityIndicator color="#fff" size="small" />
                : <Download color="#fff" size={16} />
              }
              <Text className="text-white text-sm font-semibold">
                {downloadingPdf ? 'Generating...' : 'Download PDF'}
              </Text>
            </TouchableOpacity>
          </View>
          <ResumeWebView
            ref={webViewRef}
            resumeId={resumeId}
            onHTMLCapture={handleHTMLCapture}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Template Selector ── */}
      <Modal visible={templatePickerVisible} animationType="slide" transparent onRequestClose={() => setTemplatePickerVisible(false)}>
        <TemplateSelector
          current={resumeData?.template}
          onSelect={(t) => { updateResumeData({ template: t }); setTemplatePickerVisible(false) }}
          onClose={() => setTemplatePickerVisible(false)}
        />
      </Modal>

      {/* ── Color Picker ── */}
      <Modal visible={colorPickerVisible} animationType="slide" transparent onRequestClose={() => setColorPickerVisible(false)}>
        <ColorPicker
          current={resumeData?.accent_color}
          onSelect={(c) => { updateResumeData({ accent_color: c }); setColorPickerVisible(false) }}
          onClose={() => setColorPickerVisible(false)}
        />
      </Modal>

      {/* ── AI Custom Prompt Modal ── */}
      <Modal visible={aiPromptVisible} animationType="slide" onRequestClose={() => setAiPromptVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Sparkles color="#9333ea" size={16} />
              </View>
              <Text className="flex-1 font-bold text-gray-900 text-base">AI Custom Prompt</Text>
              <TouchableOpacity onPress={() => setAiPromptVisible(false)} disabled={aiLoading}>
                <X color="#9ca3af" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
              <Text className="text-sm text-gray-600 mb-1">
                Describe what you want to add or modify in your resume.
              </Text>
              <Text className="text-xs text-gray-400 mb-4">
                Examples:{'\n'}
                • "Add a project about building a mobile app"{'\n'}
                • "Improve the description of my first experience"{'\n'}
                • "Add AWS certification completed in 2024"
              </Text>

              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Prompt</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
                placeholder="e.g., Add a project about an e-commerce website..."
                value={aiPrompt}
                onChangeText={setAiPrompt}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!aiLoading}
                style={{ minHeight: 120 }}
              />

              <View className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
                <Text className="text-xs text-blue-700">
                  <Text className="font-semibold">Tip:</Text> AI analyzes your current resume and generates accurate content based on your request.
                </Text>
              </View>
            </ScrollView>

            <View className="px-4 pb-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAiPromptVisible(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3.5 items-center"
                disabled={aiLoading}
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAiPrompt}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex-1 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
                style={{ backgroundColor: (aiLoading || !aiPrompt.trim()) ? '#d8b4fe' : '#9333ea' }}
              >
                {aiLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Sparkles color="#fff" size={16} />
                }
                <Text className="text-white font-bold">
                  {aiLoading ? 'Generating...' : 'Generate'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Job Requirements Modal ── */}
      <Modal visible={jobReqVisible} animationType="slide" onRequestClose={() => setJobReqVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center px-4 py-4 bg-blue-600">
            <AlertCircle color="#fff" size={22} className="mr-3" />
            <View className="flex-1 ml-3">
              <Text className="font-bold text-white text-base">Job Requirements Checklist</Text>
              <Text className="text-blue-100 text-xs mt-0.5">Key details to address in your resume</Text>
            </View>
            <TouchableOpacity onPress={() => setJobReqVisible(false)}>
              <X color="#fff" size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {!resumeData?.job_description?.trim() ? (
              <View className="items-center py-16">
                <FileText color="#d1d5db" size={48} />
                <Text className="text-gray-500 text-base mt-4">No Job Description</Text>
                <Text className="text-gray-400 text-sm mt-1 text-center px-8">
                  Tailor your resume from the Dashboard to attach a job description.
                </Text>
              </View>
            ) : jobReqLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-gray-600 text-base mt-4">Analyzing Job Description...</Text>
                <Text className="text-gray-400 text-sm mt-1">AI is extracting key requirements</Text>
              </View>
            ) : jobRequirements ? (
              <View className="gap-4">
                <TouchableOpacity
                  onPress={extractJobRequirements}
                  className="self-end flex-row items-center gap-1"
                >
                  <Sparkles color="#2563eb" size={14} />
                  <Text className="text-blue-600 text-sm">Re-analyze JD</Text>
                </TouchableOpacity>

                {jobRequirements.workplaceLocation && (
                  <JobReqItem
                    icon={MapPin} color="green" title="Location & Work Type"
                    content={jobRequirements.workplaceLocation}
                    itemKey="location" checked={checkedItems.location}
                    onCheck={k => setCheckedItems(p => ({ ...p, [k]: !p[k] }))}
                  />
                )}
                {jobRequirements.requiredSkills && (
                  <JobReqItem
                    icon={CheckCircle} color="blue" title="Required Skills"
                    content={jobRequirements.requiredSkills} isList
                    itemKey="skills" checked={checkedItems.skills}
                    onCheck={k => setCheckedItems(p => ({ ...p, [k]: !p[k] }))}
                  />
                )}
                {jobRequirements.requiredCertifications && (
                  <JobReqItem
                    icon={Award} color="purple" title="Required Certifications"
                    content={jobRequirements.requiredCertifications} isList
                    itemKey="certifications" checked={checkedItems.certifications}
                    onCheck={k => setCheckedItems(p => ({ ...p, [k]: !p[k] }))}
                  />
                )}
                {jobRequirements.experience && (
                  <JobReqItem
                    icon={Clock} color="orange" title="Experience Required"
                    content={jobRequirements.experience}
                    itemKey="experience" checked={checkedItems.experience}
                    onCheck={k => setCheckedItems(p => ({ ...p, [k]: !p[k] }))}
                  />
                )}
                {jobRequirements.education && (
                  <JobReqItem
                    icon={GraduationCap} color="indigo" title="Education Required"
                    content={jobRequirements.education}
                    itemKey="education" checked={checkedItems.education}
                    onCheck={k => setCheckedItems(p => ({ ...p, [k]: !p[k] }))}
                  />
                )}
                {jobRequirements.additionalRequirements && (
                  <View className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4">
                    <View className="flex-row items-start gap-3">
                      <AlertCircle color="#dc2626" size={20} />
                      <View className="flex-1">
                        <Text className="font-semibold text-red-900 mb-1">Other Important Requirements</Text>
                        <Text className="text-red-800 text-sm">{jobRequirements.additionalRequirements}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2 mb-8">
                  <View className="flex-row items-start gap-2">
                    <Sparkles color="#2563eb" size={16} />
                    <Text className="text-blue-700 text-xs flex-1">
                      <Text className="font-semibold">Tip:</Text> Check off items as you address them in your resume before applying.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center py-16">
                <AlertCircle color="#d1d5db" size={48} />
                <Text className="text-gray-500 text-base mt-4">Failed to extract requirements</Text>
                <TouchableOpacity
                  onPress={extractJobRequirements}
                  className="mt-4 bg-blue-600 rounded-xl px-6 py-3"
                >
                  <Text className="text-white font-semibold">Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  )
}

// ─── Job Requirement Item ─────────────────────────────────────────────────────
const COLOR = {
  blue:   { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: '#2563eb' },
  green:  { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '#16a34a' },
  purple: { bg: '#faf5ff', border: '#d8b4fe', text: '#581c87', icon: '#9333ea' },
  orange: { bg: '#fff7ed', border: '#fdba74', text: '#9a3412', icon: '#ea580c' },
  indigo: { bg: '#eef2ff', border: '#a5b4fc', text: '#312e81', icon: '#4f46e5' },
}

function JobReqItem({ icon: Icon, color, title, content, isList, itemKey, checked, onCheck }) {
  const c = COLOR[color]
  return (
    <View
      className="rounded-xl p-4 border-l-4"
      style={{ backgroundColor: c.bg, borderLeftColor: c.icon }}
    >
      <View className="flex-row items-start gap-3">
        <Icon color={c.icon} size={20} />
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-semibold" style={{ color: c.text }}>{title}</Text>
            <TouchableOpacity
              onPress={() => onCheck(itemKey)}
              className="flex-row items-center gap-1.5"
            >
              <View
                className="w-5 h-5 rounded border-2 items-center justify-center"
                style={{ borderColor: checked ? c.icon : '#d1d5db', backgroundColor: checked ? c.icon : '#fff' }}
              >
                {checked && <Text className="text-white text-xs font-bold">✓</Text>}
              </View>
              <Text className="text-xs text-gray-500">Covered</Text>
            </TouchableOpacity>
          </View>
          {isList
            ? content.split('\n').filter(l => l.trim()).map((line, i) => (
                <Text key={i} className="text-sm mb-0.5" style={{ color: c.text, opacity: checked ? 0.4 : 1 }}>
                  • {line.trim()}
                </Text>
              ))
            : <Text className="text-sm" style={{ color: c.text, opacity: checked ? 0.4 : 1 }}>
                {content}
              </Text>
          }
        </View>
      </View>
    </View>
  )
}
