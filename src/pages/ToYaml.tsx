import { useState, useCallback, useEffect } from 'react'
import yaml from 'js-yaml'
import { FileJsonIcon, CopyIcon, Trash2Icon, ShareIcon, LinkIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'

export function ToYaml() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [options, setOptions] = useState({
    indent: 2,
  })

  useSEO({
    title: 'JSON to YAML Converter Online - Free | JSON Tools',
    description: 'Convert JSON to YAML format instantly. Free online converter with customizable indentation. Privacy-first: all processing happens in your browser.',
    canonical: '/to-yaml',
  })

  const { sharedData, shareUrl } = useShareUrl()

  useEffect(() => {
    if (sharedData) {
      setInput(sharedData)
    }
  }, [sharedData])

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON to convert')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const yamlOutput = yaml.dump(parsed, {
        indent: options.indent,
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false,
      })
      setOutput(yamlOutput)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, options])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

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
    { key: 'Enter', meta: true, handler: convert },
    { key: 'c', meta: true, shift: true, handler: handleCopy },
  ])

  const loadSample = () => {
    const sample = {
      name: "JSON Tools",
      version: "1.0.0",
      features: ["formatter", "converter", "validator"],
      settings: {
        theme: "dark",
        autoSave: true
      },
      tags: ["json", "yaml", "converter"]
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON to YAML</h1>
        <p className="text-muted-foreground">Convert JSON to YAML format</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Enter</kbd> Convert
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={convert}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <FileJsonIcon className="h-4 w-4" />
          Convert to YAML
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
          <span className="text-sm text-muted-foreground">Indent:</span>
          <select
            value={options.indent}
            onChange={(e) => setOptions(prev => ({ ...prev, indent: Number(e.target.value) }))}
            className="px-2 py-1 bg-secondary rounded-md text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
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
            placeholder="Paste your JSON here or drag & drop a file..."
            className="w-full h-[500px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">YAML Output</label>
            {output && (
              <span className="text-xs text-muted-foreground">
                ({output.length} chars)
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="YAML output will appear here..."
            className="w-full h-[500px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About JSON to YAML Conversion</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">What is YAML?</h3>
            <p>YAML (YAML Ain't Markup Language) is a human-readable data serialization format commonly used for configuration files and data exchange.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Why convert JSON to YAML?</h3>
            <p>YAML is more readable than JSON for configuration files, supports comments, and is widely used in DevOps tools like Docker, Kubernetes, and CI/CD pipelines.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
