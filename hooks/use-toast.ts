import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToasterToast = Toast & {
  onClose: () => void
}

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

let toastIdCounter = 0

const listeners: Array<(toasts: ToasterToast[]) => void> = []
let memoryToasts: ToasterToast[] = []

function dispatch(toasts: ToasterToast[]) {
  memoryToasts = toasts
  listeners.forEach((listener) => {
    listener(toasts)
  })
}

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = `toast-${toastIdCounter++}`

  const dismiss = () => {
    dispatch(memoryToasts.filter((t) => t.id !== id))
  }

  const newToast: ToasterToast = {
    id,
    title,
    description,
    variant,
    onClose: dismiss,
  }

  dispatch([...memoryToasts, newToast].slice(-TOAST_LIMIT))

  setTimeout(() => {
    dismiss()
  }, TOAST_REMOVE_DELAY)

  return {
    id,
    dismiss,
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>(memoryToasts)

  useCallback(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])()

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        dispatch(memoryToasts.filter((t) => t.id !== toastId))
      } else {
        dispatch([])
      }
    },
  }
}
