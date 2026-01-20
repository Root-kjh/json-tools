import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckIcon } from './Icons'

interface ToastContextType {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastState {
  message: string
  visible: boolean
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false })

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
  }, [])

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [toast.visible])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toast.visible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/90 text-white rounded-lg shadow-lg backdrop-blur-sm">
          <CheckIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    </ToastContext.Provider>
  )
}
