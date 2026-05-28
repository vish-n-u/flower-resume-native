import { useRef } from 'react'
import { View, Text } from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'

const TOOLBAR_ACTIONS = [
  actions.setBold,
  actions.setItalic,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.undo,
  actions.redo,
]

/**
 * Rich text editor backed by react-native-pell-rich-editor (WebView-based).
 * Stores and emits HTML strings — compatible with Quill output from the web app.
 *
 * NOTE: `initialContentHTML` is set once on mount. If the parent needs to push
 * a new value (e.g. after AI update), change the `key` prop to force remount.
 */
export default function RichTextInput({ label, value, onChange, placeholder, minHeight = 140 }) {
  const editorRef = useRef(null)

  return (
    <View className="mb-3">
      {label && (
        <Text className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
          {label}
        </Text>
      )}
      <View
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        {/* Toolbar */}
        <RichToolbar
          editor={editorRef}
          actions={TOOLBAR_ACTIONS}
          iconTint="#6b7280"
          selectedIconTint="#f59e0b"
          style={{
            backgroundColor: '#f9fafb',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            height: 44,
          }}
        />

        {/* Editor */}
        <RichEditor
          ref={editorRef}
          initialContentHTML={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          editorStyle={{
            backgroundColor: '#f9fafb',
            color: '#111827',
            fontSize: 14,
            padding: 10,
            minHeight,
          }}
          style={{ minHeight }}
          useContainer={false}
        />
      </View>
    </View>
  )
}
