import { useState, useCallback, useEffect } from 'react'
import { CheckIcon, CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'
import { useLargeFile } from '../hooks/useLargeFile'
import { ProgressBar } from '../components/ProgressBar'

interface ValidationResult {
  valid: boolean
  error?: string
  errorLine?: number
  errorColumn?: number
  stats?: {
    keys: number
    arrays: number
    objects: number
    strings: number
    numbers: number
    booleans: number
    nulls: number
  }
}

function analyzeJson(obj: unknown, stats = { keys: 0, arrays: 0, objects: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 }): typeof stats {
  if (obj === null) {
    stats.nulls++
  } else if (Array.isArray(obj)) {
    stats.arrays++
    obj.forEach(item => analyzeJson(item, stats))
  } else if (typeof obj === 'object') {
    stats.objects++
    const keys = Object.keys(obj as Record<string, unknown>)
    stats.keys += keys.length
    keys.forEach(key => analyzeJson((obj as Record<string, unknown>)[key], stats))
  } else if (typeof obj === 'string') {
    stats.strings++
  } else if (typeof obj === 'number') {
    stats.numbers++
  } else if (typeof obj === 'boolean') {
    stats.booleans++
  }
  return stats
}

function getErrorPosition(json: string, error: SyntaxError): { line: number; column: number } | null {
  const match = error.message.match(/position (\d+)/)
  if (!match) return null
  
  const position = parseInt(match[1], 10)
  const lines = json.substring(0, position).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  }
}

export function Validator() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

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
    title: 'JSON Validator Online - Check JSON Syntax | JSON Tools',
    description: 'Validate JSON syntax instantly. Find errors with line numbers and detailed error messages. Free online JSON validator with statistics.',
    canonical: '/validator',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const validate = useCallback(async () => {
    if (!input.trim()) {
      setResult({ valid: false, error: 'Please enter JSON to validate' })
      return
    }

    if (isLargeFile(input)) {
      try {
        await processLargeJson(input, 'validate')
        const parsed = JSON.parse(input)
        const stats = analyzeJson(parsed)
        setResult({ valid: true, stats })
      } catch (e) {
        const error = e as SyntaxError
        const position = getErrorPosition(input, error)
        setResult({
          valid: false,
          error: error.message,
          errorLine: position?.line,
          errorColumn: position?.column,
        })
      }
      return
    }

    try {
      const parsed = JSON.parse(input)
      const stats = analyzeJson(parsed)
      setResult({ valid: true, stats })
    } catch (e) {
      const error = e as SyntaxError
      const position = getErrorPosition(input, error)
      setResult({
        valid: false,
        error: error.message,
        errorLine: position?.line,
        errorColumn: position?.column,
      })
    }
  }, [input, isLargeFile, processLargeJson])

  const handleCopy = useCallback(async () => {
    if (!input) return
    await navigator.clipboard.writeText(input)
    setCopied(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [input, showToast])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    resetLargeFile()
  }, [resetLargeFile])

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
    { key: 'Enter', meta: true, handler: validate },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadSample = () => {
    setInput(`{
  "name": "JSON Tools",
  "version": "1.0.0",
  "features": ["validator", "formatter", "converter"],
  "settings": {
    "theme": "dark",
    "autoSave": true
  }
}`)
  }

  const loadInvalidSample = () => {
    setInput(`{
  "name": "Invalid JSON"
  "missing": "comma",
  "trailing": "comma",
}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Validator</h1>
        <p className="text-muted-foreground">Validate JSON syntax and find errors</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Enter</kbd> Validate
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={validate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <CheckIcon className="h-4 w-4" />
          Validate
        </button>
        <button
          onClick={handleCopy}
          disabled={!input}
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
          Valid Sample
        </button>
        <button
          onClick={loadInvalidSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Invalid Sample
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
              {processingState === 'reading' ? 'Reading file...' : 'Validating large file...'}
            </span>
            <span className="text-muted-foreground">{formatFileSize(input.length)}</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${result.valid ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
          {result.valid ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <CheckIcon className="h-5 w-5" />
                Valid JSON
              </div>
              {result.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Keys:</span> <span className="font-mono">{result.stats.keys}</span></div>
                  <div><span className="text-muted-foreground">Objects:</span> <span className="font-mono">{result.stats.objects}</span></div>
                  <div><span className="text-muted-foreground">Arrays:</span> <span className="font-mono">{result.stats.arrays}</span></div>
                  <div><span className="text-muted-foreground">Strings:</span> <span className="font-mono">{result.stats.strings}</span></div>
                  <div><span className="text-muted-foreground">Numbers:</span> <span className="font-mono">{result.stats.numbers}</span></div>
                  <div><span className="text-muted-foreground">Booleans:</span> <span className="font-mono">{result.stats.booleans}</span></div>
                  <div><span className="text-muted-foreground">Nulls:</span> <span className="font-mono">{result.stats.nulls}</span></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-destructive font-medium">Invalid JSON</div>
              <div className="text-sm text-destructive/80">{result.error}</div>
              {result.errorLine && (
                <div className="text-xs text-muted-foreground">
                  Line {result.errorLine}, Column {result.errorColumn}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div
        {...dragProps}
        className={`${isDragging ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg' : ''}`}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here or drag & drop a file..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">Common JSON Errors</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Syntax Errors</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Missing commas between elements</li>
              <li>Trailing commas after last element</li>
              <li>Single quotes instead of double quotes</li>
              <li>Unquoted property names</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Value Errors</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Undefined values (use null instead)</li>
              <li>NaN or Infinity numbers</li>
              <li>Functions or methods</li>
              <li>Comments (not allowed in JSON)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
