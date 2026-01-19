import { useState, useCallback } from 'react'
import { CopyIcon, CheckIcon, Trash2Icon, DownloadIcon, TableIcon } from '../components/Icons'

type JsonArray = Record<string, unknown>[]

function jsonToCsv(input: unknown): string {
  let data: JsonArray
  
  if (Array.isArray(input)) {
    data = input as JsonArray
  } else if (typeof input === 'object' && input !== null) {
    data = [input as Record<string, unknown>]
  } else {
    throw new Error('Input must be an array of objects or a single object')
  }

  if (data.length === 0) return ''

  const allKeys = new Set<string>()
  for (const item of data) {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => allKeys.add(key))
    }
  }

  const headers = Array.from(allKeys)
  
  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = data.map((item: Record<string, unknown>) => {
    if (typeof item !== 'object' || item === null) return ''
    return headers.map(header => escapeCell(item[header])).join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function ToCsv() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const csv = jsonToCsv(parsed)
      setOutput(csv)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      setError(errorMessage)
      setOutput('')
    }
  }, [input])

  const copyToClipboard = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const downloadCsv = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'data.csv'
    link.click()
    URL.revokeObjectURL(url)
  }, [output])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  const loadSample = useCallback(() => {
    const sample = [
      { name: "John Doe", age: 30, city: "Seoul", active: true },
      { name: "Jane Smith", age: 25, city: "Tokyo", active: false },
      { name: "Bob Johnson", age: 35, city: "New York", active: true }
    ]
    setInput(JSON.stringify(sample, null, 2))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON to CSV</h1>
        <p className="text-muted-foreground mt-2">
          Convert JSON arrays to CSV format for spreadsheets
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={convert}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <TableIcon className="h-4 w-4" />
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
          onClick={downloadCsv}
          disabled={!output}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="h-4 w-4" />
          Download
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
          <label className="text-sm font-medium">Input JSON (array of objects)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
            className="w-full h-[500px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">CSV Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="CSV output will appear here..."
            className="w-full h-[500px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
