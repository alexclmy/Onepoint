"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast, ToastContainer } from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContainer>
  )
}
