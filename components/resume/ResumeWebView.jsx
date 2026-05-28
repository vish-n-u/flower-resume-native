import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import { useSelector } from 'react-redux'
import { API_BASE_URL } from '@configs/api'

/**
 * Renders the resume preview by loading the existing web app's
 * /view/:resumeId route inside a WebView.
 *
 * Exposes a `captureHTML()` method via ref for PDF generation.
 * After calling captureHTML(), listen for the `onHTMLCapture` callback.
 */
const ResumeWebView = forwardRef(function ResumeWebView({ resumeId, onHTMLCapture }, ref) {
  const { token } = useSelector(state => state.auth)
  const webviewRef = useRef(null)
  const [loading, setLoading] = useState(true)

  const uri = `${API_BASE_URL}/view/${resumeId}`

  // Runs BEFORE any page JavaScript — guarantees token is in localStorage
  // before React mounts and calls getUserData() / loadResume()
  const injectTokenBeforeLoad = `
    (function() {
      try { localStorage.setItem('token', ${JSON.stringify(token)}); } catch(e) {}
    })();
    true;
  `

  // Expose captureHTML() to parent via ref
  useImperativeHandle(ref, () => ({
    captureHTML: () => {
      webviewRef.current?.injectJavaScript(`
        (function() {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'HTML_CAPTURE', html: document.documentElement.outerHTML })
          );
        })();
        true;
      `)
    }
  }))

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.type === 'HTML_CAPTURE' && onHTMLCapture) {
        onHTMLCapture(msg.html)
      }
    } catch {
      // ignore non-JSON messages
    }
  }

  return (
    <View className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-white">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri }}
        injectedJavaScriptBeforeContentLoaded={injectTokenBeforeLoad}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        className="flex-1"
      />
    </View>
  )
})

export default ResumeWebView
