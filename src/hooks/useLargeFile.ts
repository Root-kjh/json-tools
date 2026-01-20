import { useState, useCallback, useRef, useEffect } from 'react'

const LARGE_FILE_THRESHOLD = 1024 * 1024

type ProcessingState = 'idle' | 'reading' | 'processing' | 'done' | 'error'

type WorkerMessage = {
  type: 'parse' | 'format' | 'minify' | 'validate'
  data: string
  options?: {
    indentSize?: number
  }
}

type WorkerResponse = {
  type: 'progress' | 'result' | 'error'
  progress?: number
  result?: string
  error?: string
  stats?: {
    inputSize: number
    outputSize: number
    parseTime: number
  }
}

export function useLargeFile() {
  const [state, setState] = useState<ProcessingState>('idle')
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<WorkerResponse['stats'] | null>(null)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/jsonWorker.ts', import.meta.url),
        { type: 'module' }
      )
    }
    return workerRef.current
  }, [])

  const processLargeJson = useCallback((
    data: string,
    type: WorkerMessage['type'],
    options?: WorkerMessage['options']
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const worker = getWorker()

      setState('processing')
      setProgress(0)
      setStats(null)

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const response = e.data

        if (response.type === 'progress') {
          setProgress(response.progress ?? 0)
        } else if (response.type === 'result') {
          setState('done')
          setProgress(100)
          setStats(response.stats ?? null)
          resolve(response.result ?? '')
        } else if (response.type === 'error') {
          setState('error')
          reject(new Error(response.error))
        }
      }

      worker.onerror = (err) => {
        setState('error')
        reject(new Error(err.message))
      }

      worker.postMessage({ type, data, options } as WorkerMessage)
    })
  }, [getWorker])

  const readLargeFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setState('reading')
      setProgress(0)

      const reader = new FileReader()

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setProgress(percent)
        }
      }

      reader.onload = (e) => {
        const content = e.target?.result as string
        setState('idle')
        setProgress(100)
        resolve(content)
      }

      reader.onerror = () => {
        setState('error')
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }, [])

  const isLargeFile = useCallback((file: File | string) => {
    if (typeof file === 'string') {
      return file.length > LARGE_FILE_THRESHOLD
    }
    return file.size > LARGE_FILE_THRESHOLD
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setProgress(0)
    setStats(null)
  }, [])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  return {
    state,
    progress,
    stats,
    isLargeFile,
    readLargeFile,
    processLargeJson,
    reset,
    formatFileSize,
    isProcessing: state === 'reading' || state === 'processing',
    LARGE_FILE_THRESHOLD
  }
}
