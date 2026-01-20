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

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data, options } = e.data
  const startTime = performance.now()

  try {
    self.postMessage({ type: 'progress', progress: 10 } as WorkerResponse)

    const parsed = JSON.parse(data)
    
    self.postMessage({ type: 'progress', progress: 50 } as WorkerResponse)

    let result: string

    switch (type) {
      case 'parse':
      case 'validate':
        result = JSON.stringify(parsed, null, options?.indentSize ?? 2)
        break
      case 'format':
        result = JSON.stringify(parsed, null, options?.indentSize ?? 2)
        break
      case 'minify':
        result = JSON.stringify(parsed)
        break
      default:
        result = JSON.stringify(parsed, null, 2)
    }

    self.postMessage({ type: 'progress', progress: 90 } as WorkerResponse)

    const endTime = performance.now()

    self.postMessage({
      type: 'result',
      result,
      stats: {
        inputSize: data.length,
        outputSize: result.length,
        parseTime: Math.round(endTime - startTime)
      }
    } as WorkerResponse)

  } catch (err) {
    self.postMessage({
      type: 'error',
      error: err instanceof Error ? err.message : 'Unknown error'
    } as WorkerResponse)
  }
}

export {}
