import { useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import generateResumeHTML from '@utils/generateResumeHTML'

export default function ResumeWebView({ resumeData }) {
  const [loading, setLoading] = useState(true)

  return (
    <View className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-white">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      )}
      <WebView
        source={{ html: generateResumeHTML(resumeData) }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        className="flex-1"
      />
    </View>
  )
}
