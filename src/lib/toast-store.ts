export type ToastTone = 'success' | 'error'

export interface ToastMessage {
  id: number
  title: string
  message: string
  tone: ToastTone
}

type ToastInput = Omit<ToastMessage, 'id'>

let messages: ToastMessage[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function notifyToast(input: ToastInput) {
  const toast: ToastMessage = { id: nextId, ...input }
  nextId += 1
  messages = [...messages, toast]
  emitChange()

  window.setTimeout(() => dismissToast(toast.id), 5000)

  return toast.id
}

export function dismissToast(id: number) {
  messages = messages.filter((message) => message.id !== id)
  emitChange()
}

export function clearToasts() {
  messages = []
  emitChange()
}

export function getToasts() {
  return messages
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
