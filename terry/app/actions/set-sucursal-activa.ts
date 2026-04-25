"use server";

import { cookies } from "next/headers";

export async function setSucursalActiva(sucursalId: string) {
  const cookieStore = await cookies();

  cookieStore.set("sucursal_activa", sucursalId, {
    path: "/",
  });
}