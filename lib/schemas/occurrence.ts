import { OCCURRENCE_CATEGORIES, OCCURRENCE_STATUSES } from "@/lib/constants";
import { z } from "zod";

const postalCodeRegex = /^\d{5}-?\d{3}$/;

export const createOccurrenceSchema = z.object({
  title: z.string().min(5, "Título muito curto.").max(120, "Título muito longo."),
  description: z
    .string()
    .min(15, "Descreva o problema com mais detalhes.")
    .max(2000, "Descrição muito longa."),
  category: z.enum(OCCURRENCE_CATEGORIES),
  postalCode: z
    .string()
    .regex(postalCodeRegex, "CEP inválido. Use o formato 00000-000."),
  addressNumber: z
    .string()
    .trim()
    .min(1, "Informe o número.")
    .max(20, "Número muito longo."),
  street: z.string().trim().min(3, "Informe a rua.").max(120, "Rua muito longa."),
  neighborhood: z.string().trim().min(2, "Informe o bairro.").max(100, "Bairro muito longo."),
  city: z.string().trim().min(2, "Informe a cidade.").max(100, "Cidade muito longa."),
  state: z
    .string()
    .trim()
    .length(2, "UF deve ter 2 caracteres.")
    .regex(/^[A-Za-z]{2}$/, "UF inválida."),
  reference: z.string().trim().max(160, "Referência muito longa.").optional().or(z.literal("")),
});

export const manageOccurrenceSchema = z.object({
  status: z.enum(OCCURRENCE_STATUSES),
  assignedTo: z.string().uuid().nullable(),
  institutionId: z.string().uuid().nullable(),
  teamId: z.string().uuid().nullable(),
  operationalAgentId: z.string().uuid().nullable(),
  comment: z.string().max(1200, "Comentário muito longo.").optional(),
  isInternal: z.boolean(),
});

export const ratingSchema = z.object({
  rating: z
    .number()
    .int("A nota deve ser inteira.")
    .min(1, "A nota mínima é 1.")
    .max(5, "A nota máxima é 5."),
  feedback: z.string().max(1000, "Feedback muito longo.").optional(),
});

export type CreateOccurrenceFormValues = z.infer<typeof createOccurrenceSchema>;
export type ManageOccurrenceFormValues = z.infer<typeof manageOccurrenceSchema>;
export type RatingFormValues = z.infer<typeof ratingSchema>;
