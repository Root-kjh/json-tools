import { useState, useCallback, useEffect } from 'react'
import { CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

type SortOrder = 'asc' | 'desc'

function sortObjectKeys(obj: unknown, order: SortOrder, deep: boolean): unknown {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return deep ? obj.map(item => sortObjectKeys(item, order, deep)) : obj
  }
  
  const sorted: Record<string, unknown> = {}
  const keys = Object.keys(obj as Record<string, unknown>).sort((a, b) => {
    return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  })
  
  for (const key of keys) {
    const value = (obj as Record<string, unknown>)[key]
    sorted[key] = deep ? sortObjectKeys(value, order, deep) : value
  }
  
  return sorted
}

export function Sorter() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [order, setOrder] = useState<SortOrder>('asc')
  const [deep, setDeep] = useState(true)
  const [indent, setIndent] = useState(2)

  useSEO({
    title: 'JSON Sorter Online - Sort Keys Alphabetically | JSON Tools',
    description: 'Sort JSON object keys alphabetically. Ascending or descending order with deep sorting option. Free online JSON key sorter.',
    canonical: '/sorter',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) setInput(sharedData)
  }, [sharedData])

  const sort = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to sort')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const sorted = sortObjectKeys(parsed, order, deep)
      setOutput(JSON.stringify(sorted, null, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, order, deep, indent])

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
    { key: 'Enter', meta: true, handler: sort },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadSample = () => {
    const sample = {
      zebra: "last animal",
      apple: "first fruit",
      mango: { color: "yellow", taste: "sweet", origin: "tropical" },
      banana: ["yellow", "curved"],
      cherry: { z: 1, a: 2, m: 3 }
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Sorter</h1>
        <p className="text-muted-foreground">Sort JSON object keys alphabetically</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Enter</kbd> Sort
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={sort}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Sort Keys
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
          <span className="text-sm text-muted-foreground">Order:</span>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as SortOrder)}
            className="px-2 py-1 bg-secondary rounded-md text-sm"
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Indent:</span>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2 py-1 bg-secondary rounded-md text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={deep}
            onChange={(e) => setDeep(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Deep sort</span>
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
            placeholder="Paste your JSON here..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sorted Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Sorted JSON will appear here..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About JSON Sorter</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Why sort JSON keys?</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Easier to compare JSON objects</li>
              <li>Consistent formatting in version control</li>
              <li>Better readability for large objects</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Options</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Ascending (A→Z) or descending (Z→A)</li>
              <li>Deep sort nested objects recursively</li>
              <li>Arrays are preserved in original order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
