import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(6, "A senha precisa ter ao menos 6 caracteres.")
    .max(72, "A senha é muito longa."),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  email: z.string().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(6, "A senha precisa ter ao menos 6 caracteres.")
    .max(72, "A senha é muito longa."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
