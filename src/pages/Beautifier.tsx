import { useState, useCallback, useEffect } from 'react'
import { Maximize2Icon, CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'

export function Beautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)

  useSEO({
    title: 'JSON Beautifier Online - Pretty Print JSON | JSON Tools',
    description: 'Beautify and pretty print JSON with customizable indentation. Make JSON readable with proper formatting. Free online JSON beautifier.',
    canonical: '/beautifier',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const sortObject = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(sortObject)
    
    const sorted: Record<string, unknown> = {}
    Object.keys(obj as Record<string, unknown>)
      .sort()
      .forEach(key => {
        sorted[key] = sortObject((obj as Record<string, unknown>)[key])
      })
    return sorted
  }

  const beautify = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to beautify')
      setOutput('')
      return
    }

    try {
      let parsed = JSON.parse(input)
      if (sortKeys) {
        parsed = sortObject(parsed)
      }
      const beautified = JSON.stringify(parsed, null, indent)
      setOutput(beautified)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, indent, sortKeys])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
  }, [])

  const handleShare = useCallback(async () => {
    if (!input.trim()) return
    const r = await shareUrl(input)
    if (r.success) {
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }, [input, shareUrl])

  const { isDragging, dragProps } = useFileDrop({
    onFileDrop: (content) => setInput(content),
  })

  useKeyboardShortcut([
    { key: 'Enter', meta: true, handler: beautify },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadSample = () => {
    setInput('{"name":"JSON Tools","version":"1.0.0","features":["beautifier","formatter","validator"],"settings":{"theme":"dark","indent":2,"sortKeys":false}}')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Beautifier</h1>
        <p className="text-muted-foreground">Pretty print JSON with customizable formatting</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Enter</kbd> Beautify
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={beautify}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Maximize2Icon className="h-4 w-4" />
          Beautify
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
          onClick={loadSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Load Sample
        </button>
        <button
          onClick={handleShare}
          disabled={!input.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {shareStatus === 'copied' ? <LinkIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
          {shareStatus === 'copied' ? 'Link Copied!' : 'Share'}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Indent:</span>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2 py-1 bg-secondary rounded-md text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>Tab (8)</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Sort keys</span>
        </label>
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
          <label className="text-sm font-medium">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your minified or messy JSON here..."
            className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Beautified Output</label>
            {output && (
              <span className="text-xs text-muted-foreground">
                ({output.split('\n').length} lines)
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Beautified JSON will appear here..."
            className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About JSON Beautifier</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Readable Format</h3>
            <p>Transform minified JSON into human-readable format with proper indentation and line breaks.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Custom Indentation</h3>
            <p>Choose between 2 spaces, 4 spaces, or tabs to match your coding style preferences.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Sort Keys</h3>
            <p>Optionally sort object keys alphabetically for consistent and organized output.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
