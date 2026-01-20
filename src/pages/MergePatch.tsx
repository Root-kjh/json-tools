import { useState, useCallback, useMemo } from 'react'
import { CheckIcon, CopyIcon, Trash2Icon, UploadIcon, GitMergeIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../components/Toast'

function applyMergePatch(target: unknown, patch: unknown): unknown {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
    return patch
  }

  if (target === null || typeof target !== 'object' || Array.isArray(target)) {
    target = {}
  }

  const result = { ...(target as Record<string, unknown>) }
  const patchObj = patch as Record<string, unknown>

  for (const key in patchObj) {
    if (Object.prototype.hasOwnProperty.call(patchObj, key)) {
      if (patchObj[key] === null) {
        delete result[key]
      } else {
        result[key] = applyMergePatch(result[key], patchObj[key])
      }
    }
  }

  return result
}

export function MergePatch() {
  useSEO({
    title: 'JSON Merge Patch Tool Online - Apply RFC 7396 Patches | JSON Tools',
    description: 'Apply JSON Merge Patch (RFC 7396) to JSON documents. Simple partial updates with null for deletions. Free online tool.',
    canonical: '/merge-patch',
  })

  const { showToast } = useToast()
  const [jsonInput, setJsonInput] = useState('')
  const [patchInput, setPatchInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeDropZone, setActiveDropZone] = useState<'json' | 'patch' | null>(null)

  const applyPatch = useCallback(() => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON document')
      setOutput('')
      return
    }
    if (!patchInput.trim()) {
      setError('Please enter merge patch')
      setOutput('')
      return
    }

    let doc: unknown
    let patch: unknown

    try {
      doc = JSON.parse(jsonInput)
    } catch (e) {
      setError(`Invalid JSON document: ${e instanceof Error ? e.message : 'Parse error'}`)
      setOutput('')
      return
    }

    try {
      patch = JSON.parse(patchInput)
    } catch (e) {
      setError(`Invalid merge patch: ${e instanceof Error ? e.message : 'Parse error'}`)
      setOutput('')
      return
    }

    try {
      const result = applyMergePatch(doc, patch)
      setOutput(JSON.stringify(result, null, 2))
      setError(null)
    } catch (e) {
      setError(`Merge failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
      setOutput('')
    }
  }, [jsonInput, patchInput])

  const copyToClipboard = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [output, showToast])

  const clearAll = useCallback(() => {
    setJsonInput('')
    setPatchInput('')
    setOutput('')
    setError(null)
  }, [])

  const loadSample = useCallback(() => {
    setJsonInput(JSON.stringify({
      title: "Hello!",
      author: {
        name: "John",
        email: "john@example.com"
      },
      tags: ["example", "sample"],
      content: "This is the content"
    }, null, 2))

    setPatchInput(JSON.stringify({
      title: "Hello World!",
      author: {
        email: "john.doe@example.com",
        phone: "+1-234-567-8900"
      },
      content: null,
      published: true
    }, null, 2))
  }, [])

  const { isDragging: isJsonDragging, dragProps: jsonDragProps } = useFileDrop({
    onFileDrop: setJsonInput,
  })

  const { isDragging: isPatchDragging, dragProps: patchDragProps } = useFileDrop({
    onFileDrop: setPatchInput,
  })

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: applyPatch },
    { key: 'c', ctrl: true, shift: true, handler: copyToClipboard },
  ], [applyPatch, copyToClipboard])

  useKeyboardShortcut(shortcuts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON Merge Patch</h1>
        <p className="text-muted-foreground mt-2">
          Apply RFC 7396 merge patches to JSON documents
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Enter</kbd> Apply
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={applyPatch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <GitMergeIcon className="h-4 w-4" />
          Merge
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
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      {output && !error && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 font-medium">
            <CheckIcon className="h-5 w-5" />
            Merge patch applied successfully
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Original JSON</label>
          <div
            {...jsonDragProps}
            onDragEnter={() => setActiveDropZone('json')}
            onDragLeave={() => setActiveDropZone(null)}
            onDrop={(e) => { jsonDragProps.onDrop(e); setActiveDropZone(null); }}
            className={`relative ${isJsonDragging || activeDropZone === 'json' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            {(isJsonDragging || activeDropZone === 'json') && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-primary">
                  <UploadIcon className="h-6 w-6" />
                  <span className="font-medium">Drop JSON file</span>
                </div>
              </div>
            )}
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON document here..."
              className="w-full h-[350px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Merge Patch</label>
          <div
            {...patchDragProps}
            onDragEnter={() => setActiveDropZone('patch')}
            onDragLeave={() => setActiveDropZone(null)}
            onDrop={(e) => { patchDragProps.onDrop(e); setActiveDropZone(null); }}
            className={`relative ${isPatchDragging || activeDropZone === 'patch' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            {(isPatchDragging || activeDropZone === 'patch') && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-primary">
                  <UploadIcon className="h-6 w-6" />
                  <span className="font-medium">Drop patch file</span>
                </div>
              </div>
            )}
            <textarea
              value={patchInput}
              onChange={(e) => setPatchInput(e.target.value)}
              placeholder='{"key": "new value", "remove": null}'
              className="w-full h-[350px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Result {output && <span className="text-muted-foreground">({output.length} chars)</span>}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Merged JSON will appear here..."
            className="w-full h-[350px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">JSON Merge Patch vs JSON Patch</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <h3 className="font-medium text-foreground mb-2">Merge Patch (RFC 7396)</h3>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Simple partial updates</li>
              <li>Use <code className="bg-secondary px-1 rounded">null</code> to delete keys</li>
              <li>Cannot append to arrays (replaces them)</li>
              <li>Intuitive for simple use cases</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">JSON Patch (RFC 6902)</h3>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Array of explicit operations</li>
              <li>Can add, remove, replace, move, copy</li>
              <li>Can modify arrays at specific indices</li>
              <li>More powerful but more verbose</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
