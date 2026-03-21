import { login } from "@/modules/auth/actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <form action={login} className="space-y-4 border p-6 rounded-lg">
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          name="email"
          type="email"
          placeholder="Correo"
          required
          className="border px-3 py-2 w-full"
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          className="border px-3 py-2 w-full"
        />

        <button className="border px-3 py-2 w-full">
          Entrar
        </button>
      </form>
    </main>
  );
}