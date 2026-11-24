import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Acceso al panel /admin con una sola contraseña (variable ADMIN_PASSWORD).
 * La cookie guarda una firma derivada de la contraseña: si se cambia la contraseña,
 * todas las sesiones abiertas se cierran solas.
 */

const COOKIE = 'mbtek_admin'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 días

function password(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined
}

function sessionToken(pw: string): string {
  return createHmac('sha256', pw).update('mbtek-admin-session-v1').digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function isAdminConfigured(): boolean {
  return !!password()
}

export async function isAdmin(): Promise<boolean> {
  const pw = password()
  if (!pw) return false
  const value = (await cookies()).get(COOKIE)?.value
  return !!value && safeEqual(value, sessionToken(pw))
}

/** Lanza un error si no hay sesión: usar al principio de cada acción del panel. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('No autorizado')
}

export async function logIn(attempt: string): Promise<boolean> {
  const pw = password()
  if (!pw || !safeEqual(attempt, pw)) return false
  ;(await cookies()).set(COOKIE, sessionToken(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: MAX_AGE,
  })
  return true
}

export async function logOut(): Promise<void> {
  ;(await cookies()).delete({ name: COOKIE, path: '/admin' })
}
