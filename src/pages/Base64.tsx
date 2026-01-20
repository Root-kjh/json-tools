import { useState, useCallback, useEffect } from 'react'
import { CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

export function Base64() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  useSEO({
    title: 'JSON Base64 Encoder/Decoder Online | JSON Tools',
    description: 'Encode JSON to Base64 or decode Base64 to JSON. Free online tool for Base64 conversion with JSON validation.',
    canonical: '/base64',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) setInput(sharedData)
  }, [sharedData])

  const encode = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to encode')
      setOutput('')
      return
    }

    try {
      JSON.parse(input)
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input])

  const decode = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter Base64 to decode')
      setOutput('')
      return
    }

    try {
      const decoded = decodeURIComponent(escape(atob(input.trim())))
      const parsed = JSON.parse(decoded)
      setOutput(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (e) {
      setError('Invalid Base64 or not valid JSON')
      setOutput('')
    }
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [output, showToast])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
  }, [])

  const handleShare = useCallback(async () => {
    if (!input.trim()) return
    const result = await shareUrl(input)
    if (result.success) {
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }, [input, shareUrl])

  const { isDragging, dragProps } = useFileDrop({
    onFileDrop: (content) => setInput(content),
  })

  useKeyboardShortcut([
    { key: 'Enter', meta: true, handler: encode },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadEncodeSample = () => {
    const sample = { name: "JSON Tools", version: "1.0", features: ["encode", "decode"] }
    setInput(JSON.stringify(sample, null, 2))
  }

  const loadDecodeSample = () => {
    setInput('eyJuYW1lIjoiSlNPTiBUb29scyIsInZlcnNpb24iOiIxLjAiLCJmZWF0dXJlcyI6WyJlbmNvZGUiLCJkZWNvZGUiXX0=')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Base64</h1>
        <p className="text-muted-foreground">Encode JSON to Base64 or decode Base64 to JSON</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Enter</kbd> Encode
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={encode}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Encode to Base64
        </button>
        <button
          onClick={decode}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Decode from Base64
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <CopyIcon className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          <Trash2Icon className="h-4 w-4" />
          Clear
        </button>
        <button
          onClick={loadEncodeSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          JSON Sample
        </button>
        <button
          onClick={loadDecodeSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Base64 Sample
        </button>
        <button
          onClick={handleShare}
          disabled={!input.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {shareStatus === 'copied' ? <LinkIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
          {shareStatus === 'copied' ? 'Link Copied!' : 'Share'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      <div
        {...dragProps}
        className={`grid gap-4 md:grid-cols-2 ${isDragging ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg' : ''}`}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Input (JSON or Base64)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON to encode or Base64 to decode..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About Base64 Encoding</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Use Cases</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Embed JSON in URLs safely</li>
              <li>Store JSON in cookies</li>
              <li>Transmit data through text-only channels</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>UTF-8 safe encoding</li>
              <li>JSON validation before encoding</li>
              <li>Pretty print decoded JSON</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
