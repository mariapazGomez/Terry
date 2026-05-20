import { z } from "zod";

export const waitlistSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  rubro: z.string().optional(),
  num_sucursales: z.string().optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
