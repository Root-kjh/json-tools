import { useState, useCallback, useEffect } from 'react'
import { SearchIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

interface TreeNodeProps {
  data: unknown
  name: string
  path: string
  depth: number
  expandedPaths: Set<string>
  toggleExpand: (path: string) => void
  onCopyPath: (path: string) => void
}

function TreeNode({ data, name, path, depth, expandedPaths, toggleExpand, onCopyPath }: TreeNodeProps) {
  const isExpanded = expandedPaths.has(path)
  const isObject = data !== null && typeof data === 'object'
  const isArray = Array.isArray(data)
  
  const getValueColor = (value: unknown) => {
    if (value === null) return 'text-orange-400'
    if (typeof value === 'string') return 'text-green-400'
    if (typeof value === 'number') return 'text-blue-400'
    if (typeof value === 'boolean') return 'text-purple-400'
    return ''
  }

  const formatValue = (value: unknown) => {
    if (value === null) return 'null'
    if (typeof value === 'string') return `"${value}"`
    return String(value)
  }

  const childCount = isObject ? (isArray ? (data as unknown[]).length : Object.keys(data as object).length) : 0

  return (
    <div style={{ paddingLeft: depth > 0 ? '1.25rem' : 0 }}>
      <div 
        className="flex items-center gap-1 py-0.5 hover:bg-secondary/50 rounded px-1 -mx-1 group cursor-pointer"
        onClick={() => isObject && toggleExpand(path)}
      >
        {isObject && (
          <span className="text-muted-foreground w-4 text-center text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!isObject && <span className="w-4" />}
        
        <span className="text-primary font-medium">{name}</span>
        <span className="text-muted-foreground">:</span>
        
        {isObject ? (
          <span className="text-muted-foreground text-sm">
            {isArray ? `[${childCount}]` : `{${childCount}}`}
          </span>
        ) : (
          <span className={`${getValueColor(data)} text-sm`}>
            {formatValue(data)}
          </span>
        )}
        
        <button
          onClick={(e) => { e.stopPropagation(); onCopyPath(path); }}
          className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-muted-foreground hover:text-foreground transition-opacity"
          title="Copy path"
        >
          📋
        </button>
      </div>
      
      {isObject && isExpanded && (
        <div>
          {isArray
            ? (data as unknown[]).map((item, index) => (
                <TreeNode
                  key={index}
                  data={item}
                  name={String(index)}
                  path={`${path}[${index}]`}
                  depth={depth + 1}
                  expandedPaths={expandedPaths}
                  toggleExpand={toggleExpand}
                  onCopyPath={onCopyPath}
                />
              ))
            : Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                <TreeNode
                  key={key}
                  data={value}
                  name={key}
                  path={path ? `${path}.${key}` : key}
                  depth={depth + 1}
                  expandedPaths={expandedPaths}
                  toggleExpand={toggleExpand}
                  onCopyPath={onCopyPath}
                />
              ))}
        </div>
      )}
    </div>
  )
}

export function Viewer() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [parsedData, setParsedData] = useState<unknown>(null)
  const [error, setError] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']))
  const [copiedPath, setCopiedPath] = useState('')
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  useSEO({
    title: 'JSON Viewer Online - Tree View Visualizer | JSON Tools',
    description: 'View JSON in an interactive tree structure. Expand/collapse nodes, copy paths, and search. Free online JSON viewer with tree visualization.',
    canonical: '/viewer',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const parseJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to view')
      setParsedData(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      setParsedData(parsed)
      setError('')
      setExpandedPaths(new Set(['$']))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setParsedData(null)
    }
  }, [input])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    if (!parsedData) return
    const paths = new Set<string>(['$'])
    
    const collectPaths = (data: unknown, path: string) => {
      if (data !== null && typeof data === 'object') {
        paths.add(path)
        if (Array.isArray(data)) {
          data.forEach((_, i) => collectPaths(data[i], `${path}[${i}]`))
        } else {
          Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
            collectPaths(value, path ? `${path}.${key}` : key)
          })
        }
      }
    }
    
    collectPaths(parsedData, '$')
    setExpandedPaths(paths)
  }, [parsedData])

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['$']))
  }, [])

  const handleCopyPath = useCallback(async (path: string) => {
    await navigator.clipboard.writeText(path)
    setCopiedPath(path)
    showToast('Path copied!')
    setTimeout(() => setCopiedPath(''), 2000)
  }, [showToast])

  const handleClear = useCallback(() => {
    setInput('')
    setParsedData(null)
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
    { key: 'Enter', meta: true, handler: parseJson },
  ])

  const loadSample = () => {
    const sample = {
      name: "JSON Tools",
      version: "1.0.0",
      author: { name: "Developer", email: "dev@example.com" },
      features: [
        { name: "Viewer", type: "visualization" },
        { name: "Formatter", type: "transform" },
        { name: "Validator", type: "check" }
      ],
      config: { theme: "dark", indent: 2 }
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Viewer</h1>
        <p className="text-muted-foreground">View JSON in an interactive tree structure</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Enter</kbd> Parse
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={parseJson}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <SearchIcon className="h-4 w-4" />
          View Tree
        </button>
        <button
          onClick={expandAll}
          disabled={!parsedData}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          disabled={!parsedData}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          Collapse All
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

      {copiedPath && (
        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400">
          Copied: <code className="font-mono">{copiedPath}</code>
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
          <label className="text-sm font-medium">Tree View</label>
          <div className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm overflow-auto">
            {parsedData ? (
              <TreeNode
                data={parsedData}
                name="$"
                path="$"
                depth={0}
                expandedPaths={expandedPaths}
                toggleExpand={toggleExpand}
                onCopyPath={handleCopyPath}
              />
            ) : (
              <span className="text-muted-foreground">Tree view will appear here...</span>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">JSON Viewer Features</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Interactive Tree</h3>
            <p>Click on objects and arrays to expand or collapse them. Navigate complex JSON structures easily.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Copy Paths</h3>
            <p>Hover over any node and click the copy button to get the JSONPath to that value.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Color Coded</h3>
            <p>Different colors for strings, numbers, booleans, and null values for easy identification.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
