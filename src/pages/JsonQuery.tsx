import { useState, useCallback, useEffect } from 'react'
import { JSONPath } from 'jsonpath-plus'
import { SearchIcon, CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

const EXAMPLES = [
  { label: 'All names', query: '$.users[*].name' },
  { label: 'First item', query: '$.users[0]' },
  { label: 'Filter by age', query: '$.users[?(@.age > 25)]' },
  { label: 'Nested values', query: '$..email' },
  { label: 'Array length', query: '$.users.length' },
]

export function JsonQuery() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('$')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [matchCount, setMatchCount] = useState<number | null>(null)

  useSEO({
    title: 'JSON Query - JSONPath Query Tool Online | JSON Tools',
    description: 'Query JSON data using JSONPath expressions. Filter, search, and extract data from JSON. Free online tool with live preview.',
    canonical: '/json-query',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const executeQuery = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to query')
      setOutput('')
      setMatchCount(null)
      return
    }

    if (!query.trim()) {
      setError('Please enter a JSONPath query')
      setOutput('')
      setMatchCount(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const result = JSONPath({ path: query, json: parsed })
      
      setMatchCount(Array.isArray(result) ? result.length : 1)
      setOutput(JSON.stringify(result, null, 2))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query error')
      setOutput('')
      setMatchCount(null)
    }
  }, [input, query])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [output, showToast])

  const handleClear = useCallback(() => {
    setInput('')
    setQuery('$')
    setOutput('')
    setError('')
    setMatchCount(null)
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
    { key: 'Enter', meta: true, handler: executeQuery },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadSample = () => {
    const sample = {
      users: [
        { id: 1, name: "Alice", age: 28, email: "alice@example.com" },
        { id: 2, name: "Bob", age: 32, email: "bob@example.com" },
        { id: 3, name: "Charlie", age: 24, email: "charlie@example.com" }
      ],
      meta: {
        total: 3,
        page: 1
      }
    }
    setInput(JSON.stringify(sample, null, 2))
    setQuery('$.users[*].name')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Query</h1>
        <p className="text-muted-foreground">Query JSON data using JSONPath expressions</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Enter</kbd> Execute
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter JSONPath query (e.g., $.users[*].name)"
              className="w-full px-4 py-2 bg-card border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
            />
          </div>
          <button
            onClick={executeQuery}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <SearchIcon className="h-4 w-4" />
            Execute Query
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground py-1">Examples:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.query}
              onClick={() => setQuery(ex.query)}
              className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
            <label className="text-sm font-medium">Query Result</label>
            {matchCount !== null && (
              <span className="text-xs text-muted-foreground">
                {matchCount} match{matchCount !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Query results will appear here..."
            className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">JSONPath Syntax Reference</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <code className="text-primary">$</code>
              <span className="text-muted-foreground">Root object</span>
            </div>
            <div className="flex justify-between">
              <code className="text-primary">$.property</code>
              <span className="text-muted-foreground">Child property</span>
            </div>
            <div className="flex justify-between">
              <code className="text-primary">$[0]</code>
              <span className="text-muted-foreground">Array index</span>
            </div>
            <div className="flex justify-between">
              <code className="text-primary">$[*]</code>
              <span className="text-muted-foreground">All array items</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <code className="text-primary">$..</code>
              <span className="text-muted-foreground">Recursive descent</span>
            </div>
            <div className="flex justify-between">
              <code className="text-primary">$[?(@.x)]</code>
              <span className="text-muted-foreground">Filter expression</span>
            </div>
            <div className="flex justify-between">
              <code className="text-primary">$[0:3]</code>
              <span className="text-muted-foreground">Array slice</span>
            </div>
            <div className="flex justify-between">
              <code className="text-primary">$.length</code>
              <span className="text-muted-foreground">Array length</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
