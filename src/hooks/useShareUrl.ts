import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

interface UseShareUrlOptions {
  paramName?: string
  maxLength?: number
}

interface UseShareUrlReturn {
  sharedData: string | null
  shareUrl: (data: string) => Promise<{ success: boolean; url?: string; error?: string }>
  isShared: boolean
  clearShare: () => void
}

function compressToBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str)
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
    return btoa(binString)
  } catch {
    return ''
  }
}

function decompressFromBase64(base64: string): string {
  try {
    const binString = atob(base64)
    const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0)!)
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

export function useShareUrl(options: UseShareUrlOptions = {}): UseShareUrlReturn {
  const { paramName = 'd', maxLength = 2000 } = options
  const [searchParams, setSearchParams] = useSearchParams()
  const [sharedData, setSharedData] = useState<string | null>(null)
  const [isShared, setIsShared] = useState(false)

  useEffect(() => {
    const encoded = searchParams.get(paramName)
    if (encoded) {
      const decoded = decompressFromBase64(encoded)
      if (decoded) {
        setSharedData(decoded)
        setIsShared(true)
      }
    }
  }, [searchParams, paramName])

  const shareUrl = useCallback(async (data: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    const encoded = compressToBase64(data)
    
    if (encoded.length > maxLength) {
      return { 
        success: false, 
        error: `Data too large to share via URL (${encoded.length} chars, max ${maxLength})` 
      }
    }

    const url = new URL(window.location.href)
    url.searchParams.set(paramName, encoded)
    const shareableUrl = url.toString()

    try {
      await navigator.clipboard.writeText(shareableUrl)
      return { success: true, url: shareableUrl }
    } catch {
      return { success: false, error: 'Failed to copy to clipboard' }
    }
  }, [paramName, maxLength])

  const clearShare = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete(paramName)
      return prev
    })
    setSharedData(null)
    setIsShared(false)
  }, [setSearchParams, paramName])

  return { sharedData, shareUrl, isShared, clearShare }
}
