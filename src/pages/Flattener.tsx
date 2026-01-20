import { useState, useCallback, useEffect } from 'react'
import { CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

function flattenObject(obj: unknown, prefix: string = '', delimiter: string = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  
  function recurse(current: unknown, path: string) {
    if (current === null || current === undefined) {
      result[path] = current
    } else if (Array.isArray(current)) {
      if (current.length === 0) {
        result[path] = []
      } else {
        current.forEach((item, index) => {
          recurse(item, path ? `${path}[${index}]` : `[${index}]`)
        })
      }
    } else if (typeof current === 'object') {
      const keys = Object.keys(current as Record<string, unknown>)
      if (keys.length === 0) {
        result[path] = {}
      } else {
        keys.forEach(key => {
          const newPath = path ? `${path}${delimiter}${key}` : key
          recurse((current as Record<string, unknown>)[key], newPath)
        })
      }
    } else {
      result[path] = current
    }
  }
  
  recurse(obj, prefix)
  return result
}

function unflattenObject(obj: Record<string, unknown>, delimiter: string = '.'): unknown {
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const parts: (string | number)[] = []
    let current = ''
    let i = 0
    
    while (i < key.length) {
      if (key[i] === '[') {
        if (current) parts.push(current)
        current = ''
        i++
        let num = ''
        while (i < key.length && key[i] !== ']') {
          num += key[i]
          i++
        }
        parts.push(parseInt(num, 10))
        i++
      } else if (key[i] === delimiter[0] && key.substring(i, i + delimiter.length) === delimiter) {
        if (current) parts.push(current)
        current = ''
        i += delimiter.length
      } else {
        current += key[i]
        i++
      }
    }
    if (current) parts.push(current)
    
    let target: Record<string, unknown> | unknown[] = result
    for (let j = 0; j < parts.length - 1; j++) {
      const part = parts[j]
      const nextPart = parts[j + 1]
      const isNextArray = typeof nextPart === 'number'
      
      if (typeof part === 'number') {
        if (!(target as unknown[])[part]) {
          (target as unknown[])[part] = isNextArray ? [] : {}
        }
        target = (target as unknown[])[part] as Record<string, unknown> | unknown[]
      } else {
        if (!(target as Record<string, unknown>)[part]) {
          (target as Record<string, unknown>)[part] = isNextArray ? [] : {}
        }
        target = (target as Record<string, unknown>)[part] as Record<string, unknown> | unknown[]
      }
    }
    
    const lastPart = parts[parts.length - 1]
    if (typeof lastPart === 'number') {
      (target as unknown[])[lastPart] = value
    } else {
      (target as Record<string, unknown>)[lastPart] = value
    }
  }
  
  return result
}

export function Flattener() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [delimiter, setDelimiter] = useState('.')

  useSEO({
    title: 'JSON Flattener Online - Flatten/Unflatten JSON | JSON Tools',
    description: 'Flatten nested JSON to dot notation or unflatten back to nested structure. Free online JSON flattening tool.',
    canonical: '/flattener',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) setInput(sharedData)
  }, [sharedData])

  const flatten = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to flatten')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const flattened = flattenObject(parsed, '', delimiter)
      setOutput(JSON.stringify(flattened, null, 2))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, delimiter])

  const unflatten = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter flattened JSON to unflatten')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Input must be a flat object')
      }
      const unflattened = unflattenObject(parsed, delimiter)
      setOutput(JSON.stringify(unflattened, null, 2))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, delimiter])

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
    { key: 'Enter', meta: true, handler: flatten },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadNestedSample = () => {
    const sample = {
      user: {
        name: "John",
        address: {
          city: "Seoul",
          country: "Korea"
        },
        tags: ["developer", "designer"]
      },
      settings: {
        theme: "dark"
      }
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  const loadFlatSample = () => {
    const sample = {
      "user.name": "John",
      "user.address.city": "Seoul",
      "user.address.country": "Korea",
      "user.tags[0]": "developer",
      "user.tags[1]": "designer",
      "settings.theme": "dark"
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON Flattener</h1>
        <p className="text-muted-foreground">Flatten nested JSON or unflatten dot notation</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Enter</kbd> Flatten
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={flatten}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Flatten
        </button>
        <button
          onClick={unflatten}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Unflatten
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
          onClick={loadNestedSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Nested Sample
        </button>
        <button
          onClick={loadFlatSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Flat Sample
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
          <span className="text-sm text-muted-foreground">Delimiter:</span>
          <input
            type="text"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value || '.')}
            className="w-12 px-2 py-1 bg-secondary rounded-md text-sm text-center"
            maxLength={3}
          />
        </div>
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
            placeholder="Paste nested or flattened JSON..."
            className="w-full h-[400px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Output</label>
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
        <h2 className="text-lg font-semibold">About JSON Flattening</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Flatten Example</h3>
            <pre className="bg-secondary p-2 rounded text-xs overflow-x-auto">
{`{ "a": { "b": 1 } }
→ { "a.b": 1 }`}</pre>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Use Cases</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Database column mapping</li>
              <li>Form field handling</li>
              <li>CSV/spreadsheet export</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
