import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const STORAGE_KEY = 'json-tools-recent'
const MAX_RECENT = 5

export interface RecentTool {
  path: string
  name: string
  timestamp: number
}

const toolNames: Record<string, string> = {
  '/formatter': 'JSON Formatter',
  '/validator': 'JSON Validator',
  '/viewer': 'JSON Viewer',
  '/beautifier': 'JSON Beautifier',
  '/minifier': 'JSON Minifier',
  '/to-typescript': 'JSON to TypeScript',
  '/to-csv': 'JSON to CSV',
  '/to-yaml': 'JSON to YAML',
  '/from-yaml': 'YAML to JSON',
  '/to-schema': 'JSON to Schema',
  '/json-query': 'JSON Query',
  '/diff': 'JSON Diff',
  '/path-finder': 'JSON Path Finder',
  '/ai-assistant': 'AI Assistant',
  '/escape': 'JSON Escape',
  '/to-xml': 'JSON to XML',
  '/sorter': 'JSON Sorter',
  '/base64': 'JSON Base64',
  '/flattener': 'JSON Flattener',
}

export function getRecentTools(): RecentTool[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function useRecentTools() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const name = toolNames[path]
    
    if (!name || path === '/') return

    try {
      const recent = getRecentTools()
      const filtered = recent.filter(t => t.path !== path)
      const updated: RecentTool[] = [
        { path, name, timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore localStorage errors
    }
  }, [location.pathname])
}
