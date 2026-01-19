import { useState, useCallback } from 'react'
import { CopyIcon, CheckIcon, Trash2Icon, CodeIcon } from '../components/Icons'

function jsonToTypeScript(json: unknown, rootName: string = 'Root'): string {
  const interfaces: string[] = []
  const processedTypes = new Map<string, string>()

  function getTypeName(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/[^a-zA-Z0-9]/g, '')
  }

  function getType(value: unknown, key: string, depth: number = 0): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'

    const type = typeof value

    if (type === 'string') return 'string'
    if (type === 'number') return 'number'
    if (type === 'boolean') return 'boolean'

    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]'
      const itemType = getType(value[0], key, depth)
      return `${itemType}[]`
    }

    if (type === 'object') {
      const typeName = depth === 0 ? rootName : getTypeName(key)
      const signature = JSON.stringify(Object.keys(value as object).sort())
      
      if (processedTypes.has(signature)) {
        return processedTypes.get(signature)!
      }

      processedTypes.set(signature, typeName)
      
      const properties: string[] = []
      for (const [k, v] of Object.entries(value as object)) {
        const propType = getType(v, k, depth + 1)
        const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`
        properties.push(`  ${safeName}: ${propType};`)
      }

      interfaces.push(`interface ${typeName} {\n${properties.join('\n')}\n}`)
      return typeName
    }

    return 'unknown'
  }

  getType(json, rootName)
  return interfaces.reverse().join('\n\n')
}

export function ToTypeScript() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [rootName, setRootName] = useState('Root')

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const typescript = jsonToTypeScript(parsed, rootName)
      setOutput(typescript)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      setError(errorMessage)
      setOutput('')
    }
  }, [input, rootName])

  const copyToClipboard = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  const loadSample = useCallback(() => {
    const sample = {
      user: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        roles: ["admin", "user"]
      },
      posts: [
        {
          id: 1,
          title: "Hello World",
          published: true,
          tags: ["intro", "welcome"]
        }
      ],
      metadata: {
        version: "1.0.0",
        lastUpdated: "2024-01-01"
      }
    }
    setInput(JSON.stringify(sample, null, 2))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON to TypeScript</h1>
        <p className="text-muted-foreground mt-2">
          Generate TypeScript interfaces from your JSON data
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={convert}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <CodeIcon className="h-4 w-4" />
          Convert
        </button>
        <button
          onClick={copyToClipboard}
          disabled={!output}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
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
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-muted-foreground">Root name:</label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value || 'Root')}
            className="px-2 py-1 w-32 bg-secondary text-secondary-foreground rounded-md border border-border"
            placeholder="Root"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-[500px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">TypeScript Interfaces</label>
          <textarea
            value={output}
            readOnly
            placeholder="TypeScript interfaces will appear here..."
            className="w-full h-[500px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
