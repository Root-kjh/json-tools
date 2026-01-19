import { useState, useCallback } from 'react'
import { GitCompareIcon, Trash2Icon } from '../components/Icons'

type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

interface DiffResult {
  path: string
  type: DiffType
  oldValue?: unknown
  newValue?: unknown
}

function compareJson(obj1: unknown, obj2: unknown, path: string = ''): DiffResult[] {
  const results: DiffResult[] = []

  if (obj1 === obj2) {
    return results
  }

  if (typeof obj1 !== typeof obj2) {
    results.push({ path: path || 'root', type: 'changed', oldValue: obj1, newValue: obj2 })
    return results
  }

  if (obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      results.push({ path: path || 'root', type: 'changed', oldValue: obj1, newValue: obj2 })
    }
    return results
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLength = Math.max(obj1.length, obj2.length)
    for (let i = 0; i < maxLength; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`
      if (i >= obj1.length) {
        results.push({ path: itemPath, type: 'added', newValue: obj2[i] })
      } else if (i >= obj2.length) {
        results.push({ path: itemPath, type: 'removed', oldValue: obj1[i] })
      } else {
        results.push(...compareJson(obj1[i], obj2[i], itemPath))
      }
    }
    return results
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const allKeys = Array.from(new Set([...Object.keys(obj1 as object), ...Object.keys(obj2 as object)]))
    
    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key
      const val1 = (obj1 as Record<string, unknown>)[key]
      const val2 = (obj2 as Record<string, unknown>)[key]

      if (!(key in (obj1 as object))) {
        results.push({ path: keyPath, type: 'added', newValue: val2 })
      } else if (!(key in (obj2 as object))) {
        results.push({ path: keyPath, type: 'removed', oldValue: val1 })
      } else {
        results.push(...compareJson(val1, val2, keyPath))
      }
    }
    return results
  }

  if (obj1 !== obj2) {
    results.push({ path: path || 'root', type: 'changed', oldValue: obj1, newValue: obj2 })
  }

  return results
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value)
}

export function Diff() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [results, setResults] = useState<DiffResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const compare = useCallback(() => {
    if (!left.trim() || !right.trim()) {
      setResults([])
      setError('Please enter JSON in both fields')
      return
    }

    try {
      const leftParsed = JSON.parse(left)
      const rightParsed = JSON.parse(right)
      const diff = compareJson(leftParsed, rightParsed)
      setResults(diff)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      setError(errorMessage)
      setResults([])
    }
  }, [left, right])

  const clearAll = useCallback(() => {
    setLeft('')
    setRight('')
    setResults([])
    setError(null)
  }, [])

  const loadSample = useCallback(() => {
    setLeft(JSON.stringify({
      name: "John",
      age: 30,
      city: "Seoul",
      hobbies: ["reading", "coding"]
    }, null, 2))
    setRight(JSON.stringify({
      name: "John",
      age: 31,
      country: "South Korea",
      hobbies: ["reading", "gaming", "traveling"]
    }, null, 2))
  }, [])

  const getTypeColor = (type: DiffType) => {
    switch (type) {
      case 'added': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'removed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'changed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-muted'
    }
  }

  const getTypeLabel = (type: DiffType) => {
    switch (type) {
      case 'added': return '+'
      case 'removed': return '-'
      case 'changed': return '~'
      default: return '='
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON Diff</h1>
        <p className="text-muted-foreground mt-2">
          Compare two JSON objects and see the differences
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={compare}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <GitCompareIcon className="h-4 w-4" />
          Compare
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

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Left JSON (Original)</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original JSON here..."
            className="w-full h-[300px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Right JSON (Modified)</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste modified JSON here..."
            className="w-full h-[300px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Differences Found: {results.length}
          </h2>
          <div className="border rounded-md overflow-hidden">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 border-b last:border-b-0 ${getTypeColor(result.type)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold w-6">{getTypeLabel(result.type)}</span>
                  <div className="flex-1 font-mono text-sm">
                    <span className="font-semibold">{result.path}</span>
                    {result.type === 'changed' && (
                      <div className="mt-1 space-y-1">
                        <div className="text-red-400">- {formatValue(result.oldValue)}</div>
                        <div className="text-green-400">+ {formatValue(result.newValue)}</div>
                      </div>
                    )}
                    {result.type === 'added' && (
                      <span className="ml-2 text-green-400">{formatValue(result.newValue)}</span>
                    )}
                    {result.type === 'removed' && (
                      <span className="ml-2 text-red-400">{formatValue(result.oldValue)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && left && right && !error && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md text-green-400">
          No differences found. The JSON objects are identical.
        </div>
      )}
    </div>
  )
}
