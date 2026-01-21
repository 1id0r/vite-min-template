/**
 * JsonEditor - CodeMirror 6 based JSON editor with syntax highlighting
 *
 * Features:
 * - JSON syntax highlighting
 * - Real-time validation
 * - Lightweight (~50KB)
 */

import { memo, useCallback, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { Typography } from 'antd'

const { Text } = Typography

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string
  placeholder?: string
  error?: string
}

export const JsonEditor = memo(function JsonEditor({
  value,
  onChange,
  height = '180px',
  placeholder,
  error: externalError,
}: JsonEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleChange = useCallback(
    (val: string) => {
      onChange(val)

      // Validate JSON on change
      if (val.trim()) {
        try {
          JSON.parse(val)
          setJsonError(null)
        } catch {
          setJsonError('JSON לא תקין')
        }
      } else {
        setJsonError(null)
      }
    },
    [onChange],
  )

  const displayError = externalError || jsonError

  return (
    <div>
      <div
        style={{
          border: displayError ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
          borderRadius: 8,
          overflow: 'hidden',
          direction: 'ltr',
        }}
      >
        <CodeMirror
          value={value || ''}
          height={height}
          extensions={[json()]}
          onChange={handleChange}
          placeholder={placeholder || '{"query": {...}}'}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            autocompletion: true,
          }}
          style={{
            fontSize: 13,
          }}
        />
      </div>
      {displayError && (
        <Text type='danger' style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          {displayError}
        </Text>
      )}
    </div>
  )
})

JsonEditor.displayName = 'JsonEditor'
