'use client'

import { useActionState } from 'react'
import { Lock } from 'lucide-react'
import { loginAction } from './actions'

export default function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null)

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center gap-3">
        <Lock size={18} className="text-[var(--accent)]" />
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Fotos de productos</h1>
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-zinc-400">Contraseña</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
        />
      </label>
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
