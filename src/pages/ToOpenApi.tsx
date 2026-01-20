import { useState, useCallback, useMemo } from 'react'
import { CheckIcon, CopyIcon, Trash2Icon, UploadIcon, FileCodeIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../components/Toast'

function inferType(value: unknown): { type: string; format?: string; items?: object; properties?: object; required?: string[] } {
  if (value === null) {
    return { type: 'string' }
  }
  if (Array.isArray(value)) {
    if (value.length > 0) {
      return { type: 'array', items: inferType(value[0]) }
    }
    return { type: 'array', items: { type: 'string' } }
  }
  if (typeof value === 'object') {
    const properties: Record<string, object> = {}
    const required: string[] = []
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      properties[key] = inferType(val)
      if (val !== null && val !== undefined) {
        required.push(key)
      }
    }
    return { type: 'object', properties, required }
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { type: 'integer' }
    }
    return { type: 'number' }
  }
  if (typeof value === 'boolean') {
    return { type: 'boolean' }
  }
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return { type: 'string', format: 'date-time' }
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { type: 'string', format: 'date' }
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { type: 'string', format: 'email' }
    }
    if (/^https?:\/\//.test(value)) {
      return { type: 'string', format: 'uri' }
    }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return { type: 'string', format: 'uuid' }
    }
    return { type: 'string' }
  }
  return { type: 'string' }
}

function generateOpenApiSpec(json: unknown, options: { title: string; version: string; basePath: string }): object {
  const isArray = Array.isArray(json)
  const sampleItem = isArray ? json[0] : json
  const schema = inferType(sampleItem)

  return {
    openapi: '3.0.3',
    info: {
      title: options.title,
      version: options.version,
      description: 'Auto-generated OpenAPI specification from JSON sample'
    },
    servers: [
      { url: options.basePath, description: 'API Server' }
    ],
    paths: {
      '/items': {
        get: {
          summary: 'List items',
          operationId: 'listItems',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: isArray
                    ? { type: 'array', items: schema }
                    : schema
                }
              }
            }
          }
        },
        post: {
          summary: 'Create item',
          operationId: 'createItem',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schema
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: schema
                }
              }
            }
          }
        }
      },
      '/items/{id}': {
        get: {
          summary: 'Get item by ID',
          operationId: 'getItem',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: schema
                }
              }
            },
            '404': {
              description: 'Not found'
            }
          }
        },
        put: {
          summary: 'Update item',
          operationId: 'updateItem',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schema
              }
            }
          },
          responses: {
            '200': {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: schema
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete item',
          operationId: 'deleteItem',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '204': {
              description: 'Deleted'
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Item: schema
      }
    }
  }
}

export function ToOpenApi() {
  useSEO({
    title: 'JSON to OpenAPI Generator Online - Create Swagger Spec | JSON Tools',
    description: 'Generate OpenAPI 3.0 specification from JSON sample data. Auto-detect types and formats. Free online tool for API documentation.',
    canonical: '/to-openapi',
  })

  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [title, setTitle] = useState('My API')
  const [version, setVersion] = useState('1.0.0')
  const [basePath, setBasePath] = useState('https://api.example.com')

  const generate = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JSON sample')
      setOutput('')
      return
    }

    let json: unknown
    try {
      json = JSON.parse(input)
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`)
      setOutput('')
      return
    }

    try {
      const spec = generateOpenApiSpec(json, { title, version, basePath })
      setOutput(JSON.stringify(spec, null, 2))
      setError(null)
    } catch (e) {
      setError(`Generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
      setOutput('')
    }
  }, [input, title, version, basePath])

  const copyToClipboard = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [output, showToast])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  const loadSample = useCallback(() => {
    setInput(JSON.stringify([
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        isActive: true,
        createdAt: "2024-01-15T09:30:00Z",
        website: "https://example.com",
        tags: ["developer", "designer"]
      }
    ], null, 2))
  }, [])

  const { isDragging, dragProps } = useFileDrop({
    onFileDrop: setInput,
  })

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: generate },
    { key: 'c', ctrl: true, shift: true, handler: copyToClipboard },
  ], [generate, copyToClipboard])

  useKeyboardShortcut(shortcuts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON to OpenAPI</h1>
        <p className="text-muted-foreground mt-2">
          Generate OpenAPI 3.0 specification from JSON sample data
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Enter</kbd> Generate
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘+Shift+C</kbd> Copy
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <button
          onClick={generate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <FileCodeIcon className="h-4 w-4" />
          Generate
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

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-2 py-1 bg-secondary text-sm rounded-md border border-border w-32"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Version:</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="px-2 py-1 bg-secondary text-sm rounded-md border border-border w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Server:</label>
          <input
            type="text"
            value={basePath}
            onChange={(e) => setBasePath(e.target.value)}
            className="px-2 py-1 bg-secondary text-sm rounded-md border border-border w-48"
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
          <label className="text-sm font-medium">JSON Sample</label>
          <div
            {...dragProps}
            className={`relative ${isDragging ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-primary">
                  <UploadIcon className="h-6 w-6" />
                  <span className="font-medium">Drop JSON file</span>
                </div>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON sample here (object or array)..."
              className="w-full h-[450px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            OpenAPI Specification {output && <span className="text-muted-foreground">(3.0.3)</span>}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="OpenAPI spec will appear here..."
            className="w-full h-[450px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">About OpenAPI Generation</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Auto-Detection</h3>
            <p>Automatically detects types and formats: email, uri, date, date-time, uuid</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">CRUD Endpoints</h3>
            <p>Generates standard REST endpoints: GET, POST, PUT, DELETE</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Swagger Compatible</h3>
            <p>Output is compatible with Swagger UI and other OpenAPI tools</p>
          </div>
        </div>
      </div>
    </div>
  )
}
