import { useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import { useSelector } from 'react-redux'
import { API_BASE_URL } from '@configs/api'

/**
 * Renders the resume preview by loading the existing web app's
 * /view/:resumeId route inside a WebView.
 *
 * This avoids re-implementing the HTML/CSS templates natively.
 * All template rendering, scaling, and layout stays on the web side.
 */
export default function ResumeWebView({ resumeId }) {
  const { token } = useSelector(state => state.auth)
  const webviewRef = useRef(null)
  const [loading, setLoading] = useState(true)

  const uri = `${API_BASE_URL}/view/${resumeId}`

  // Inject token into the WebView's localStorage so the web app
  // can authenticate and load the private resume
  const injectToken = `
    (function() {
      localStorage.setItem('token', '${token}');
      true;
    })();
  `

  return (
    <View className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-white">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri }}
        injectedJavaScript={injectToken}
        onLoadEnd={() => setLoading(false)}
        onLoad={() => {
          webviewRef.current?.injectJavaScript(injectToken)
        }}
        javaScriptEnabled
        domStorageEnabled
        className="flex-1"
      />
    </View>
  )
}
