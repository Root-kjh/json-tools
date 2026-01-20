import { useState, useCallback, useMemo } from 'react'
import { CopyIcon, CheckIcon, Trash2Icon, SearchIcon, UploadIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useSEO } from '../hooks/useSEO'

interface JsonNode {
  path: string
  key: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  depth: number
  expanded?: boolean
}

export function PathFinder() {
  useSEO({
    title: 'JSON Path Finder - Get JSONPath Online - Free',
    description: 'Click on any JSON value to get its JSONPath instantly. Interactive JSON tree viewer with path extraction. Free online tool for developers.',
    canonical: '/path-finder',
  })

  const [input, setInput] = useState('')
  const [parsedData, setParsedData] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']))

  const parseJson = useCallback(() => {
    if (!input.trim()) {
      setParsedData(null)
      setError(null)
      setSelectedPath(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      setParsedData(parsed)
      setError(null)
      setExpandedPaths(new Set(['$']))
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      setError(errorMessage)
      setParsedData(null)
    }
  }, [input])

  const copyPath = useCallback(async () => {
    if (!selectedPath) return
    await navigator.clipboard.writeText(selectedPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [selectedPath])

  const clearAll = useCallback(() => {
    setInput('')
    setParsedData(null)
    setError(null)
    setSelectedPath(null)
    setExpandedPaths(new Set(['$']))
  }, [])

  const loadSample = useCallback(() => {
    const sample = {
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          settings: {
            theme: "dark",
            notifications: true
          }
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          settings: {
            theme: "light",
            notifications: false
          }
        }
      ],
      metadata: {
        version: "1.0.0",
        lastUpdated: "2026-01-19"
      }
    }
    setInput(JSON.stringify(sample, null, 2))
  }, [])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }, [])

  const { isDragging, dragProps } = useFileDrop({
    onFileDrop: setInput,
  })

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: parseJson },
    { key: 'c', ctrl: true, shift: true, handler: copyPath },
  ], [parseJson, copyPath])

  useKeyboardShortcut(shortcuts)

  const getValueType = (value: unknown): JsonNode['type'] => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as JsonNode['type']
  }

  const renderValue = (value: unknown, path: string, key: string, depth: number): React.ReactNode => {
    const type = getValueType(value)
    const isExpanded = expandedPaths.has(path)
    const isSelected = selectedPath === path
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedPath(path)
    }

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleExpand(path)
    }

    const baseClasses = `cursor-pointer hover:bg-primary/10 rounded px-1 -mx-1 ${isSelected ? 'bg-primary/20 ring-1 ring-primary' : ''}`
    const indent = { paddingLeft: `${depth * 16}px` }

    if (type === 'object' || type === 'array') {
      const entries = type === 'array' 
        ? (value as unknown[]).map((v, i) => [i.toString(), v] as [string, unknown])
        : Object.entries(value as Record<string, unknown>)
      
      const bracket = type === 'array' ? ['[', ']'] : ['{', '}']
      const isEmpty = entries.length === 0

      return (
        <div key={path}>
          <div 
            className={`flex items-center font-mono text-sm py-0.5 ${baseClasses}`}
            style={indent}
            onClick={handleClick}
          >
            {!isEmpty && (
              <button 
                onClick={handleToggle}
                className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground mr-1"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {isEmpty && <span className="w-4 mr-1" />}
            {key && <span className="text-blue-400">"{key}"</span>}
            {key && <span className="text-muted-foreground">: </span>}
            <span className="text-muted-foreground">
              {bracket[0]}
              {!isExpanded && !isEmpty && <span className="text-muted-foreground/60">...</span>}
              {(isEmpty || !isExpanded) && bracket[1]}
            </span>
            {type === 'array' && (
              <span className="text-muted-foreground/60 text-xs ml-2">
                ({(value as unknown[]).length} items)
              </span>
            )}
          </div>
          {isExpanded && !isEmpty && (
            <>
              {entries.map(([k, v]) => {
                const childPath = type === 'array' ? `${path}[${k}]` : `${path}.${k}`
                return renderValue(v, childPath, type === 'array' ? k : k, depth + 1)
              })}
              <div className="font-mono text-sm py-0.5 text-muted-foreground" style={{ paddingLeft: `${depth * 16}px` }}>
                {bracket[1]}
              </div>
            </>
          )}
        </div>
      )
    }

    let valueDisplay: React.ReactNode
    let valueColor = ''

    switch (type) {
      case 'string':
        valueDisplay = `"${value}"`
        valueColor = 'text-green-400'
        break
      case 'number':
        valueDisplay = String(value)
        valueColor = 'text-orange-400'
        break
      case 'boolean':
        valueDisplay = String(value)
        valueColor = 'text-purple-400'
        break
      case 'null':
        valueDisplay = 'null'
        valueColor = 'text-red-400'
        break
    }

    return (
      <div 
        key={path}
        className={`flex items-center font-mono text-sm py-0.5 ${baseClasses}`}
        style={indent}
        onClick={handleClick}
      >
        <span className="w-4 mr-1" />
        {key && <span className="text-blue-400">"{key}"</span>}
        {key && <span className="text-muted-foreground">: </span>}
        <span className={valueColor}>{valueDisplay}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON Path Finder</h1>
        <p className="text-muted-foreground mt-2">
          Click on any value to get its JSON path (JSONPath syntax)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Enter</kbd> Parse
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Shift+C</kbd> Copy Path
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={parseJson}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <SearchIcon className="h-4 w-4" />
          Parse JSON
        </button>
        <button
          onClick={copyPath}
          disabled={!selectedPath}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Path'}
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
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
      </div>

      {selectedPath && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
          <div className="text-sm text-muted-foreground mb-1">Selected Path:</div>
          <code className="font-mono text-primary text-lg">{selectedPath}</code>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input JSON</label>
          <div
            {...dragProps}
            className={`relative ${isDragging ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-primary">
                  <UploadIcon className="h-6 w-6" />
                  <span className="font-medium">Drop JSON file here</span>
                </div>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here or drag & drop a file..."
              className="w-full h-[500px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">JSON Tree (click to get path)</label>
          <div className="w-full h-[500px] p-4 bg-card border rounded-md overflow-auto">
            {parsedData !== null ? (
              <div className="min-w-fit">
                {renderValue(parsedData, '$', '', 0)}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Parsed JSON tree will appear here...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold mb-3">How to use JSON Path</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <h3 className="font-medium text-muted-foreground mb-2">Path Syntax</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li><code className="text-primary">$</code> - Root object</li>
              <li><code className="text-primary">$.key</code> - Property access</li>
              <li><code className="text-primary">$[0]</code> - Array index</li>
              <li><code className="text-primary">$.users[0].name</code> - Nested access</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground mb-2">Usage Examples</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>JavaScript: <code className="text-primary">data.users[0].name</code></li>
              <li>jq: <code className="text-primary">.users[0].name</code></li>
              <li>Python: <code className="text-primary">data['users'][0]['name']</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
