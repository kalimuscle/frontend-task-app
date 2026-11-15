import { z } from 'zod'
import type { TaskStatus } from '../api/tasks'

export const taskStatusValues = [
  'pending',
  'in_progress',
  'done',
] as const satisfies readonly TaskStatus[]

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Escribe un título.')
    .max(200, 'El título no puede superar 200 caracteres.'),
  status: z.enum(taskStatusValues),
  assigneeId: z
    .string()
    .trim()
    .min(1, 'Elige un responsable.')
    .max(64, 'El identificador no puede superar 64 caracteres.'),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
