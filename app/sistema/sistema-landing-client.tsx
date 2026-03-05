"use client";

import { Button } from "@/components/ui/button";
import { ShadboardLogo } from "@/components/brand/shadboard-logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartNoAxesCombined,
  ClipboardCheck,
  Layers3,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_ITEMS = [
  { id: "produto", label: "Produto" },
  { id: "recursos", label: "Recursos" },
  { id: "setores", label: "Setores" },
];

const bentoCards = [
  {
    title: "Painel executivo com indicadores críticos",
    description:
      "Métricas de volume, SLA e eficiência operacional em uma leitura rápida para decisão diária.",
    image: "/resumo.png",
    className: "lg:col-span-7",
  },
  {
    title: "Mapa territorial pronto para ação",
    description:
      "Ponteiros e contexto geográfico para distribuir equipes por bairro e reduzir tempo de resposta.",
    image: "/mapa.png",
    className: "lg:col-span-5",
  },
  {
    title: "Operação de ocorrências sem ruído",
    description:
      "Fluxo claro de abertura, análise, execução e resolução com histórico rastreável por protocolo.",
    image: "/ocorrencias.png",
    className: "lg:col-span-5",
  },
  {
    title: "Relatórios para gestão e controle",
    description:
      "Exportações e visualizações para prestação de contas com transparência institucional.",
    image: "/relatorios.png",
    className: "lg:col-span-4",
  },
];

const features = [
  {
    title: "Fluxo completo de atendimento",
    description:
      "Do registro público à resolução em campo, com status auditáveis e governança operacional.",
    icon: ClipboardCheck,
  },
  {
    title: "Gestão por SLA e prioridade",
    description:
      "Monitore tempo médio, criticidade e vencimentos para atuar antes da escalada do problema.",
    icon: Timer,
  },
  {
    title: "Inteligência territorial",
    description:
      "Visualize concentração por rua e bairro para orientar escala, deslocamento e execução das equipes.",
    icon: MapPinned,
  },
  {
    title: "Camada executiva de decisão",
    description:
      "Comparativos e evolução histórica para sustentar decisões táticas e estratégicas.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Segurança e rastreabilidade",
    description:
      "Histórico por protocolo e trilha de evolução para suporte a auditoria e órgãos de controle.",
    icon: ShieldCheck,
  },
  {
    title: "Adoção simples por equipes",
    description:
      "Experiência objetiva para gestores, analistas e operadores com curva de aprendizado curta.",
    icon: Users,
  },
];

const recommendedOrgs = [
  "Secretaria de Obras e Infraestrutura",
  "Secretaria de Serviços Urbanos e Limpeza Pública",
  "Secretaria de Meio Ambiente e Saneamento",
  "Ouvidoria Municipal",
  "Defesa Civil Municipal",
  "Gabinete de Gestão Integrada",
];

export function SistemaLandingClient() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleSectionScroll = (sectionId: string) => {
    const target = document.getElementById(sectionId);

    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setIsContactOpen(false);
    toast.success("Contato enviado com sucesso. Nossa equipe retornará em breve.");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_36%),radial-gradient(circle_at_82%_10%,hsl(var(--chart-1)/0.15),transparent_32%)] dark:bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.26),transparent_38%),radial-gradient(circle_at_82%_10%,hsl(var(--chart-1)/0.18),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_18%,#000_35%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,hsl(var(--foreground)/0.08)_1px,transparent_1px)] bg-[size:30px_30px] opacity-45 [mask-image:radial-gradient(ellipse_80%_55%_at_50%_100%,#000_40%,transparent_100%)]" />

      <motion.div
        className="pointer-events-none absolute -left-20 top-40 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: EASE }}
      />
      <motion.div
        className="pointer-events-none absolute right-[-60px] top-32 -z-10 h-72 w-72 rounded-full bg-accent/35 blur-3xl dark:bg-accent/25"
        animate={{ y: [0, 18, 0], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: EASE }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-[-20%] top-[34%] -z-10 h-44 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.24),transparent_70%)] blur-3xl"
        animate={{ x: [-50, 55, -50], opacity: [0.18, 0.35, 0.18] }}
        transition={{ duration: 14, repeat: Infinity, ease: EASE }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pb-24 md:pt-8">
        <nav className="flex flex-wrap items-center gap-3 rounded-full border border-border/65 bg-background/75 px-4 py-3 shadow-sm backdrop-blur-xl md:px-6">
          <Link href="/sistema" className="inline-flex items-center" aria-label="ShadBoard">
            <ShadboardLogo className="h-6 md:h-7" />
          </Link>

          <div className="ml-auto flex flex-wrap items-center gap-4 sm:gap-6">
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleSectionScroll(item.id)}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="group relative text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground sm:text-sm"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </motion.button>
            ))}
          </div>
        </nav>

        <section id="produto" className="grid gap-10 pt-14 lg:grid-cols-[1.04fr_0.96fr] lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="space-y-6"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma pública de alta performance
            </p>

            <h1 className="max-w-3xl text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.6rem] lg:leading-[1.06]">
              Gestão urbana com design executivo, dados em tempo real e operação territorial.
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              O ShadBoard foi desenhado para prefeituras que precisam de previsibilidade operacional,
              transparência institucional e velocidade de resposta para a população.
            </p>

            <div className="grid gap-2 pt-2 sm:grid-cols-2 lg:max-w-2xl">
              <p className="rounded-lg border border-border/55 bg-card/60 px-3 py-2 text-sm text-muted-foreground">
                SLA, prioridade e histórico por protocolo.
              </p>
              <p className="rounded-lg border border-border/55 bg-card/60 px-3 py-2 text-sm text-muted-foreground">
                Mapa operacional para atuação por território.
              </p>
              <p className="rounded-lg border border-border/55 bg-card/60 px-3 py-2 text-sm text-muted-foreground sm:col-span-2">
                Navegação por seções com rolagem suave para apresentação institucional.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: EASE }}
            className="relative"
          >
            <div className="rounded-[24px] border border-border/60 bg-card/75 p-2 shadow-[0_26px_72px_hsl(var(--foreground)/0.12)] backdrop-blur">
              <div className="overflow-hidden rounded-[18px] border border-border/50">
                <Image
                  src="/resumo.png"
                  alt="Painel executivo do sistema ShadBoard"
                  width={1300}
                  height={760}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>

            <motion.div
              className="absolute -bottom-4 left-4 rounded-xl border border-border/65 bg-background/85 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            >
              Resposta orientada por dados
            </motion.div>
          </motion.div>
        </section>

        <section className="mt-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="space-y-3"
          >
            <h2 className="max-w-4xl text-3xl text-foreground md:text-4xl">
              Interface construída para conectar monitoramento executivo e operação de campo.
            </h2>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-12">
            {bentoCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.6, delay: index * 0.07, ease: EASE }}
                whileHover={{ y: -6 }}
                className={`group overflow-hidden rounded-[22px] border border-border/50 bg-card/80 p-4 shadow-[0_10px_28px_hsl(var(--foreground)/0.08)] backdrop-blur transition-colors duration-300 hover:border-primary/30 ${card.className}`}
              >
                <div className="overflow-hidden rounded-xl border border-border/40">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={1100}
                    height={650}
                    className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <h3 className="mt-4 text-xl text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
              </motion.article>
            ))}

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
              className="rounded-[22px] border border-border/50 bg-card/80 p-4 shadow-[0_10px_28px_hsl(var(--foreground)/0.08)] backdrop-blur lg:col-span-3"
            >
              <div className="inline-flex items-center gap-2 rounded-md border border-border/65 bg-background/75 px-2.5 py-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <Layers3 className="h-3.5 w-3.5" />
                Estrutura recomendada
              </div>
              <div className="mt-3 space-y-2">
                {recommendedOrgs.map((org) => (
                  <p
                    key={org}
                    className="rounded-lg border border-border/50 bg-background/65 px-3 py-2 text-sm text-muted-foreground"
                  >
                    {org}
                  </p>
                ))}
              </div>
            </motion.article>
          </div>
        </section>

        <section id="recursos" className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="space-y-3"
          >
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Features</p>
            <h2 className="text-3xl text-foreground md:text-4xl">
              Recursos desenhados para operação pública moderna
            </h2>
          </motion.div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.06, ease: EASE }}
                  className="rounded-[22px] border border-border/50 bg-card/80 p-5 shadow-[0_10px_28px_hsl(var(--foreground)/0.08)] backdrop-blur"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-lg text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <motion.section
          id="setores"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative mt-20 overflow-hidden rounded-[26px] border border-border/60 bg-[linear-gradient(120deg,hsl(var(--primary)/0.18),hsl(var(--accent)/0.36),hsl(var(--primary)/0.1))] p-8 shadow-[0_24px_64px_hsl(var(--primary)/0.2)] md:p-10"
        >
          <div className="pointer-events-none absolute -left-8 top-8 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
          <div className="pointer-events-none absolute right-2 top-2 h-28 w-28 rounded-full bg-accent/35 blur-2xl" />

          <p className="text-xs uppercase tracking-[0.16em] text-foreground/80">Chamada para ação</p>
          <h2 className="mt-3 max-w-3xl text-3xl text-foreground md:text-4xl">
            Quer levar esta estrutura para o seu município?
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Entre em contato para apresentar o cenário da sua operação, volume de ocorrências e
            necessidades de integração entre secretarias.
          </p>

          <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="mt-6 h-12 rounded-full bg-primary px-8 text-primary-foreground transition-all duration-300 ease-out hover:brightness-110 hover:shadow-[0_12px_30px_hsl(var(--primary)/0.35)]"
              >
                Entre em contato
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 bg-background/95 sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Solicitar contato comercial</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo e nossa equipe retornará com os próximos passos.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleContactSubmit} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Nome completo</Label>
                    <Input id="contact-name" name="name" placeholder="Seu nome" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">E-mail institucional</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="voce@orgao.gov.br"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-role">Cargo/Função</Label>
                    <Input id="contact-role" name="role" placeholder="Ex.: Gestor de Operações" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Telefone/WhatsApp</Label>
                    <Input id="contact-phone" name="phone" placeholder="(00) 00000-0000" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-city">Município</Label>
                    <Input id="contact-city" name="city" placeholder="Ex.: Caratinga - MG" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-prefeitura">É prefeitura?</Label>
                    <select
                      id="contact-prefeitura"
                      name="is_city_hall"
                      defaultValue=""
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                      <option value="consorcio">Consórcio/Outro órgão público</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact-org">Órgão/Secretaria</Label>
                    <Input
                      id="contact-org"
                      name="department"
                      placeholder="Ex.: Secretaria de Serviços Urbanos"
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact-context">Contexto e objetivo</Label>
                    <Textarea
                      id="contact-context"
                      name="context"
                      placeholder="Conte brevemente o cenário atual, volume de demandas e objetivos com a plataforma."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10"
                    onClick={() => setIsContactOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="h-10">
                    Enviar solicitação
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.section>
      </div>
    </main>
  );
}
