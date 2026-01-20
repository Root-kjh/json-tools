import { useState, useCallback, useEffect } from 'react'
import { CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

export function Escape() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  useSEO({
    title: 'JSON Escape/Unescape Online - Free String Encoder | JSON Tools',
    description: 'Escape and unescape JSON strings online. Convert special characters to escape sequences and vice versa. Free tool for developers.',
    canonical: '/escape',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const escapeJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter text to escape')
      setOutput('')
      return
    }

    try {
      const escaped = JSON.stringify(input)
      setOutput(escaped)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Escape failed')
      setOutput('')
    }
  }, [input])

  const unescapeJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter text to unescape')
      setOutput('')
      return
    }

    try {
      let textToUnescape = input.trim()
      if (!textToUnescape.startsWith('"')) {
        textToUnescape = `"${textToUnescape}"`
      }
      if (!textToUnescape.endsWith('"')) {
        textToUnescape = `${textToUnescape}"`
      }
      
      const unescaped = JSON.parse(textToUnescape)
      setOutput(unescaped)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unescape failed - invalid escape sequence')
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
    { key: 'Enter', meta: true, handler: escapeJson },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadEscapeSample = () => {
    setInput('Hello "World"!\nThis has special characters: \t tab and \\ backslash')
  }

  const loadUnescapeSample = () => {
    setInput('"Hello \\"World\\"!\\nThis has special characters: \\t tab and \\\\ backslash"')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Escape / Unescape</h1>
        <p className="text-muted-foreground">Escape or unescape JSON string special characters</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Enter</kbd> Escape
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={escapeJson}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Escape
        </button>
        <button
          onClick={unescapeJson}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Unescape
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
          onClick={loadEscapeSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Escape Sample
        </button>
        <button
          onClick={loadUnescapeSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Unescape Sample
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
          <label className="text-sm font-medium">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to escape or escaped text to unescape..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <span className="text-xs text-muted-foreground">
                ({output.length} chars)
              </span>
            )}
          </div>
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
        <h2 className="text-lg font-semibold">Common Escape Sequences</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\n</code>
              <span className="text-muted-foreground">New line</span>
            </div>
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\t</code>
              <span className="text-muted-foreground">Tab</span>
            </div>
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\r</code>
              <span className="text-muted-foreground">Carriage return</span>
            </div>
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\\</code>
              <span className="text-muted-foreground">Backslash</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\"</code>
              <span className="text-muted-foreground">Double quote</span>
            </div>
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\b</code>
              <span className="text-muted-foreground">Backspace</span>
            </div>
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\f</code>
              <span className="text-muted-foreground">Form feed</span>
            </div>
            <div className="flex justify-between font-mono">
              <code className="text-muted-foreground">\uXXXX</code>
              <span className="text-muted-foreground">Unicode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
