import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Camera, User } from 'lucide-react-native'
import FormField from './FormField'

export default function PersonalInfoForm({ data, onChange }) {
  const info = data?.personal_info || {}

  const update = (field, value) => {
    onChange({ personal_info: { ...info, [field]: value } })
  }

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) {
      update('image', result.assets[0].uri)
    }
  }

  return (
    <View>
      <Text className="text-base font-bold text-gray-900 mb-4">Personal Information</Text>

      {/* Profile picture */}
      <View className="items-center mb-6">
        <TouchableOpacity onPress={pickProfileImage} className="relative">
          {info.image ? (
            <Image
              source={{ uri: info.image }}
              className="w-20 h-20 rounded-full bg-gray-200"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center">
              <User color="#4f46e5" size={32} />
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-7 h-7 items-center justify-center border-2 border-white">
            <Camera color="#fff" size={12} />
          </View>
        </TouchableOpacity>
      </View>

      <FormField label="Full Name" value={info.full_name} onChangeText={v => update('full_name', v)} placeholder="John Doe" />
      <FormField label="Profession" value={info.profession} onChangeText={v => update('profession', v)} placeholder="Software Engineer" />
      <FormField label="Email" value={info.email} onChangeText={v => update('email', v)} placeholder="john@example.com" keyboardType="email-address" />
      <FormField label="Phone" value={info.phone} onChangeText={v => update('phone', v)} placeholder="+1 234 567 8900" keyboardType="phone-pad" />
      <FormField label="Location" value={info.location} onChangeText={v => update('location', v)} placeholder="New York, NY" />
      <FormField label="LinkedIn" value={info.linkedin} onChangeText={v => update('linkedin', v)} placeholder="linkedin.com/in/yourname" />
      <FormField label="Portfolio / Website" value={info.website} onChangeText={v => update('website', v)} placeholder="yoursite.com" />
    </View>
  )
}
