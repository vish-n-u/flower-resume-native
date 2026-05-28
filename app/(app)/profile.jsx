import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import Toast from 'react-native-toast-message'
import {
  Camera, LogOut, User, ChevronDown, ChevronUp,
  Plus, Trash2, Briefcase, GraduationCap, FolderOpen,
  Wrench, Award, Trophy, FileText, Save
} from 'lucide-react-native'
import api from '@configs/api'
import { logout, login } from '@store/features/authSlice'
import { router } from 'expo-router'
import { removeToken } from '@utils/storage'

// ─── Reusable field ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChangeText, placeholder, multiline, keyboardType = 'default' }) => (
  <View className="mb-3">
    {label && <Text className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</Text>}
    <TextInput
      className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 ${multiline ? 'min-h-[88px]' : ''}`}
      value={value || ''}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      keyboardType={keyboardType}
    />
  </View>
)

// ─── Accordion section ────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, color = '#f59e0b', expanded, onToggle, children }) => (
  <View className="mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden"
    style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3 }}>
    <TouchableOpacity
      className="flex-row items-center px-4 py-4"
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: color + '18' }}>
        <Icon size={16} color={color} />
      </View>
      <Text className="flex-1 font-semibold text-gray-800 text-sm">{title}</Text>
      {expanded ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
    </TouchableOpacity>
    {expanded && (
      <View className="px-4 pb-4 border-t border-gray-50">
        <View className="h-3" />
        {children}
      </View>
    )}
  </View>
)

// ─── List section ─────────────────────────────────────────────────────────────
const ListSection = ({ items, emptyLabel, onAdd, onRemove, renderItem }) => (
  <View>
    {items.length === 0 && (
      <Text className="text-gray-400 text-sm text-center py-3">{emptyLabel}</Text>
    )}
    {items.map((item, index) => (
      <View key={index} className="bg-gray-50 rounded-xl p-3 mb-2 border border-gray-100">
        <TouchableOpacity
          className="absolute top-3 right-3 z-10"
          onPress={() => onRemove(index)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={15} color="#ef4444" />
        </TouchableOpacity>
        {renderItem(item, index)}
      </View>
    ))}
    <TouchableOpacity
      className="flex-row items-center justify-center gap-2 border border-dashed border-amber-300 rounded-xl py-3 mt-1"
      onPress={onAdd}
    >
      <Plus size={16} color="#f59e0b" />
      <Text className="text-amber-600 text-sm font-medium">Add</Text>
    </TouchableOpacity>
  </View>
)

// ─── Default resume data shape ────────────────────────────────────────────────
const DEFAULT_DATA = {
  personal_info: { full_name: '', profession: '', email: '', phone: '', location: '', linkedin: '', website: '', image: '' },
  professional_summary: '',
  skills: [],
  experience: [],
  education: [],
  project: [],
  certifications: [],
  achievements: [],
}

// ─── Main Profile screen ──────────────────────────────────────────────────────
export default function Profile() {
  const dispatch = useDispatch()
  const { user, token } = useSelector(state => state.auth)

  const [activeTab, setActiveTab] = useState('account')
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingResume, setSavingResume] = useState(false)
  const [loadingResume, setLoadingResume] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [skillInput, setSkillInput] = useState('')

  const [resumeData, setResumeData] = useState(DEFAULT_DATA)
  const [pendingImage, setPendingImage] = useState(null)

  const [open, setOpen] = useState({
    personal: true, summary: false, skills: false,
    experience: false, education: false, projects: false,
    certs: false, achievements: false,
  })
  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

  // ── Load default resume data ─────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'resume') return
    const load = async () => {
      setLoadingResume(true)
      try {
        const { data } = await api.get('/api/users/default-resume-data', { headers: { Authorization: token } })
        if (data.defaultResumeData && Object.keys(data.defaultResumeData).length > 0) {
          setResumeData({ ...DEFAULT_DATA, ...data.defaultResumeData })
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to load resume data' })
      } finally {
        setLoadingResume(false)
      }
    }
    load()
  }, [activeTab])

  // ── Pick image ───────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    })
    if (!result.canceled) {
      setPendingImage(result.assets[0].uri)
      updatePersonalInfo('image', result.assets[0].uri)
    }
  }

  // ── Save account ─────────────────────────────────────────────────────────
  const saveAccount = async () => {
    setSavingAccount(true)
    try {
      const { data } = await api.put('/api/users/update', { name }, { headers: { Authorization: token } })
      dispatch(login({ token, user: data.user }))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: 'Account updated' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' })
    } finally {
      setSavingAccount(false)
    }
  }

  // ── Save resume data ─────────────────────────────────────────────────────
  const saveResumeData = async () => {
    setSavingResume(true)
    try {
      const formData = new FormData()
      const dataToSend = { ...resumeData, personal_info: { ...resumeData.personal_info } }
      if (pendingImage) {
        delete dataToSend.personal_info.image
        formData.append('image', { uri: pendingImage, type: 'image/jpeg', name: 'profile.jpg' })
      }
      formData.append('defaultResumeData', JSON.stringify(dataToSend))
      const { data } = await api.put('/api/users/update-default-resume-data', formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
      })
      if (data.defaultResumeData) {
        setResumeData({ ...DEFAULT_DATA, ...data.defaultResumeData })
        setPendingImage(null)
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: 'Resume data saved!' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save resume data' })
    } finally {
      setSavingResume(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updatePersonalInfo = (field, value) =>
    setResumeData(prev => ({ ...prev, personal_info: { ...prev.personal_info, [field]: value } }))

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !resumeData.skills.includes(trimmed)) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill) =>
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))

  const listHelpers = (key) => ({
    items: resumeData[key] || [],
    onAdd: (empty) => setResumeData(prev => ({ ...prev, [key]: [...(prev[key] || []), empty] })),
    onRemove: (index) => setResumeData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) })),
    onUpdate: (index, field, value) => setResumeData(prev => {
      const updated = [...prev[key]]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, [key]: updated }
    }),
  })

  const logout_ = async () => {
    await removeToken()
    dispatch(logout())
    router.replace('/(auth)/login')
  }

  const imageUri = pendingImage || (typeof resumeData.personal_info?.image === 'string' ? resumeData.personal_info.image : null)

  // ── Initials avatar ──────────────────────────────────────────────────────
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* ── Profile Header ── */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-4">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-14 h-14 rounded-full" />
          ) : (
            <View className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: '#fef3c7' }}>
              <Text className="text-xl font-bold" style={{ color: '#f59e0b' }}>{initials}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-lg" numberOfLines={1}>{user?.name}</Text>
            <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>

        {/* Tabs inside header */}
        <View className="flex-row mt-4 gap-1">
          {[{ key: 'account', label: 'Account' }, { key: 'resume', label: 'Resume Data' }].map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                Haptics.selectionAsync()
                setActiveTab(tab.key)
              }}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === tab.key ? '#f59e0b' : '#f3f4f6',
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === tab.key ? '#fff' : '#6b7280' }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── ACCOUNT TAB ── */}
      {activeTab === 'account' && (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

            {/* Avatar */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} className="relative">
                {imageUri ? (
                  <Image source={{ uri: imageUri }} className="w-24 h-24 rounded-full" />
                ) : (
                  <View className="w-24 h-24 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#fef3c7' }}>
                    <Text className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{initials}</Text>
                  </View>
                )}
                <View className="absolute bottom-0 right-0 rounded-full w-8 h-8 items-center justify-center border-2 border-white"
                  style={{ backgroundColor: '#f59e0b' }}>
                  <Camera color="#fff" size={13} />
                </View>
              </TouchableOpacity>
              <Text className="text-gray-400 text-xs mt-2">Tap to change photo</Text>
            </View>

            <Field label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" />

            <View className="mb-6">
              <Text className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Email</Text>
              <View className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-3">
                <Text className="text-sm text-gray-400">{user?.email}</Text>
              </View>
            </View>

            <TouchableOpacity
              className="rounded-xl py-4 items-center mb-4"
              style={{ backgroundColor: savingAccount ? '#9ca3af' : '#f59e0b' }}
              onPress={saveAccount}
              disabled={savingAccount}
              activeOpacity={0.85}
            >
              {savingAccount
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-bold text-base">Save Changes</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-red-200 rounded-xl py-4 flex-row items-center justify-center gap-2 bg-red-50"
              onPress={logout_}
              activeOpacity={0.85}
            >
              <LogOut color="#ef4444" size={18} />
              <Text className="text-red-500 font-semibold">Sign Out</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ── RESUME DATA TAB ── */}
      {activeTab === 'resume' && (
        <View className="flex-1">
          {loadingResume ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text className="text-gray-400 text-sm mt-3">Loading your data...</Text>
            </View>
          ) : (
            <>
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text className="text-xs text-gray-400 mb-4 text-center">
                  This data powers the AI resume generator
                </Text>

                {/* Personal Info */}
                <Section title="Personal Info" icon={User} color="#f59e0b" expanded={open.personal} onToggle={() => toggle('personal')}>
                  {imageUri ? (
                    <TouchableOpacity onPress={pickImage} className="flex-row items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <Image source={{ uri: imageUri }} className="w-12 h-12 rounded-full" />
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700">Profile Photo</Text>
                        <Text className="text-xs" style={{ color: '#f59e0b' }}>Tap to change</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={pickImage} className="flex-row items-center gap-3 mb-4 p-3 rounded-xl border border-amber-100"
                      style={{ backgroundColor: '#fffbeb' }}>
                      <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                        <Camera size={18} color="#f59e0b" />
                      </View>
                      <Text className="text-sm font-medium" style={{ color: '#f59e0b' }}>Add Profile Photo</Text>
                    </TouchableOpacity>
                  )}
                  <Field label="Full Name" value={resumeData.personal_info?.full_name} onChangeText={v => updatePersonalInfo('full_name', v)} placeholder="John Doe" />
                  <Field label="Profession" value={resumeData.personal_info?.profession} onChangeText={v => updatePersonalInfo('profession', v)} placeholder="Software Engineer" />
                  <Field label="Email" value={resumeData.personal_info?.email} onChangeText={v => updatePersonalInfo('email', v)} placeholder="john@example.com" keyboardType="email-address" />
                  <Field label="Phone" value={resumeData.personal_info?.phone} onChangeText={v => updatePersonalInfo('phone', v)} placeholder="+1 234 567 8900" keyboardType="phone-pad" />
                  <Field label="Location" value={resumeData.personal_info?.location} onChangeText={v => updatePersonalInfo('location', v)} placeholder="New York, NY" />
                  <Field label="LinkedIn" value={resumeData.personal_info?.linkedin} onChangeText={v => updatePersonalInfo('linkedin', v)} placeholder="linkedin.com/in/yourname" />
                  <Field label="Website" value={resumeData.personal_info?.website} onChangeText={v => updatePersonalInfo('website', v)} placeholder="yoursite.com" />
                </Section>

                {/* Summary */}
                <Section title="Professional Summary" icon={FileText} color="#0d9488" expanded={open.summary} onToggle={() => toggle('summary')}>
                  <Field
                    value={resumeData.professional_summary}
                    onChangeText={v => setResumeData(prev => ({ ...prev, professional_summary: v }))}
                    placeholder="Write a brief summary about yourself..."
                    multiline
                  />
                </Section>

                {/* Skills */}
                <Section title="Skills" icon={Wrench} color="#7c3aed" expanded={open.skills} onToggle={() => toggle('skills')}>
                  <View className="flex-row gap-2 mb-3">
                    <TextInput
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900"
                      value={skillInput}
                      onChangeText={setSkillInput}
                      placeholder="e.g. React Native"
                      placeholderTextColor="#9ca3af"
                      onSubmitEditing={addSkill}
                      returnKeyType="done"
                    />
                    <TouchableOpacity onPress={addSkill} className="rounded-xl px-4 items-center justify-center"
                      style={{ backgroundColor: '#f59e0b' }}>
                      <Plus color="#fff" size={18} />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {resumeData.skills.map(skill => (
                      <TouchableOpacity
                        key={skill}
                        onPress={() => removeSkill(skill)}
                        className="flex-row items-center rounded-full px-3 py-1.5 gap-1 border"
                        style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
                      >
                        <Text className="text-xs font-medium" style={{ color: '#d97706' }}>{skill}</Text>
                        <Text className="text-xs" style={{ color: '#d97706' }}>✕</Text>
                      </TouchableOpacity>
                    ))}
                    {resumeData.skills.length === 0 && <Text className="text-gray-400 text-xs">No skills added yet</Text>}
                  </View>
                </Section>

                {/* Experience */}
                <Section title="Experience" icon={Briefcase} color="#ea580c" expanded={open.experience} onToggle={() => toggle('experience')}>
                  <ListSection
                    {...listHelpers('experience')}
                    emptyLabel="No experience added"
                    onAdd={() => listHelpers('experience').onAdd({ company: '', position: '', start_date: '', end_date: '', description: '', is_current: false })}
                    renderItem={(item, index) => {
                      const h = listHelpers('experience')
                      return (
                        <View className="pr-6">
                          <Field label="Position" value={item.position} onChangeText={v => h.onUpdate(index, 'position', v)} placeholder="Software Engineer" />
                          <Field label="Company" value={item.company} onChangeText={v => h.onUpdate(index, 'company', v)} placeholder="Acme Corp" />
                          <View className="flex-row gap-2">
                            <View className="flex-1"><Field label="Start" value={item.start_date} onChangeText={v => h.onUpdate(index, 'start_date', v)} placeholder="Jan 2022" /></View>
                            <View className="flex-1"><Field label="End" value={item.end_date} onChangeText={v => h.onUpdate(index, 'end_date', v)} placeholder="Present" /></View>
                          </View>
                          <Field label="Description" value={item.description} onChangeText={v => h.onUpdate(index, 'description', v)} placeholder="Responsibilities and achievements..." multiline />
                        </View>
                      )
                    }}
                  />
                </Section>

                {/* Education */}
                <Section title="Education" icon={GraduationCap} color="#0284c7" expanded={open.education} onToggle={() => toggle('education')}>
                  <ListSection
                    {...listHelpers('education')}
                    emptyLabel="No education added"
                    onAdd={() => listHelpers('education').onAdd({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' })}
                    renderItem={(item, index) => {
                      const h = listHelpers('education')
                      return (
                        <View className="pr-6">
                          <Field label="Institution" value={item.institution} onChangeText={v => h.onUpdate(index, 'institution', v)} placeholder="MIT" />
                          <Field label="Degree" value={item.degree} onChangeText={v => h.onUpdate(index, 'degree', v)} placeholder="Bachelor of Science" />
                          <Field label="Field of Study" value={item.field_of_study} onChangeText={v => h.onUpdate(index, 'field_of_study', v)} placeholder="Computer Science" />
                          <View className="flex-row gap-2">
                            <View className="flex-1"><Field label="Start" value={item.start_date} onChangeText={v => h.onUpdate(index, 'start_date', v)} placeholder="2018" /></View>
                            <View className="flex-1"><Field label="End" value={item.end_date} onChangeText={v => h.onUpdate(index, 'end_date', v)} placeholder="2022" /></View>
                            <View className="flex-1"><Field label="GPA" value={item.gpa} onChangeText={v => h.onUpdate(index, 'gpa', v)} placeholder="3.8" keyboardType="decimal-pad" /></View>
                          </View>
                        </View>
                      )
                    }}
                  />
                </Section>

                {/* Projects */}
                <Section title="Projects" icon={FolderOpen} color="#16a34a" expanded={open.projects} onToggle={() => toggle('projects')}>
                  <ListSection
                    {...listHelpers('project')}
                    emptyLabel="No projects added"
                    onAdd={() => listHelpers('project').onAdd({ title: '', description: '', tech_stack: '', link: '' })}
                    renderItem={(item, index) => {
                      const h = listHelpers('project')
                      return (
                        <View className="pr-6">
                          <Field label="Title" value={item.title} onChangeText={v => h.onUpdate(index, 'title', v)} placeholder="My App" />
                          <Field label="Tech Stack" value={item.tech_stack} onChangeText={v => h.onUpdate(index, 'tech_stack', v)} placeholder="React Native, Node.js" />
                          <Field label="Link" value={item.link} onChangeText={v => h.onUpdate(index, 'link', v)} placeholder="github.com/you/project" />
                          <Field label="Description" value={item.description} onChangeText={v => h.onUpdate(index, 'description', v)} placeholder="What does this project do?" multiline />
                        </View>
                      )
                    }}
                  />
                </Section>

                {/* Certifications */}
                <Section title="Certifications" icon={Award} color="#d97706" expanded={open.certs} onToggle={() => toggle('certs')}>
                  <ListSection
                    {...listHelpers('certifications')}
                    emptyLabel="No certifications added"
                    onAdd={() => listHelpers('certifications').onAdd({ name: '', issuer: '', date: '', credential_id: '' })}
                    renderItem={(item, index) => {
                      const h = listHelpers('certifications')
                      return (
                        <View className="pr-6">
                          <Field label="Name" value={item.name} onChangeText={v => h.onUpdate(index, 'name', v)} placeholder="AWS Certified Developer" />
                          <Field label="Issuer" value={item.issuer} onChangeText={v => h.onUpdate(index, 'issuer', v)} placeholder="Amazon Web Services" />
                          <View className="flex-row gap-2">
                            <View className="flex-1"><Field label="Date" value={item.date} onChangeText={v => h.onUpdate(index, 'date', v)} placeholder="Mar 2024" /></View>
                            <View className="flex-1"><Field label="Credential ID" value={item.credential_id} onChangeText={v => h.onUpdate(index, 'credential_id', v)} placeholder="ABC123" /></View>
                          </View>
                        </View>
                      )
                    }}
                  />
                </Section>

                {/* Achievements */}
                <Section title="Achievements" icon={Trophy} color="#9333ea" expanded={open.achievements} onToggle={() => toggle('achievements')}>
                  <ListSection
                    {...listHelpers('achievements')}
                    emptyLabel="No achievements added"
                    onAdd={() => listHelpers('achievements').onAdd({ title: '', date: '', description: '' })}
                    renderItem={(item, index) => {
                      const h = listHelpers('achievements')
                      return (
                        <View className="pr-6">
                          <Field label="Title" value={item.title} onChangeText={v => h.onUpdate(index, 'title', v)} placeholder="Best Developer Award" />
                          <Field label="Date" value={item.date} onChangeText={v => h.onUpdate(index, 'date', v)} placeholder="2023" />
                          <Field label="Description" value={item.description} onChangeText={v => h.onUpdate(index, 'description', v)} placeholder="Brief description..." multiline />
                        </View>
                      )
                    }}
                  />
                </Section>

              </ScrollView>

              {/* Floating save button */}
              <View
                className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white border-t border-gray-100"
                style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 }}
              >
                <TouchableOpacity
                  className="rounded-2xl py-4 flex-row items-center justify-center gap-2"
                  style={{ backgroundColor: savingResume ? '#9ca3af' : '#f59e0b' }}
                  onPress={saveResumeData}
                  disabled={savingResume}
                  activeOpacity={0.85}
                >
                  {savingResume
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Save color="#fff" size={18} />
                        <Text className="text-white font-bold text-base">Save Resume Data</Text>
                      </>
                  }
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

    </SafeAreaView>
  )
}
