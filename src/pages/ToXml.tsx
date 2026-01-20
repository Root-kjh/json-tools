import { useState, useCallback, useEffect } from 'react'
import { CopyIcon, Trash2Icon, ShareIcon, LinkIcon, DownloadIcon } from '../components/Icons'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'
import { useShareUrl } from '../hooks/useShareUrl'
import { useToast } from '../components/Toast'

function jsonToXml(obj: unknown, rootName: string = 'root', indent: number = 2): string {
  const spaces = (level: number) => ' '.repeat(level * indent)
  
  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
  
  const convert = (data: unknown, tagName: string, level: number): string => {
    const prefix = spaces(level)
    
    if (data === null || data === undefined) {
      return `${prefix}<${tagName}/>`
    }
    
    if (typeof data === 'boolean' || typeof data === 'number') {
      return `${prefix}<${tagName}>${data}</${tagName}>`
    }
    
    if (typeof data === 'string') {
      return `${prefix}<${tagName}>${escapeXml(data)}</${tagName}>`
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return `${prefix}<${tagName}/>`
      }
      return data.map(item => convert(item, 'item', level)).join('\n')
    }
    
    if (typeof data === 'object') {
      const entries = Object.entries(data as Record<string, unknown>)
      if (entries.length === 0) {
        return `${prefix}<${tagName}/>`
      }
      
      const children = entries
        .map(([key, value]) => {
          const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
          if (Array.isArray(value)) {
            return value.map(item => convert(item, safeKey, level + 1)).join('\n')
          }
          return convert(value, safeKey, level + 1)
        })
        .join('\n')
      
      return `${prefix}<${tagName}>\n${children}\n${prefix}</${tagName}>`
    }
    
    return `${prefix}<${tagName}>${String(data)}</${tagName}>`
  }
  
  const xmlContent = convert(obj, rootName, 0)
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`
}

export function ToXml() {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [rootName, setRootName] = useState('root')
  const [indent, setIndent] = useState(2)

  useSEO({
    title: 'JSON to XML Converter Online - Free | JSON Tools',
    description: 'Convert JSON to XML format instantly. Free online converter with customizable root element and indentation. Privacy-first: all processing happens in your browser.',
    canonical: '/to-xml',
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
      const xml = jsonToXml(parsed, rootName, indent)
      setOutput(xml)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, rootName, indent])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [output, showToast])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'data.xml'
    link.click()
    URL.revokeObjectURL(url)
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
      bookstore: {
        book: [
          {
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            year: 1925,
            price: 10.99
          },
          {
            title: "1984",
            author: "George Orwell",
            year: 1949,
            price: 8.99
          }
        ]
      }
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JSON to XML</h1>
        <p className="text-muted-foreground">Convert JSON to XML format</p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Enter</kbd> Convert
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Cmd+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={convert}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Convert to XML
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
          onClick={handleDownload}
          disabled={!output}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <DownloadIcon className="h-4 w-4" />
          Download
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
          <span className="text-sm text-muted-foreground">Root:</span>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value || 'root')}
            className="w-24 px-2 py-1 bg-secondary rounded-md text-sm"
            placeholder="root"
          />
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
            <label className="text-sm font-medium">XML Output</label>
            {output && (
              <span className="text-xs text-muted-foreground">
                ({output.length} chars)
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="XML output will appear here..."
            className="w-full h-[450px] p-4 bg-card border rounded-lg font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About JSON to XML Conversion</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Conversion Rules</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Object keys become XML element names</li>
              <li>Arrays are wrapped with item elements</li>
              <li>Special characters are escaped</li>
              <li>Invalid XML names are sanitized</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Use Cases</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Legacy system integration</li>
              <li>SOAP web services</li>
              <li>Configuration file conversion</li>
              <li>Data interchange formats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
