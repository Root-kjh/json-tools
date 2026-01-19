import { useState, useCallback } from 'react'
import type { DragEvent } from 'react'

interface UseFileDropOptions {
  onFileDrop: (content: string) => void
  accept?: string[]
}

export function useFileDrop({ onFileDrop, accept = ['.json', '.txt'] }: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (!file) return

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (accept.length > 0 && !accept.includes(extension)) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        onFileDrop(content)
      }
    }
    reader.readAsText(file)
  }, [onFileDrop, accept])

  return {
    isDragging,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
