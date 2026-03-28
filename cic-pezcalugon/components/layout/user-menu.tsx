import { logout } from "@/modules/auth/actions";

export default function UserMenu() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
      >
        Cerrar sesión
      </button>
    </form>
  );
}