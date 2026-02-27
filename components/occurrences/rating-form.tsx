"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ratingSchema, type RatingFormValues } from "@/lib/schemas/occurrence";
import { addOccurrenceRating } from "@/services/occurrence-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function RatingForm({
  occurrenceId,
  userId,
  onSuccess,
}: {
  occurrenceId: string;
  userId?: string | null;
  onSuccess?: () => void;
}) {
  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      rating: 5,
      feedback: "",
    },
  });

  const onSubmit = async (values: RatingFormValues) => {
    try {
      await addOccurrenceRating(occurrenceId, values, userId);
      toast.success("Avaliação enviada com sucesso.");
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao enviar avaliação.";
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Nota do atendimento</FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-5 gap-2"
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value.toString()}
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <FormItem key={score}>
                      <FormControl>
                        <RadioGroupItem
                          value={score.toString()}
                          id={`rating-${score}`}
                          className="sr-only"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor={`rating-${score}`}
                        className="flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm font-medium transition data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                        data-selected={field.value === score}
                      >
                        {score}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentário (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Como foi a execução do serviço?"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </form>
    </Form>
  );
}
