"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS, OCCURRENCE_CATEGORIES } from "@/lib/constants";
import {
  createOccurrenceSchema,
  type CreateOccurrenceFormValues,
} from "@/lib/schemas/occurrence";
import {
  formatPostalCode,
  lookupAddressByPostalCode,
} from "@/services/geolocation-service";
import { createOccurrence } from "@/services/occurrence-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function NewOccurrenceForm() {
  const router = useRouter();
  const [loadingPostalCode, setLoadingPostalCode] = useState(false);

  const form = useForm<CreateOccurrenceFormValues>({
    resolver: zodResolver(createOccurrenceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "buraco",
      postalCode: "",
      addressNumber: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      reference: "",
    },
  });

  const handleLookupPostalCode = async () => {
    const postalCode = form.getValues("postalCode");
    if (!postalCode) {
      return;
    }

    try {
      setLoadingPostalCode(true);
      const address = await lookupAddressByPostalCode(postalCode);
      if (!address) {
        toast.error("Não foi possível localizar o CEP informado.");
        return;
      }

      form.setValue("street", address.street, { shouldValidate: true });
      form.setValue("neighborhood", address.neighborhood, { shouldValidate: true });
      form.setValue("city", address.city, { shouldValidate: true });
      form.setValue("state", address.state.toUpperCase(), { shouldValidate: true });
      toast.success("Endereço preenchido automaticamente.");
    } catch {
      toast.error("Falha ao consultar o CEP.");
    } finally {
      setLoadingPostalCode(false);
    }
  };

  const onSubmit = async (values: CreateOccurrenceFormValues) => {
    try {
      const occurrence = await createOccurrence(values, null);
      toast.success("Ocorrência registrada com sucesso.");
      router.push(`/occurrence/${occurrence.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao registrar ocorrência.";
      toast.error(message);
    }
  };

  return (
    <Card className="shadow-lg shadow-black/5 dark:shadow-black/30">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-foreground">
          Registrar nova ocorrência
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Formulário público do denunciante com categoria e endereço.
        </p>
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          Não é necessário login para enviar denúncia.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Título da ocorrência</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Buraco grande na Avenida Central" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva local exato, riscos e impacto para a população."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OCCURRENCE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {CATEGORY_LABELS[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: 150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Endereço da ocorrência</p>
              <p className="text-xs text-muted-foreground">
                Informe o CEP e número. O restante do endereço será preenchido automaticamente.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="00000-000"
                          value={field.value}
                          onChange={(event) => field.onChange(formatPostalCode(event.target.value))}
                          onBlur={() => {
                            field.onBlur();
                            void handleLookupPostalCode();
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleLookupPostalCode()}
                          disabled={loadingPostalCode}
                        >
                          {loadingPostalCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua/Avenida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UF"
                        maxLength={2}
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento/Referência (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Perto de..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Enviando..." : "Enviar ocorrência"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
