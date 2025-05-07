import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TaskStatus } from "@/services/taskService"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.PENDING: return 'Pending'
    case TaskStatus.IN_PROGRESS: return 'In Progress'
    case TaskStatus.COMPLETED: return 'Completed'
    case TaskStatus.CANCELLED: return 'Cancelled'
    default: return 'Unknown'
  }
}
