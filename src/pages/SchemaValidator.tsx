import { useState, useCallback, useMemo } from 'react'
import { CheckIcon, CopyIcon, Trash2Icon, UploadIcon, XCircleIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../components/Toast'
import Ajv, { type AnySchema } from 'ajv'
import addFormats from 'ajv-formats'

interface ValidationError {
  path: string
  message: string
  keyword: string
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export function SchemaValidator() {
  useSEO({
    title: 'JSON Schema Validator Online - Validate JSON Against Schema | JSON Tools',
    description: 'Validate JSON data against JSON Schema (Draft 2020-12, 2019-09, 07, 06, 04). Detailed error messages with paths. Free online tool.',
    canonical: '/schema-validator',
  })

  const { showToast } = useToast()
  const [jsonInput, setJsonInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeDropZone, setActiveDropZone] = useState<'json' | 'schema' | null>(null)

  const validate = useCallback(() => {
    if (!jsonInput.trim()) {
      setResult({ valid: false, errors: [{ path: '', message: 'Please enter JSON data to validate', keyword: 'required' }] })
      return
    }
    if (!schemaInput.trim()) {
      setResult({ valid: false, errors: [{ path: '', message: 'Please enter a JSON Schema', keyword: 'required' }] })
      return
    }

    let data: unknown
    let schema: unknown

    try {
      data = JSON.parse(jsonInput)
    } catch (e) {
      setResult({ valid: false, errors: [{ path: '', message: `Invalid JSON data: ${e instanceof Error ? e.message : 'Parse error'}`, keyword: 'parse' }] })
      return
    }

    try {
      schema = JSON.parse(schemaInput)
    } catch (e) {
      setResult({ valid: false, errors: [{ path: '', message: `Invalid JSON Schema: ${e instanceof Error ? e.message : 'Parse error'}`, keyword: 'parse' }] })
      return
    }

    try {
      const ajv = new Ajv({ allErrors: true, strict: false })
      addFormats(ajv)
      
      const validateFn = ajv.compile(schema as AnySchema)
      const valid = validateFn(data)

      if (valid) {
        setResult({ valid: true, errors: [] })
      } else {
        const errors: ValidationError[] = (validateFn.errors || []).map(err => ({
          path: err.instancePath || '/',
          message: err.message || 'Validation failed',
          keyword: err.keyword
        }))
        setResult({ valid: false, errors })
      }
    } catch (e) {
      setResult({ valid: false, errors: [{ path: '', message: `Schema error: ${e instanceof Error ? e.message : 'Invalid schema'}`, keyword: 'schema' }] })
    }
  }, [jsonInput, schemaInput])

  const copyErrors = useCallback(async () => {
    if (!result || result.valid) return
    const text = result.errors.map(e => `${e.path}: ${e.message}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    showToast('Errors copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [result, showToast])

  const clearAll = useCallback(() => {
    setJsonInput('')
    setSchemaInput('')
    setResult(null)
  }, [])

  const loadSample = useCallback(() => {
    setJsonInput(JSON.stringify({
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      isActive: true,
      tags: ["developer", "designer"]
    }, null, 2))

    setSchemaInput(JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "age": { "type": "integer", "minimum": 0 },
        "email": { "type": "string", "format": "email" },
        "isActive": { "type": "boolean" },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["name", "email"]
    }, null, 2))
  }, [])

  const loadInvalidSample = useCallback(() => {
    setJsonInput(JSON.stringify({
      name: "",
      age: -5,
      email: "not-an-email",
      isActive: "yes",
      tags: [1, 2, 3]
    }, null, 2))

    setSchemaInput(JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "age": { "type": "integer", "minimum": 0 },
        "email": { "type": "string", "format": "email" },
        "isActive": { "type": "boolean" },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["name", "email"]
    }, null, 2))
  }, [])

  const { isDragging: isJsonDragging, dragProps: jsonDragProps } = useFileDrop({
    onFileDrop: setJsonInput,
  })

  const { isDragging: isSchemaDragging, dragProps: schemaDragProps } = useFileDrop({
    onFileDrop: setSchemaInput,
  })

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: validate },
  ], [validate])

  useKeyboardShortcut(shortcuts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON Schema Validator</h1>
        <p className="text-muted-foreground mt-2">
          Validate JSON data against a JSON Schema
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Enter</kbd> Validate
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={validate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Validate
        </button>
        <button
          onClick={copyErrors}
          disabled={!result || result.valid}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CopyIcon className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Errors'}
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
          Valid Sample
        </button>
        <button
          onClick={loadInvalidSample}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Invalid Sample
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.valid ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
          {result.valid ? (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <CheckIcon className="h-5 w-5" />
              Valid - JSON matches the schema
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <XCircleIcon className="h-5 w-5" />
                Invalid - {result.errors.length} error{result.errors.length > 1 ? 's' : ''} found
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <div key={index} className="text-sm p-2 bg-background/50 rounded">
                    <span className="font-mono text-muted-foreground">{error.path || '/'}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="text-destructive">{error.message}</span>
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-secondary rounded">{error.keyword}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">JSON Data</label>
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
                  <span className="font-medium">Drop JSON file here</span>
                </div>
              </div>
            )}
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON data here or drag & drop a file..."
              className="w-full h-[400px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">JSON Schema</label>
          <div
            {...schemaDragProps}
            onDragEnter={() => setActiveDropZone('schema')}
            onDragLeave={() => setActiveDropZone(null)}
            onDrop={(e) => { schemaDragProps.onDrop(e); setActiveDropZone(null); }}
            className={`relative ${isSchemaDragging || activeDropZone === 'schema' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            {(isSchemaDragging || activeDropZone === 'schema') && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-primary">
                  <UploadIcon className="h-6 w-6" />
                  <span className="font-medium">Drop schema file here</span>
                </div>
              </div>
            )}
            <textarea
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder="Paste your JSON Schema here or drag & drop a file..."
              className="w-full h-[400px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About JSON Schema Validation</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Supported Drafts</h3>
            <p>Draft 2020-12, 2019-09, Draft-07, Draft-06, Draft-04</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Format Validation</h3>
            <p>email, uri, date, time, date-time, uuid, ipv4, ipv6, hostname, regex</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Use Cases</h3>
            <p>API validation, config files, data contracts, form validation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
