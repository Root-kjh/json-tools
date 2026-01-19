export interface JsonSchema {
  $schema?: string
  type?: string | string[]
  properties?: Record<string, JsonSchema>
  items?: JsonSchema | JsonSchema[]
  required?: string[]
  enum?: unknown[]
  const?: unknown
  format?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  additionalProperties?: boolean | JsonSchema
}

export interface SchemaOptions {
  includeExamples?: boolean
  requiredByDefault?: boolean
  detectFormats?: boolean
}

function detectFormat(value: string): string | undefined {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'date-time'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date'
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return 'time'
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email'
  if (/^https?:\/\//.test(value)) return 'uri'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return 'uuid'
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return 'ipv4'
  return undefined
}

function getType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function mergeSchemas(schemas: JsonSchema[]): JsonSchema {
  if (schemas.length === 0) return {}
  if (schemas.length === 1) return schemas[0]

  const types = new Set<string>()
  let mergedProperties: Record<string, JsonSchema[]> = {}
  let mergedItems: JsonSchema[] = []

  for (const schema of schemas) {
    if (schema.type) {
      if (Array.isArray(schema.type)) {
        schema.type.forEach(t => types.add(t))
      } else {
        types.add(schema.type)
      }
    }

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (!mergedProperties[key]) mergedProperties[key] = []
        mergedProperties[key].push(prop)
      }
    }

    if (schema.items && !Array.isArray(schema.items)) {
      mergedItems.push(schema.items)
    }
  }

  const result: JsonSchema = {}

  if (types.size === 1) {
    result.type = [...types][0]
  } else if (types.size > 1) {
    result.type = [...types]
  }

  if (Object.keys(mergedProperties).length > 0) {
    result.properties = {}
    for (const [key, propSchemas] of Object.entries(mergedProperties)) {
      result.properties[key] = mergeSchemas(propSchemas)
    }
  }

  if (mergedItems.length > 0) {
    result.items = mergeSchemas(mergedItems)
  }

  return result
}

function generateSchemaForValue(value: unknown, options: SchemaOptions): JsonSchema {
  const type = getType(value)

  switch (type) {
    case 'null':
      return { type: 'null' }

    case 'boolean':
      return { type: 'boolean' }

    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' }

    case 'string': {
      const schema: JsonSchema = { type: 'string' }
      if (options.detectFormats) {
        const format = detectFormat(value as string)
        if (format) schema.format = format
      }
      return schema
    }

    case 'array': {
      const arr = value as unknown[]
      if (arr.length === 0) {
        return { type: 'array', items: {} }
      }

      const itemSchemas = arr.map(item => generateSchemaForValue(item, options))
      return {
        type: 'array',
        items: mergeSchemas(itemSchemas)
      }
    }

    case 'object': {
      const obj = value as Record<string, unknown>
      const properties: Record<string, JsonSchema> = {}
      const keys = Object.keys(obj)

      for (const key of keys) {
        properties[key] = generateSchemaForValue(obj[key], options)
      }

      const schema: JsonSchema = {
        type: 'object',
        properties
      }

      if (options.requiredByDefault && keys.length > 0) {
        schema.required = keys
      }

      return schema
    }

    default:
      return {}
  }
}

export function jsonToSchema(json: unknown, options: SchemaOptions = {}): JsonSchema {
  const defaultOptions: SchemaOptions = {
    includeExamples: false,
    requiredByDefault: true,
    detectFormats: true,
    ...options
  }

  const schema = generateSchemaForValue(json, defaultOptions)

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    ...schema
  }
}
