import { logout } from "@/modules/auth/actions";

type AppHeaderProps = {
  userEmail?: string;
  sucursalNombre?: string;
};

export default function AppHeader({ userEmail, sucursalNombre }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded bg-zinc-950 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-950">Finanzas</span>
        {sucursalNombre && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="text-sm text-zinc-500">{sucursalNombre}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-xs text-zinc-400 hidden sm:block">{userEmail}</span>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors px-3 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-400"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
