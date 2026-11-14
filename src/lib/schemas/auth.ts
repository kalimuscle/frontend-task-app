import { z } from 'zod'

export const userRoleSchema = z.enum(['ADMIN', 'USER'])

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Escribe un nombre de al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar 100 caracteres.'),
  email: z.email('Escribe un correo electrónico válido.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(128, 'La contraseña no puede superar 128 caracteres.'),
  role: userRoleSchema,
})

export const signInSchema = z.object({
  email: z.email('Escribe un correo electrónico válido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UserRoleInput = z.infer<typeof userRoleSchema>
