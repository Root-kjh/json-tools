import { useState, useCallback, useEffect } from 'react'
import { Minimize2Icon, CopyIcon, Trash2Icon, ShareIcon, LinkIcon, Maximize2Icon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'
import { useLargeFile } from '../hooks/useLargeFile'
import { ProgressBar } from '../components/ProgressBar'

export function Minifier() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [stats, setStats] = useState<{ original: number; minified: number; saved: number } | null>(null)

  const {
    progress,
    isLargeFile,
    processLargeJson,
    reset: resetLargeFile,
    isProcessing,
    state: processingState,
    formatFileSize
  } = useLargeFile()

  useSEO({
    title: 'JSON Minifier Online - Compress JSON | JSON Tools',
    description: 'Minify and compress JSON by removing whitespace. Reduce file size for faster loading. Free online tool with size comparison.',
    canonical: '/minifier',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const minify = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter JSON to minify')
      setOutput('')
      setStats(null)
      return
    }

    if (isLargeFile(input)) {
      try {
        const minified = await processLargeJson(input, 'minify')
        setOutput(minified)
        setError('')
        
        const originalSize = new Blob([input]).size
        const minifiedSize = new Blob([minified]).size
        const saved = originalSize - minifiedSize
        setStats({ original: originalSize, minified: minifiedSize, saved })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON')
        setOutput('')
        setStats(null)
      }
      return
    }

    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')
      
      const originalSize = new Blob([input]).size
      const minifiedSize = new Blob([minified]).size
      const saved = originalSize - minifiedSize
      setStats({
        original: originalSize,
        minified: minifiedSize,
        saved: saved,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
      setStats(null)
    }
  }, [input, isLargeFile, processLargeJson])

  const beautify = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter JSON to beautify')
      setOutput('')
      setStats(null)
      return
    }

    if (isLargeFile(input)) {
      try {
        const beautified = await processLargeJson(input, 'format', { indentSize: 2 })
        setOutput(beautified)
        setError('')
        setStats(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON')
        setOutput('')
        setStats(null)
      }
      return
    }

    try {
      const parsed = JSON.parse(input)
      const beautified = JSON.stringify(parsed, null, 2)
      setOutput(beautified)
      setError('')
      setStats(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
      setStats(null)
    }
  }, [input, isLargeFile, processLargeJson])

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
    setStats(null)
    resetLargeFile()
  }, [resetLargeFile])

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
    { key: 'Enter', meta: true, handler: minify },
    { key: 'm', meta: true, handler: minify },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadSample = () => {
    const sample = {
      name: "JSON Tools",
      version: "1.0.0",
      description: "Free online JSON utilities",
      features: [
        "formatter",
        "minifier",
        "converter"
      ],
      settings: {
        theme: "dark",
        autoSave: true,
        notifications: {
          email: true,
          push: false
        }
      }
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Minifier</h1>
        <p className="text-muted-foreground">Compress JSON by removing whitespace and formatting</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Enter</kbd> Minify
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={minify}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Minimize2Icon className="h-4 w-4" />
          Minify
        </button>
        <button
          onClick={beautify}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
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
      </div>

      {isProcessing && (
        <div className="p-4 bg-secondary/50 border border-border rounded-md space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {processingState === 'reading' ? 'Reading file...' : 'Processing large file...'}
            </span>
            <span className="text-muted-foreground">{formatFileSize(input.length)}</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      )}

      {stats && (
        <div className="flex flex-wrap gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-sm">
            <span className="text-muted-foreground">Original:</span>{' '}
            <span className="font-mono font-medium">{formatBytes(stats.original)}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Minified:</span>{' '}
            <span className="font-mono font-medium">{formatBytes(stats.minified)}</span>
          </div>
          <div className="text-sm text-green-400">
            <span className="text-muted-foreground">Saved:</span>{' '}
            <span className="font-mono font-medium">
              {formatBytes(stats.saved)} ({((stats.saved / stats.original) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

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
            placeholder="Paste your JSON here or drag & drop a file..."
            className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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
            placeholder="Minified JSON will appear here..."
            className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">Why Minify JSON?</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Reduce File Size</h3>
            <p>Remove unnecessary whitespace and formatting to reduce JSON file size by 20-50%.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Faster Loading</h3>
            <p>Smaller files mean faster network transfers and improved application performance.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">API Optimization</h3>
            <p>Send minified JSON in API responses to reduce bandwidth and response times.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
