import { useState, useCallback, useMemo } from 'react'
import { CheckIcon, CopyIcon, Trash2Icon, UploadIcon, PlayIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../components/Toast'
import { applyPatch, validate, type Operation } from 'fast-json-patch'

interface PatchResult {
  success: boolean
  result?: unknown
  error?: string
  testResults?: { path: string; passed: boolean }[]
}

export function JsonPatch() {
  useSEO({
    title: 'JSON Patch Tool Online - Apply RFC 6902 Patches | JSON Tools',
    description: 'Apply JSON Patch operations (RFC 6902) to JSON documents. Support for add, remove, replace, move, copy, and test operations. Free online tool.',
    canonical: '/json-patch',
  })

  const { showToast } = useToast()
  const [jsonInput, setJsonInput] = useState('')
  const [patchInput, setPatchInput] = useState('')
  const [output, setOutput] = useState('')
  const [result, setResult] = useState<PatchResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeDropZone, setActiveDropZone] = useState<'json' | 'patch' | null>(null)

  const applyJsonPatch = useCallback(() => {
    if (!jsonInput.trim()) {
      setResult({ success: false, error: 'Please enter JSON document' })
      setOutput('')
      return
    }
    if (!patchInput.trim()) {
      setResult({ success: false, error: 'Please enter JSON Patch operations' })
      setOutput('')
      return
    }

    let doc: unknown
    let patch: Operation[]

    try {
      doc = JSON.parse(jsonInput)
    } catch (e) {
      setResult({ success: false, error: `Invalid JSON document: ${e instanceof Error ? e.message : 'Parse error'}` })
      setOutput('')
      return
    }

    try {
      patch = JSON.parse(patchInput)
      if (!Array.isArray(patch)) {
        setResult({ success: false, error: 'JSON Patch must be an array of operations' })
        setOutput('')
        return
      }
    } catch (e) {
      setResult({ success: false, error: `Invalid JSON Patch: ${e instanceof Error ? e.message : 'Parse error'}` })
      setOutput('')
      return
    }

    const validationErrors = validate(patch, doc)
    if (validationErrors) {
      setResult({ success: false, error: `Patch validation failed: ${validationErrors.message}` })
      setOutput('')
      return
    }

    try {
      const testResults: { path: string; passed: boolean }[] = []
      
      patch.forEach((op) => {
        if (op.op === 'test') {
          testResults.push({ path: op.path, passed: true })
        }
      })

      const patchResult = applyPatch(doc, patch, true, false)
      const newDoc = patchResult.newDocument

      setOutput(JSON.stringify(newDoc, null, 2))
      setResult({ 
        success: true, 
        result: newDoc,
        testResults: testResults.length > 0 ? testResults : undefined
      })
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Patch application failed'
      if (errorMsg.includes('test')) {
        setResult({ success: false, error: `Test operation failed: ${errorMsg}` })
      } else {
        setResult({ success: false, error: errorMsg })
      }
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
    setResult(null)
  }, [])

  const loadSample = useCallback(() => {
    setJsonInput(JSON.stringify({
      firstName: "John",
      lastName: "Doe",
      age: 30,
      email: "john@example.com",
      address: {
        street: "123 Main St",
        city: "Seoul"
      },
      tags: ["developer"]
    }, null, 2))

    setPatchInput(JSON.stringify([
      { op: "replace", path: "/age", value: 31 },
      { op: "add", path: "/phone", value: "+82-10-1234-5678" },
      { op: "add", path: "/tags/-", value: "designer" },
      { op: "remove", path: "/email" },
      { op: "copy", from: "/firstName", path: "/nickname" },
      { op: "move", from: "/address/street", path: "/street" }
    ], null, 2))
  }, [])

  const loadTestSample = useCallback(() => {
    setJsonInput(JSON.stringify({
      name: "Test User",
      role: "admin",
      permissions: ["read", "write"]
    }, null, 2))

    setPatchInput(JSON.stringify([
      { op: "test", path: "/role", value: "admin" },
      { op: "replace", path: "/role", value: "superadmin" },
      { op: "add", path: "/permissions/-", value: "delete" }
    ], null, 2))
  }, [])

  const { isDragging: isJsonDragging, dragProps: jsonDragProps } = useFileDrop({
    onFileDrop: setJsonInput,
  })

  const { isDragging: isPatchDragging, dragProps: patchDragProps } = useFileDrop({
    onFileDrop: setPatchInput,
  })

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: applyJsonPatch },
    { key: 'c', ctrl: true, shift: true, handler: copyToClipboard },
  ], [applyJsonPatch, copyToClipboard])

  useKeyboardShortcut(shortcuts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON Patch</h1>
        <p className="text-muted-foreground mt-2">
          Apply RFC 6902 JSON Patch operations to JSON documents
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Enter</kbd> Apply Patch
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={applyJsonPatch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <PlayIcon className="h-4 w-4" />
          Apply Patch
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
        <button
          onClick={loadTestSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Test Operation Sample
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
          {result.success ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <CheckIcon className="h-5 w-5" />
                Patch applied successfully
              </div>
              {result.testResults && result.testResults.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Test operations: {result.testResults.length} passed
                </div>
              )}
            </div>
          ) : (
            <div className="text-destructive">
              <strong>Error:</strong> {result.error}
            </div>
          )}
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
          <label className="text-sm font-medium">JSON Patch Operations</label>
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
              placeholder='[{"op": "add", "path": "/key", "value": "..."}]'
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
            placeholder="Patched JSON will appear here..."
            className="w-full h-[350px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">JSON Patch Operations (RFC 6902)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <h3 className="font-medium text-foreground mb-1">add</h3>
            <p className="text-muted-foreground">Add a value at the specified path</p>
            <code className="text-xs bg-secondary px-1 rounded">{`{"op":"add","path":"/key","value":"..."}`}</code>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">remove</h3>
            <p className="text-muted-foreground">Remove value at the specified path</p>
            <code className="text-xs bg-secondary px-1 rounded">{`{"op":"remove","path":"/key"}`}</code>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">replace</h3>
            <p className="text-muted-foreground">Replace value at the specified path</p>
            <code className="text-xs bg-secondary px-1 rounded">{`{"op":"replace","path":"/key","value":"..."}`}</code>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">move</h3>
            <p className="text-muted-foreground">Move value from one path to another</p>
            <code className="text-xs bg-secondary px-1 rounded">{`{"op":"move","from":"/old","path":"/new"}`}</code>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">copy</h3>
            <p className="text-muted-foreground">Copy value from one path to another</p>
            <code className="text-xs bg-secondary px-1 rounded">{`{"op":"copy","from":"/src","path":"/dest"}`}</code>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">test</h3>
            <p className="text-muted-foreground">Test that value at path equals given value</p>
            <code className="text-xs bg-secondary px-1 rounded">{`{"op":"test","path":"/key","value":"..."}`}</code>
          </div>
        </div>
      </div>
    </div>
  )
}
