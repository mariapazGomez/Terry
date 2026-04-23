import { login } from "@/modules/auth/actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-950 tracking-tight">Finanzas</h1>
          <p className="mt-1 text-sm text-zinc-400">Inteligencia financiera para tu negocio</p>
        </div>

        <form action={login} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="correo@empresa.cl"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 placeholder-zinc-300 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 placeholder-zinc-300 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors mt-2"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
