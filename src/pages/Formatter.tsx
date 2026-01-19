import { useState, useCallback, useMemo } from 'react'
import { CopyIcon, CheckIcon, Trash2Icon, Minimize2Icon, Maximize2Icon, UploadIcon, WrenchIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { repairJson } from '../utils/jsonRepair'

export function Formatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [repairInfo, setRepairInfo] = useState<string[] | null>(null)

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      setError(errorMessage)
      setOutput('')
    }
  }, [input, indentSize])

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      setError(errorMessage)
      setOutput('')
    }
  }, [input])

  const autoRepair = useCallback(() => {
    if (!input.trim()) {
      setRepairInfo(null)
      return
    }

    const result = repairJson(input)
    if (result.fixes.length > 0) {
      setInput(result.repaired)
      setRepairInfo(result.fixes)
      setError(null)
      
      if (result.success) {
        try {
          const parsed = JSON.parse(result.repaired)
          setOutput(JSON.stringify(parsed, null, indentSize))
        } catch {
          setOutput('')
        }
      }
    } else {
      setRepairInfo(['No issues found to repair'])
    }
  }, [input, indentSize])

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
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      address: {
        street: "123 Main St",
        city: "Seoul",
        country: "South Korea"
      },
      hobbies: ["reading", "coding", "gaming"],
      active: true
    }
    setInput(JSON.stringify(sample))
  }, [])

  const { isDragging, dragProps } = useFileDrop({
    onFileDrop: setInput,
  })

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: formatJson },
    { key: 'c', ctrl: true, shift: true, handler: copyToClipboard },
    { key: 'm', ctrl: true, handler: minifyJson },
  ], [formatJson, copyToClipboard, minifyJson])

  useKeyboardShortcut(shortcuts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON Formatter & Validator</h1>
        <p className="text-muted-foreground mt-2">
          Format, beautify, and validate your JSON with syntax highlighting
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Enter</kbd> Format
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+M</kbd> Minify
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={formatJson}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Maximize2Icon className="h-4 w-4" />
          Format
        </button>
        <button
          onClick={minifyJson}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <Minimize2Icon className="h-4 w-4" />
          Minify
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
          onClick={autoRepair}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <WrenchIcon className="h-4 w-4" />
          Auto-Repair
        </button>
        <button
          onClick={loadSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Load Sample
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-muted-foreground">Indent:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md border border-border"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>Tab (8)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      {repairInfo && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md text-foreground">
          <strong className="text-primary">Auto-Repair Applied:</strong>
          <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
            {repairInfo.map((fix, index) => (
              <li key={index}>{fix}</li>
            ))}
          </ul>
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
          <label className="text-sm font-medium">
            Output {output && <span className="text-muted-foreground">({output.length} chars)</span>}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="w-full h-[500px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
